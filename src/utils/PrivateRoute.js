import { Navigate } from 'react-router-dom';
import { isTokenValid } from './auth';

const PrivateRoute = ({ children }) => {
  console.log("🛡️ isTokenValid:", isTokenValid(token)); // Inside PrivateRoute
  const token = localStorage.getItem('token');
  return isTokenValid(token) ? children : <Navigate to="/login" />;
};

export default PrivateRoute;