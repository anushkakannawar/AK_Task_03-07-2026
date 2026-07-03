/**
 * Department Routes — /api/v1/departments
 */
const router = require('express').Router();
const { body, param } = require('express-validator');
const {
  getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment,
} = require('../controllers/departments.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

// GET — accessible to all authenticated users (for dropdowns etc.)
router.get('/', getDepartments);
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid department ID')],
  validate,
  getDepartment
);

// POST — Admin only
router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Department name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('description').optional().isString(),
  ],
  validate,
  createDepartment
);

// PUT — Admin only
router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid department ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('description').optional().isString(),
  ],
  validate,
  updateDepartment
);

// DELETE — Admin only
router.delete(
  '/:id',
  requireAdmin,
  [param('id').isInt({ min: 1 }).withMessage('Invalid department ID')],
  validate,
  deleteDepartment
);

module.exports = router;
