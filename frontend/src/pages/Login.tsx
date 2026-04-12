/**
 * @module pages/Login
 * @description Login page matching the Stitch "TaskFlow Login Page" design.
 * Glassmorphism card, deep slate background, indigo accents.
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Autentificare reușită!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="exemplu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Parolă</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={loading}
            id="sign-in-btn"
          >
            {loading ? 'Se autentifică...' : 'Sign In'}
          </Button>
        </form>

        <p className="auth-switch">
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
