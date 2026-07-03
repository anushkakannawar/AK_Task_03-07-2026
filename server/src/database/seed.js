/**
 * Database Seed Script
 * Inserts test data for development
 * Run with: npm run db:seed
 * 
 * Test credentials (all use password: "password"):
 *   admin@hrms.com    — Admin role
 *   john@hrms.com     — Employee role
 *   jane@hrms.com     — Employee role
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management',
    multipleStatements: true,
  });

  try {
    console.log('🌱 Seeding database...');

    // Hash password for all seed users
    const passwordHash = await bcrypt.hash('password', 12);

    // Departments
    await connection.query(`
      INSERT INTO departments (name, description) VALUES
        ('Engineering',     'Software development and technical teams'),
        ('Human Resources', 'Recruitment, onboarding, and employee welfare'),
        ('Finance',         'Accounting, budgeting, and financial planning'),
        ('Marketing',       'Brand, growth, and digital marketing'),
        ('Operations',      'Day-to-day business operations and logistics')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);
    console.log('  ✓ Departments seeded');

    // Users
    const users = [
      { name: 'Admin User',    email: 'admin@hrms.com',    role: 'admin' },
      { name: 'John Doe',      email: 'john@hrms.com',     role: 'employee' },
      { name: 'Jane Smith',    email: 'jane@hrms.com',     role: 'employee' },
      { name: 'Bob Johnson',   email: 'bob@hrms.com',      role: 'employee' },
      { name: 'Alice Brown',   email: 'alice@hrms.com',    role: 'employee' },
      { name: 'Charlie Davis', email: 'charlie@hrms.com',  role: 'employee' },
    ];

    for (const user of users) {
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [user.name, user.email, passwordHash, user.role]
      );
    }
    console.log('  ✓ Users seeded (password: "password" for all)');

    // Employees
    const empData = [
      { email: 'john@hrms.com',    dept: 'Engineering',     designation: 'Senior Developer',    phone: '555-0101', doj: '2022-03-15' },
      { email: 'jane@hrms.com',    dept: 'Human Resources', designation: 'HR Manager',           phone: '555-0102', doj: '2021-07-01' },
      { email: 'bob@hrms.com',     dept: 'Finance',         designation: 'Finance Analyst',      phone: '555-0103', doj: '2023-01-10' },
      { email: 'alice@hrms.com',   dept: 'Marketing',       designation: 'Marketing Specialist', phone: '555-0104', doj: '2022-09-20' },
      { email: 'charlie@hrms.com', dept: 'Operations',      designation: 'Operations Manager',   phone: '555-0105', doj: '2020-11-05' },
    ];

    for (const emp of empData) {
      const [[user]] = await connection.query('SELECT id FROM users WHERE email = ?', [emp.email]);
      const [[dept]] = await connection.query('SELECT id FROM departments WHERE name = ?', [emp.dept]);
      if (user && dept) {
        await connection.query(
          `INSERT INTO employees (user_id, department_id, designation, phone, address, emergency_contact, date_of_joining, status)
           VALUES (?, ?, ?, ?, '123 Sample St, New York', 'Emergency Contact: 555-9999', ?, 'active')
           ON DUPLICATE KEY UPDATE designation = VALUES(designation), phone = VALUES(phone)`,
          [user.id, dept.id, emp.designation, emp.phone, emp.doj]
        );
      }
    }
    console.log('  ✓ Employee profiles seeded');

    // Attendance (last 7 days)
    const [[{ eid1 }]] = await connection.query(
      'SELECT e.id as eid1 FROM employees e JOIN users u ON u.id=e.user_id WHERE u.email="john@hrms.com"'
    );
    const [[{ eid2 }]] = await connection.query(
      'SELECT e.id as eid2 FROM employees e JOIN users u ON u.id=e.user_id WHERE u.email="jane@hrms.com"'
    );

    const attendanceRecords = [
      [eid1, 'present', 1], [eid1, 'present', 2], [eid1, 'half-day', 3],
      [eid1, 'absent',  4], [eid1, 'present', 5], [eid1, 'present', 6],
      [eid2, 'present', 1], [eid2, 'present', 2], [eid2, 'present', 3],
      [eid2, 'present', 4], [eid2, 'absent',  5], [eid2, 'present', 6],
    ];

    for (const [empId, status, daysAgo] of attendanceRecords) {
      await connection.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
         VALUES (?, CURDATE() - INTERVAL ? DAY, '09:00:00', '17:30:00', ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [empId, daysAgo, status]
      );
    }
    console.log('  ✓ Attendance records seeded');

    // Leave requests
    await connection.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, 'annual', CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 11 DAY, 'Family vacation planned', 'pending')
       ON DUPLICATE KEY UPDATE status = status`,
      [eid1]
    );
    await connection.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, 'sick', CURDATE() - INTERVAL 10 DAY, CURDATE() - INTERVAL 8 DAY, 'Seasonal flu', 'approved')
       ON DUPLICATE KEY UPDATE status = status`,
      [eid2]
    );
    console.log('  ✓ Leave requests seeded');

    // Payroll
    for (const empId of [eid1, eid2]) {
      const salary = empId === eid1 ? 8000 : 9000;
      await connection.query(
        `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions)
         VALUES (?, MONTH(CURDATE()), YEAR(CURDATE()), ?, 1500.00, 800.00)
         ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary)`,
        [empId, salary]
      );
    }
    console.log('  ✓ Payroll records seeded');

    console.log('\n✅ Database seeded successfully!');
    console.log('📌 Login credentials (password: "password" for all):');
    console.log('   Admin:    admin@hrms.com');
    console.log('   Employee: john@hrms.com | jane@hrms.com | bob@hrms.com');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
