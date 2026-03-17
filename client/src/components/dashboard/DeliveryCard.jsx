import { FiMapPin, FiClock, FiDollarSign, FiUser, FiCheck, FiTruck } from 'react-icons/fi';

const DeliveryCard = ({ order, onAccept, onComplete, variant = 'available' }) => {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>🏪</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {order.restaurant?.name || order.groceryShop?.name || order.businessName || 'Business'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6 }}>
              #{order._id?.slice(-6).toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '8px 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUser /> {order.customer?.name || 'Customer'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin /> {order.deliveryAddress?.city || order.deliveryAddress?.street || '—'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock /> {order.items?.length || 0} items</span>
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)' }}>
            <FiDollarSign style={{ verticalAlign: 'middle' }} /> ₹{order.totalAmount || order.deliveryFee || 0}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {variant === 'available' && onAccept && (
            <button className="btn btn-primary btn-sm" onClick={() => onAccept(order._id)}><FiTruck style={{ marginRight: 4 }} /> Accept</button>
          )}
          {variant === 'active' && onComplete && (
            <button className="btn btn-primary btn-sm" onClick={() => onComplete(order._id)}><FiCheck style={{ marginRight: 4 }} /> Complete</button>
          )}
          {variant === 'history' && (
            <>
              <span className="status-badge delivered" style={{ fontSize: '0.75rem' }}>Delivered</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(order.completedAt || order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;
