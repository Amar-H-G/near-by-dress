const Category = require('../../../models/Category');
const { sendSuccess } = require('../../../utils/response');
const AppError = require('../../../utils/AppError');

/**
 * Helper: Normalize orders for a parent to be sequential (1, 2, 3...)
 */
const normalizeOrders = async (parentId) => {
  const categories = await Category.find({ parentId: parentId || null, isDeleted: false })
    .sort({ order: 1, updatedAt: -1 });
  
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].order !== i + 1) {
      categories[i].order = i + 1;
      await categories[i].save();
    }
  }
};

/**
 * Public: Get all active, non-deleted categories
 * GET /api/categories
 */
exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true, isDeleted: false })
    .sort({ order: 1, name: 1 })
    .populate('parentId', 'name');
  sendSuccess(res, { data: categories });
};

/**
 * Admin: Get all non-deleted categories for management
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
  const { name, parentId, order, isActive, description } = req.body;
  const image = req.file ? req.file.path : null;

  const parentVal = parentId === 'null' || parentId === '' ? null : parentId;

  // Shift existing categories with same parent and same/higher order
  if (order !== undefined) {
    await Category.updateMany(
      { parentId: parentVal, order: { $gte: order }, isDeleted: false },
      { $inc: { order: 1 } }
    );
  }

  const category = await Category.create({ 
    name, 
    slug: req.body.slug, 
    parentId: parentVal, 
    order: order || 0, 
    isActive: isActive === 'true' || isActive === true,
    description,
    image
  });

  await normalizeOrders(parentVal);
  
  sendSuccess(res, { data: category }, 'Category created successfully', 201);
};

/**
 * Admin: Update category
 * PUT /api/admin/categories/:id
 */
exports.updateCategory = async (req, res) => {
  const { name, parentId, order, isActive, description } = req.body;
  
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  const parentVal = parentId === 'null' || parentId === '' ? null : (parentId || category.parentId);

  // Prevent setting itself as parent
  if (String(parentVal) === String(req.params.id)) throw new AppError('Cannot set a category as its own parent', 400);

  const oldOrder = category.order;
  const oldParentId = category.parentId;
  const newOrder = order !== undefined ? Number(order) : category.order;

  // If order or parent changed, shift categories at the new position
  if (newOrder !== oldOrder || String(parentVal) !== String(oldParentId)) {
    await Category.updateMany(
      { 
        _id: { $ne: req.params.id },
        parentId: parentVal, 
        order: { $gte: newOrder },
        isDeleted: false
      },
      { $inc: { order: 1 } }
    );
  }

  category.name = name || category.name;
  if (req.body.slug) category.slug = req.body.slug;
  category.parentId = parentVal;
  category.order = newOrder;
  if (isActive !== undefined) {
    category.isActive = isActive === 'true' || isActive === true;
  }
  if (description !== undefined) category.description = description;
  if (req.file) category.image = req.file.path;

  await category.save();

  // Normalize both old and new parent branches
  await normalizeOrders(parentVal);
  if (String(oldParentId) !== String(parentVal)) {
    await normalizeOrders(oldParentId);
  }

  sendSuccess(res, { data: category }, 'Category updated successfully');
};

/**
 * Admin: Soft delete category to preserve references or clean up
 * DELETE /api/admin/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  const parentId = category.parentId;

  // Soft delete all children categories
  await Category.updateMany({ parentId: req.params.id }, { isDeleted: true });

  // Soft delete category itself
  category.isDeleted = true;
  await category.save();

  // Normalize orders in the branch
  await normalizeOrders(parentId || null);

  sendSuccess(res, null, 'Category deleted successfully');
};
