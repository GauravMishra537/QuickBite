import { useEffect, useState } from 'react';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import deliveryService from '../services/deliveryService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import DeliveryCard from '../components/dashboard/DeliveryCard';
import EarningsChart from '../components/dashboard/EarningsChart';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'available', label: '📦 Available' },
  { key: 'history', label: '📋 History' },
  { key: 'earnings', label: '💰 Earnings' },
];

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [profileRes, availRes, histRes, earnRes] = await Promise.all([
        deliveryService.getProfile().catch(() => ({ data: null })),
        deliveryService.getAvailable().catch(() => ({ data: { deliveries: [], orders: [] } })),
        deliveryService.getHistory().catch(() => ({ data: { deliveries: [], orders: [] } })),
        deliveryService.getEarnings().catch(() => ({ data: { earnings: null } })),
      ]);
      setProfile(profileRes.data?.partner || profileRes.data);
      setAvailableOrders(availRes.data?.deliveries || availRes.data?.orders || []);
      setHistory(histRes.data?.deliveries || histRes.data?.orders || []);
      setEarnings(earnRes.data?.earnings || earnRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async () => {
    try {
      const res = await deliveryService.toggleAvailability();
      const updated = res.data?.partner || res.data;
      setProfile((prev) => ({ ...prev, isAvailable: updated?.isAvailable ?? !prev?.isAvailable }));
      toast.success(profile?.isAvailable ? 'You are now offline' : 'You are now online!');
    } catch { toast.error('Toggle failed'); }
  };

  const handleAccept = async (orderId) => {
    try {
      await deliveryService.acceptDelivery(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success('Delivery accepted! 🏍️');
    } catch (err) { toast.error(err.response?.data?.message || 'Accept failed'); }
  };

  const handleComplete = async (orderId) => {
    try {
      await deliveryService.completeDelivery(orderId);
      toast.success('Delivery completed! ✅');
      fetchData(); // Refresh all data
    } catch { toast.error('Complete failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 8, borderRadius: 12 }} />)}
    </div>
  );

  const totalEarnings = typeof earnings === 'object' ? (earnings?.totalEarnings || earnings?.total || 0) : (earnings || 0);
  const completedCount = Array.isArray(history) ? history.length : 0;
  const todayDeliveries = Array.isArray(history) ? history.filter((o) => {
    const d = new Date(o.completedAt || o.updatedAt || o.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length : 0;

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

      <div className="dash-tabs">
        {TABS.map((t) => <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={availableOrders.length} label="Available Orders" />
            <StatCard icon="deliveries" color="blue" value={completedCount} label="Total Completed" />
            <StatCard icon="revenue" color="green" value={`₹${Number(totalEarnings).toLocaleString()}`} label="Total Earnings" />
            <StatCard icon="location" color="purple" value={profile?.vehicleType || 'Bike'} label="Vehicle" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📦 Available Deliveries</h3>
              {availableOrders.slice(0, 3).map((order) => (
                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontWeight: 600 }}>{order.restaurant?.name || order.groceryShop?.name || 'Restaurant'}</span>
                  <span>₹{order.totalAmount || 0}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(order._id)}>Accept</button>
                </div>
              ))}
              {availableOrders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No deliveries available</p>}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Quick Stats</h3>
              {[
                ['Today\'s Deliveries', todayDeliveries],
                ['Avg. Earning/Delivery', `₹${completedCount > 0 ? Math.round(totalEarnings / completedCount) : 0}`],
                ['Status', profile?.isAvailable ? '🟢 Online' : '🔴 Offline'],
                ['Rating', `⭐ ${profile?.rating?.toFixed(1) || '5.0'}`],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── AVAILABLE DELIVERIES ── */}
      {tab === 'available' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            Available Deliveries ({availableOrders.length})
          </h3>
          {availableOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📦</div>
              <p>No available deliveries right now</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>New orders will appear here when ready for delivery</p>
            </div>
          ) : (
            availableOrders.map((order) => <DeliveryCard key={order._id} order={order} onAccept={handleAccept} variant="available" />)
          )}
        </>
      )}

      {/* ── DELIVERY HISTORY ── */}
      {tab === 'history' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            Delivery History ({completedCount})
          </h3>
          {completedCount === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>🏍️</div><p>No deliveries completed yet</p>
            </div>
          ) : (
            <>
              <table className="orders-table" style={{ marginBottom: 'var(--space-xl)' }}>
                <thead><tr><th>Order ID</th><th>Restaurant</th><th>Customer</th><th>Amount</th><th>Fee</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {history.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                      <td>{order.restaurant?.name || order.groceryShop?.name || '—'}</td>
                      <td>{order.customer?.name || '—'}</td>
                      <td>₹{order.totalAmount || 0}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{order.deliveryFee || 40}</td>
                      <td>{new Date(order.completedAt || order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td><span className="status-badge delivered">Delivered</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.map((order) => <DeliveryCard key={order._id} order={order} variant="history" />)}
            </>
          )}
        </>
      )}

      {/* ── EARNINGS ── */}
      {tab === 'earnings' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="revenue" color="green" value={`₹${Number(totalEarnings).toLocaleString()}`} label="Total Earnings" />
            <StatCard icon="deliveries" color="blue" value={completedCount} label="Total Deliveries" />
            <StatCard icon="rating" color="orange" value={completedCount > 0 ? `₹${Math.round(totalEarnings / completedCount)}` : '₹0'} label="Avg. per Delivery" />
            <StatCard icon="completed" color="purple" value={todayDeliveries} label="Today's Deliveries" />
          </div>

          {/* EarningsChart component */}
          <EarningsChart history={history} totalEarnings={totalEarnings} completedCount={completedCount} />

          {/* Earnings table */}
          {completedCount > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>💰 Earnings Breakdown</h3>
              <table className="orders-table">
                <thead><tr><th>Order ID</th><th>Restaurant</th><th>Date</th><th>Earnings</th><th>Status</th></tr></thead>
                <tbody>
                  {history.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                      <td>{order.restaurant?.name || '—'}</td>
                      <td>{new Date(order.completedAt || order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{order.deliveryFee || 40}</td>
                      <td><span className="status-badge delivered">Paid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryDashboard;
