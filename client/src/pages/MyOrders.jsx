import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiMapPin, FiClock, FiExternalLink } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my-orders?limit=50');
            setOrders(res.data?.orders || []);
        } catch (err) { toast.error(err.message || 'Failed to load orders'); }
        finally { setLoading(false); }
    };

    const cancelOrder = async (id) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.patch(`/orders/${id}/cancel`, { cancelReason: 'Changed my mind' });
            toast.success('Order cancelled');
            fetchOrders();
        } catch (err) { toast.error(err.message || 'Cannot cancel'); }
    };

    const filtered = orders.filter((o) => !filter || o.status === filter);

    const statusColor = {
        placed: '#3498db', confirmed: '#2ecc71', preparing: '#e67e22', ready: '#9b59b6',
        outForDelivery: '#e74c3c', delivered: '#27ae60', cancelled: '#7f8c8d',
    };

    if (loading) return (
        <div className="container" style={{ padding: 'var(--space-3xl) 0', minHeight: '70vh' }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 16 }} />)}
        </div>
    );

    return (
        <div className="container" style={{ padding: 'var(--space-2xl) 0', minHeight: '70vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>📦 My Orders</h1>
                <select className="form-input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">All Orders</option>
                    {['placed', 'confirmed', 'preparing', 'ready', 'outForDelivery', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</p>
                    <p>No orders found. <Link to="/" style={{ color: 'var(--primary)' }}>Start ordering!</Link></p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {filtered.map((order) => {
                    const source = order.restaurant || order.cloudKitchen || order.groceryShop || {};
                    const canCancel = ['placed', 'confirmed'].includes(order.status);
                    const canTrack = !['delivered', 'cancelled'].includes(order.status);

                    return (
                        <div key={order._id} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
                            padding: 'var(--space-lg)', transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{order._id?.slice(-8).toUpperCase()}</span>
                                        <span style={{
                                            padding: '2px 12px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
                                            background: `${statusColor[order.status]}22`, color: statusColor[order.status],
                                            border: `1px solid ${statusColor[order.status]}44`,
                                        }}>{order.status}</span>
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{source.name || 'Order'}</h3>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                            </div>

                            {/* Items preview */}
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: 8 }}>
                                {order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                            </p>

                            <div style={{ display: 'flex', gap: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {new Date(order.createdAt).toLocaleString('en-IN')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} /> {order.deliveryAddress?.city || 'N/A'}</span>
                                <span>{order.paymentMethod === 'stripe' ? '💳 Stripe' : '💵 COD'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                {canTrack && (
                                    <Link to={`/track/${order._id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiExternalLink size={14} /> Track Order
                                    </Link>
                                )}
                                {order.status === 'delivered' && (
                                    <Link to={`/track/${order._id}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiPackage size={14} /> View Details
                                    </Link>
                                )}
                                {canCancel && (
                                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => cancelOrder(order._id)}>Cancel</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;
