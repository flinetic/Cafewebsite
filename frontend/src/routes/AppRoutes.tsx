import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';

// Auth Pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import EmailVerifiedPage from '../pages/Auth/EmailVerifiedPage';

// Public Pages
import Home from '../pages/public/Home';
import Menu from '../pages/public/Menu';
import About from '../pages/public/About';
import TableMenu from '../pages/public/TableMenu';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import MenuManager from '../pages/admin/MenuManager';
import OffersManager from '../pages/admin/OffersManager';
import Orders from '../pages/admin/Orders';
import Tables from '../pages/admin/Tables';
import Settings from '../pages/admin/Settings';

// Protected Route Components
import ProtectedRoute from '../components/ProtectedRoute';
import LocationGuard from '../components/LocationGuard';
import EmailVerificationGuard from '../components/EmailVerificationGuard';

// Role-based redirect component - redirects kitchen users to Orders
const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // If user is not admin, redirect to orders
  if (user?.role !== 'admin') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <>{children}</>;
};

// Component to handle default routing based on role
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  // Kitchen users go directly to orders (which is their dashboard)
  if (user?.role === 'kitchen') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Dashboard />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  // Determine where to redirect logged-in users
  const getDefaultRoute = () => {
    if (!user) return '/admin/dashboard';
    return user.role === 'kitchen' ? '/admin/orders' : '/admin/dashboard';
  };

  return (
    <Routes>
      {/* Table Menu Route - Customer ordering via QR code (MUST be before PublicLayout) */}
      {/* Handles: /menu?table=X and /table/:tableNumber/menu */}
      <Route path="/table/:tableNumber/menu" element={
        <LocationGuard>
          <TableMenu />
        </LocationGuard>
      } />
      <Route path="/scan" element={
        <LocationGuard>
          <TableMenu />
        </LocationGuard>
      } />

      {/* Public Routes with PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Auth Routes (No Layout) */}
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getDefaultRoute()} replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={user ? <Navigate to={getDefaultRoute()} replace /> : <ResetPasswordPage />} />
      <Route path="/email-verified" element={<EmailVerifiedPage />} />

      {/* Admin Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={getDefaultRoute()} replace />} />
        {/* Dashboard is accessible without email verification */}
        <Route path="dashboard" element={<RoleBasedDashboard />} />

        {/* All other routes require email verification */}
        <Route path="tables" element={
          <EmailVerificationGuard>
            <AdminOnlyRoute>
              <Tables />
            </AdminOnlyRoute>
          </EmailVerificationGuard>
        } />
        <Route path="orders" element={
          <EmailVerificationGuard>
            <Orders />
          </EmailVerificationGuard>
        } />
        {/* Menu is accessible without email verification */}
        <Route path="menu" element={
          <EmailVerificationGuard>
            <AdminOnlyRoute>
              <MenuManager />
            </AdminOnlyRoute>
          </EmailVerificationGuard>
        } />
        <Route path="offers" element={
          <EmailVerificationGuard>
            <AdminOnlyRoute>
              <OffersManager />
            </AdminOnlyRoute>
          </EmailVerificationGuard>
        } />
        {/* Settings is accessible without email verification */}
        <Route path="settings" element={
          <Settings />
        } />
      </Route>

      {/* Legacy Route - Redirect old dashboard to new one */}
      <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

