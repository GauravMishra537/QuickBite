import { useEffect, useState } from 'react';
import { FiTruck, FiDollarSign, FiClock, FiMapPin, FiToggleLeft, FiToggleRight, FiCheck, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, availRes, histRes, earnRes] = await Promise.all([
          api.get('/deliveries/profile').catch(() => ({ data: null })),
          api.get('/deliveries/available').catch(() => ({ deliveries: [], orders: [] })),
          api.get('/deliveries/history').catch(() => ({ deliveries: [], orders: [] })),
          api.get('/deliveries/earnings').catch(() => ({ earnings: null })),
        ]);
        setProfile(profileRes.data?.partner || profileRes.data || profileRes);
        setAvailableOrders(availRes.deliveries || availRes.orders || availRes.data?.deliveries || availRes.data?.orders || []);
        setHistory(histRes.deliveries || histRes.orders || histRes.data?.deliveries || histRes.data?.orders || []);
        setEarnings(earnRes.earnings || earnRes.data?.earnings || earnRes.data || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleToggle = async () => {
    try {
      const res = await api.patch('/deliveries/toggle-availability');
      const updated = res.data?.partner || res.partner || res;
      setProfile((prev) => ({ ...prev, isAvailable: updated.isAvailable ?? !prev?.isAvailable }));
      toast.success(profile?.isAvailable ? 'You are now offline' : 'You are now online!');
    } catch (err) { toast.error('Toggle failed'); }
  };

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/deliveries/accept/${orderId}`);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success('Delivery accepted! 🏍️');
    } catch (err) { toast.error(err.message || 'Accept failed'); }
  };

  const handleComplete = async (orderId) => {
    try {
      await api.patch(`/deliveries/complete/${orderId}`);
      toast.success('Delivery completed! ✅');
    } catch (err) { toast.error('Complete failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  const totalEarnings = typeof earnings === 'object' ? (earnings?.totalEarnings || earnings?.total || 0) : (earnings || 0);
  const completedCount = Array.isArray(history) ? history.length : 0;

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>🏍️ Delivery Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
        <div className="dash-header-actions">
          <button className={`btn ${profile?.isAvailable ? 'btn-primary' : 'btn-secondary'}`} onClick={handleToggle}>
            {profile?.isAvailable ? <><FiToggleRight /> Online</> : <><FiToggleLeft /> Offline</>}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon orange"><FiPackage /></div><div><div className="stat-value">{availableOrders.length}</div><div className="stat-label">Available Orders</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FiTruck /></div><div><div className="stat-value">{completedCount}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div><div className="stat-value">₹{Number(totalEarnings).toLocaleString()}</div><div className="stat-label">Total Earnings</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiMapPin /></div><div><div className="stat-value">{profile?.vehicleType || 'Bike'}</div><div className="stat-label">Vehicle</div></div></div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>Available ({availableOrders.length})</button>
        <button className={`dash-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History ({completedCount})</button>
      </div>

      {tab === 'available' && (
        availableOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📦</div>
            <p>No available deliveries right now. Check back soon!</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead><tr><th>Order ID</th><th>Restaurant</th><th>Delivery Area</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {availableOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                  <td>{order.restaurant?.name || order.businessName || 'Restaurant'}</td>
                  <td>{order.deliveryAddress?.city || order.address?.city || '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalAmount || order.deliveryFee || 0}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(order._id)}>Accept</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'history' && (
        completedCount === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>🏍️</div><p>No deliveries completed yet</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead><tr><th>Order ID</th><th>Restaurant</th><th>Date</th><th>Earning</th><th>Status</th></tr></thead>
            <tbody>
              {history.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                  <td>{order.restaurant?.name || 'Restaurant'}</td>
                  <td>{new Date(order.completedAt || order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{order.deliveryFee || 40}</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default DeliveryDashboard;
