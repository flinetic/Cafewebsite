import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'kitchen')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Not logged in OR role missing
  if (!isAuthenticated || !user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/orders" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
