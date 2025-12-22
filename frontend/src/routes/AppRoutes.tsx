import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';

// Auth Pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Public Pages
import Home from '../pages/public/Home';
import Menu from '../pages/public/Menu';
import About from '../pages/public/About';
import TableMenu from '../pages/public/TableMenu';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import MenuManager from '../pages/admin/MenuManager';
import Orders from '../pages/admin/Orders';
import Tables from '../pages/admin/Tables';

// Protected Route Component
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes with PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Table Menu Route - Customer ordering (No PublicLayout - standalone) */}
      <Route path="/table/:tableNumber/menu" element={<TableMenu />} />

      {/* Auth Routes (No Layout) */}
      <Route path="/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/admin/dashboard" replace /> : <RegisterPage />} />

      {/* Admin Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tables" element={<Tables />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<MenuManager />} />
      </Route>

      {/* Legacy Route - Redirect old dashboard to new one */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
