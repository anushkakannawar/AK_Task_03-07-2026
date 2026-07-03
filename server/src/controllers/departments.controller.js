/**
 * Departments Controller
 * Admin-only CRUD for departments
 * Edge case: duplicate name prevention, safe delete check
 */
const { pool } = require('../database/connection');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/v1/departments — accessible to all authenticated users
 */
const getDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.id,
        d.name,
        d.description,
        d.created_at,
        COUNT(e.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
      GROUP BY d.id
      ORDER BY d.name ASC
    `);

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/departments/:id
 */
const getDepartment = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, COUNT(e.id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
       WHERE d.id = ?
       GROUP BY d.id`,
      [req.params.id]
    );

    if (!rows.length) throw new AppError('Department not found', 404);

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/departments — Admin only
 * Edge case: duplicate department name returns 409
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check for duplicate name (case-insensitive)
    const [[existing]] = await pool.query(
      'SELECT id FROM departments WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );
    if (existing) throw new AppError('Department with this name already exists', 409);

    const [result] = await pool.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    const [[dept]] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { ...dept, employee_count: 0 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/departments/:id — Admin only
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [[dept]] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!dept) throw new AppError('Department not found', 404);

    // Check duplicate name (excluding self)
    if (name) {
      const [[dup]] = await pool.query(
        'SELECT id FROM departments WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name.trim(), id]
      );
      if (dup) throw new AppError('Department with this name already exists', 409);
    }

    const updates = [];
    const params = [];
    if (name)        { updates.push('name = ?');        params.push(name.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    if (!updates.length) throw new AppError('No fields provided to update', 400);

    await pool.query(
      `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );

    const [rows] = await pool.query(
      `SELECT d.*, COUNT(e.id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
       WHERE d.id = ? GROUP BY d.id`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/departments/:id — Admin only
 * Edge case: cannot delete department with active employees — reassign first
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[dept]] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!dept) throw new AppError('Department not found', 404);

    // Prevent deletion if active employees are assigned
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM employees WHERE department_id = ? AND status = 'active'",
      [id]
    );
    if (count > 0) {
      throw new AppError(
        `Cannot delete department with ${count} active employee(s). Reassign them first.`,
        409
      );
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
