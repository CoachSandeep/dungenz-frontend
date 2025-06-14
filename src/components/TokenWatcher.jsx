import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

const TokenWatcher = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    const isAuthPage = location.pathname === '/login' || location.pathname === '/caccount';

    if (token && isTokenValid(token)) {
      setIsLoggedIn(true);
      try {
        const { exp } = jwtDecode(token);
        const timeLeft = exp * 1000 - Date.now();
        if (timeLeft > 0) {
          const logoutTimer = setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Session expired. Please login again.');
            navigate('/login');
          }, timeLeft);

          return () => clearTimeout(logoutTimer);
        }
      } catch (err) {
        console.error('Token decode failed:', err);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      // 👇 Prevent infinite redirect loop
      if (!isAuthPage) {
        navigate('/login');
      }
    }
  }, [navigate, setIsLoggedIn, location]);

  return null;
};

export default TokenWatcher;
