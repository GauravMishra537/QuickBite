import { FiCheckCircle, FiClock, FiPackage, FiTruck } from 'react-icons/fi';

const STEPS = [
    { key: 'placed', label: 'Order Placed', icon: <FiClock size={20} />, desc: 'Your order has been received' },
    { key: 'confirmed', label: 'Confirmed', icon: <FiCheckCircle size={20} />, desc: 'Restaurant has accepted your order' },
    { key: 'preparing', label: 'Preparing', icon: <FiPackage size={20} />, desc: 'Your food is being prepared' },
    { key: 'ready', label: 'Ready', icon: <FiCheckCircle size={20} />, desc: 'Order is packed and ready for pickup' },
    { key: 'outForDelivery', label: 'Out for Delivery', icon: <FiTruck size={20} />, desc: 'Delivery partner is on the way' },
    { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle size={20} />, desc: 'Enjoy your meal!' },
];

const OrderTracker = ({ currentStatus, statusHistory = [] }) => {
    const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);
    const isCancelled = currentStatus === 'cancelled';

    const getTimestamp = (key) => {
        const entry = statusHistory.find((h) => h.status === key);
        if (!entry) return null;
        return new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                {isCancelled ? '❌ Order Cancelled' : '📦 Order Status'}
            </h3>

            {isCancelled ? (
                <div style={{
                    background: 'var(--danger)15', border: '1px solid var(--danger)44', borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)', textAlign: 'center',
                }}>
                    <p style={{ fontSize: '2rem', marginBottom: 8 }}>😔</p>
                    <p style={{ fontWeight: 600, color: 'var(--danger)' }}>This order has been cancelled</p>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {STEPS.map((step, i) => {
                        const isCompleted = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        const time = getTimestamp(step.key);

                        return (
                            <div key={step.key} style={{ display: 'flex', gap: 'var(--space-md)', position: 'relative', paddingBottom: i < STEPS.length - 1 ? 'var(--space-xl)' : 0 }}>
                                {/* Vertical line */}
                                {i < STEPS.length - 1 && (
                                    <div style={{
                                        position: 'absolute', left: 17, top: 36, bottom: 0, width: 2,
                                        background: isCompleted && i < currentIdx ? 'var(--primary)' : 'var(--border-color)',
                                        transition: 'background 0.5s',
                                    }} />
                                )}

                                {/* Circle icon */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, zIndex: 1, transition: 'all 0.3s',
                                    background: isCompleted ? 'var(--primary)' : 'var(--bg-tertiary)',
                                    color: isCompleted ? '#fff' : 'var(--text-muted)',
                                    border: isCurrent ? '2px solid var(--primary)' : '2px solid transparent',
                                    boxShadow: isCurrent ? '0 0 0 4px var(--primary)22' : 'none',
                                    animation: isCurrent ? 'pulse 2s infinite' : 'none',
                                }}>
                                    {step.icon}
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontWeight: isCurrent ? 700 : 600, color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.3s' }}>
                                            {step.label}
                                        </h4>
                                        {time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{time}</span>}
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: 2 }}>
                                        {step.desc}
                                    </p>
                                    {isCurrent && currentStatus !== 'delivered' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                            <span className="tracking-pulse-dot" />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>In progress...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.15); }
                    50% { box-shadow: 0 0 0 8px rgba(255, 107, 53, 0.08); }
                }
                .tracking-pulse-dot {
                    width: 8px; height: 8px; border-radius: 50%; background: var(--primary);
                    animation: pulse-dot 1.5s infinite;
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
            `}</style>
        </div>
    );
};

export default OrderTracker;
