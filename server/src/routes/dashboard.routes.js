/**
 * Dashboard Routes — /api/v1/dashboard
 */
const router = require('express').Router();
const { getDashboardSummary, getEmployeeDashboard } = require('../controllers/dashboard.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET /api/v1/dashboard/summary — Admin only
router.get('/summary', requireAdmin, getDashboardSummary);

// GET /api/v1/dashboard/employee — Any authenticated employee
router.get('/employee', getEmployeeDashboard);

module.exports = router;
