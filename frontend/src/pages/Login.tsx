/**
 * @module pages/Login
 * @description Login page matching the Stitch "TaskFlow Login Page" design.
 * Glassmorphism card, deep slate background, indigo accents.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      {/* Decorative gradient orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card glass-card-elevated"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="2" fill="#8083ff" />
            <rect x="14" y="3" width="7" height="7" rx="2" fill="#c0c1ff" opacity="0.6" />
            <rect x="3" y="14" width="7" height="7" rx="2" fill="#c0c1ff" opacity="0.4" />
            <rect x="14" y="14" width="7" height="7" rx="2" fill="#8083ff" opacity="0.8" />
          </svg>
          <h1 className="auth-title">TaskFlow</h1>
          <p className="auth-subtitle">Gestionare colaborativă a task-urilor</p>
        </div>

        <LoginForm />

        <p className="auth-switch">
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
