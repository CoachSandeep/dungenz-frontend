import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation, Link } from 'react-router-dom';
import './../styles/Header.css';
import logo from '../assets/logo.png';
import dp from '../assets/dp.png';
import adminShield from '../assets/admin-shield.png';
import NavbarAvatar from './NavbarAvatar'; // ✅ Add this line

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // ✅ To pass into NavbarAvatar

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
      if (storedUser.role === 'superadmin') {
        setIsSuperadmin(true);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    setNavOpen(false);
    setAdminMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setNavOpen(!navOpen);
    setAdminMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsSuperadmin(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left" onClick={() => navigate('/workouts')}>
        <img src={logo} alt="DUNGENZ" className="navbar-logo" />
        <img src={dp} alt="DUNGENZ" className="navbar-logo" />
      </div>

      <div className={`navbar-right ${navOpen ? 'open' : ''}`}>
        {isLoggedIn ? (
          <>
            <NavbarAvatar user={user} onLogout={handleLogout} />
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/caccount')}>Register</button>
          </>
        )}
      </div>

      {isSuperadmin && (
        <div className="admin-shield-container">
          <img
            src={adminShield}
            alt="Admin"
            className="admin-shield-icon"
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          />
          {adminMenuOpen && (
            <div className="admin-dropdown">
              <button onClick={() => navigate('/admin')}>🛠 Manage Workouts</button>
              <button onClick={() => navigate('/admin/cluster-copy')}>🔁 Cluster Copy</button>
              <button onClick={() => navigate('/library')}>📚 Library</button>
              <button onClick={() => navigate('/settings')}>Setting</button>
              <Link to="/admin/push">🔔 Push Panel</Link>
            </div>
          )}
        </div>
      )}

      {/* <div className="hamburger" onClick={toggleMenu}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div> */}
    </header>
  );
};

export default Navbar;
