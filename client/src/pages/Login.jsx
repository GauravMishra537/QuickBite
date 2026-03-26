import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }

    const result = await login(email, password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      // Role-based redirect
      const role = result.user.role;
      if (role === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🍔 <span>QuickBite</span></div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue ordering your favourites</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="auth-input-icon">
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <FiMail className="icon" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="auth-input-icon">
              <input
                type={showPw ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <FiLock className="icon" />
              <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        {/* Quick login for demo */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {[
            { label: 'Customer', email: 'aarav.sharma@gmail.com' },
            { label: 'Restaurant', email: 'rajesh.kapoor@gmail.com' },
            { label: 'Cloud Kitchen', email: 'neha.verma@gmail.com' },
            { label: 'Grocery', email: 'kavitha.nair@gmail.com' },
            { label: 'Delivery', email: 'delivery@quickbite.com' },
            { label: 'NGO', email: 'ngo@quickbite.com' },
            { label: 'Admin', email: 'admin@quickbite.com' },
          ].map((demo) => (
            <button
              key={demo.email}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem' }}
              onClick={() => {
                if (demo.label === 'Admin') {
                  const secret = window.prompt('🔐 Enter Admin Secret Password:');
                  if (secret !== 'quickbite@admin123') {
                    alert('❌ Wrong admin secret. Access denied.');
                    return;
                  }
                }
                setEmail(demo.email);
                setPassword(demo.label === 'Admin' ? 'Admin@123' : 'Password@123');
              }}
            >
              Demo: {demo.label}
            </button>
          ))}
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
