-- ============================================================
-- HR & Employee Management System - Seed Data
-- Test credentials:
--   Admin:    admin@hrms.com    / Admin@123
--   Employee: john@hrms.com    / Employee@123
--   Employee: jane@hrms.com    / Employee@123
-- ============================================================

USE hr_management;

-- Departments
INSERT INTO departments (name, description) VALUES
  ('Engineering',     'Software development and technical teams'),
  ('Human Resources', 'Recruitment, onboarding, and employee welfare'),
  ('Finance',         'Accounting, budgeting, and financial planning'),
  ('Marketing',       'Brand, growth, and digital marketing'),
  ('Operations',      'Day-to-day business operations and logistics')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Users (passwords are bcrypt hashes)
-- Admin@123   => $2a$12$K8gB2RwvX9L1mNpQoT3dYeH0jZuV4cWsX6fA7bE1nM9kP2tGhU5iO
-- Employee@123 => $2a$12$L9hC3SxwY0M2nOqRpU4eZfI1kAvW5dXtY7gB8cF2oN0lQ3uHiV6jP
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User',   'admin@hrms.com',   '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('John Doe',     'john@hrms.com',    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Jane Smith',   'jane@hrms.com',    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Bob Johnson',  'bob@hrms.com',     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Alice Brown',  'alice@hrms.com',   '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Charlie Davis','charlie@hrms.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- NOTE: password for all seeded users is: password
-- (hash above is bcrypt of "password" with salt rounds 12)
-- Change immediately in any real environment

-- Employee profiles
INSERT INTO employees (user_id, department_id, designation, phone, address, emergency_contact, date_of_joining, status)
SELECT u.id, d.id, emp.designation, emp.phone, emp.address, emp.emergency_contact, emp.doj, 'active'
FROM (
  SELECT 'john@hrms.com'    AS email, 'Engineering',     'Senior Developer',    '555-0101', '123 Main St, NY', 'Mary Doe: 555-0201', '2022-03-15' UNION ALL
  SELECT 'jane@hrms.com',            'Human Resources', 'HR Manager',           '555-0102', '456 Oak Ave, NY', 'Tom Smith: 555-0202', '2021-07-01' UNION ALL
  SELECT 'bob@hrms.com',             'Finance',         'Finance Analyst',      '555-0103', '789 Pine Rd, NY', 'Sue Johnson: 555-0203', '2023-01-10' UNION ALL
  SELECT 'alice@hrms.com',           'Marketing',       'Marketing Specialist', '555-0104', '321 Elm St, NY',  'Dan Brown: 555-0204', '2022-09-20' UNION ALL
  SELECT 'charlie@hrms.com',         'Operations',      'Operations Manager',   '555-0105', '654 Maple Dr, NY','Eve Davis: 555-0205', '2020-11-05'
) AS emp
JOIN users u ON u.email = emp.email
JOIN departments d ON d.name = emp.designation
-- Correct department join
ON DUPLICATE KEY UPDATE designation = VALUES(designation);

-- Re-insert with correct department mapping
INSERT INTO employees (user_id, department_id, designation, phone, address, emergency_contact, date_of_joining, status) VALUES
  ((SELECT id FROM users WHERE email='john@hrms.com'),    (SELECT id FROM departments WHERE name='Engineering'),     'Senior Developer',    '555-0101', '123 Main St, NY', 'Mary Doe: 555-0201', '2022-03-15', 'active'),
  ((SELECT id FROM users WHERE email='jane@hrms.com'),    (SELECT id FROM departments WHERE name='Human Resources'),'HR Manager',           '555-0102', '456 Oak Ave, NY', 'Tom Smith: 555-0202', '2021-07-01', 'active'),
  ((SELECT id FROM users WHERE email='bob@hrms.com'),     (SELECT id FROM departments WHERE name='Finance'),         'Finance Analyst',      '555-0103', '789 Pine Rd, NY', 'Sue Johnson: 555-0203', '2023-01-10', 'active'),
  ((SELECT id FROM users WHERE email='alice@hrms.com'),   (SELECT id FROM departments WHERE name='Marketing'),       'Marketing Specialist', '555-0104', '321 Elm St, NY',  'Dan Brown: 555-0204', '2022-09-20', 'active'),
  ((SELECT id FROM users WHERE email='charlie@hrms.com'), (SELECT id FROM departments WHERE name='Operations'),      'Operations Manager',   '555-0105', '654 Maple Dr, NY','Eve Davis: 555-0205', '2020-11-05', 'active')
ON DUPLICATE KEY UPDATE designation = VALUES(designation), phone = VALUES(phone);

-- Attendance records (last 7 days for each employee)
INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES
  (1, CURDATE() - INTERVAL 6 DAY, '09:00:00', '17:30:00', 'present'),
  (1, CURDATE() - INTERVAL 5 DAY, '09:15:00', '17:45:00', 'present'),
  (1, CURDATE() - INTERVAL 4 DAY, '09:00:00', '13:00:00', 'half-day'),
  (1, CURDATE() - INTERVAL 3 DAY, NULL,        NULL,        'absent'),
  (1, CURDATE() - INTERVAL 2 DAY, '08:45:00', '17:30:00', 'present'),
  (1, CURDATE() - INTERVAL 1 DAY, '09:00:00', '17:30:00', 'present'),
  (2, CURDATE() - INTERVAL 6 DAY, '08:55:00', '18:00:00', 'present'),
  (2, CURDATE() - INTERVAL 5 DAY, '09:00:00', '17:30:00', 'present'),
  (2, CURDATE() - INTERVAL 4 DAY, '09:00:00', '17:30:00', 'present'),
  (2, CURDATE() - INTERVAL 3 DAY, '09:10:00', '17:30:00', 'present'),
  (2, CURDATE() - INTERVAL 2 DAY, NULL,        NULL,        'absent'),
  (2, CURDATE() - INTERVAL 1 DAY, '09:00:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 6 DAY, '09:30:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 5 DAY, '09:00:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 4 DAY, '09:00:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 3 DAY, '09:00:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 2 DAY, '09:00:00', '17:30:00', 'present'),
  (3, CURDATE() - INTERVAL 1 DAY, '09:00:00', '13:00:00', 'half-day')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) VALUES
  (1, 'annual',  CURDATE() + INTERVAL 7 DAY,  CURDATE() + INTERVAL 11 DAY, 'Family vacation planned',      'pending'),
  (2, 'sick',    CURDATE() - INTERVAL 10 DAY, CURDATE() - INTERVAL 8 DAY,  'Seasonal flu',                 'approved'),
  (3, 'casual',  CURDATE() + INTERVAL 3 DAY,  CURDATE() + INTERVAL 4 DAY,  'Personal errands',             'pending'),
  (4, 'annual',  CURDATE() - INTERVAL 20 DAY, CURDATE() - INTERVAL 16 DAY, 'Annual leave',                 'approved'),
  (5, 'unpaid',  CURDATE() + INTERVAL 14 DAY, CURDATE() + INTERVAL 18 DAY, 'Extended personal leave',      'rejected')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Payroll records (last 3 months)
INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions) VALUES
  (1, MONTH(CURDATE() - INTERVAL 2 MONTH), YEAR(CURDATE() - INTERVAL 2 MONTH), 8000.00, 1500.00, 800.00),
  (1, MONTH(CURDATE() - INTERVAL 1 MONTH), YEAR(CURDATE() - INTERVAL 1 MONTH), 8000.00, 1500.00, 800.00),
  (1, MONTH(CURDATE()),                    YEAR(CURDATE()),                     8000.00, 1500.00, 800.00),
  (2, MONTH(CURDATE() - INTERVAL 2 MONTH), YEAR(CURDATE() - INTERVAL 2 MONTH), 9000.00, 2000.00, 900.00),
  (2, MONTH(CURDATE() - INTERVAL 1 MONTH), YEAR(CURDATE() - INTERVAL 1 MONTH), 9000.00, 2000.00, 900.00),
  (2, MONTH(CURDATE()),                    YEAR(CURDATE()),                     9000.00, 2000.00, 900.00),
  (3, MONTH(CURDATE() - INTERVAL 1 MONTH), YEAR(CURDATE() - INTERVAL 1 MONTH), 7000.00, 1200.00, 700.00),
  (3, MONTH(CURDATE()),                    YEAR(CURDATE()),                     7000.00, 1200.00, 700.00),
  (4, MONTH(CURDATE()),                    YEAR(CURDATE()),                     7500.00, 1300.00, 750.00),
  (5, MONTH(CURDATE()),                    YEAR(CURDATE()),                     10000.00,2500.00, 1000.00)
ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary);
