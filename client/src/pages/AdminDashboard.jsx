import { useEffect, useState } from 'react';
import { FiUsers, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'users', label: '👥 Users' },
  { key: 'restaurants', label: '🍽️ Restaurants' },
  { key: 'kitchens', label: '☁️ Cloud Kitchens' },
  { key: 'grocery', label: '🥬 Grocery Shops' },
  { key: 'ngos', label: '🤝 NGOs' },
  { key: 'delivery', label: '🏍️ Delivery Partners' },
  { key: 'orders', label: '📋 Orders' },
  { key: 'analytics', label: '📈 Analytics' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [shops, setShops] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, restRes, kitchenRes, shopRes, ngoRes, partnerRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=100'),
        api.get('/admin/restaurants'),
        api.get('/admin/cloud-kitchens'),
        api.get('/admin/grocery-shops'),
        api.get('/admin/ngos'),
        api.get('/admin/delivery-partners'),
        api.get('/admin/orders?limit=100'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
      setRestaurants(restRes.data?.restaurants || []);
      setKitchens(kitchenRes.data?.kitchens || []);
      setShops(shopRes.data?.shops || []);
      setNgos(ngoRes.data?.ngos || []);
      setPartners(partnerRes.data?.partners || []);
      setOrders(ordersRes.data?.orders || []);
    } catch (err) { toast.error('Failed to load admin data'); console.error(err); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, isActive: res.data?.user?.isActive ?? !u.isActive } : u));
      toast.success(res.message || 'Updated');
    } catch { toast.error('Failed'); }
  };

  const toggleEntity = async (type, id, setter) => {
    try {
      const res = await api.patch(`/admin/${type}/${id}/toggle`);
      const key = Object.keys(res.data || {})[0];
      const updated = res.data?.[key];
      setter((p) => p.map((e) => e._id === id ? { ...e, isActive: updated?.isActive ?? !e.isActive } : e));
      toast.success(res.message || 'Updated');
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

  const statusBadge = (active) => <span className={`status-badge ${active ? 'ready' : 'cancelled'}`}>{active ? 'Active' : 'Inactive'}</span>;

  /* Reusable entity table */
  const EntityTable = ({ title, data, columns, toggleType, setter }) => (
    <>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>{title} ({data.length})</h3>
      <table className="orders-table">
        <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              {columns.map((c) => <td key={c.label} style={c.style || {}}>{c.render(item)}</td>)}
              <td>{statusBadge(item.isActive)}</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleEntity(toggleType, item._id, setter)}>
                  {item.isActive ? <FiToggleRight size={18} color="var(--success)" /> : <FiToggleLeft size={18} color="var(--danger)" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No data found</p>}
    </>
  );

  /* Analytics card that navigates to tab */
  const AnalyticsCard = ({ emoji, value, label, targetTab, color }) => (
    <button
      onClick={() => setTab(targetTab)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
        width: '100%',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: color || 'var(--primary)' }}>{value}</div>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>{label}</p>
      <div style={{ fontSize: '0.6875rem', color: 'var(--primary)', marginTop: 8, fontWeight: 600 }}>Click to view details →</div>
    </button>
  );

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>👑 Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="dash-tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {TABS.map((t) => <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)} style={{ whiteSpace: 'nowrap' }}>{t.label}</button>)}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="users" color="blue" value={stats.totalUsers} label="Total Users" />
            <StatCard icon="orders" color="orange" value={stats.totalOrders} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} label="Revenue" />
            <StatCard icon="restaurants" color="purple" value={stats.totalRestaurants + stats.totalKitchens + stats.totalGrocery} label="All Businesses" />
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
                  <td>{statusBadge(u.isActive)}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>{u.role !== 'admin' && <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u._id)}>{u.isActive ? <FiToggleRight size={18} color="var(--success)" /> : <FiToggleLeft size={18} color="var(--danger)" />}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <p style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No users found</p>}
        </>
      )}

      {/* RESTAURANTS */}
      {tab === 'restaurants' && (
        <EntityTable
          title="All Restaurants" data={restaurants} toggleType="restaurants" setter={setRestaurants}
          columns={[
            { label: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
            { label: 'Owner', render: (r) => r.owner?.name || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Cuisine', render: (r) => (r.cuisine || []).slice(0, 2).join(', '), style: { fontSize: '0.8125rem' } },
            { label: 'Rating', render: (r) => `⭐ ${r.rating || '—'}` },
          ]}
        />
      )}

      {/* CLOUD KITCHENS */}
      {tab === 'kitchens' && (
        <EntityTable
          title="All Cloud Kitchens" data={kitchens} toggleType="cloud-kitchens" setter={setKitchens}
          columns={[
            { label: 'Name', render: (k) => <span style={{ fontWeight: 600 }}>{k.name}</span> },
            { label: 'Owner', render: (k) => k.owner?.name || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Cuisine', render: (k) => (k.cuisine || []).slice(0, 2).join(', '), style: { fontSize: '0.8125rem' } },
            { label: 'Rating', render: (k) => `⭐ ${k.rating || '—'}` },
          ]}
        />
      )}

      {/* GROCERY SHOPS */}
      {tab === 'grocery' && (
        <EntityTable
          title="All Grocery Shops" data={shops} toggleType="grocery-shops" setter={setShops}
          columns={[
            { label: 'Name', render: (s) => <span style={{ fontWeight: 600 }}>{s.name}</span> },
            { label: 'Owner', render: (s) => s.owner?.name || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Categories', render: (s) => (s.categories || []).slice(0, 3).join(', '), style: { fontSize: '0.8125rem' } },
            { label: 'Rating', render: (s) => `⭐ ${s.rating || '—'}` },
          ]}
        />
      )}

      {/* NGOs */}
      {tab === 'ngos' && (
        <EntityTable
          title="All NGOs" data={ngos} toggleType="ngos" setter={setNgos}
          columns={[
            { label: 'Name', render: (n) => <span style={{ fontWeight: 600 }}>{n.name}</span> },
            { label: 'Owner', render: (n) => n.owner?.name || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Contact', render: (n) => n.contactPerson || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Phone', render: (n) => n.phone || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Donations', render: (n) => n.totalDonationsReceived || 0 },
          ]}
        />
      )}

      {/* DELIVERY PARTNERS */}
      {tab === 'delivery' && (
        <EntityTable
          title="All Delivery Partners" data={partners} toggleType="delivery-partners" setter={setPartners}
          columns={[
            { label: 'Name', render: (p) => <span style={{ fontWeight: 600 }}>{p.user?.name || '—'}</span> },
            { label: 'Email', render: (p) => p.user?.email || '—', style: { fontSize: '0.8125rem' } },
            { label: 'Vehicle', render: (p) => `${p.vehicleType} (${p.vehicleNumber})`, style: { fontSize: '0.8125rem' } },
            { label: 'Deliveries', render: (p) => p.totalDeliveries || 0 },
            { label: 'Earnings', render: (p) => `₹${(p.totalEarnings || 0).toLocaleString()}` },
            { label: 'Available', render: (p) => p.isAvailable ? '🟢 Yes' : '🔴 No' },
          ]}
        />
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

      {/* ANALYTICS — clickable cards */}
      {tab === 'analytics' && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={stats.totalOrders} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" />
            <StatCard icon="users" color="blue" value={stats.totalUsers} label="Total Users" />
            <StatCard icon="completed" color="purple" value={stats.totalReviews} label="Reviews" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: 'var(--space-xl) 0 var(--space-md)' }}>📂 Click to view details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-lg)' }}>
            <AnalyticsCard emoji="🍽️" value={stats.totalRestaurants} label="Restaurants" targetTab="restaurants" color="#e67e22" />
            <AnalyticsCard emoji="☁️" value={stats.totalKitchens} label="Cloud Kitchens" targetTab="kitchens" color="#9b59b6" />
            <AnalyticsCard emoji="🥬" value={stats.totalGrocery} label="Grocery Shops" targetTab="grocery" color="#2ecc71" />
            <AnalyticsCard emoji="🤝" value={stats.totalNGOs} label="NGOs" targetTab="ngos" color="#1abc9c" />
            <AnalyticsCard emoji="🏍️" value={stats.totalDeliveryPartners} label="Delivery Partners" targetTab="delivery" color="#e74c3c" />
            <AnalyticsCard emoji="📦" value={stats.totalDonations} label="Donations" targetTab="orders" color="#f39c12" />
            <AnalyticsCard emoji="👥" value={stats.totalUsers} label="All Users" targetTab="users" color="#3498db" />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
