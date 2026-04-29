const Filter = require('../../../models/Filter');
const { sendSuccess } = require('../../../utils/response');
const AppError = require('../../../utils/AppError');

/**
 * Public: Get all active filters
 * GET /api/filters
 */
exports.getFilters = async (req, res) => {
  const filters = await Filter.find({ isActive: true, isDeleted: false }).sort({ order: 1 });
  sendSuccess(res, { data: filters });
};

/**
 * Admin: Get all filters (including inactive/deleted?) Usually just non-deleted
 * GET /api/admin/filters
 */
exports.getAdminFilters = async (req, res) => {
  const filters = await Filter.find({ isDeleted: false }).sort({ order: 1 });
  sendSuccess(res, { data: filters });
};

/**
 * Admin: Create new filter
 * POST /api/admin/filters
 */
exports.createFilter = async (req, res) => {
  const { name, key, type, options, order, min, max, isDynamic, isActive } = req.body;
  
  // Check if key exists
  const exists = await Filter.findOne({ key, isDeleted: false });
  if (exists) throw new AppError('Filter key already exists', 400);

  const filter = await Filter.create({ 
    name, key, type, options, order, min, max, isDynamic, isActive 
  });
  sendSuccess(res, { data: filter }, 'Filter created successfully', 201);
};

/**
 * Admin: Update filter
 * PUT /api/admin/filters/:id
 */
exports.updateFilter = async (req, res) => {
  const filter = await Filter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!filter) throw new AppError('Filter not found', 404);
  sendSuccess(res, { data: filter }, 'Filter updated successfully');
};

/**
 * Admin: Toggle filter status
 * PATCH /api/admin/filters/:id/toggle
 */
exports.toggleFilter = async (req, res) => {
  const filter = await Filter.findById(req.params.id);
  if (!filter) throw new AppError('Filter not found', 404);
  
  filter.isActive = !filter.isActive;
  await filter.save();
  
  sendSuccess(res, { data: filter }, `Filter ${filter.isActive ? 'enabled' : 'disabled'}`);
};

exports.deleteFilter = async (req, res) => {
  const filter = await Filter.findByIdAndDelete(req.params.id);
  if (!filter) throw new AppError('Filter not found', 404);

  // Reorder remaining filters to ensure sequential order (1, 2, 3...)
  const remainingFilters = await Filter.find().sort({ order: 1 });
  
  if (remainingFilters.length > 0) {
    const updatePromises = remainingFilters.map((f, index) => {
      return Filter.findByIdAndUpdate(f._id, { order: index + 1 });
    });
    await Promise.all(updatePromises);
  }

  sendSuccess(res, null, 'Filter permanently deleted and list reordered');
};
