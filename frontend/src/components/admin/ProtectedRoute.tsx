import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient, API_ENDPOINTS } from '../../config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verify authentication via httpOnly cookie
        // apiClient automatically sends cookies with withCredentials: true
        await apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
        setIsAuthenticated(true);
      } catch {
        // Clear any cached user data on auth failure
        sessionStorage.removeItem('admin_user');
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
