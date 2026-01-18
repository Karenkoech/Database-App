import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1002, position: 'relative', pointerEvents: 'auto' }}>
          <span className="nav-icon">🔍</span>
          <span className="nav-title">Database Audit Tool</span>
        </Link>
        <div className="nav-menu">
          <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            Contact
          </Link>
          <div className="nav-user">
            <span>{user?.fullName || user?.username || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
