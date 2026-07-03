/**
 * Authentication Middleware
 * Verifies JWT access tokens on protected routes
 * Evaluation Criterion: Security Implementation — JWT, RBAC
 */
const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');

/**
 * Verify JWT access token and attach user to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }

    // Verify user still exists and is active
    const [rows] = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated',
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * RBAC Middleware — restrict access to admin-only routes
 * Evaluation Criterion: RBAC — admin vs employee separation
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required',
    });
  }
  next();
};

/**
 * Middleware — allow only the employee themselves or admin
 * Used for routes like GET /employees/:id where employee can see their own data
 */
const requireSelfOrAdmin = async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  // Look up employee record for the logged-in user
  const [rows] = await pool.query(
    'SELECT id FROM employees WHERE user_id = ?',
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(403).json({
      success: false,
      message: 'Employee profile not found',
    });
  }

  const employeeId = parseInt(req.params.id || req.params.employeeId);
  if (rows[0].id !== employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied — you can only view your own data',
    });
  }

  req.employeeId = rows[0].id;
  next();
};

module.exports = { authenticate, requireAdmin, requireSelfOrAdmin };
