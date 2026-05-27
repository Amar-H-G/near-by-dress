/**
 * settings.controller.js
 * Handles GET /api/settings (public, cached) and PUT /api/admin/settings (admin-only).
 */
const settingsService = require('../services/settings.service');
const { sendSuccess } = require('../../../utils/response');

/**
 * GET /api/settings
 * Public endpoint — cached by Redis middleware in server.js.
 */
exports.getSettings = async (req, res) => {
  const settings = await settingsService.getSettings();
  return sendSuccess(res, { data: settings });
};

/**
 * PUT /api/admin/settings
 * Admin-only — full or partial settings update.
 * Accepts multipart/form-data (for logo/favicon file uploads) or application/json.
 */
exports.updateSettings = async (req, res) => {
  const settings = await settingsService.updateSettings(req.body, req.files);
  return sendSuccess(res, { data: settings }, 'Settings updated successfully');
};
