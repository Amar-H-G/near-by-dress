const Category = require('../../../models/Category');
const { sendSuccess } = require('../../../utils/response');
const AppError = require('../../../utils/AppError');

/**
 * Public: Get all active categories
 * GET /api/categories
 */
exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true, isDeleted: false })
    .sort({ order: 1, name: 1 })
    .populate('parentId', 'name');
  sendSuccess(res, { data: categories });
};

/**
 * Admin: Get all categories for management
 * GET /api/admin/categories
 */
exports.getAdminCategories = async (req, res) => {
  const categories = await Category.find({ isDeleted: false })
    .sort({ order: 1, name: 1 })
    .populate('parentId', 'name');
  sendSuccess(res, { data: categories });
};

/**
 * Admin: Create category
 * POST /api/admin/categories
 */
exports.createCategory = async (req, res) => {
  const { name, parentId, order, isActive } = req.body;
  
  // Check if name exists under same parent to avoid confusion? 
  // Slug unique check is handled by DB index
  
  const category = await Category.create({ name, parentId: parentId || null, order, isActive });
  sendSuccess(res, { data: category }, 'Category created successfully', 201);
};

/**
 * Admin: Update category
 * PUT /api/admin/categories/:id
 */
exports.updateCategory = async (req, res) => {
  const { name, parentId, order, isActive } = req.body;
  
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  // Prevent setting itself as parent
  if (parentId === req.params.id) throw new AppError('Cannot set a category as its own parent', 400);

  category.name = name || category.name;
  category.parentId = parentId === '' ? null : (parentId || category.parentId);
  category.order = order !== undefined ? order : category.order;
  category.isActive = isActive !== undefined ? isActive : category.isActive;

  await category.save();
  sendSuccess(res, { data: category }, 'Category updated successfully');
};

/**
 * Admin: Soft delete category
 * DELETE /api/admin/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  sendSuccess(res, null, 'Category deleted successfully');
};
