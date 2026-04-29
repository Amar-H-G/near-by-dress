const Joi = require('joi');
const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return sendError(res, messages, 422);
  }
  next();
};

// --- Auth schemas ---
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'shop_owner').default('customer'),
  phone: Joi.string().allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- Shop schemas ---
const createShopSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).allow('').optional(),
  whatsappNumber: Joi.string().required(),
  address: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  category: Joi.string().allow('').optional(),
});

const updateShopSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  whatsappNumber: Joi.string().optional(),
  address: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  category: Joi.string().allow('').optional(),
});

const shopStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().when('status', {
    is: 'rejected',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional(),
  }),
});

// --- Product schemas ---
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).allow('').optional(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).allow(null).optional(),
  category: Joi.string().required(),
  sizes: Joi.array().items(Joi.string()).default([]),
  colors: Joi.array().items(Joi.string()).default([]),
  stock: Joi.number().min(0).default(0),
  shop: Joi.string().hex().length(24).allow(null).optional(),
  isSystemProduct: Joi.boolean().default(false),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(2000).allow('').optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).allow(null).optional(),
  category: Joi.string().optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createShopSchema,
  updateShopSchema,
  shopStatusSchema,
  createProductSchema,
  updateProductSchema,
};
