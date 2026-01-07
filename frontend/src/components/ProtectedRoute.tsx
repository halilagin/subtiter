import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // TODO: Replace this with your actual authentication logic
  // This is a placeholder - you should implement your own auth check
  const isAuthenticated = () => {
    // Example: Check for token in localStorage, context, or state management
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  if (!isAuthenticated()) {
    // Redirect to landing page with the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
