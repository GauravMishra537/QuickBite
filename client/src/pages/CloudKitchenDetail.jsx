import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiStar, FiClock, FiMapPin, FiPlus, FiMinus } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './Customer.css';

const CloudKitchenDetail = () => {
  const { id } = useParams();
  const [kitchen, setKitchen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items: cart, addItem, updateQuantity } = useCart();

  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const [kitchenRes, menuRes] = await Promise.all([
          api.get(`/cloud-kitchens/${id}`),
          api.get(`/menu/kitchen/${id}`).catch(() => ({ data: { menuItems: [] } })),
        ]);
        setKitchen(kitchenRes.data?.kitchen || kitchenRes.kitchen);
        setMenu(menuRes.data?.menuItems || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchKitchen();
  }, [id]);

  const getCartQty = (itemId) => {
    const item = cart.find((c) => c._id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (item) => {
    addItem(item, { _id: id, name: kitchen?.name });
  };

  // Group menu by category
  const categories = {};
  menu.forEach((item) => {
    const cat = item.category || 'Specials';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  if (loading) return (
    <div className="container section">
      <div className="skeleton" style={{ height: 250, borderRadius: 16, marginBottom: 'var(--space-xl)' }} />
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 8, borderRadius: 12 }} />)}
    </div>
  );

  if (!kitchen) return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>☁️</div><p>Cloud kitchen not found.</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div style={{
        height: 280, background: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.7)), url(${kitchen.images?.[0] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop'}) center/cover`,
        display: 'flex', alignItems: 'flex-end', padding: 'var(--space-xl)',
      }}>
        <div className="container" style={{ color: '#fff' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: 4 }}>{kitchen.name}</h1>
          <p style={{ opacity: 0.9, marginBottom: 8 }}>{(kitchen.cuisine || []).join(' • ')}</p>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', fontSize: '0.875rem', opacity: 0.85 }}>
            <span><FiStar style={{ marginRight: 4 }} /> {kitchen.rating?.toFixed(1) || '4.0'} ({kitchen.totalReviews || 0} reviews)</span>
            <span><FiClock style={{ marginRight: 4 }} /> {kitchen.deliveryTime?.min || 20}–{kitchen.deliveryTime?.max || 35} min</span>
            <span><FiMapPin style={{ marginRight: 4 }} /> {kitchen.address?.city || 'City'}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="detail-layout">
          {/* Menu */}
          <div className="detail-main">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>☁️ Menu</h2>
            {Object.keys(categories).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
                <p>Menu coming soon!</p>
              </div>
            ) : (
              Object.entries(categories).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', padding: '0 0 8px', borderBottom: '2px solid var(--border-color)' }}>{cat}</h3>
                  {items.map((item) => {
                    const qty = getCartQty(item._id);
                    return (
                      <div key={item._id} className="menu-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: '0.6875rem', padding: '1px 4px', border: `1px solid ${item.isVeg ? 'var(--success)' : '#e74c3c'}`, color: item.isVeg ? 'var(--success)' : '#e74c3c', borderRadius: 3 }}>
                              {item.isVeg ? '●' : '●'}
                            </span>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                          </div>
                          {item.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.description}</p>}
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{item.price}</span>
                        </div>
                        <div>
                          {qty === 0 ? (
                            <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)} disabled={!item.isAvailable}>
                              {item.isAvailable ? 'Add' : 'Unavailable'}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item._id, qty - 1)}><FiMinus /></button>
                              <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                              <button className="btn btn-primary btn-sm" onClick={() => updateQuantity(item._id, qty + 1)}><FiPlus /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Cart sidebar */}
          <div className="detail-sidebar">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', position: 'sticky', top: 80 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🛒 Your Cart</h3>
              {cart.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your cart is empty. Add items from the menu.</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '1rem' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                  </div>
                  <a href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)', textAlign: 'center', textDecoration: 'none' }}>Proceed to Checkout</a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudKitchenDetail;
