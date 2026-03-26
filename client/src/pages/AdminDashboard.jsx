import { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiMapPin, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'users', label: '👥 Users' },
  { key: 'restaurants', label: '🍽️ Restaurants' },
  { key: 'orders', label: '📋 Orders' },
  { key: 'analytics', label: '📈 Analytics' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, restRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=100'),
        api.get('/admin/restaurants'),
        api.get('/admin/orders?limit=100'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
      setRestaurants(restRes.data?.restaurants || []);
      setOrders(ordersRes.data?.orders || []);
    } catch (err) { toast.error('Failed to load admin data'); console.error(err); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      const updated = res.data?.user;
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: updated?.isActive ?? !u.isActive } : u));
      toast.success(res.message || 'User status updated');
    } catch { toast.error('Failed'); }
  };

  const toggleRestaurant = async (id) => {
    try {
      const res = await api.patch(`/admin/restaurants/${id}/toggle`);
      const updated = res.data?.restaurant;
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, isActive: updated?.isActive ?? !r.isActive } : r));
      toast.success(res.message || 'Restaurant status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchTerm && !u.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredOrders = orders.filter((o) => !statusFilter || o.status === statusFilter);

  const roleBadge = (role) => {
    const colors = { customer: '#3498db', restaurant: '#e67e22', cloudkitchen: '#9b59b6', grocery: '#2ecc71', delivery: '#e74c3c', ngo: '#1abc9c', admin: '#f39c12' };
    return <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${colors[role] || '#666'}22`, color: colors[role] || '#666', border: `1px solid ${colors[role] || '#666'}44` }}>{role}</span>;
  };

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>👑 Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="dash-tabs">
        {TABS.map((t) => <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="users" color="blue" value={stats.totalUsers} label="Total Users" />
            <StatCard icon="orders" color="orange" value={stats.totalOrders} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} label="Revenue" />
            <StatCard icon="restaurants" color="purple" value={stats.totalRestaurants + stats.totalKitchens} label="Restaurants & Kitchens" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>👥 Users by Role</h3>
              {stats.roles && Object.entries(stats.roles).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  {roleBadge(role)}
                  <span style={{ fontWeight: 700 }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}><div style={{ width: `${(count / stats.totalUsers) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} /></div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Order Status</h3>
              {stats.orderStatuses && Object.entries(stats.orderStatuses).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span className={`status-badge ${status}`}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
              {(!stats.orderStatuses || Object.keys(stats.orderStatuses).length === 0) && <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>}
            </div>
          </div>
        </>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <select className="form-input" style={{ width: 'auto' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {['customer', 'restaurant', 'cloudkitchen', 'grocery', 'delivery', 'ngo', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <table className="orders-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td><span className={`status-badge ${u.isActive ? 'ready' : 'cancelled'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: '0.8125rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive ? <FiToggleRight size={18} color="var(--success)" /> : <FiToggleLeft size={18} color="var(--danger)" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <p style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No users found</p>}
        </>
      )}

      {/* RESTAURANTS */}
      {tab === 'restaurants' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            All Restaurants ({restaurants.length})
          </h3>
          <table className="orders-table">
            <thead><tr><th>Name</th><th>Owner</th><th>Cuisine</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{r.owner?.name || '—'}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{(r.cuisine || []).slice(0, 2).join(', ')}</td>
                  <td>⭐ {r.rating || '—'}</td>
                  <td><span className={`status-badge ${r.isActive ? 'ready' : 'cancelled'}`}>{r.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleRestaurant(r._id)}>
                      {r.isActive ? <FiToggleRight size={18} color="var(--success)" /> : <FiToggleLeft size={18} color="var(--danger)" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, flex: 1 }}>All Orders ({filteredOrders.length})</h3>
            <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <table className="orders-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Source</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>#{o._id?.slice(-6).toUpperCase()}</td>
                  <td>{o.user?.name || '—'}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{o.restaurant?.name || o.cloudKitchen?.name || o.groceryShop?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{o.totalAmount}</td>
                  <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <p style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No orders found</p>}
        </>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={stats.totalOrders} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" />
            <StatCard icon="users" color="blue" value={stats.totalUsers} label="Total Users" />
            <StatCard icon="completed" color="purple" value={stats.totalReviews} label="Reviews" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalRestaurants}</div>
              <p style={{ color: 'var(--text-muted)' }}>Restaurants</p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#9b59b6' }}>{stats.totalKitchens}</div>
              <p style={{ color: 'var(--text-muted)' }}>Cloud Kitchens</p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#2ecc71' }}>{stats.totalGrocery}</div>
              <p style={{ color: 'var(--text-muted)' }}>Grocery Shops</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
