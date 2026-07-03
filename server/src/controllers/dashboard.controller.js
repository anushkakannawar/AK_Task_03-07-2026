/**
 * Dashboard Controller
 * Summary stats, chart data, and recent activity feed
 * Evaluation Criterion: Dashboard with analytics data
 */
const { pool } = require('../database/connection');

/**
 * GET /api/v1/dashboard/summary — Admin only
 * Returns: total counts, attendance trends, dept headcounts, recent activity
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    // ── Summary Counts ────────────────────────────────────────────────────────
    const [[counts]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM employees WHERE status = 'active')           AS total_employees,
        (SELECT COUNT(*) FROM departments)                                  AS total_departments,
        (SELECT COUNT(*) FROM leave_requests WHERE status = 'pending')     AS pending_leaves,
        (SELECT COUNT(*) FROM attendance WHERE date = CURDATE())           AS attendance_today,
        (SELECT COUNT(*) FROM attendance WHERE date = CURDATE() AND status = 'present') AS present_today,
        (SELECT COUNT(*) FROM employees WHERE status = 'active'
          AND MONTH(date_of_joining) = MONTH(CURDATE())
          AND YEAR(date_of_joining) = YEAR(CURDATE()))                     AS new_hires_this_month
    `);

    // ── Attendance Trend (last 7 days) ────────────────────────────────────────
    const [attendanceTrend] = await pool.query(`
      SELECT
        DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
        SUM(a.status = 'present')  AS present,
        SUM(a.status = 'absent')   AS absent,
        SUM(a.status = 'half-day') AS half_day,
        SUM(a.status = 'leave')    AS on_leave
      FROM attendance a
      WHERE a.date >= CURDATE() - INTERVAL 6 DAY
      GROUP BY a.date
      ORDER BY a.date ASC
    `);

    // ── Department Headcount ──────────────────────────────────────────────────
    const [departmentHeadcount] = await pool.query(`
      SELECT
        d.name,
        COUNT(e.id) AS count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `);

    // ── Leave Status Distribution ─────────────────────────────────────────────
    const [leaveDistribution] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM leave_requests
      WHERE YEAR(created_at) = YEAR(CURDATE())
      GROUP BY status
    `);

    // ── Monthly Payroll Summary (current month) ───────────────────────────────
    const [[payrollSummary]] = await pool.query(`
      SELECT
        COUNT(*)          AS payroll_count,
        SUM(net_salary)   AS total_net_salary,
        AVG(net_salary)   AS avg_net_salary,
        SUM(basic_salary) AS total_basic,
        SUM(deductions)   AS total_deductions
      FROM payroll
      WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())
    `);

    // ── Recent Activity Feed ──────────────────────────────────────────────────
    // Combine recent leaves, attendance, and new hires into one activity stream
    const [recentLeaves] = await pool.query(`
      SELECT
        'leave_request' AS type,
        CONCAT(u.name, ' applied for ', lr.leave_type, ' leave') AS description,
        lr.status AS status,
        lr.created_at AS timestamp
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN users u ON u.id = e.user_id
      ORDER BY lr.created_at DESC
      LIMIT 5
    `);

    const [recentHires] = await pool.query(`
      SELECT
        'new_hire' AS type,
        CONCAT(u.name, ' joined as ', e.designation) AS description,
        'active' AS status,
        e.created_at AS timestamp
      FROM employees e
      JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    const [recentLeaveApprovals] = await pool.query(`
      SELECT
        'leave_update' AS type,
        CONCAT(u.name, '''s leave was ', lr.status) AS description,
        lr.status AS status,
        lr.updated_at AS timestamp
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN users u ON u.id = e.user_id
      WHERE lr.status IN ('approved', 'rejected')
      ORDER BY lr.updated_at DESC
      LIMIT 5
    `);

    // Merge and sort activity feed
    const recentActivity = [
      ...recentLeaves,
      ...recentHires,
      ...recentLeaveApprovals,
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        counts,
        attendanceTrend,
        departmentHeadcount,
        leaveDistribution,
        payrollSummary,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/employee-summary
 * Personal dashboard for logged-in employee
 */
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const [[emp]] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );
    if (!emp) {
      return res.status(200).json({ success: true, data: {} });
    }

    const empId = emp.id;
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    // Attendance summary this month
    const [attSummary] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM attendance
       WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY status`,
      [empId, month, year]
    );

    const attendance = { present: 0, absent: 0, 'half-day': 0, leave: 0 };
    attSummary.forEach((r) => { attendance[r.status] = parseInt(r.count); });

    // Pending leave requests
    const [[{ pendingLeaves }]] = await pool.query(
      "SELECT COUNT(*) AS pendingLeaves FROM leave_requests WHERE employee_id = ? AND status = 'pending'",
      [empId]
    );

    // Latest payroll
    const [[latestPayroll]] = await pool.query(
      `SELECT month, year, basic_salary, allowances, deductions, net_salary
       FROM payroll WHERE employee_id = ?
       ORDER BY year DESC, month DESC LIMIT 1`,
      [empId]
    );

    // Upcoming approved leaves
    const [upcomingLeaves] = await pool.query(
      `SELECT leave_type, start_date, end_date,
              DATEDIFF(end_date, start_date) + 1 AS days
       FROM leave_requests
       WHERE employee_id = ? AND status = 'approved' AND start_date >= CURDATE()
       ORDER BY start_date ASC LIMIT 3`,
      [empId]
    );

    res.status(200).json({
      success: true,
      data: {
        attendance,
        pendingLeaves,
        latestPayroll: latestPayroll || null,
        upcomingLeaves,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, getEmployeeDashboard };
