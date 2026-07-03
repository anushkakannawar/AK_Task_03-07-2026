/**
 * Payroll Controller
 * Admin manages payroll; employees view their own
 * Edge case: duplicate month/year entry prevention
 */
const { pool } = require('../database/connection');
const { AppError } = require('../middleware/error.middleware');

const PAYROLL_SELECT = `
  SELECT
    p.id,
    p.employee_id,
    u.name        AS employee_name,
    d.name        AS department_name,
    e.designation,
    p.month,
    p.year,
    p.basic_salary,
    p.allowances,
    p.deductions,
    p.net_salary,
    p.generated_at,
    p.updated_at
  FROM payroll p
  JOIN employees e ON e.id = p.employee_id
  JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
`;

/**
 * GET /api/v1/payroll/:employeeId
 * Employee: own payroll; Admin: any employee's payroll
 */
const getEmployeePayroll = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { month, year, page = 1, limit = 12 } = req.query;

    // Employee can only see their own payroll
    if (req.user.role === 'employee') {
      const [[emp]] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (!emp || emp.id !== parseInt(employeeId)) {
        throw new AppError('Access denied — you can only view your own payroll', 403);
      }
    }

    const conditions = ['p.employee_id = ?'];
    const params = [employeeId];

    if (month) { conditions.push('p.month = ?'); params.push(month); }
    if (year)  { conditions.push('p.year = ?');  params.push(year); }

    const where  = `WHERE ${conditions.join(' AND ')}`;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `${PAYROLL_SELECT} ${where} ORDER BY p.year DESC, p.month DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM payroll p ${where}`,
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
 * GET /api/v1/payroll — Admin only — all payroll with filters
 */
const getAllPayroll = async (req, res, next) => {
  try {
    const { employee_id, month, year, department_id, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (employee_id)  { conditions.push('p.employee_id = ?');  params.push(employee_id); }
    if (month)        { conditions.push('p.month = ?');        params.push(month); }
    if (year)         { conditions.push('p.year = ?');         params.push(year); }
    if (department_id){ conditions.push('e.department_id = ?');params.push(department_id); }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `${PAYROLL_SELECT} ${where} ORDER BY p.year DESC, p.month DESC, u.name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM payroll p JOIN employees e ON e.id = p.employee_id ${where}`,
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
 * POST /api/v1/payroll — Admin creates payroll record
 * Edge case: duplicate month/year for same employee returns 409
 */
const createPayroll = async (req, res, next) => {
  try {
    const { employee_id, month, year, basic_salary, allowances = 0, deductions = 0 } = req.body;

    // Verify employee exists
    const [[emp]] = await pool.query('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (!emp) throw new AppError('Employee not found', 404);

    // Edge case: duplicate month/year prevention
    const [[existing]] = await pool.query(
      'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
      [employee_id, month, year]
    );
    if (existing) {
      throw new AppError(
        `Payroll for this employee for ${month}/${year} already exists. Use PUT to update.`,
        409
      );
    }

    const [result] = await pool.query(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, month, year, basic_salary, allowances, deductions]
    );

    const [rows] = await pool.query(
      `${PAYROLL_SELECT} WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/payroll/:id — Admin updates payroll record
 */
const updatePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { basic_salary, allowances, deductions } = req.body;

    const [[record]] = await pool.query('SELECT id FROM payroll WHERE id = ?', [id]);
    if (!record) throw new AppError('Payroll record not found', 404);

    const updates = [];
    const params  = [];
    if (basic_salary !== undefined) { updates.push('basic_salary = ?'); params.push(basic_salary); }
    if (allowances   !== undefined) { updates.push('allowances = ?');   params.push(allowances); }
    if (deductions   !== undefined) { updates.push('deductions = ?');   params.push(deductions); }

    if (!updates.length) throw new AppError('No fields to update', 400);

    await pool.query(
      `UPDATE payroll SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );

    const [rows] = await pool.query(`${PAYROLL_SELECT} WHERE p.id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/payroll/:id — Admin only
 */
const deletePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[record]] = await pool.query('SELECT id FROM payroll WHERE id = ?', [id]);
    if (!record) throw new AppError('Payroll record not found', 404);

    await pool.query('DELETE FROM payroll WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Payroll record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmployeePayroll, getAllPayroll, createPayroll, updatePayroll, deletePayroll };
