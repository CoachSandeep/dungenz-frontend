import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PublicOnlyRoute = ({ children, isLoggedIn }) => {
  const location = useLocation();

  // ✅ Allow access to reset-password page even if logged in
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password');

  if (isLoggedIn && !isResetPasswordRoute) {
    return <Navigate to="/workouts" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
