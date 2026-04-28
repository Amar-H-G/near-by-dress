const { registerUser, loginUser } = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const register = async (req, res) => {
  const { user, token } = await registerUser(req.body);
  return sendSuccess(res, { data: { user, token } }, 'Registration successful', 201);
};

const login = async (req, res) => {
  const { user, token } = await loginUser(req.body);
  return sendSuccess(res, { data: { user, token } }, 'Login successful');
};

const getMe = async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } }, 'User fetched');
};

module.exports = { register, login, getMe };
