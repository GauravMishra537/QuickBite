import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiStar, FiMapPin, FiPhone, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './Customer.css';
import './Services.css';

const GroceryDetail = () => {
  const { id } = useParams();
  const { items: cartItems, addItem, updateQuantity, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopRes, prodRes] = await Promise.all([
          api.get(`/grocery/${id}`),
          api.get(`/grocery/${id}/products`),
        ]);
        setShop(shopRes.data?.shop || shopRes.data?.groceryShop || shopRes.data);
        setProducts(prodRes.data?.products || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 16 }} />)}
    </div>
  );

  if (!shop) return <div className="container section" style={{ textAlign: 'center' }}><h2>Shop not found</h2></div>;

  const categories = ['All', ...new Set(products.map((p) => p.category || 'General'))];
  const filtered = filter === 'All' ? products : products.filter((p) => (p.category || 'General') === filter);

  const getItemQty = (itemId) => cartItems.find((i) => i._id === itemId)?.quantity || 0;

  return (
    <div>
      {/* Hero */}
      <div className="detail-hero">
        <img src={shop.images?.[0] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=400&fit=crop'} alt={shop.name} />
        <div className="detail-hero-overlay">
          <div className="detail-hero-info">
            <h1>{shop.name}</h1>
            <div className="detail-hero-meta">
              <span><FiStar style={{ color: '#f1c40f' }} /> {shop.rating?.toFixed(1) || '4.0'}</span>
              <span className="meta-dot">•</span>
              <span><FiMapPin /> {shop.address?.city || 'Multiple locations'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'flex', gap: 'var(--space-lg)', padding: 'var(--space-md) 0', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          {shop.phone && <span><FiPhone style={{ marginRight: 4 }} /> {shop.phone}</span>}
          <span style={{ color: shop.isOpen ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {shop.isOpen !== false ? '● Open Now' : '● Closed'}
          </span>
        </div>

        {/* Category filters */}
        <div className="filter-bar">
          {categories.map((c) => (
            <button key={c} className={`filter-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        <div className="detail-content">
          {/* Products */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 'var(--space-lg)' }}>
              Products ({filtered.length})
            </h2>
            <div className="listing-grid">
              {filtered.map((prod) => {
                const qty = getItemQty(prod._id);
                const discount = prod.originalPrice ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0;
                return (
                  <div key={prod._id} className="product-card" style={{ position: 'relative' }}>
                    {discount > 0 && <div className="product-card-discount">{discount}% OFF</div>}
                    <div className="product-card-img">
                      <img src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop'} alt={prod.name} />
                    </div>
                    <div className="product-card-body">
                      <div className="product-card-name">{prod.name}</div>
                      <div className="product-card-weight">{prod.weight || prod.unit || ''}</div>
                      <div className="product-card-footer">
                        <div>
                          <span className="product-card-price">₹{prod.price}</span>
                          {prod.originalPrice && <span className="product-card-original">₹{prod.originalPrice}</span>}
                        </div>
                        {qty === 0 ? (
                          <button className="add-btn" onClick={() => addItem(prod, { _id: shop._id, name: shop.name }, 'groceryShop')}>ADD</button>
                        ) : (
                          <div className="cart-qty">
                            <button onClick={() => updateQuantity(prod._id, qty - 1)}><FiMinus /></button>
                            <span>{qty}</span>
                            <button onClick={() => updateQuantity(prod._id, qty + 1)}><FiPlus /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart sidebar */}
          <div className="cart-sidebar">
            <h3><FiShoppingCart /> Your Cart</h3>
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
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
                  <div className="cart-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                  <div className="cart-row"><span>GST (5%)</span><span>₹{tax}</span></div>
                  <div className="cart-row total"><span>Total</span><span>₹{total}</span></div>
                </div>
                <a href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>Checkout</a>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 'var(--space-sm)', color: 'var(--danger)' }} onClick={clearCart}>Clear Cart</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryDetail;
