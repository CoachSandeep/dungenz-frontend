import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from './auth'; // ✅ import correctly

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const valid = isTokenValid(token);

  console.log("Token is valid?", isTokenValid(localStorage.getItem('token')));

  return valid ? children : <Navigate to="/login" />;
};

export default PrivateRoute;