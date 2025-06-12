import React, { useState, useRef, useEffect } from 'react';
import '../styles/NavbarAvatar.css';

const NavbarAvatar = ({ user }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

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
  const profileImage = user?.avatar;

  return (
    <div className="navbar-avatar" ref={dropdownRef}>
      <div className="avatar-trigger" onClick={toggleDropdown}>
        {profileImage ? (
          <img src={profileImage} alt="avatar" className="avatar-img" />
        ) : (
          <div className="avatar-circle">{initials}</div>
        )}
      </div>

      {open && (
        <div className="avatar-dropdown">
          <p><strong>{user?.name}</strong></p>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{user?.email}</p>
          <hr />
          <a href="/profile">🧍 View Profile</a>
          <a href="#" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}>🚪 Logout</a>
        </div>
      )}
    </div>
  );
};

export default NavbarAvatar;
