import { Navigate } from 'react-router-dom';
import { isTokenValid } from './auth';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return isTokenValid(token) ? children : <Navigate to="/login" />;
};

export default PrivateRoute;