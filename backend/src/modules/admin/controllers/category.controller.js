const Category = require('../../../models/Category');
const { sendSuccess } = require('../../../utils/response');
const AppError = require('../../../utils/AppError');

/**
 * Helper: Normalize orders for a parent to be sequential (1, 2, 3...)
 */
const normalizeOrders = async (parentId) => {
  const categories = await Category.find({ parentId: parentId || null })
    .sort({ order: 1, updatedAt: -1 });
  
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].order !== i + 1) {
      categories[i].order = i + 1;
      await categories[i].save();
    }
  }
};

/**
 * Public: Get all active categories
 * GET /api/categories
 */
exports.getCategories = async (req, res) => {
  const categories = await Category.find()
    .sort({ order: 1, name: 1 })
    .populate('parentId', 'name');
  sendSuccess(res, { data: categories });
};

/**
 * Admin: Get all categories for management
 * GET /api/admin/categories
 */
exports.getAdminCategories = async (req, res) => {
  const categories = await Category.find()
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

  // Shift existing categories with same parent and same/higher order
  if (order !== undefined) {
    await Category.updateMany(
      { parentId: parentId || null, order: { $gte: order } },
      { $inc: { order: 1 } }
    );
  }

  const category = await Category.create({ 
    name, 
    slug: req.body.slug, 
    parentId: parentId || null, 
    order: order || 0, 
    isActive 
  });

  await normalizeOrders(parentId || null);
  
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

  const oldOrder = category.order;
  const oldParentId = category.parentId;
  const newOrder = order !== undefined ? order : category.order;
  const newParentId = parentId === '' ? null : (parentId || category.parentId);

  // If order or parent changed, shift categories at the new position
  if (newOrder !== oldOrder || String(newParentId) !== String(oldParentId)) {
    await Category.updateMany(
      { 
        _id: { $ne: req.params.id },
        parentId: newParentId, 
        order: { $gte: newOrder }
      },
      { $inc: { order: 1 } }
    );
  }

  category.name = name || category.name;
  category.slug = req.body.slug || category.slug;
  category.parentId = newParentId;
  category.order = newOrder;
  category.isActive = isActive !== undefined ? isActive : category.isActive;

  await category.save();

  // Normalize both old and new parent branches
  await normalizeOrders(newParentId);
  if (String(oldParentId) !== String(newParentId)) {
    await normalizeOrders(oldParentId);
  }

  sendSuccess(res, { data: category }, 'Category updated successfully');
};

/**
 * Admin: Hard delete category
 * DELETE /api/admin/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  const parentId = category.parentId;

  // Delete all children categories first
  await Category.deleteMany({ parentId: req.params.id });

  // Delete the category itself
  await Category.findByIdAndDelete(req.params.id);

  // Normalize orders in the branch
  await normalizeOrders(parentId || null);

  sendSuccess(res, null, 'Category deleted permanently');
};
