import { useEffect, useState } from 'react';
import { FiToggleLeft, FiToggleRight, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import OrderTable from '../components/dashboard/OrderTable';
import MenuForm from '../components/dashboard/MenuForm';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'orders', label: '📋 Orders' },
  { key: 'menu', label: '🍽️ Menu' },
  { key: 'analytics', label: '📈 Analytics' },
];

const CloudKitchenDashboard = () => {
  const { user } = useAuth();
  const [kitchen, setKitchen] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [kitRes, ordersRes] = await Promise.all([
        api.get('/cloud-kitchens/my/kitchen'),
        api.get('/orders/business'),
      ]);
      const kit = kitRes.data?.cloudKitchen || kitRes.data;
      setKitchen(kit);
      setOrders(ordersRes.data?.orders || []);
      if (kit?._id) {
        const menuRes = await api.get(`/menu/kitchen/${kit._id}`);
        setMenuItems(menuRes.data?.items || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/cloud-kitchens/${kitchen._id}/toggle-status`);
      setKitchen((k) => ({ ...k, isOpen: !k.isOpen }));
      toast.success(kitchen.isOpen ? 'Kitchen closed' : 'Kitchen opened');
    } catch { toast.error('Toggle failed'); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Status update failed'); }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.patch(`/menu/${itemId}/toggle-availability`);
      setMenuItems((prev) => prev.map((m) => m._id === itemId ? { ...m, isAvailable: !m.isAvailable } : m));
    } catch { toast.error('Toggle failed'); }
  };

  const handleAddMenu = async (data) => {
    try {
      const res = await api.post('/menu', data);
      setMenuItems((prev) => [...prev, res.data?.item || res.item]);
      setShowMenuForm(false);
      toast.success('Item added! 🎉');
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleEditMenu = async (data) => {
    try {
      await api.put(`/menu/${editItem._id}`, data);
      setMenuItems((prev) => prev.map((m) => m._id === editItem._id ? { ...m, ...data } : m));
      setEditItem(null);
      toast.success('Item updated');
    } catch { toast.error('Update failed'); }
  };

  const handleDeleteMenu = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== itemId));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const statusBreakdown = {};
  orders.forEach((o) => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });
  const categoryStats = {};
  menuItems.forEach((i) => { categoryStats[i.category] = (categoryStats[i.category] || 0) + 1; });

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>☁️ {kitchen?.name || 'Cloud Kitchen Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
        <div className="dash-header-actions">
          <button className={`btn ${kitchen?.isOpen ? 'btn-primary' : 'btn-secondary'}`} onClick={handleToggleStatus}>
            {kitchen?.isOpen ? <><FiToggleRight /> Open</> : <><FiToggleLeft /> Closed</>}
          </button>
        </div>
      </div>

      <div className="dash-tabs">
        {TABS.map((t) => <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={orders.length} label="Total Orders" />
            <StatCard icon="pending" color="blue" value={pendingOrders} label="Pending" />
            <StatCard icon="products" color="purple" value={menuItems.length} label="Menu Items" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Revenue" />
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📋 Recent Orders</h3>
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>#{o._id?.slice(-6).toUpperCase()}</span>
                <span>₹{o.totalAmount}</span>
                <span className={`status-badge ${o.status}`}>{o.status}</span>
              </div>
            ))}
            {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>}
          </div>
        </>
      )}

      {/* ORDERS */}
      {tab === 'orders' && <OrderTable orders={orders} onStatusChange={handleOrderStatus} />}

      {/* MENU */}
      {tab === 'menu' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Menu Items ({menuItems.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowMenuForm(!showMenuForm); }}><FiPlus /> Add Item</button>
          </div>
          {showMenuForm && <MenuForm onSubmit={handleAddMenu} onCancel={() => setShowMenuForm(false)} />}
          {editItem && <MenuForm item={editItem} onSubmit={handleEditMenu} onCancel={() => setEditItem(null)} />}
          {menuItems.map((item) => (
            <div key={item._id} className="menu-manage-card">
              {item.image && <img src={item.image} alt={item.name} className="menu-manage-img" />}
              <div className="menu-manage-info">
                <div className="menu-manage-name">{item.name}</div>
                <div className="menu-manage-meta"><span>₹{item.price}</span><span>{item.category}</span></div>
              </div>
              <div className="menu-manage-actions">
                <div className={`toggle-switch ${item.isAvailable !== false ? 'active' : ''}`} onClick={() => handleToggleAvailability(item._id)} />
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowMenuForm(false); setEditItem(item); }}><FiEdit2 /></button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteMenu(item._id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
          {menuItems.length === 0 && <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}><div style={{ fontSize: '3rem' }}>🍳</div><p>No menu items yet</p></div>}
        </>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="orders" color="orange" value={orders.length} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Revenue" />
            <StatCard icon="products" color="blue" value={menuItems.length} label="Menu Items" />
            <StatCard icon="completed" color="purple" value={orders.filter((o) => o.status === 'delivered').length} label="Delivered" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Order Status</h3>
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span className={`status-badge ${status}`}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}><div style={{ width: `${(count / orders.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} /></div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🍽️ Menu by Category</h3>
              {Object.entries(categoryStats).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{cat}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}><div style={{ width: `${(count / menuItems.length) * 100}%`, height: '100%', background: '#9b59b6', borderRadius: 4 }} /></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CloudKitchenDashboard;
