/**
 * Payroll Routes — /api/v1/payroll
 */
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const {
  getEmployeePayroll, getAllPayroll, createPayroll, updatePayroll, deletePayroll,
} = require('../controllers/payroll.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

// GET /api/v1/payroll — Admin: all payroll records
router.get('/', requireAdmin, getAllPayroll);

// GET /api/v1/payroll/:employeeId — Employee: own; Admin: any
router.get(
  '/:employeeId',
  [param('employeeId').isInt({ min: 1 }).withMessage('Invalid employee ID')],
  validate,
  getEmployeePayroll
);

// POST /api/v1/payroll — Admin creates
router.post(
  '/',
  requireAdmin,
  [
    body('employee_id').isInt({ min: 1 }).withMessage('Valid employee_id required'),
    body('month')
      .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year')
      .isInt({ min: 2000, max: 2100 }).withMessage('Valid year required'),
    body('basic_salary')
      .isFloat({ min: 0 }).withMessage('basic_salary must be a positive number'),
    body('allowances')
      .optional().isFloat({ min: 0 }).withMessage('allowances must be a positive number'),
    body('deductions')
      .optional().isFloat({ min: 0 }).withMessage('deductions must be a positive number'),
  ],
  validate,
  createPayroll
);

// PUT /api/v1/payroll/:id — Admin updates
router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid payroll ID'),
    body('basic_salary').optional().isFloat({ min: 0 }).withMessage('Invalid basic_salary'),
    body('allowances').optional().isFloat({ min: 0 }).withMessage('Invalid allowances'),
    body('deductions').optional().isFloat({ min: 0 }).withMessage('Invalid deductions'),
  ],
  validate,
  updatePayroll
);

// DELETE /api/v1/payroll/:id — Admin only
router.delete(
  '/:id',
  requireAdmin,
  [param('id').isInt({ min: 1 }).withMessage('Invalid payroll ID')],
  validate,
  deletePayroll
);

module.exports = router;
