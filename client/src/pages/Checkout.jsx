import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiShoppingCart, FiArrowLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Customer.css';

const Checkout = () => {
  const { items, restaurant, sourceType, subtotal, deliveryFee, tax, total, clearCart, updateQuantity } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState(user?.addresses?.[0] || { street: '', city: '', state: '', zipCode: '' });
  const [placing, setPlacing] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>Your cart is empty</h2>
        <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city) {
      toast.error('Please fill in your delivery address');
      return;
    }
    setPlacing(true);
    try {
      // Determine order type and entity field based on cart source
      const orderType = sourceType === 'groceryShop' ? 'grocery' : 'food';
      const entityField = sourceType === 'cloudKitchen' ? 'cloudKitchen'
        : sourceType === 'groceryShop' ? 'groceryShop'
        : 'restaurant';

      const orderData = {
        orderType,
        [entityField]: restaurant._id,
        items: items.map((i) => ({
          item: i._id,
          itemModel: sourceType === 'groceryShop' ? 'Product' : 'MenuItem',
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        deliveryAddress: address,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'stripe',
      };

      const res = await api.post('/orders', orderData);
      const order = res.data?.order;

      if (paymentMethod === 'stripe' && order?._id) {
        try {
          const checkoutRes = await api.post('/payments/create-checkout/order', { orderId: order._id });
          const stripeUrl = checkoutRes.data?.url;
          if (stripeUrl) {
            clearCart();
            window.location.href = stripeUrl;
            return;
          }
        } catch (stripeErr) {
          toast.info('Stripe checkout unavailable. Order placed as COD.');
        }
      }

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to={`/restaurants/${restaurant?._id || ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontSize: '0.9375rem' }}>
          <FiArrowLeft /> Back to menu
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>Checkout</h1>

        <div className="checkout-grid">
          <div>
            {/* Delivery Address */}
            <div className="checkout-section">
              <h3><FiMapPin /> Delivery Address</h3>
              {user?.addresses?.length > 0 && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>Saved addresses</p>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {user.addresses.map((addr, i) => (
                      <button key={i} className={`filter-chip ${address.street === addr.street ? 'active' : ''}`} onClick={() => setAddress(addr)}>
                        {addr.label || `Address ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Street Address</label>
                  <input className="input" value={address.street || ''} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Enter street address" />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input className="input" value={address.city || ''} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" />
                </div>
                <div className="input-group">
                  <label>State</label>
                  <input className="input" value={address.state || ''} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" />
                </div>
                <div className="input-group">
                  <label>ZIP Code</label>
                  <input className="input" value={address.zipCode || ''} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} placeholder="PIN Code" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3><FiCreditCard /> Payment Method</h3>
              <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                <div className="payment-option-radio" />
                <div>
                  <div style={{ fontWeight: 600 }}>💵 Cash on Delivery</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pay when your order arrives</div>
                </div>
              </div>
              <div className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                <div className="payment-option-radio" />
                <div>
                  <div style={{ fontWeight: 600 }}>💳 Pay Online (Stripe)</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Credit/Debit card, UPI</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-sidebar">
            <h3><FiShoppingCart /> Order Summary</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
              From <strong>{restaurant?.name || 'Restaurant'}</strong>
            </p>
            {items.map((ci) => (
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
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }} onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order…' : `Place Order — ₹${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
