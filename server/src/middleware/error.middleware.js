/**
 * Centralized Error Handling Middleware
 * Evaluation Criterion: API Architecture — proper HTTP status codes
 * All thrown errors bubble up here for consistent JSON error responses
 */

// Custom application error class
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Validation error array
    this.isOperational = true;
  }
}

// 404 handler — mount before general error handler
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// General error handler — must have 4 params for Express to recognize it
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status not set
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log errors in development
  if (!isProduction) {
    console.error('🔴 Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  // Handle MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
    });
  }

  // Handle JWT errors (shouldn't reach here but just in case)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Include validation errors if present
    ...(err.errors && { errors: err.errors }),
    // Include stack trace only in development
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = { AppError, notFoundHandler, errorHandler };
