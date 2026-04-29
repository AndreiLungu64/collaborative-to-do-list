import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const LoginForm = () => {
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
  );
};

export default LoginForm;
