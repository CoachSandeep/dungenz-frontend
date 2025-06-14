import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicOnlyRoute = ({ children, isLoggedIn }) => {
  if (isLoggedIn) {
    return <Navigate to="/workouts" replace />;
  }
  return children;
};

export default PublicOnlyRoute;