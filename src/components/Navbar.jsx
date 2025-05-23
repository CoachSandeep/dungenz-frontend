import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation, Link  } from 'react-router-dom';
import './../styles/Header.css';
import logo from '../assets/logo.png';
import dp from '../assets/dp.png';
import adminShield from '../assets/admin-shield.png'; // Save this image in /assets

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
   
    if (token) {
      setIsLoggedIn(true);
      if (user?.role === 'superadmin') {
        setIsSuperadmin(true);
      }
    }
    setNavOpen(false);
    setAdminMenuOpen(false);

  }, [location.pathname]);

 
  const toggleMenu = () => {
    setNavOpen(!navOpen);
    setAdminMenuOpen(false); // Close admin menu if nav toggled
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsSuperadmin(false);
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
            <button onClick={() => navigate('/upload')}>Upload Workout</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
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

      <div className="hamburger" onClick={toggleMenu}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>
    </header>
  );
};

export default Navbar;
