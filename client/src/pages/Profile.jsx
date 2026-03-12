import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiCalendar, FiLogOut } from 'react-icons/fi';
import './Auth.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleIcons = {
    customer: '🛒', restaurant: '🍽️', cloudkitchen: '☁️',
    grocery: '🥬', delivery: '🏍️', ngo: '🤝', admin: '👑',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="profile-card">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">{getInitials(user.name)}</div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <div className="profile-role-badge">
                {roleIcons[user.role] || '👤'} {user.role}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="profile-body">
            {/* Account Info */}
            <div className="profile-section">
              <h3><FiUser /> Account Information</h3>
              <div className="profile-detail-grid">
                <div className="profile-detail">
                  <div className="profile-detail-label">Full Name</div>
                  <div className="profile-detail-value">{user.name}</div>
                </div>
                <div className="profile-detail">
                  <div className="profile-detail-label">Email</div>
                  <div className="profile-detail-value">{user.email}</div>
                </div>
                <div className="profile-detail">
                  <div className="profile-detail-label">Phone</div>
                  <div className="profile-detail-value">{user.phone || 'Not set'}</div>
                </div>
                <div className="profile-detail">
                  <div className="profile-detail-label">Role</div>
                  <div className="profile-detail-value" style={{ textTransform: 'capitalize' }}>
                    {roleIcons[user.role]} {user.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="profile-section">
                <h3><FiMapPin /> Saved Addresses</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {user.addresses.map((addr, i) => (
                    <div key={i} className="profile-address">
                      <div className="profile-address-icon"><FiMapPin /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                          {addr.label || 'Address'}
                          {addr.isDefault && <span className="badge badge-primary" style={{ marginLeft: 8 }}>Default</span>}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {addr.street}, {addr.city}, {addr.state} — {addr.zipCode}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Actions */}
            <div className="profile-section">
              <h3><FiShield /> Account Actions</h3>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
                  My Orders
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>
                  My Bookings
                </button>
                <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
