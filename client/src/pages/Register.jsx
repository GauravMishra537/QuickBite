import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const ROLES = [
  { value: 'customer', icon: '🛒', label: 'Customer' },
  { value: 'restaurant', icon: '🍽️', label: 'Restaurant' },
  { value: 'cloudkitchen', icon: '☁️', label: 'Cloud Kitchen' },
  { value: 'grocery', icon: '🥬', label: 'Grocery' },
  { value: 'delivery', icon: '🏍️', label: 'Delivery' },
  { value: 'ngo', icon: '🤝', label: 'NGO' },
];

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const onChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role,
    });

    if (result.success) {
      toast.success(`Welcome to QuickBite, ${result.user.name}!`);
      navigate('/');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="auth-logo">🍔 <span>QuickBite</span></div>
          <h1>Create Account</h1>
          <p>Join thousands of users ordering delicious food</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>I want to join as</label>
            <div className="role-selector">
              {ROLES.map((role) => (
                <div
                  key={role.value}
                  className={`role-option ${form.role === role.value ? 'selected' : ''}`}
                  onClick={() => onChange('role', role.value)}
                >
                  <span className="role-option-icon">{role.icon}</span>
                  <span className="role-option-label">{role.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-input-row">
            <div className="input-group">
              <label>Full Name</label>
              <div className="auth-input-icon">
                <input type="text" className="input" placeholder="John Doe" value={form.name} onChange={(e) => onChange('name', e.target.value)} />
                <FiUser className="icon" />
              </div>
            </div>
            <div className="input-group">
              <label>Phone</label>
              <div className="auth-input-icon">
                <input type="tel" className="input" placeholder="+91 9876543210" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
                <FiPhone className="icon" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="auth-input-icon">
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => onChange('email', e.target.value)} autoComplete="email" />
              <FiMail className="icon" />
            </div>
          </div>

          <div className="auth-input-row">
            <div className="input-group">
              <label>Password</label>
              <div className="auth-input-icon">
                <input type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" value={form.password} onChange={(e) => onChange('password', e.target.value)} />
                <FiLock className="icon" />
              </div>
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="auth-input-icon">
                <input type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => onChange('confirmPassword', e.target.value)} />
                <FiLock className="icon" />
                <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
