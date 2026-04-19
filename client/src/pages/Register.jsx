import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCamera, FiHelpCircle } from 'react-icons/fi';
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

const SECURITY_QUESTIONS = [
  'What is your favourite food?',
  'What is the name of your first pet?',
  'What city were you born in?',
  "What is your mother's maiden name?",
  'What was your first car?',
  'What is your favourite book?',
  'What is your childhood nickname?',
  'What is the name of your school?',
  'What is your favourite movie?',
  'What street did you grow up on?',
  'What is your favourite dessert?',
  'What is your lucky number?',
  'What is your favourite cricket team?',
  'What is the name of your best friend?',
];

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    role: 'customer', avatar: '',
    securityQuestion: '', securityAnswer: '',
  });
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
    if (!form.securityQuestion || !form.securityAnswer.trim()) {
      setError('Please select a security question and provide an answer');
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role,
      securityQuestion: form.securityQuestion,
      securityAnswer: form.securityAnswer.trim(),
      ...(form.avatar && { avatar: form.avatar }),
    });

    if (result.success) {
      toast.success(`Welcome to QuickBite, ${result.user.name}!`);
      const role = result.user.role;
      if (role === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
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

          {/* ── Security Question & Answer ── */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-sm)' }}>
              <FiHelpCircle style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Security Question</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(for password recovery)</span>
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
              <select className="input" value={form.securityQuestion} onChange={(e) => onChange('securityQuestion', e.target.value)}
                style={{ cursor: 'pointer', appearance: 'auto' }}>
                <option value="">— Select a question —</option>
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            {form.securityQuestion && (
              <div className="input-group">
                <div className="auth-input-icon">
                  <input type="text" className="input" placeholder="Type your answer..." value={form.securityAnswer}
                    onChange={(e) => onChange('securityAnswer', e.target.value)} />
                  <FiHelpCircle className="icon" />
                </div>
              </div>
            )}
          </div>

          {/* Photo URL for business roles */}
          {['restaurant', 'cloudkitchen', 'grocery', 'delivery'].includes(form.role) && (
            <div className="input-group">
              <label>Profile Photo / Logo URL</label>
              <div className="auth-input-icon">
                <input type="url" className="input" placeholder="https://example.com/photo.jpg" value={form.avatar} onChange={(e) => onChange('avatar', e.target.value)} />
                <FiCamera className="icon" />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Paste a URL to your profile photo or business logo</span>
            </div>
          )}

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
