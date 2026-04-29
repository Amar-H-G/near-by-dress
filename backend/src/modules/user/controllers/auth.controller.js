/**
 * Used by: user (all roles for authentication)
 * Purpose: handle register, login, and profile fetch — delegates to auth.service
 */
const { registerUser, loginUser, updateUserProfile } = require('../services/auth.service');
const { sendSuccess } = require('../../../utils/response');

/** POST /api/auth/register */
const register = async (req, res) => {
  const { user, token } = await registerUser(req.body);
  return sendSuccess(res, { data: { user, token } }, 'Registration successful', 201);
};

/** POST /api/auth/login */
const login = async (req, res) => {
  const { user, token } = await loginUser(req.body);
  return sendSuccess(res, { data: { user, token } }, 'Login successful');
};

/** GET /api/auth/me — returns currently authenticated user */
const getMe = async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } }, 'User fetched');
};

/** PUT /api/auth/profile — updates currently authenticated user */
const updateProfile = async (req, res) => {
  const user = await updateUserProfile(req.user._id, req.body);
  return sendSuccess(res, { data: { user } }, 'Profile updated successfully');
};

module.exports = { register, login, getMe, updateProfile };
