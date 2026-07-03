/**
 * Leave Request Routes — /api/v1/leaves
 */
const router = require('express').Router();
const { body, param } = require('express-validator');
const {
  getLeaves, getLeave, applyLeave, updateLeaveStatus, deleteLeave,
} = require('../controllers/leaves.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const LEAVE_TYPES = ['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid'];

router.use(authenticate);

// GET /api/v1/leaves
router.get('/', getLeaves);

// GET /api/v1/leaves/:id
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid leave ID')],
  validate,
  getLeave
);

// POST /api/v1/leaves — Employee applies
router.post(
  '/',
  [
    body('leave_type')
      .isIn(LEAVE_TYPES)
      .withMessage(`Leave type must be one of: ${LEAVE_TYPES.join(', ')}`),
    body('start_date').isDate().withMessage('Valid start_date required (YYYY-MM-DD)'),
    body('end_date').isDate().withMessage('Valid end_date required (YYYY-MM-DD)'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
      .isLength({ max: 500 }).withMessage('Reason too long (max 500 chars)'),
  ],
  validate,
  applyLeave
);

// PATCH /api/v1/leaves/:id/status — Admin approves/rejects
router.patch(
  '/:id/status',
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid leave ID'),
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be "approved" or "rejected"'),
    body('review_note').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  updateLeaveStatus
);

// DELETE /api/v1/leaves/:id — Cancel pending leave (employee or admin)
router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid leave ID')],
  validate,
  deleteLeave
);

module.exports = router;
