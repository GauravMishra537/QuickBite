import { useEffect, useState } from 'react';
import { FiShoppingBag, FiDollarSign, FiClock, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const CloudKitchenDashboard = () => {
  const { user } = useAuth();
  const [kitchen, setKitchen] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    const fetchData = async () => {
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
          setMenuItems(menuRes.data?.menuItems || menuRes.data?.items || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleToggleStatus = async () => {
    if (!kitchen) return;
    try {
      const res = await api.patch(`/cloud-kitchens/${kitchen._id}/toggle-status`);
      setKitchen(res.data?.cloudKitchen || { ...kitchen, isOpen: !kitchen.isOpen });
      toast.success(kitchen.isOpen ? 'Kitchen closed' : 'Kitchen opened');
    } catch (err) { toast.error('Toggle failed'); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch (err) { toast.error('Status update failed'); }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.patch(`/menu/${itemId}/toggle-availability`);
      setMenuItems((prev) => prev.map((m) => m._id === itemId ? { ...m, isAvailable: !m.isAvailable } : m));
      toast.success('Availability updated');
    } catch (err) { toast.error('Toggle failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

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

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon orange"><FiShoppingBag /></div><div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FiClock /></div><div><div className="stat-value">{orders.filter((o) => o.status === 'pending').length}</div><div className="stat-label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiClock /></div><div><div className="stat-value">{orders.filter((o) => o.status === 'preparing').length}</div><div className="stat-label">Preparing</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div><div className="stat-value">₹{totalRevenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div></div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
        <button className={`dash-tab ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>Menu ({menuItems.length})</button>
      </div>

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>📋</div><p>No orders yet</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
                  <td>{order.customer?.name || 'Customer'}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalAmount || 0}</td>
                  <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {order.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => handleOrderStatus(order._id, 'confirmed')}>Accept</button>}
                      {order.status === 'confirmed' && <button className="btn btn-secondary btn-sm" onClick={() => handleOrderStatus(order._id, 'preparing')}>Prepare</button>}
                      {order.status === 'preparing' && <button className="btn btn-primary btn-sm" onClick={() => handleOrderStatus(order._id, 'ready')}>Ready</button>}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleOrderStatus(order._id, 'cancelled')}>Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'menu' && (
        menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>🍳</div><p>No menu items yet</p>
          </div>
        ) : (
          menuItems.map((item) => (
            <div key={item._id} className="menu-manage-card">
              {item.image && <img src={item.image} alt={item.name} className="menu-manage-img" />}
              <div className="menu-manage-info">
                <div className="menu-manage-name">{item.name}</div>
                <div className="menu-manage-meta"><span>₹{item.price}</span><span>{item.category}</span></div>
              </div>
              <div className={`toggle-switch ${item.isAvailable !== false ? 'active' : ''}`} onClick={() => handleToggleAvailability(item._id)} />
            </div>
          ))
        )
      )}
    </div>
  );
};

export default CloudKitchenDashboard;
