/**
 * @module components/common/Navbar
 * @description Top navigation bar matching Stitch design.
 * Shows TaskFlow branding, navigation links, and user avatar.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="#8083ff" />
              <rect x="14" y="3" width="7" height="7" rx="2" fill="#c0c1ff" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="2" fill="#c0c1ff" opacity="0.4" />
              <rect x="14" y="14" width="7" height="7" rx="2" fill="#8083ff" opacity="0.8" />
            </svg>
          </div>
          <span className="navbar-title">TaskFlow</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </NavLink>
          <NavLink to="/completed" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Finalizate
          </NavLink>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <span className="navbar-username">{user?.username}</span>
          <div className="avatar" title={user?.email}>
            {initials}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} id="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
