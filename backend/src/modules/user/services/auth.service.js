/**
 * Used by: user (all roles for auth)
 * Purpose: authentication business logic — register, login, JWT generation
 */
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const AppError = require('../../../utils/AppError');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/**
 * Register a new user (customer or shop_owner)
 * Admin registration is blocked via public API
 */
const registerUser = async (data) => {
  const { name, email, password, role, phone } = data;

  // Admin registration not allowed via public API
  if (role === 'admin') throw new AppError('Cannot register as admin', 403);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password, role, phone });
  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Login an existing user and return JWT
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 403);

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { registerUser, loginUser };
