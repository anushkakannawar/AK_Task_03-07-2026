/**
 * Attendance Routes — /api/v1/attendance
 */
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const {
  getAttendance, markAttendance, updateAttendance, getAttendanceSummary,
} = require('../controllers/attendance.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

// GET /api/v1/attendance/summary
router.get('/summary', getAttendanceSummary);

// GET /api/v1/attendance
router.get(
  '/',
  [
    query('start_date').optional().isDate().withMessage('Invalid start_date'),
    query('end_date').optional().isDate().withMessage('Invalid end_date'),
    query('status').optional().isIn(['present', 'absent', 'half-day', 'leave']),
  ],
  validate,
  getAttendance
);

// POST /api/v1/attendance — mark attendance
router.post(
  '/',
  [
    body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
    body('status')
      .isIn(['present', 'absent', 'half-day', 'leave'])
      .withMessage('Status must be: present, absent, half-day, or leave'),
    body('employee_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Invalid employee ID'),
    body('check_in').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid check_in time (HH:MM)'),
    body('check_out').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid check_out time (HH:MM)'),
  ],
  validate,
  markAttendance
);

// PUT /api/v1/attendance/:id — Admin only
router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid attendance ID'),
    body('status').optional().isIn(['present', 'absent', 'half-day', 'leave']),
    body('check_in').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid check_in time'),
    body('check_out').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid check_out time'),
  ],
  validate,
  updateAttendance
);

module.exports = router;
