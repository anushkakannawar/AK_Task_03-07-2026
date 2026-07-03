/**
 * Attendance Controller
 * Mark, view, and update attendance records
 * Edge case: duplicate same-day mark prevention, check_out before check_in
 */
const { pool } = require('../database/connection');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/v1/attendance
 * Admin: all records (filterable); Employee: own records only
 */
const getAttendance = async (req, res, next) => {
  try {
    const {
      employee_id, start_date, end_date, status,
      page = 1, limit = 30,
    } = req.query;

    const conditions = [];
    const params = [];

    if (req.user.role === 'employee') {
      // Employee sees only their own attendance
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp) throw new AppError('Employee profile not found', 404);
      conditions.push('a.employee_id = ?');
      params.push(emp.id);
    } else if (employee_id) {
      conditions.push('a.employee_id = ?');
      params.push(employee_id);
    }

    if (start_date) { conditions.push('a.date >= ?'); params.push(start_date); }
    if (end_date)   { conditions.push('a.date <= ?'); params.push(end_date); }
    if (status)     { conditions.push('a.status = ?'); params.push(status); }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `SELECT
         a.id, a.employee_id, u.name AS employee_name,
         d.name AS department_name,
         a.date, a.check_in, a.check_out, a.status, a.notes,
         a.created_at
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       JOIN users u ON u.id = e.user_id
       LEFT JOIN departments d ON d.id = e.department_id
       ${where}
       ORDER BY a.date DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM attendance a ${where}`,
      params
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/attendance
 * Mark attendance — Admin can mark for any employee; Employee marks own
 * Edge case: duplicate mark for same day returns 409
 * Edge case: check_out must be after check_in
 */
const markAttendance = async (req, res, next) => {
  try {
    let { employee_id, date, check_in, check_out, status = 'present', notes } = req.body;

    if (req.user.role === 'employee') {
      // Employee can only mark their own attendance
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp) throw new AppError('Employee profile not found', 404);
      employee_id = emp.id;
    }

    // Verify employee exists
    const [[emp]] = await pool.query('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (!emp) throw new AppError('Employee not found', 404);

    // Edge case: prevent duplicate attendance for same date
    const [[existing]] = await pool.query(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );
    if (existing) {
      throw new AppError('Attendance already marked for this date. Use PUT to update.', 409);
    }

    // Edge case: check_out must be after check_in
    if (check_in && check_out && check_out <= check_in) {
      throw new AppError('Check-out time must be after check-in time', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, date, check_in || null, check_out || null, status, notes || null]
    );

    const [[record]] = await pool.query(
      `SELECT a.*, u.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/attendance/:id — Admin only
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, status, notes } = req.body;

    const [[record]] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);
    if (!record) throw new AppError('Attendance record not found', 404);

    // Edge case: check_out must be after check_in
    const newCheckIn  = check_in  !== undefined ? check_in  : record.check_in;
    const newCheckOut = check_out !== undefined ? check_out : record.check_out;
    if (newCheckIn && newCheckOut && newCheckOut <= newCheckIn) {
      throw new AppError('Check-out time must be after check-in time', 400);
    }

    const updates = [];
    const params  = [];
    if (check_in  !== undefined) { updates.push('check_in = ?');  params.push(check_in || null); }
    if (check_out !== undefined) { updates.push('check_out = ?'); params.push(check_out || null); }
    if (status)                  { updates.push('status = ?');    params.push(status); }
    if (notes !== undefined)     { updates.push('notes = ?');     params.push(notes); }

    if (!updates.length) throw new AppError('No fields to update', 400);

    await pool.query(
      `UPDATE attendance SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );

    const [[updated]] = await pool.query(
      `SELECT a.*, u.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE a.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/attendance/summary
 * Returns attendance summary for a given employee and month
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { employee_id, month, year } = req.query;

    let empId = employee_id;
    if (req.user.role === 'employee') {
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp) throw new AppError('Employee profile not found', 404);
      empId = emp.id;
    }

    const m = month || new Date().getMonth() + 1;
    const y = year  || new Date().getFullYear();

    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM attendance
       WHERE employee_id = ?
         AND MONTH(date) = ?
         AND YEAR(date)  = ?
       GROUP BY status`,
      [empId, m, y]
    );

    const summary = { present: 0, absent: 0, 'half-day': 0, leave: 0, total: 0 };
    rows.forEach((r) => {
      summary[r.status] = parseInt(r.count);
      summary.total += parseInt(r.count);
    });

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAttendance, markAttendance, updateAttendance, getAttendanceSummary };
