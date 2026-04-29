import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Parolele nu se potrivesc!');
      return;
    }
    setLoading(true);
    try {
      await doRegister(username, email, password);
      toast.success('Cont creat cu succes!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Eroare la înregistrare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="input-group">
        <label htmlFor="register-username">Nume utilizator</label>
        <input
          id="register-username"
          type="text"
          className="input-field"
          placeholder="Ex: andrei_lungu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoFocus
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          className="input-field"
          placeholder="exemplu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-password">Parolă</label>
        <input
          id="register-password"
          type="password"
          className="input-field"
          placeholder="Min. 6 caractere"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-confirm">Confirmă parola</label>
        <input
          id="register-confirm"
          type="password"
          className="input-field"
          placeholder="Repetă parola"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" size="lg" fullWidth isLoading={loading} id="register-btn">
        {loading ? 'Se creează...' : 'Creează Cont'}
      </Button>
    </form>
  );
};

export default RegisterForm;
