import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../services/api';
import DeliveryMap from '../components/tracking/DeliveryMap';
import { toast } from 'react-toastify';

/* Error Boundary for map */
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
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Track your donation status in the timeline below</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const STEPS = [
    { key: 'requested', label: 'Requested', icon: '📩' },
    { key: 'accepted', label: 'Accepted', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '🍳' },
    { key: 'readyForPickup', label: 'Ready', icon: '📦' },
    { key: 'outForDelivery', label: 'On the Way', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const DonationTracking = () => {
    const { id } = useParams();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonation();
        const interval = setInterval(fetchDonation, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchDonation = async () => {
        try {
            const res = await api.get(`/donations/${id}`);
            setDonation(res.data?.donation || res.donation);
        } catch (err) {
            toast.error(err.message || 'Donation not found');
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

    if (!donation) return (
        <div className="container" style={{ padding: 'var(--space-3xl) 0', textAlign: 'center', minHeight: '70vh' }}>
            <h2>Donation not found</h2>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Dashboard</Link>
        </div>
    );

    const statusOrder = STEPS.map((s) => s.key);
    const currentIdx = statusOrder.indexOf(donation.status);

    const pickupCoords = donation.restaurant?.location?.coordinates
        ? { lat: donation.restaurant.location.coordinates[1], lng: donation.restaurant.location.coordinates[0] }
        : null;

    return (
        <div className="container" style={{ padding: 'var(--space-2xl) 0', minHeight: '70vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)', display: 'flex' }}><FiArrowLeft size={20} /></Link>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
                        🍱 Track Donation <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'monospace' }}>#{donation._id?.slice(-8).toUpperCase()}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        From: <strong>{donation.restaurant?.name || 'Restaurant'}</strong> • {donation.totalServings} servings
                    </p>
                </div>
                <span style={{
                    display: 'inline-block', padding: '4px 16px', borderRadius: 20, fontSize: '0.875rem', fontWeight: 700,
                    background: donation.status === 'delivered' ? '#27ae6022' : '#e67e2222',
                    color: donation.status === 'delivered' ? '#27ae60' : '#e67e22',
                    border: `1px solid ${donation.status === 'delivered' ? '#27ae6044' : '#e67e2244'}`,
                }}>
                    {donation.status}
                </span>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                {/* Left — Map + Items */}
                <div>
                    <MapErrorBoundary>
                        <DeliveryMap
                            orderStatus={donation.status === 'outForDelivery' ? 'outForDelivery' : donation.status === 'delivered' ? 'delivered' : 'preparing'}
                            shopLocation={pickupCoords}
                        />
                    </MapErrorBoundary>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🍱 Donated Items ({donation.items?.length || 0})
                        </h3>
                        {donation.items?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < donation.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                <div>
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: 8 }}>{item.description || ''}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.quantity} {item.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Tracker + Details */}
                <div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>📊 Donation Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;
                                return (
                                    <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', position: 'relative', paddingBottom: idx < STEPS.length - 1 ? 24 : 0 }}>
                                        {idx < STEPS.length - 1 && (
                                            <div style={{ position: 'absolute', left: 17, top: 36, width: 2, height: 24, background: idx < currentIdx ? 'var(--primary)' : 'var(--border-color)' }} />
                                        )}
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isCompleted ? 'var(--primary)' : 'var(--bg-secondary)',
                                            border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border-color)'}`,
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(255, 107, 53, 0.2)' : 'none',
                                            animation: isCurrent ? 'pulse 2s infinite' : 'none',
                                            fontSize: '1rem',
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: isCurrent ? 700 : 500, color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.9375rem' }}>{step.label}</p>
                                            {isCurrent && <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 2 }}>Current status</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiMapPin /> Route Details
                        </h3>
                        <div style={{ marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-light)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>📍 Pickup From</p>
                            <p style={{ fontWeight: 600 }}>{donation.restaurant?.name}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                {donation.pickupAddress?.street || donation.restaurant?.address?.street || ''}, {donation.pickupAddress?.city || donation.restaurant?.address?.city || ''}
                            </p>
                            {donation.restaurant?.phone && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FiPhone size={12} /> {donation.restaurant.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>🏠 Deliver To</p>
                            <p style={{ fontWeight: 600 }}>{donation.ngo?.name || 'NGO'}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                {donation.deliveryAddress?.street || 'Address pending'}, {donation.deliveryAddress?.city || ''}
                            </p>
                            {donation.ngo?.phone && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FiPhone size={12} /> {donation.ngo.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>⏰ Expires</span>
                            <span style={{ fontWeight: 600 }}>{new Date(donation.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: 8 }}>
                            <span style={{ color: 'var(--text-muted)' }}>📅 Listed</span>
                            <span style={{ fontWeight: 600 }}>{new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationTracking;
