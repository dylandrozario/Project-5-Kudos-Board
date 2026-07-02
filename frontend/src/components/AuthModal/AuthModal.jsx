import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isRegister = mode === 'register';

  const reset = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    setMode('login');
    onClose?.();
  };

  const switchMode = () => {
    setError(null);
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await onRegister?.({
          email: email.trim(),
          username: username.trim() || undefined,
          password,
        });
      } else {
        await onLogin?.({ email: email.trim(), password });
      }
      reset();
      onClose?.();
    } catch (err) {
      // Surface the backend's message (e.g. "Invalid credentials.") when present.
      setError(
        err?.response?.data?.error ?? err?.message ?? 'Something went wrong.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isRegister ? 'Create an account' : 'Welcome back'}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        {isRegister && (
          <label className="auth-form__field">
            <span>Username (optional)</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        )}

        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isRegister ? 8 : undefined}
          />
        </label>

        {error && <p className="auth-form__error">{error}</p>}

        <div className="auth-form__actions">
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isRegister
                ? 'Creating…'
                : 'Signing in…'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </div>

        <p className="auth-form__switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="auth-form__switch-btn" onClick={switchMode}>
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </form>
    </Modal>
  );
}

export default AuthModal;
