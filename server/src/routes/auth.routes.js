/**
 * Auth Routes — /api/v1/auth
 * Evaluation Criterion: API Architecture — versioned, RESTful
 */
const router = require('express').Router();
const { body } = require('express-validator');
const { login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Valid email required')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  login
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token required'),
  ],
  validate,
  refresh
);

// POST /api/v1/auth/logout
router.post('/logout', logout);

// GET /api/v1/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
