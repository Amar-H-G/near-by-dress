const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'unspecified').optional(),
  dob: Joi.date().raw().allow(null, '').optional(),
  avatar: Joi.string().allow(null, '').optional()
});

const addressSchema = Joi.object({
  label: Joi.string().valid('Home', 'Office', 'Hostel', 'Shop', 'Other').required(),
  fullName: Joi.string().min(2).max(80).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be exactly 10 digits'
  }),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().allow('', null).optional(),
  landmark: Joi.string().allow('', null).optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.pattern.base': 'Pincode must be exactly 6 digits'
  }),
  isDefault: Joi.boolean().optional().default(false),
  lat: Joi.number().min(-90).max(90).allow(null, '').optional(),
  lng: Joi.number().min(-180).max(180).allow(null, '').optional()
});

module.exports = {
  updateProfileSchema,
  addressSchema
};
