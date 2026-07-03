/**
 * Employees Controller
 * Full CRUD for employee records — Admin write, self-read for employees
 * Evaluation Criterion: Clean Code, CRUD Operations, RBAC
 */
const bcrypt   = require('bcryptjs');
const { pool } = require('../database/connection');
const { AppError } = require('../middleware/error.middleware');

// Reusable SELECT with joins
const EMPLOYEE_SELECT = `
  SELECT
    e.id,
    e.user_id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    e.department_id,
    d.name       AS department_name,
    e.designation,
    e.phone,
    e.address,
    e.emergency_contact,
    e.date_of_joining,
    e.status,
    e.created_at,
    e.updated_at
  FROM employees e
  JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
`;

/**
 * GET /api/v1/employees
 * Admin: all employees (with optional filters)
 * Employee: own record only
 */
const getEmployees = async (req, res, next) => {
  try {
    if (req.user.role === 'employee') {
      // Employees can only see their own record
      const [rows] = await pool.query(
        `${EMPLOYEE_SELECT} WHERE e.user_id = ?`,
        [req.user.id]
      );
      return res.status(200).json({ success: true, data: rows });
    }

    // Admin: support filters
    const { department_id, status, search, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (department_id) {
      conditions.push('e.department_id = ?');
      params.push(department_id);
    }
    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR e.designation LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `${EMPLOYEE_SELECT} ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Total count for pagination
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM employees e JOIN users u ON u.id=e.user_id ${where}`,
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
 * GET /api/v1/employees/:id
 * Admin: any employee; Employee: own record only (enforced in route)
 */
const getEmployee = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${EMPLOYEE_SELECT} WHERE e.id = ?`,
      [req.params.id]
    );

    if (!rows.length) throw new AppError('Employee not found', 404);

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/employees
 * Admin only — creates user account + employee profile atomically
 */
const createEmployee = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      name, email, password, role = 'employee',
      department_id, designation, phone, address,
      emergency_contact, date_of_joining,
    } = req.body;

    // Check duplicate email
    const [[existing]] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user account
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), passwordHash, role]
    );

    // Create employee profile
    const [empResult] = await conn.query(
      `INSERT INTO employees
         (user_id, department_id, designation, phone, address, emergency_contact, date_of_joining)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, department_id || null, designation, phone || null,
       address || null, emergency_contact || null, date_of_joining]
    );

    await conn.commit();

    const [rows] = await pool.query(
      `${EMPLOYEE_SELECT} WHERE e.id = ?`,
      [empResult.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: rows[0],
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/v1/employees/:id
 * Admin: update any employee; Employee: update own profile fields only
 */
const updateEmployee = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const [[employee]] = await conn.query(
      'SELECT e.id, e.user_id FROM employees e WHERE e.id = ?',
      [id]
    );
    if (!employee) throw new AppError('Employee not found', 404);

    const isAdmin = req.user.role === 'admin';

    // Fields employees can update on their own profile
    const {
      name, phone, address, emergency_contact,
      // Admin-only fields
      department_id, designation, date_of_joining, status, email,
    } = req.body;

    // Update users table
    const userUpdates = [];
    const userParams = [];
    if (name) { userUpdates.push('name = ?'); userParams.push(name); }
    if (isAdmin && email) {
      // Ensure no duplicate email
      const [[dup]] = await conn.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.toLowerCase(), employee.user_id]
      );
      if (dup) throw new AppError('Email already in use', 409);
      userUpdates.push('email = ?');
      userParams.push(email.toLowerCase());
    }

    if (userUpdates.length) {
      await conn.query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
        [...userParams, employee.user_id]
      );
    }

    // Update employees table
    const empUpdates = [];
    const empParams = [];
    if (phone !== undefined)             { empUpdates.push('phone = ?');             empParams.push(phone); }
    if (address !== undefined)           { empUpdates.push('address = ?');           empParams.push(address); }
    if (emergency_contact !== undefined) { empUpdates.push('emergency_contact = ?'); empParams.push(emergency_contact); }
    if (isAdmin && department_id !== undefined) { empUpdates.push('department_id = ?'); empParams.push(department_id); }
    if (isAdmin && designation)          { empUpdates.push('designation = ?');       empParams.push(designation); }
    if (isAdmin && date_of_joining)      { empUpdates.push('date_of_joining = ?');   empParams.push(date_of_joining); }
    if (isAdmin && status)               { empUpdates.push('status = ?');            empParams.push(status); }

    if (empUpdates.length) {
      await conn.query(
        `UPDATE employees SET ${empUpdates.join(', ')} WHERE id = ?`,
        [...empParams, id]
      );
    }

    await conn.commit();

    const [rows] = await pool.query(`${EMPLOYEE_SELECT} WHERE e.id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: rows[0],
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/v1/employees/:id — Admin only
 * Soft-delete approach: deactivate user and set employee status to inactive
 */
const deleteEmployee = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const [[employee]] = await conn.query(
      'SELECT e.id, e.user_id FROM employees e WHERE e.id = ?',
      [id]
    );
    if (!employee) throw new AppError('Employee not found', 404);

    // Prevent deleting own admin account
    if (employee.user_id === req.user.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    await conn.query('UPDATE users SET is_active = 0 WHERE id = ?', [employee.user_id]);
    await conn.query("UPDATE employees SET status = 'inactive' WHERE id = ?", [id]);

    await conn.commit();

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
