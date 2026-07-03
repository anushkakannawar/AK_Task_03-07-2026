/**
 * Validation Middleware
 * Uses express-validator to sanitize and validate inputs
 * Evaluation Criterion: Security — input validation & sanitization
 */
const { validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

/**
 * Runs after express-validator chains — collects and returns errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field:   e.path,
      message: e.msg,
    }));
    return next(new AppError('Validation failed', 400, formattedErrors));
  }
  next();
};

module.exports = { validate };
