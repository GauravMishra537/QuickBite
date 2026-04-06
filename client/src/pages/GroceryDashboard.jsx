import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import OrderTable from '../components/dashboard/OrderTable';
import ProductForm from '../components/dashboard/ProductForm';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'orders', label: '📋 Orders' },
  { key: 'products', label: '📦 Products' },
  { key: 'inventory', label: '📊 Inventory' },
  { key: 'analytics', label: '📈 Analytics' },
];

const GroceryDashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '', description: '', phone: '', email: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    images: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
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

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Status update failed'); }
  };

  const handleAddProduct = async (data) => {
    try {
      const res = await api.post(`/grocery/${shop._id}/products`, data);
      setProducts((prev) => [...prev, res.data?.product || res.product || data]);
      setShowProductForm(false);
      toast.success('Product added! 📦');
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleEditProduct = async (data) => {
    try {
      await api.put(`/grocery/${shop._id}/products/${editProduct._id}`, data);
      setProducts((prev) => prev.map((p) => p._id === editProduct._id ? { ...p, ...data } : p));
      setEditProduct(null);
      toast.success('Product updated');
    } catch { toast.error('Update failed'); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/grocery/${shop._id}/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  /* ── REGISTRATION FORM ── */
  if (!shop) {
    const handleRegister = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          ...regForm,
          images: regForm.images ? [regForm.images] : [],
        };
        await api.post('/grocery', payload);
        toast.success('Grocery shop registered! 🎉 It will now appear on listing pages.');
        fetchAll();
      } catch (err) { toast.error(err.response?.data?.message || err.message || 'Registration failed'); }
    };
    return (
      <div className="container dashboard-page" style={{ maxWidth: 700, margin: '0 auto', paddingTop: 'var(--space-2xl)' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🥬</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Register Your Grocery Shop</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Fill in the details below to get listed on QuickBite</p>
          </div>
          <form onSubmit={handleRegister} style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div className="form-group"><label className="form-label">Shop Name *</label><input className="form-input" required value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="Fresh Mart" /></div>
            <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" required rows={2} value={regForm.description} onChange={(e) => setRegForm({...regForm, description: e.target.value})} placeholder="Tell customers about your grocery shop" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} placeholder="+91 98765 43210" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="info@shop.com" /></div>
            </div>
            <div className="form-group"><label className="form-label">Shop Photo URL</label><input className="form-input" type="url" value={regForm.images} onChange={(e) => setRegForm({...regForm, images: e.target.value})} placeholder="https://example.com/photo.jpg" /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This photo will appear on the listing page</span></div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginTop: 'var(--space-sm)' }}>📍 Address</h4>
            <div className="form-group"><label className="form-label">Street *</label><input className="form-input" required value={regForm.address.street} onChange={(e) => setRegForm({...regForm, address: {...regForm.address, street: e.target.value}})} placeholder="19, Anna Salai" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group"><label className="form-label">City *</label><input className="form-input" required value={regForm.address.city} onChange={(e) => setRegForm({...regForm, address: {...regForm.address, city: e.target.value}})} placeholder="Chennai" /></div>
              <div className="form-group"><label className="form-label">State *</label><input className="form-input" required value={regForm.address.state} onChange={(e) => setRegForm({...regForm, address: {...regForm.address, state: e.target.value}})} placeholder="Tamil Nadu" /></div>
              <div className="form-group"><label className="form-label">Zip Code *</label><input className="form-input" required value={regForm.address.zipCode} onChange={(e) => setRegForm({...regForm, address: {...regForm.address, zipCode: e.target.value}})} placeholder="600018" /></div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>🚀 Register Grocery Shop</button>
          </form>
        </div>
      </div>
    );
  }


  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'placed').length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 10);
  const outOfStockProducts = products.filter((p) => (p.stock || 0) === 0);
  const statusBreakdown = {};
  orders.forEach((o) => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });
  const categoryStats = {};
  products.forEach((p) => { categoryStats[p.category] = (categoryStats[p.category] || 0) + 1; });

  return (
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>🥬 {shop?.name || 'Grocery Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
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
            <StatCard icon="products" color="purple" value={products.length} label="Products" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Revenue" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
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
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${lowStockProducts.length > 0 ? 'var(--warning)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', color: lowStockProducts.length > 0 ? 'var(--warning)' : 'inherit' }}>
                <FiAlertTriangle style={{ marginRight: 4 }} /> Low Stock Alert ({lowStockProducts.length})
              </h3>
              {lowStockProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>All products well stocked ✅</p>
              ) : (
                lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span>{p.name}</span>
                    <span style={{ fontWeight: 700, color: (p.stock || 0) === 0 ? 'var(--danger)' : 'var(--warning)' }}>{p.stock || 0} left</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <OrderTable orders={orders} onStatusChange={handleOrderStatus}
          statusActions={{ confirmed: [{ label: 'Pack', status: 'preparing', variant: 'btn-secondary' }] }} />
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Products ({products.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditProduct(null); setShowProductForm(!showProductForm); }}><FiPlus /> Add Product</button>
          </div>
          {showProductForm && <ProductForm onSubmit={handleAddProduct} onCancel={() => setShowProductForm(false)} />}
          {editProduct && <ProductForm product={editProduct} onSubmit={handleEditProduct} onCancel={() => setEditProduct(null)} />}
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}><div style={{ fontSize: '3rem' }}>📦</div><p>No products yet</p></div>
          ) : (
            products.map((prod) => (
              <div key={prod._id} className="menu-manage-card">
                {prod.image && <img src={prod.image} alt={prod.name} className="menu-manage-img" />}
                <div className="menu-manage-info">
                  <div className="menu-manage-name">{prod.name}</div>
                  <div className="menu-manage-meta">
                    <span>₹{prod.price}/{prod.unit || 'kg'}</span>
                    <span>{prod.category}</span>
                    <span>{prod.stock || 0} in stock</span>
                    {prod.discount > 0 && <span style={{ color: 'var(--success)' }}>{prod.discount}% off</span>}
                  </div>
                </div>
                <div className="menu-manage-actions">
                  <span className={`status-badge ${(prod.stock || 0) > 0 ? 'ready' : 'cancelled'}`}>{(prod.stock || 0) > 0 ? 'In Stock' : 'Out'}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowProductForm(false); setEditProduct(prod); }}><FiEdit2 /></button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteProduct(prod._id)}><FiTrash2 /></button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* INVENTORY */}
      {tab === 'inventory' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="products" color="blue" value={products.length} label="Total Products" />
            <StatCard icon="completed" color="green" value={products.filter((p) => (p.stock || 0) > 10).length} label="Well Stocked" />
            <StatCard icon="pending" color="orange" value={lowStockProducts.length} label="Low Stock" />
            <StatCard icon="donations" color="purple" value={outOfStockProducts.length} label="Out of Stock" />
          </div>
          <table className="orders-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}/{p.unit || 'kg'}</td>
                  <td style={{ fontWeight: 600, color: (p.stock || 0) === 0 ? 'var(--danger)' : (p.stock || 0) < 10 ? 'var(--warning)' : 'var(--success)' }}>{p.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${(p.stock || 0) === 0 ? 'cancelled' : (p.stock || 0) < 10 ? 'pending' : 'ready'}`}>
                      {(p.stock || 0) === 0 ? 'Out of Stock' : (p.stock || 0) < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}><p>No products to track</p></div>}
        </>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="orders" color="orange" value={orders.length} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Revenue" />
            <StatCard icon="products" color="blue" value={products.length} label="Products" />
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
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📦 Products by Category</h3>
              {Object.entries(categoryStats).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{cat}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}><div style={{ width: `${(count / products.length) * 100}%`, height: '100%', background: '#9b59b6', borderRadius: 4 }} /></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroceryDashboard;
