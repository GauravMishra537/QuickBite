import { FiMapPin, FiClock, FiPackage } from 'react-icons/fi';

const DonationCard = ({ donation, onRequest, onAccept, showActions = true }) => {
  const statusColors = { available: 'var(--success)', requested: 'var(--warning)', accepted: 'var(--info)', pickedUp: '#9b59b6', delivered: 'var(--success)', expired: 'var(--danger)' };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>🍱</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {donation.restaurant?.name || 'Restaurant'}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            {donation.items?.map((i) => `${i.name} (${i.quantity} ${i.unit || 'servings'})`).join(' • ') || 'Food items'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiPackage /> {donation.totalServings || 0} servings</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin /> {donation.pickupAddress?.city || donation.pickupAddress?.street || '—'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock /> Expires: {new Date(donation.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {donation.notes && <div style={{ marginTop: 6, fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{donation.notes}"</div>}
          {donation.ngo && <div style={{ marginTop: 6, fontSize: '0.8125rem', color: 'var(--info)' }}>NGO: {donation.ngo.name || donation.ngo.contactPerson}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', background: `${statusColors[donation.status] || 'var(--text-muted)'}22`, color: statusColors[donation.status] || 'var(--text-muted)' }}>
            {donation.status}
          </span>
          {showActions && donation.status === 'available' && onRequest && (
            <button className="btn btn-primary btn-sm" onClick={() => onRequest(donation._id)}>Request</button>
          )}
          {showActions && donation.status === 'requested' && onAccept && (
            <button className="btn btn-primary btn-sm" onClick={() => onAccept(donation._id)}>Accept</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
