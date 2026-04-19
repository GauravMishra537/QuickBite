import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiChevronDown, FiX, FiHelpCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const DEMO_LOGINS = [
  { label: 'Customer', icon: '👤', email: 'aarav.sharma@gmail.com', password: 'Password@123', color: '#3498db' },
  { label: 'Restaurant', icon: '🍽️', email: 'rajesh.kapoor@gmail.com', password: 'Password@123', color: '#e67e22' },
  { label: 'Cloud Kitchen', icon: '👨‍🍳', email: 'neha.verma@gmail.com', password: 'Password@123', color: '#9b59b6' },
  { label: 'Grocery', icon: '🛒', email: 'kavitha.nair@gmail.com', password: 'Password@123', color: '#27ae60' },
  { label: 'Delivery', icon: '🏍️', email: 'ravi.kumar@gmail.com', password: 'Password@123', color: '#e74c3c' },
  { label: 'NGO', icon: '🤝', email: 'sunita.devi@gmail.com', password: 'Password@123', color: '#1abc9c' },
];

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  // More modal
  const [showMoreModal, setShowMoreModal] = useState(false);

  // Demo secret modal (shared for admin and all demo logins)
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState('');
  const [pendingDemo, setPendingDemo] = useState(null); // holds the demo object waiting for secret

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    const result = await login(email, password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(result.user.role === 'customer' ? '/' : '/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  // ── Secret code verification (used for ALL demo logins including admin) ──
  const openSecretModal = (demo) => {
    setPendingDemo(demo);
    setSecretInput('');
    setSecretError('');
    setShowSecretModal(true);
    setShowMoreModal(false); // close More modal if open
  };

  const handleSecretVerify = () => {
    if (secretInput === 'quickbite@admin123') {
      setEmail(pendingDemo.email);
      setPassword(pendingDemo.password);
      setShowSecretModal(false);
      setSecretInput('');
      setSecretError('');
      setPendingDemo(null);
      toast.info(`${pendingDemo.icon} ${pendingDemo.label} credentials filled. Click Sign In.`);
    } else {
      setSecretError('❌ Wrong secret code. Access denied.');
    }
  };

  // ── Forgot password — Step 1: Fetch security question ──
  const handleForgotStep1 = async () => {
    setForgotError('');
    if (!forgotEmail.trim()) { setForgotError('Please enter your email'); return; }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/security-question', { email: forgotEmail.trim() });
      const q = res.data?.data?.securityQuestion || res.data?.securityQuestion || '';
      if (!q) {
        setForgotError('No security question found for this account.');
        return;
      }
      setSecurityQuestion(q);
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Email not found');
    } finally { setForgotLoading(false); }
  };

  // ── Forgot password — Step 2: Verify answer and reset ──
  const handleForgotReset = async () => {
    setForgotError('');
    if (!securityAnswer.trim()) { setForgotError('Please answer the security question'); return; }
    if (!newPassword.trim() || newPassword.length < 6) { setForgotError('Password must be at least 6 characters'); return; }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: forgotEmail.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword,
      });
      setForgotSuccess(res.data?.message || 'Password reset successfully!');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset failed');
    } finally { setForgotLoading(false); }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setNewPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  // ── Styles ──
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    animation: 'fadeInUp 0.3s ease',
  };
  const modalStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-xl)', width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto',
    boxShadow: 'var(--shadow-lg)', position: 'relative',
  };
  const closeBtn = { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' };

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
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <FiMail className="icon" />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="auth-input-icon">
              <input type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
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

        {/* ── Admin Login Button (centered) ── */}
        <button className="btn btn-ghost" onClick={() => openSecretModal({ label: 'Admin', icon: '🔐', email: 'admin@quickbite.com', password: 'Admin@123', color: '#9b59b6' })}
          style={{ width: '100%', marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: '0.875rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
          <FiShield /> Admin Login
        </button>

        {/* ── More & Forgot Password buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowMoreModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
            <FiChevronDown /> More
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowForgotModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <FiHelpCircle /> Forgot Password
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>

      {/* ══════════════ Secret Code Modal (for ALL demo logins) ══════════════ */}
      {showSecretModal && pendingDemo && (
        <div style={overlayStyle} onClick={() => { setShowSecretModal(false); setPendingDemo(null); }}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => { setShowSecretModal(false); setPendingDemo(null); setSecretError(''); setSecretInput(''); }}><FiX /></button>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{pendingDemo.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>{pendingDemo.label} Access</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Enter the secret code to access demo credentials</p>
            </div>
            {secretError && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{secretError}</div>}
            <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label>Secret Code</label>
              <div className="auth-input-icon">
                <input type="password" className="input" placeholder="Enter secret code..." value={secretInput} onChange={(e) => setSecretInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSecretVerify()} autoFocus />
                <FiShield className="icon" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 12, fontWeight: 700 }} onClick={handleSecretVerify}>
              🔓 Verify & Fill Credentials
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ More (Demo Logins) Modal ══════════════ */}
      {showMoreModal && (
        <div style={overlayStyle} onClick={() => setShowMoreModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setShowMoreModal(false)}><FiX /></button>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎭</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>Demo Accounts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Click any account — requires secret code to proceed</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {DEMO_LOGINS.map((demo) => (
                <button key={demo.email} onClick={() => openSecretModal(demo)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 12px', border: `2px solid ${demo.color}22`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', background: `${demo.color}08`, color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = demo.color; e.currentTarget.style.background = `${demo.color}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${demo.color}22`; e.currentTarget.style.background = `${demo.color}08`; e.currentTarget.style.transform = 'none'; }}>
                  <span style={{ fontSize: '1.75rem' }}>{demo.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{demo.label}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{demo.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Forgot Password Modal ══════════════ */}
      {showForgotModal && (
        <div style={overlayStyle} onClick={closeForgotModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={closeForgotModal}><FiX /></button>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔑</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
                {forgotStep === 3 ? 'Password Reset!' : 'Reset Password'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                {forgotStep === 1 && 'Enter your registered email address'}
                {forgotStep === 2 && 'Answer the question and set a new password'}
              </p>
            </div>

            {forgotError && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{forgotError}</div>}
            {forgotSuccess && (
              <div style={{ padding: '12px 16px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 'var(--radius-md)', color: '#27ae60', fontSize: '0.875rem', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                ✅ {forgotSuccess}
              </div>
            )}

            {/* Step 1: Enter email */}
            {forgotStep === 1 && (
              <>
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label>Email Address</label>
                  <div className="auth-input-icon">
                    <input type="email" className="input" placeholder="you@example.com" value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotStep1()} autoFocus />
                    <FiMail className="icon" />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: 12, fontWeight: 700 }}
                  onClick={handleForgotStep1} disabled={forgotLoading}>
                  {forgotLoading ? 'Looking up...' : 'Get Security Question →'}
                </button>
              </>
            )}

            {/* Step 2: Show question, answer, new password */}
            {forgotStep === 2 && (
              <>
                <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', border: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Security Question</p>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', lineHeight: 1.4 }}>{securityQuestion}</p>
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label>Your Answer</label>
                  <div className="auth-input-icon">
                    <input type="text" className="input" placeholder="Type your answer..." value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)} autoFocus />
                    <FiHelpCircle className="icon" />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label>New Password</label>
                  <div className="auth-input-icon">
                    <input type="password" className="input" placeholder="Min 6 characters" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotReset()} />
                    <FiLock className="icon" />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: 12, fontWeight: 700 }}
                  onClick={handleForgotReset} disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : '🔐 Reset Password'}
                </button>
              </>
            )}

            {/* Step 3: Success */}
            {forgotStep === 3 && (
              <button className="btn btn-primary" style={{ width: '100%', padding: 12, fontWeight: 700 }} onClick={closeForgotModal}>
                ✅ Back to Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
