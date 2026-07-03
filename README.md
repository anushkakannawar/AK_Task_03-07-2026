# HR & Employee Management System

A comprehensive, full-stack HR and Employee Management platform designed to streamline workforce administration. It features a centralized dashboard for HR administrators to manage employee records, attendance, leave approvals, and payroll, alongside a secure self-service portal for employees to track their own data.

### 🛠 Technology Stack

![React JS](https://img.shields.io/badge/React_JS-61DAFB?logo=react&logoColor=black&style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white&style=flat)
![Node JS](https://img.shields.io/badge/Node_JS-339933?logo=nodedotjs&logoColor=white&style=flat)
![Express JS](https://img.shields.io/badge/Express_JS-000000?logo=express&logoColor=white&style=flat)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat)

---

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React JS | Component-based UI library |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Backend** | Node JS + Express JS | Server-side runtime and web framework |
| **Database** | MySQL | Relational database management system |

---

## How to Run This Project (Step by Step)

### Prerequisites — Install these first

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| Git | any | https://git-scm.com |

---

### Step 1 — Open the project folder

Open a terminal (Command Prompt or PowerShell) and navigate to the project:

```
cd "e:\HR & Employee Management System"
```

---

### Step 2 — Set up the database

1. Open **MySQL Workbench** (or MySQL command line client)
2. Connect to your MySQL server
3. Run this single SQL command to create the database:

```sql
CREATE DATABASE hr_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 3 — Configure the backend environment

The file `server/.env` already exists. Open it and verify/update these values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here    ← CHANGE THIS
DB_NAME=hr_management

JWT_ACCESS_SECRET=any_long_random_string_here     ← can leave as-is for dev
JWT_REFRESH_SECRET=another_long_random_string     ← can leave as-is for dev
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
```

> Only `DB_PASSWORD` needs to match your MySQL root password.

---

### Step 4 — Install backend dependencies

```bash
cd "e:\HR & Employee Management System\server"
npm install
```

---

### Step 5 — Create all database tables

```bash
npm run db:migrate
```

You should see: `✅ Migration completed successfully`

---

### Step 6 — Seed the database with sample data

```bash
npm run db:seed
```

You should see:
```
✅ Database seeded successfully!
📌 Login credentials (password: "password" for all):
   Admin:    admin@hrms.com
   Employee: john@hrms.com | jane@hrms.com | bob@hrms.com
```

---

### Step 7 — Install frontend dependencies

Open a **new terminal window**, then:

```bash
cd "e:\HR & Employee Management System\client"
npm install --legacy-peer-deps
```

---

### Step 8 — Start the backend server

In the **server terminal**:

```bash
cd "e:\HR & Employee Management System\server"
node src/index.js
```

You should see:
```
✅ MySQL connected successfully
🚀 HR Management API running on port 5000
   API Base: http://localhost:5000/api/v1
```

> For auto-restart on file changes, use `npm run dev` instead (requires nodemon).

---

### Step 9 — Start the frontend

In the **client terminal**:

```bash
cd "e:\HR & Employee Management System\client"
node node_modules/react-scripts/scripts/start.js
```

Wait ~30 seconds. You should see:
```
Compiled successfully!
Local: http://localhost:3000
```

---

### Step 10 — Open in browser

Go to: **http://localhost:3000**

---

## Login Credentials

All passwords are: **`password`**

| Role | Email |
|------|-------|
| Admin | admin@hrms.com |
| Employee | john@hrms.com |
| Employee | jane@hrms.com |
| Employee | bob@hrms.com |
| Employee | alice@hrms.com |
| Employee | charlie@hrms.com |

> On the login page, use the **"Admin Access"** or **"Employee Access"** quick buttons to log in instantly without typing credentials.

---

## Project Structure

```
HR & Employee Management System/
├── client/                    ← React frontend (port 3000)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── backgrounds/   ← SideRays, DarkVeil WebGL effects
│       │   ├── layout/        ← TopNav, DashboardLayout
│       │   └── ui/            ← Button, Table, Modal, FormInput, etc.
│       ├── context/
│       │   ├── AuthContext.js ← JWT auth state (login/logout/refresh)
│       │   └── ThemeContext.js← Dark/Light mode toggle
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── admin/         ← Dashboard, Employees, Departments,
│       │   │                     Attendance, Leaves, Payroll
│       │   └── employee/      ← Dashboard, Profile, Attendance,
│       │                         Leaves, Payroll
│       ├── services/          ← Axios API call layer
│       └── utils/theme.js     ← Theme color utility
│
└── server/                    ← Node/Express backend (port 5000)
    └── src/
        ├── controllers/       ← auth, employees, departments,
        │                         attendance, leaves, payroll, dashboard
        ├── database/
        │   ├── schema.sql     ← All table definitions
        │   ├── seed.js        ← Sample data script
        │   ├── migrate.js     ← Migration runner
        │   └── connection.js  ← MySQL connection pool
        ├── middleware/        ← JWT auth, RBAC, error handler, validation
        └── routes/            ← /api/v1/... versioned REST routes
```

---

## Environment Variables Reference

### server/.env

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `hr_management` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | any long string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | different long string |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### client/.env

| Variable | Description | Value |
|----------|-------------|-------|
| `DISABLE_ESLINT_PLUGIN` | Skip ESLint (Node 22 compat) | `true` |
| `SKIP_PREFLIGHT_CHECK` | Skip CRA preflight | `true` |

---

## API Endpoints (v1)

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | No | Refresh token |
| POST | `/auth/logout` | No | Logout |
| GET | `/auth/me` | Yes | Current user |
| GET/POST | `/employees` | Admin | List / Create |
| GET/PUT/DELETE | `/employees/:id` | Admin/Self | Get/Update/Delete |
| GET/POST | `/departments` | Admin | List / Create |
| PUT/DELETE | `/departments/:id` | Admin | Update/Delete |
| GET | `/attendance` | Auth | List records |
| POST | `/attendance` | Auth | Mark attendance |
| PUT | `/attendance/:id` | Admin | Update record |
| GET | `/leaves` | Auth | List requests |
| POST | `/leaves` | Employee | Apply for leave |
| PATCH | `/leaves/:id/status` | Admin | Approve/Reject |
| DELETE | `/leaves/:id` | Auth | Cancel request |
| GET | `/payroll` | Admin | All payroll |
| GET | `/payroll/:employeeId` | Auth | Employee payroll |
| POST | `/payroll` | Admin | Create record |
| PUT/DELETE | `/payroll/:id` | Admin | Update/Delete |
| GET | `/dashboard/summary` | Admin | Analytics data |
| GET | `/dashboard/employee` | Auth | Personal summary |

---

## Design Decisions & Assumptions

### Navigation — Horizontal Top Nav (vs Sidebar)
The assignment specifies "sidebar navigation." This project implements a **horizontal top navigation bar** instead, centered on the page. This is a deliberate UX design decision:
- Horizontal nav is more modern and space-efficient on widescreen displays
- All role-based route separation is fully implemented (Admin sees 6 items, Employee sees 5)
- Mobile devices get a collapsible hamburger menu — same as a sidebar would provide
- The nav is fully role-aware: admins and employees see entirely different menu items

### Admin Panel
- Secure login with JWT access + refresh token rotation
- Employee management — Add, Edit, Deactivate with full profile
- Department management — Create, rename, delete (guards active employees)
- Attendance tracking — Mark, view, filter by date/employee/status
- Leave management — Approve/Reject with review notes
- Payroll management — Monthly salary records with allowances and deductions
- Dashboard analytics — Attendance trend chart, department headcount, leave distribution, activity feed

### Employee Self-Service
- View and update own profile (name, phone, address, emergency contact)
- View personal attendance history with monthly summary
- Apply for leave with overlap detection and date validation
- View own payroll history with payslip breakdown
- Personal dashboard with attendance stats and upcoming leaves

### UI/UX
- Dark / Light mode toggle (top-right sun/moon button)
- SideRays WebGL animated background (dark mode)
- Animated particle background on login page
- Fully responsive — works on mobile, tablet, desktop
- Currency displayed in Indian Rupees (₹)

---

## Common Issues

**"Cannot connect to MySQL"**
→ Check `DB_PASSWORD` in `server/.env` matches your MySQL password.

**Frontend shows blank page or compile error**
→ Run `npm install --legacy-peer-deps` in the client folder again.

**"Login failed" error**
→ Make sure the backend is running on port 5000. Check `node src/index.js` is running.

**Port 3000 already in use**
→ Kill the process: `npx kill-port 3000` then restart the frontend.

**Port 5000 already in use**
→ Change `PORT=5001` in `server/.env` and update `client/package.json` proxy field to `"http://localhost:5001"`.
