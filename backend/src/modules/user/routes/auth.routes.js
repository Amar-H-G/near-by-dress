/**
 * Used by: user (all roles)
 * Purpose: authentication routes — register, login, get current user
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../../../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../../../middleware/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
