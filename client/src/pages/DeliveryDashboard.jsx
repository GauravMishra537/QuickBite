import { useEffect, useState, useRef } from 'react';
import { FiToggleLeft, FiToggleRight, FiPhone, FiMapPin, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import deliveryService from '../services/deliveryService';
import { connectSocket, onSocketEvent, disconnectSocket } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import EarningsChart from '../components/dashboard/EarningsChart';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'active', label: '🏍️ Active' },
  { key: 'available', label: '📦 Available' },
  { key: 'history', label: '📋 History' },
  { key: 'earnings', label: '💰 Earnings' },
];

const STATUS_STEPS = [
  { key: 'ready', label: 'Ready', icon: '📦' },
  { key: 'pickedUp', label: 'Picked Up', icon: '🤝' },
  { key: 'outForDelivery', label: 'On the Way', icon: '🏍️' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const audioRef = useRef(null);

  // Registration form state
  const [regForm, setRegForm] = useState({ vehicleType: 'motorcycle', vehicleNumber: '', licenseNumber: '' });

  useEffect(() => {
    fetchData();

    // Connect socket for real-time updates
    if (user?._id) {
      connectSocket(user._id, 'delivery');

      const unsub1 = onSocketEvent('newDeliveryRequest', (data) => {
        toast.info(`🆕 New delivery from ${data.businessName}! ₹${data.totalAmount}`, { autoClose: 8000 });
        setNewOrderCount(prev => prev + 1);
        setAvailableOrders(prev => {
          if (prev.find(o => o._id === data.orderId)) return prev;
          return [{ _id: data.orderId, ...data, isSocketOrder: true }, ...prev];
        });
        // Play notification sound
        try { audioRef.current?.play(); } catch {}
      });

      const unsub2 = onSocketEvent('orderStatusChanged', (data) => {
        // Refresh active orders when status changes
        fetchActive();
      });

      return () => { unsub1(); unsub2(); };
    }
  }, [user?._id]);

  const fetchData = async () => {
    try {
      const [profileRes, availRes, activeRes, histRes, earnRes] = await Promise.all([
        deliveryService.getProfile().catch(() => ({ data: null })),
        deliveryService.getAvailable().catch(() => ({ data: { orders: [] } })),
        deliveryService.getActive().catch(() => ({ data: { orders: [] } })),
        deliveryService.getHistory().catch(() => ({ data: { orders: [] } })),
        deliveryService.getEarnings().catch(() => ({ data: null })),
      ]);
      setProfile(profileRes.data?.partner || null);
      setAvailableOrders(availRes.data?.orders || []);
      setActiveOrders(activeRes.data?.orders || []);
      setHistory(histRes.data?.orders || histRes.data?.deliveries || []);
      setEarnings(earnRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchActive = async () => {
    try {
      const [activeRes, availRes] = await Promise.all([
        deliveryService.getActive(),
        deliveryService.getAvailable(),
      ]);
      setActiveOrders(activeRes.data?.orders || []);
      setAvailableOrders(availRes.data?.orders || []);
    } catch {}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.vehicleNumber.trim()) { toast.error('Vehicle number is required'); return; }
    try {
      const res = await deliveryService.register(regForm);
      setProfile(res.data?.partner || res.data);
      toast.success('Registered as delivery partner! 🏍️');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  const handleToggle = async () => {
    try {
      const res = await deliveryService.toggleAvailability();
      const updated = res.data?.partner || res.data;
      setProfile(prev => ({ ...prev, isAvailable: updated?.isAvailable ?? !prev?.isAvailable }));
      toast.success(profile?.isAvailable ? 'You are now offline' : 'You are now online! 🟢');
    } catch { toast.error('Toggle failed'); }
  };

  const handleAccept = async (orderId) => {
    try {
      await deliveryService.acceptDelivery(orderId);
      setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
      setNewOrderCount(0);
      toast.success('Delivery accepted! Heading to pickup 🏍️');
      fetchActive();
    } catch (err) { toast.error(err.response?.data?.message || 'Accept failed'); }
  };

  const handleOutForDelivery = async (orderId) => {
    try {
      await deliveryService.markOutForDelivery(orderId);
      toast.success('On the way to customer! 🚚');
      fetchActive();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (orderId) => {
    try {
      await deliveryService.completeDelivery(orderId);
      toast.success('Delivery completed! ₹50 earned 🎉');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Complete failed'); }
  };

  // ── Loading state ──
  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  // ── Registration form (no profile) ──
  if (!profile) {
    return (
      <div className="container dashboard-page">
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🏍️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Register as Delivery Partner</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Fill in your vehicle details to start delivering</p>
          </div>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Type *</label>
              <select className="form-input" value={regForm.vehicleType} onChange={e => setRegForm(p => ({ ...p, vehicleType: e.target.value }))}>
                <option value="bicycle">🚲 Bicycle</option>
                <option value="scooter">🛵 Scooter</option>
                <option value="motorcycle">🏍️ Motorcycle</option>
                <option value="car">🚗 Car</option>
                <option value="van">🚐 Van</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Number *</label>
              <input className="form-input" placeholder="MH 01 AB 1234" value={regForm.vehicleNumber} onChange={e => setRegForm(p => ({ ...p, vehicleNumber: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input className="form-input" placeholder="DL-0420230012345" value={regForm.licenseNumber} onChange={e => setRegForm(p => ({ ...p, licenseNumber: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-md)' }}>
              🚀 Start Delivering
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Data calculations ──
  const totalEarnings = earnings?.totalEarnings || 0;
  const completedCount = earnings?.totalDeliveries || history.length;
  const todayDeliveries = earnings?.todayDeliveries || 0;
  const activeCount = activeOrders.filter(o => o.status !== 'delivered').length;

  const getStatusStep = (status) => STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <div className="container dashboard-page">
      {/* Hidden audio for notification sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdG2Mj4+JiYmJjoyKhX58fYCEgYGBg4aIiYqLjI2OkJKRkZGSkpGRkJCPjo2Mi4qJiIeGhYSDgoGAf35+fX19fX5/gIGCg4SFhoiJio2Oj5GRk5SUlZWVlZaVlZSTk5KRkI+OjYyLiomIh4aFhIOCgYCAf359fX19fn+AgYKEhYaHiYqLjY6PkZKTlJWWl5eXl5eXlpeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgIB/fn5+fn5/gIGCg4SGh4iKi42Oj5GTlJWWl5iYmJiYmJiYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAgH9+fn5+f4CAgYOEhYeIiouNjo+Rk5SVlpeYmZmZmZmZmZiYl5aVlJOSkZCPjo2MioqJiIeGhYSDgoGAgH9+fn5/f4CAgYOEhoeIiouNj5CRk5SVl5iZmpqampqampmYl5aVlJKRkI+OjYyLiomIh4aFhIOCgYCAf39/f39/gICBg4SFh4iKi42PkJKTlZaXmJmampqbm5ubmpqZmJeWlZSTkpGPjo2Mi4qJiIeGhYSDgoGAf39/f39/gICCg4SFh4iKi42PkJKUlZeYmZqbm5ubm5ubmpqZmJeWlZOSkZCPjo2Mi4qJiIeGhQA=" preload="auto" />

      <div className="dash-header">
        <div>
          <h1>🏍️ Delivery Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Welcome back, {user?.name}
            <span style={{ marginLeft: 12, display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: profile?.isAvailable ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', color: profile?.isAvailable ? '#27ae60' : '#e74c3c' }}>
              {profile?.isAvailable ? '🟢 Online' : '🔴 Offline'}
            </span>
          </p>
        </div>
        <div className="dash-header-actions">
          <button className={`btn ${profile?.isAvailable ? 'btn-primary' : 'btn-secondary'}`} onClick={handleToggle} style={{ gap: 6 }}>
            {profile?.isAvailable ? <><FiToggleRight /> Go Offline</> : <><FiToggleLeft /> Go Online</>}
          </button>
        </div>
      </div>

      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); if (t.key === 'available') setNewOrderCount(0); }} style={{ position: 'relative' }}>
            {t.label}
            {t.key === 'available' && newOrderCount > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: '0.6875rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1s infinite' }}>
                {newOrderCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={availableOrders.length} label="Available Orders" />
            <StatCard icon="deliveries" color="blue" value={activeCount} label="Active Deliveries" />
            <StatCard icon="revenue" color="green" value={`₹${Number(totalEarnings).toLocaleString()}`} label="Total Earnings" />
            <StatCard icon="completed" color="purple" value={completedCount} label="Completed" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            {/* New orders panel */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📦 New Delivery Requests</h3>
              {availableOrders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-lg)' }}>No orders available. Stay online!</p>
              ) : (
                availableOrders.slice(0, 4).map((order) => (
                  <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || order.businessName || '—'}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>₹{order.totalAmount || 0} · {order.items?.length || order.itemCount || 0} items</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(order._id || order.orderId)}>Accept</button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stats */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Quick Stats</h3>
              {[
                ['Today\'s Deliveries', todayDeliveries],
                ['Vehicle', `${profile?.vehicleType || 'Bike'} · ${profile?.vehicleNumber || '—'}`],
                ['Avg. Earning/Delivery', `₹${completedCount > 0 ? Math.round(totalEarnings / completedCount) : 0}`],
                ['Rating', `⭐ ${profile?.rating?.toFixed(1) || '5.0'}`],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── ACTIVE DELIVERIES ── */}
      {tab === 'active' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            🏍️ Active Deliveries ({activeOrders.filter(o => o.status !== 'delivered').length})
          </h3>
          {activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🏍️</div>
              <p>No active deliveries</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Accept an order from the Available tab to start delivering</p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const source = order.restaurant || order.cloudKitchen || order.groceryShop || {};
              const sourceType = order.restaurant ? '🍽️ Restaurant' : order.cloudKitchen ? '👨‍🍳 Cloud Kitchen' : '🛒 Grocery';
              const currentStep = getStatusStep(order.status);
              const isDelivered = order.status === 'delivered';

              return (
                <div key={order._id} style={{ background: 'var(--bg-card)', border: `2px solid ${isDelivered ? 'var(--success)' : 'var(--primary)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{order._id?.slice(-6).toUpperCase()}</span>
                      <h4 style={{ fontWeight: 700, marginTop: 4 }}>{sourceType}: {source.name || 'N/A'}</h4>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>₹{order.totalAmount || 0}</span>
                  </div>

                  {/* Status progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-lg)', padding: '12px 0' }}>
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = currentStep >= i;
                      const isCurrent = currentStep === i;
                      return (
                        <div key={step.key} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, background: isCompleted ? 'var(--primary)' : 'var(--bg-secondary)', color: isCompleted ? 'white' : 'var(--text-muted)', border: isCurrent ? '2px solid var(--primary)' : 'none', transition: 'all 0.3s', flexShrink: 0 }}>
                            {step.icon}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: isCompleted ? 'var(--primary)' : 'var(--border-color)', transition: 'background 0.3s' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pickup and Drop-off */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}><FiMapPin style={{ verticalAlign: 'middle' }} /> PICKUP</p>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{source.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{source.address?.street || 'Address'}, {source.address?.city || ''}</p>
                      {source.phone && <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 4 }}><FiPhone style={{ verticalAlign: 'middle' }} /> {source.phone}</p>}
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}><FiMapPin style={{ verticalAlign: 'middle' }} /> DROP-OFF</p>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{order.user?.name || 'Customer'}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{order.deliveryAddress?.street || 'Address'}, {order.deliveryAddress?.city || ''}</p>
                      {order.user?.phone && <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 4 }}><FiPhone style={{ verticalAlign: 'middle' }} /> {order.user.phone}</p>}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isDelivered && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                      {order.status === 'pickedUp' && (
                        <button className="btn btn-primary" onClick={() => handleOutForDelivery(order._id)} style={{ flex: 1, gap: 6 }}>
                          <FiTruck /> Out for Delivery
                        </button>
                      )}
                      {(order.status === 'outForDelivery' || order.status === 'pickedUp') && (
                        <button className="btn btn-primary" onClick={() => handleComplete(order._id)} style={{ flex: 1, gap: 6, background: '#27ae60' }}>
                          <FiCheckCircle /> Mark Delivered
                        </button>
                      )}
                    </div>
                  )}
                  {isDelivered && (
                    <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--success)', fontWeight: 700 }}>
                      ✅ Delivered · Earned ₹{order.deliveryFee || 50}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* ── AVAILABLE DELIVERIES ── */}
      {tab === 'available' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            📦 Available Deliveries ({availableOrders.length})
          </h3>
          {availableOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📦</div>
              <p>No available deliveries right now</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Stay online — new orders will appear here in real-time!</p>
            </div>
          ) : (
            availableOrders.map((order) => {
              const source = order.restaurant || order.cloudKitchen || order.groceryShop || {};
              const sourceName = source.name || order.businessName || 'Business';
              const sourceType = order.restaurant ? '🍽️' : order.cloudKitchen ? '👨‍🍳' : order.groceryShop ? '🛒' : (order.businessType === 'Cloud Kitchen' ? '👨‍🍳' : order.businessType === 'Grocery' ? '🛒' : '🍽️');

              return (
                <div key={order._id || order.orderId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '1.25rem' }}>{sourceType}</span>
                        <h4 style={{ fontWeight: 700 }}>{sourceName}</h4>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{(order._id || order.orderId)?.toString().slice(-6).toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-lg)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <span><FiPackage style={{ verticalAlign: 'middle' }} /> {order.items?.length || order.itemCount || 0} items</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{order.totalAmount || 0}</span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Earn ₹{order.deliveryFee || 50}</span>
                      </div>
                      {(source.address || order.pickupAddress) && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>
                          <FiMapPin style={{ verticalAlign: 'middle' }} /> {source.address?.street || order.pickupAddress?.street || ''}, {source.address?.city || order.pickupAddress?.city || ''}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 'var(--space-md)' }}>
                      <button className="btn btn-primary" onClick={() => handleAccept(order._id || order.orderId)} style={{ minWidth: 100 }}>
                        ✅ Accept
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* ── DELIVERY HISTORY ── */}
      {tab === 'history' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            📋 Delivery History ({completedCount})
          </h3>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>🏍️</div><p>No deliveries completed yet</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead><tr><th>Order ID</th><th>From</th><th>Customer</th><th>Amount</th><th>Earned</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {history.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                    <td>{order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || '—'}</td>
                    <td>{order.user?.name || '—'}</td>
                    <td>₹{order.totalAmount || 0}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{order.deliveryFee || 50}</td>
                    <td>{new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td><span className="status-badge delivered">Delivered</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <EarningsChart history={history} totalEarnings={totalEarnings} completedCount={completedCount} />
        </>
      )}
    </div>
  );
};

export default DeliveryDashboard;
