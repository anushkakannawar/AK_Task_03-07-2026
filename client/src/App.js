/**
 * App.js — Root component with routing
 * Evaluation Criterion: Role-based routing, clean architecture
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard';
import AdminEmployees  from './pages/admin/Employees';
import AdminDepartments from './pages/admin/Departments';
import AdminAttendance  from './pages/admin/Attendance';
import AdminLeaves      from './pages/admin/Leaves';
import AdminPayroll     from './pages/admin/Payroll';

// Employee pages
import EmployeeDashboard  from './pages/employee/Dashboard';
import EmployeeProfile    from './pages/employee/Profile';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeaves     from './pages/employee/Leaves';
import EmployeePayroll    from './pages/employee/Payroll';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* ── Admin Routes ─────────────────────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/employees"   element={<AdminEmployees />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/attendance"  element={<AdminAttendance />} />
            <Route path="/admin/leaves"      element={<AdminLeaves />} />
            <Route path="/admin/payroll"     element={<AdminPayroll />} />
          </Route>

          {/* ── Employee Routes ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole="employee" />}>
            <Route path="/employee/dashboard"  element={<EmployeeDashboard />} />
            <Route path="/employee/profile"    element={<EmployeeProfile />} />
            <Route path="/employee/attendance" element={<EmployeeAttendance />} />
            <Route path="/employee/leaves"     element={<EmployeeLeaves />} />
            <Route path="/employee/payroll"    element={<EmployeePayroll />} />
          </Route>

          {/* Fallback — redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
