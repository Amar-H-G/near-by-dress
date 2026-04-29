const Category = require('../../../models/Category');
const { sendSuccess } = require('../../../utils/response');
const AppError = require('../../../utils/AppError');

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  return sendSuccess(res, { data: categories });
};

exports.createCategory = async (req, res) => {
  const { name, slug } = req.body;
  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    throw new AppError('Category with this name or slug already exists', 400);
  }

  const category = await Category.create({ name, slug });
  return sendSuccess(res, { data: category }, 'Category created successfully', 201);
};

exports.updateCategory = async (req, res) => {
  const { name, slug, isActive } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug, isActive },
    { new: true, runValidators: true }
  );

  if (!category) throw new AppError('Category not found', 404);
  return sendSuccess(res, { data: category }, 'Category updated successfully');
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  return sendSuccess(res, null, 'Category deleted successfully');
};
