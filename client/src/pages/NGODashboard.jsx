import { useEffect, useState } from 'react';
import { FiHeart, FiPackage, FiCheckCircle, FiMapPin, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const NGODashboard = () => {
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [available, setAvailable] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ngoRes, availRes, recvRes] = await Promise.all([
          api.get('/donations/ngo/my').catch(() => ({ data: null })),
          api.get('/donations/available').catch(() => ({ donations: [] })),
          api.get('/donations/ngo/received').catch(() => ({ donations: [] })),
        ]);
        setNgo(ngoRes.data?.ngo || ngoRes.ngo || ngoRes.data || null);
        setAvailable(availRes.data?.donations || availRes.donations || []);
        setReceived(recvRes.data?.donations || recvRes.donations || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleRequestDonation = async (donationId) => {
    try {
      await api.patch(`/donations/${donationId}/request`);
      setAvailable((prev) => prev.filter((d) => d._id !== donationId));
      toast.success('Donation requested! The restaurant will confirm. 🤝');
    } catch (err) { toast.error(err.message || 'Request failed'); }
  };

  const statusColor = (s) => {
    const map = { available: 'var(--success)', requested: 'var(--warning)', accepted: 'var(--info)', pickedUp: '#9b59b6', delivered: 'var(--success)', expired: 'var(--danger)' };
    return map[s] || 'var(--text-muted)';
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>🤝 {ngo?.name || 'NGO Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon orange"><FiHeart /></div><div><div className="stat-value">{available.length}</div><div className="stat-label">Available Donations</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FiPackage /></div><div><div className="stat-value">{received.length}</div><div className="stat-label">Received</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><FiCheckCircle /></div><div><div className="stat-value">{ngo?.totalDonationsReceived || 0}</div><div className="stat-label">Total Received</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiMapPin /></div><div><div className="stat-value">{ngo?.address?.city || 'City'}</div><div className="stat-label">Location</div></div></div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>Available ({available.length})</button>
        <button className={`dash-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>My Received ({received.length})</button>
      </div>

      {tab === 'available' && (
        available.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍱</div>
            <p>No surplus food available right now</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {available.map((don) => (
              <div key={don._id} className="menu-manage-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <div>
                    <div className="menu-manage-name" style={{ fontSize: '1rem' }}>
                      🏪 {don.restaurant?.name || 'Restaurant'}
                    </div>
                    <div className="menu-manage-meta" style={{ marginTop: 4 }}>
                      <span><FiMapPin style={{ marginRight: 2 }} /> {don.pickupAddress?.city || don.pickupAddress?.street || '—'}</span>
                      <span><FiClock style={{ marginRight: 2 }} /> Expires: {new Date(don.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>🍽️ {don.totalServings || 0} servings</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleRequestDonation(don._id)}>Request</button>
                </div>
                {don.items && don.items.length > 0 && (
                  <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong>Items:</strong> {don.items.map((i) => `${i.name} (${i.quantity} ${i.unit || 'servings'})`).join(', ')}
                  </div>
                )}
                {don.notes && <div style={{ marginTop: 4, fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{don.notes}"</div>}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'received' && (
        received.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>📦</div><p>No donations received yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {received.map((don) => (
              <div key={don._id} className="menu-manage-card">
                <div className="menu-manage-info">
                  <div className="menu-manage-name">🏪 {don.restaurant?.name || 'Restaurant'}</div>
                  <div className="menu-manage-meta">
                    <span>🍽️ {don.totalServings || 0} servings</span>
                    <span>{don.items?.length || 0} items</span>
                    <span>{new Date(don.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <span className="status-badge" style={{ background: `${statusColor(don.status)}22`, color: statusColor(don.status), textTransform: 'capitalize' }}>{don.status}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default NGODashboard;
