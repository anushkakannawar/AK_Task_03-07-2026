/**
 * Leave Requests Controller
 * Employee applies; Admin approves/rejects
 * Edge case: overlapping leave dates, past date prevention
 */
const { pool } = require('../database/connection');
const { AppError } = require('../middleware/error.middleware');

const LEAVE_SELECT = `
  SELECT
    lr.id,
    lr.employee_id,
    u.name        AS employee_name,
    u.email       AS employee_email,
    d.name        AS department_name,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    DATEDIFF(lr.end_date, lr.start_date) + 1 AS days_count,
    lr.reason,
    lr.status,
    lr.review_note,
    ru.name       AS reviewed_by_name,
    lr.created_at,
    lr.updated_at
  FROM leave_requests lr
  JOIN employees e ON e.id = lr.employee_id
  JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
  LEFT JOIN users ru ON ru.id = lr.reviewed_by
`;

/**
 * GET /api/v1/leaves
 * Employee: own requests; Admin: all (filterable)
 */
const getLeaves = async (req, res, next) => {
  try {
    const { status, employee_id, leave_type, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role === 'employee') {
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp) throw new AppError('Employee profile not found', 404);
      conditions.push('lr.employee_id = ?');
      params.push(emp.id);
    } else if (employee_id) {
      conditions.push('lr.employee_id = ?');
      params.push(employee_id);
    }

    if (status)     { conditions.push('lr.status = ?');     params.push(status); }
    if (leave_type) { conditions.push('lr.leave_type = ?'); params.push(leave_type); }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `${LEAVE_SELECT} ${where} ORDER BY lr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM leave_requests lr ${where}`,
      params
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/leaves/:id
 */
const getLeave = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${LEAVE_SELECT} WHERE lr.id = ?`,
      [req.params.id]
    );
    if (!rows.length) throw new AppError('Leave request not found', 404);

    // Employee can only view their own leave
    if (req.user.role === 'employee') {
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp || emp.id !== rows[0].employee_id) {
        throw new AppError('Access denied', 403);
      }
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/leaves — Employee applies for leave
 * Edge case: start_date cannot be in the past
 * Edge case: overlapping approved/pending leave requests
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;

    // Resolve employee
    const [[emp]] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );
    if (!emp) throw new AppError('Employee profile not found', 404);

    // Edge case: cannot apply for leave with end_date in the past (allow today)
    const today = new Date().toISOString().split('T')[0];
    if (end_date < today) {
      throw new AppError('Leave end date cannot be in the past', 400);
    }

    // Edge case: start must be before or equal to end
    if (start_date > end_date) {
      throw new AppError('Start date must be before or equal to end date', 400);
    }

    // Edge case: check for overlapping pending/approved leave requests
    const [overlaps] = await pool.query(
      `SELECT id FROM leave_requests
       WHERE employee_id = ?
         AND status IN ('pending', 'approved')
         AND start_date <= ?
         AND end_date   >= ?`,
      [emp.id, end_date, start_date]
    );
    if (overlaps.length) {
      throw new AppError(
        'You already have a pending or approved leave request that overlaps with these dates',
        409
      );
    }

    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [emp.id, leave_type, start_date, end_date, reason]
    );

    const [rows] = await pool.query(
      `${LEAVE_SELECT} WHERE lr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/leaves/:id/status — Admin only
 * Approve or reject a leave request
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, review_note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Status must be "approved" or "rejected"', 400);
    }

    const [[leave]] = await pool.query(
      'SELECT id, status FROM leave_requests WHERE id = ?',
      [id]
    );
    if (!leave) throw new AppError('Leave request not found', 404);

    if (leave.status !== 'pending') {
      throw new AppError(`Leave request is already ${leave.status}`, 409);
    }

    await pool.query(
      `UPDATE leave_requests
       SET status = ?, reviewed_by = ?, review_note = ?
       WHERE id = ?`,
      [status, req.user.id, review_note || null, id]
    );

    const [rows] = await pool.query(`${LEAVE_SELECT} WHERE lr.id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/leaves/:id — Employee can cancel pending requests
 */
const deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[leave]] = await pool.query(
      `SELECT lr.id, lr.status, lr.employee_id
       FROM leave_requests lr
       WHERE lr.id = ?`,
      [id]
    );
    if (!leave) throw new AppError('Leave request not found', 404);

    // Employee can only delete their own pending requests
    if (req.user.role === 'employee') {
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp || emp.id !== leave.employee_id) {
        throw new AppError('Access denied', 403);
      }
      if (leave.status !== 'pending') {
        throw new AppError('Only pending requests can be cancelled', 409);
      }
    }

    await pool.query('DELETE FROM leave_requests WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaves, getLeave, applyLeave, updateLeaveStatus, deleteLeave };
