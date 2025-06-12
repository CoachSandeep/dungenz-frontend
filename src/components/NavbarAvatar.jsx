import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavbarAvatar.css';

const NavbarAvatar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

  const toggleDropdown = () => setOpen(!open);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();
  const profileImage = user?.profileImage;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div className="navbar-avatar" ref={dropdownRef}>
      <div className="avatar-trigger" onClick={toggleDropdown}>
        {profileImage ? (
         <img src={`${process.env.REACT_APP_API_BASE_URL.replace('/api', '')}${profileImage}`} alt="avatar" className="avatar-img" />
        ) : (
          <div className="avatar-circle">{initials}</div>
        )}
      </div>

      {open && (
        <div className="avatar-dropdown">
          <p><strong>{user?.name}</strong></p>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{user?.email}</p>
          <hr />
          <button onClick={() => navigate('/profile')} className="dropdown-btn">🧍 View Profile</button>
          <button onClick={handleLogout} className="dropdown-btn">🚪 Logout</button>
        </div>
      )}
    </div>
  );
};

export default NavbarAvatar;
