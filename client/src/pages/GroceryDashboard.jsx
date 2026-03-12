import { useEffect, useState } from 'react';
import { FiShoppingBag, FiDollarSign, FiPackage, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const GroceryDashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopRes, ordersRes] = await Promise.all([
          api.get('/grocery/my/shop'),
          api.get('/orders/business'),
        ]);
        const s = shopRes.data?.shop || shopRes.data?.groceryShop || shopRes.data;
        setShop(s);
        setOrders(ordersRes.data?.orders || []);
        if (s?._id) {
          const prodRes = await api.get(`/grocery/${s._id}/products`);
          setProducts(prodRes.data?.products || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch (err) { toast.error('Status update failed'); }
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
          <h1>🥬 {shop?.name || 'Grocery Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon orange"><FiShoppingBag /></div><div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FiClock /></div><div><div className="stat-value">{orders.filter((o) => o.status === 'pending').length}</div><div className="stat-label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiPackage /></div><div><div className="stat-value">{products.length}</div><div className="stat-label">Products</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div><div className="stat-value">₹{totalRevenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div></div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
        <button className={`dash-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Products ({products.length})</button>
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
                      {order.status === 'confirmed' && <button className="btn btn-secondary btn-sm" onClick={() => handleOrderStatus(order._id, 'preparing')}>Pack</button>}
                      {order.status === 'preparing' && <button className="btn btn-primary btn-sm" onClick={() => handleOrderStatus(order._id, 'ready')}>Ready</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'products' && (
        products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>📦</div><p>No products yet</p>
          </div>
        ) : (
          products.map((prod) => (
            <div key={prod._id} className="menu-manage-card">
              {prod.image && <img src={prod.image} alt={prod.name} className="menu-manage-img" />}
              <div className="menu-manage-info">
                <div className="menu-manage-name">{prod.name}</div>
                <div className="menu-manage-meta">
                  <span>₹{prod.price}</span>
                  <span>{prod.category}</span>
                  <span>{prod.stock || 0} in stock</span>
                </div>
              </div>
              <span className={`status-badge ${prod.stock > 0 ? 'ready' : 'cancelled'}`}>{prod.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default GroceryDashboard;
