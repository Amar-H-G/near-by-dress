/**
 * location.validation.js
 * Joi schemas for location endpoints
 */

const Joi = require('joi');
const { sendError } = require('../../utils/response');

// ── Schemas ───────────────────────────────────────────────────────────────────

const setShopLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'lat must be ≥ -90',
    'number.max': 'lat must be ≤ 90',
    'any.required': 'lat is required',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'lng must be ≥ -180',
    'number.max': 'lng must be ≤ 180',
    'any.required': 'lng is required',
  }),
  serviceRadiusKm: Joi.number().min(1).max(100).optional(),
});

const nearbyQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(20),
});

const discoveryQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  radiusKm: Joi.number().min(1).max(100).default(15),
  pincode: Joi.string().allow('', null).optional(),
});

// ── Middleware factories ───────────────────────────────────────────────────────

/**
 * Validate req.body against a schema
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return sendError(res, messages, 422);
  }
  req.body = value; // replace with coerced values
  next();
};

/**
 * Validate req.query against a schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, convert: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return sendError(res, messages, 422);
  }
  req.query = value;
  next();
};

module.exports = {
  setShopLocationSchema,
  nearbyQuerySchema,
  discoveryQuerySchema,
  validateBody,
  validateQuery,
};
