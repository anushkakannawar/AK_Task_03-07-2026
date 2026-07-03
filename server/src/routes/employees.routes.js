/**
 * Employee Routes — /api/v1/employees
 */
const router = require('express').Router();
const { body, param } = require('express-validator');
const {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
} = require('../controllers/employees.controller');
const { authenticate, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/employees
router.get('/', getEmployees);

// GET /api/v1/employees/:id
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid employee ID')],
  validate,
  requireSelfOrAdmin,
  getEmployee
);

// POST /api/v1/employees — Admin only
router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('date_of_joining').isDate().withMessage('Valid date_of_joining required (YYYY-MM-DD)'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Role must be admin or employee'),
    body('department_id').optional().isInt({ min: 1 }).withMessage('Invalid department ID'),
  ],
  validate,
  createEmployee
);

// PUT /api/v1/employees/:id — Admin or self
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid employee ID'),
    body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').optional().isString().withMessage('Invalid phone number'),
    body('date_of_joining').optional().isDate().withMessage('Invalid date format'),
    body('status').optional().isIn(['active', 'inactive', 'on_leave']).withMessage('Invalid status'),
  ],
  validate,
  requireSelfOrAdmin,
  updateEmployee
);

// DELETE /api/v1/employees/:id — Admin only
router.delete(
  '/:id',
  requireAdmin,
  [param('id').isInt({ min: 1 }).withMessage('Invalid employee ID')],
  validate,
  deleteEmployee
);

module.exports = router;
