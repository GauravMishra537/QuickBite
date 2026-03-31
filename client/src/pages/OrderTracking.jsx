import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../services/socket';
import DeliveryMap from '../components/tracking/DeliveryMap';
import OrderTracker from '../components/tracking/OrderTracker';
import { toast } from 'react-toastify';

/* Error Boundary to prevent map crashes from breaking the whole page */
class MapErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(err) { console.error('Map Error:', err); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ width: '100%', height: 400, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: 12 }}>
                    <span style={{ fontSize: '3rem' }}>🗺️</span>
                    <p style={{ fontWeight: 600 }}>Map unavailable</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Track your order status in the timeline →</p>
                </div>
            );
        }
        return this.props.children;
    }
}


const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deliveryLoc, setDeliveryLoc] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchOrder();
        // Join socket room
        socketRef.current = getSocket();
        joinOrderRoom(id);

        socketRef.current.on('orderStatusUpdate', (data) => {
            setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
            toast.info(`Order status: ${data.status}`);
        });

        socketRef.current.on('deliveryLocation', (loc) => {
            setDeliveryLoc({ lat: loc.lat, lng: loc.lng });
        });

        return () => {
            leaveOrderRoom(id);
            socketRef.current?.off('orderStatusUpdate');
            socketRef.current?.off('deliveryLocation');
        };
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data?.order || res.order);
        } catch (err) {
            toast.error(err.message || 'Order not found');
        } finally { setLoading(false); }
    };

    if (loading) return (
        <div className="container" style={{ padding: 'var(--space-3xl) 0', minHeight: '70vh' }}>
            <div className="skeleton" style={{ height: 60, borderRadius: 16, marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
                <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            </div>
        </div>
    );

    if (!order) return (
        <div className="container" style={{ padding: 'var(--space-3xl) 0', textAlign: 'center', minHeight: '70vh' }}>
            <h2>Order not found</h2>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Dashboard</Link>
        </div>
    );

    const source = order.restaurant || order.cloudKitchen || order.groceryShop || {};
    const sourceLabel = order.restaurant ? 'Restaurant' : order.cloudKitchen ? 'Cloud Kitchen' : 'Grocery Shop';

    return (
        <div className="container" style={{ padding: 'var(--space-2xl) 0', minHeight: '70vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)', display: 'flex' }}><FiArrowLeft size={20} /></Link>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
                        Track Order <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'monospace' }}>#{order._id?.slice(-8).toUpperCase()}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {sourceLabel}: <strong>{source.name || 'N/A'}</strong> • {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
                </div>
                <span className={`status-badge ${order.status}`} style={{ fontSize: '0.875rem', padding: '4px 16px' }}>{order.status}</span>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                {/* Left — Map + Items */}
                <div>
                    {/* Live Map */}
                    <MapErrorBoundary>
                        <DeliveryMap
                            orderStatus={order.status}
                            deliveryLocation={deliveryLoc}
                            shopLocation={source.location?.coordinates ? { lat: source.location.coordinates[1], lng: source.location.coordinates[0] } : null}
                        />
                    </MapErrorBoundary>

                    {/* Order Items */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiPackage /> Order Items ({order.items?.length || 0})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {order.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {item.image && <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{item.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '2px solid var(--border-color)', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span>₹{order.itemsTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                                <span>₹{order.deliveryFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                                <span>₹{order.tax}</span>
                            </div>
                            {order.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--success)' }}>Discount</span>
                                    <span style={{ color: 'var(--success)' }}>−₹{order.discount}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem', marginTop: 8 }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Tracker + Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Status Tracker */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
                        <OrderTracker currentStatus={order.status} statusHistory={order.statusHistory || []} />
                    </div>

                    {/* Delivery Address */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8 }}><FiMapPin /> Delivery Address</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {order.deliveryAddress?.label && <strong>{order.deliveryAddress.label}<br /></strong>}
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}<br />
                            {order.deliveryAddress?.state} — {order.deliveryAddress?.zipCode}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8 }}><FiCreditCard /> Payment</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {order.paymentMethod === 'stripe' ? '💳 Stripe' : '💵 Cash on Delivery'}
                            </span>
                            <span className={`status-badge ${order.paymentStatus === 'completed' ? 'ready' : 'pending'}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Delivery Partner */}
                    {order.deliveryPartner && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)' }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>🏍️ Delivery Partner</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                    {(order.deliveryPartner.name || 'D')[0]}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600 }}>{order.deliveryPartner.name}</p>
                                    {order.deliveryPartner.phone && (
                                        <a href={`tel:${order.deliveryPartner.phone}`} style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FiPhone size={12} /> Call
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ETA */}
                    {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div style={{ background: 'var(--primary)10', border: '1px solid var(--primary)33', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Delivery</p>
                            <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                                {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
