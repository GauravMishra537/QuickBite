import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiClock, FiMapPin, FiPhone, FiShoppingCart, FiPlus, FiMinus, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './Customer.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { items: cartItems, addItem, removeItem, updateQuantity, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/menu/restaurant/${id}`),
        ]);
        setRestaurant(restRes.data?.restaurant || restRes.data);
        const raw = menuRes.data?.menuItems || menuRes.data?.items || [];
        setMenuItems(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 320 }} />
        <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 12 }} />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="container section" style={{ textAlign: 'center' }}><h2>Restaurant not found</h2></div>;
  }

  // Group menu items by category
  const grouped = {};
  menuItems.forEach((item) => {
    const cat = item.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const getItemQuantity = (itemId) => {
    const ci = cartItems.find((i) => i._id === itemId);
    return ci ? ci.quantity : 0;
  };

  return (
    <div>
      {/* Hero Image */}
      <div className="detail-hero">
        <img src={restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop'} alt={restaurant.name} />
        <div className="detail-hero-overlay">
          <div className="detail-hero-info">
            <h1>{restaurant.name}</h1>
            <div className="detail-hero-meta">
              <span><FiStar style={{ color: '#f1c40f' }} /> {restaurant.rating?.toFixed(1) || '4.0'} ({restaurant.totalReviews || 0} reviews)</span>
              <span className="meta-dot">•</span>
              <span><FiClock /> {restaurant.deliveryTime?.min || 25}–{restaurant.deliveryTime?.max || 40} min</span>
              <span className="meta-dot">•</span>
              <span>{(restaurant.cuisine || []).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Info bar */}
        <div style={{ display: 'flex', gap: 'var(--space-lg)', padding: 'var(--space-md) 0', flexWrap: 'wrap', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          <span><FiMapPin style={{ marginRight: 4 }} /> {restaurant.address?.street || 'Location not available'}, {restaurant.address?.city || ''}</span>
          <span><FiPhone style={{ marginRight: 4 }} /> {restaurant.phone || 'N/A'}</span>
          <span style={{ color: restaurant.isOpen ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {restaurant.isOpen ? '● Open Now' : '● Closed'}
          </span>
        </div>

        <div className="detail-content">
          {/* Menu */}
          <div>
            {/* Table Booking button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Menu</h2>
              <Link to="/bookings/new" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCalendar /> Book a Table
              </Link>
            </div>
            {Object.keys(grouped).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No menu items available yet.</p>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="menu-section">
                  <div className="menu-category-title">{category} ({items.length})</div>
                  {items.map((item) => {
                    const qty = getItemQuantity(item._id);
                    return (
                      <div key={item._id} className="menu-item">
                        <div className="menu-item-info">
                          <div className="menu-item-badges">
                            <div className={`veg-badge ${item.isVeg === false ? 'nonveg-badge' : ''}`} />
                            {item.isBestseller && <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>★ Bestseller</span>}
                          </div>
                          <div className="menu-item-name">{item.name}</div>
                          <div className="menu-item-desc">{item.description}</div>
                          <div className="menu-item-price">₹{item.price}</div>
                        </div>
                        <div className="menu-item-right">
                          {item.image && <img src={item.image} alt={item.name} className="menu-item-img" />}
                          {qty === 0 ? (
                            <button className="add-btn" onClick={() => addItem(item, { _id: restaurant._id, name: restaurant.name })}>
                              ADD
                            </button>
                          ) : (
                            <div className="cart-qty">
                              <button onClick={() => updateQuantity(item._id, qty - 1)}><FiMinus /></button>
                              <span>{qty}</span>
                              <button onClick={() => updateQuantity(item._id, qty + 1)}><FiPlus /></button>
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

          {/* Cart Sidebar */}
          <div className="cart-sidebar">
            <h3><FiShoppingCart /> Your Cart</h3>
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>Add items from the menu</p>
              </div>
            ) : (
              <>
                {cartItems.map((ci) => (
                  <div key={ci._id} className="cart-item">
                    <span className="cart-item-name">{ci.name}</span>
                    <div className="cart-qty">
                      <button onClick={() => updateQuantity(ci._id, ci.quantity - 1)}><FiMinus /></button>
                      <span>{ci.quantity}</span>
                      <button onClick={() => updateQuantity(ci._id, ci.quantity + 1)}><FiPlus /></button>
                    </div>
                    <span className="cart-item-price">₹{ci.price * ci.quantity}</span>
                  </div>
                ))}
                <div className="cart-summary">
                  <div className="cart-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="cart-row"><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                  <div className="cart-row"><span>GST (5%)</span><span>₹{tax}</span></div>
                  <div className="cart-row total"><span>Total</span><span>₹{total}</span></div>
                </div>
                <a href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                  Proceed to Checkout
                </a>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 'var(--space-sm)', color: 'var(--danger)' }} onClick={clearCart}>
                  Clear Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
