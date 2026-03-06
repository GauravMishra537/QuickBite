import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiTruck, FiStar, FiShoppingBag } from 'react-icons/fi';
import api from '../services/api';
import './Home.css';

const CATEGORIES = [
    { icon: '🍕', label: 'Pizza' },
    { icon: '🍔', label: 'Burgers' },
    { icon: '🍛', label: 'Indian' },
    { icon: '🍜', label: 'Chinese' },
    { icon: '🍣', label: 'Japanese' },
    { icon: '🥗', label: 'Healthy' },
    { icon: '🧁', label: 'Desserts' },
    { icon: '☕', label: 'Beverages' },
    { icon: '🥘', label: 'Biryani' },
    { icon: '🌮', label: 'Street Food' },
    { icon: '🫓', label: 'South Indian' },
    { icon: '🍱', label: 'Thali' },
];

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restRes, kitchenRes] = await Promise.all([
                    api.get('/restaurants?limit=8'),
                    api.get('/cloud-kitchens?limit=4'),
                ]);
                setRestaurants(restRes.data?.restaurants || []);
                setKitchens(kitchenRes.data?.kitchens || kitchenRes.data?.cloudKitchens || []);
            } catch (err) {
                console.error('Failed to fetch:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="home">
            {/* ===== HERO ===== */}
            <section className="home-hero">
                <div className="hero-bg-gradient" />
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                🚀 #1 Food Delivery Platform in India
                            </div>
                            <h1 className="hero-title">
                                Delicious Food,<br />
                                <span className="gradient-text">Delivered Fast</span>
                            </h1>
                            <p className="hero-subtitle">
                                From your favourite restaurants and cloud kitchens to fresh groceries —
                                order anything, anytime, and get it delivered to your doorstep in minutes.
                            </p>
                            <div className="hero-actions">
                                <Link to="/restaurants" className="btn btn-primary btn-lg">
                                    Order Now <FiArrowRight />
                                </Link>
                                <Link to="/subscriptions" className="btn btn-secondary btn-lg">
                                    Subscribe & Save
                                </Link>
                            </div>
                            <div className="hero-stats">
                                <div className="hero-stat">
                                    <div className="hero-stat-number">500+</div>
                                    <div className="hero-stat-label">Restaurants</div>
                                </div>
                                <div className="hero-stat">
                                    <div className="hero-stat-number">30min</div>
                                    <div className="hero-stat-label">Avg. Delivery</div>
                                </div>
                                <div className="hero-stat">
                                    <div className="hero-stat-number">50K+</div>
                                    <div className="hero-stat-label">Happy Users</div>
                                </div>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="hero-image-grid">
                                <div className="hero-image-card">
                                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" alt="Pizza" />
                                </div>
                                <div className="hero-image-card">
                                    <img src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=300&fit=crop" alt="Biryani" />
                                </div>
                                <div className="hero-image-card">
                                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" alt="Burger" />
                                </div>
                                <div className="hero-image-card">
                                    <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" alt="Indian Thali" />
                                </div>
                            </div>
                            <div className="hero-float hero-float-1">
                                <FiClock style={{ color: 'var(--primary)' }} /> 25 min delivery
                            </div>
                            <div className="hero-float hero-float-2">
                                <FiTruck style={{ color: 'var(--success)' }} /> Free delivery
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES ===== */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>What's on your mind?</h2>
                        <p>Explore cuisines from around the world</p>
                    </div>
                    <div className="category-scroll">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.label} className="category-pill">
                                <span className="category-pill-icon">{cat.icon}</span>
                                <span className="category-pill-label">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED RESTAURANTS ===== */}
            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Top Restaurants Near You</h2>
                        <p>Handpicked favourites based on ratings and popularity</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-4 gap-lg">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="restaurant-card">
                                    <div className="skeleton" style={{ height: 180 }} />
                                    <div className="restaurant-card-body">
                                        <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }} />
                                        <div className="skeleton" style={{ height: 14, width: '50%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-4 gap-lg">
                            {restaurants.slice(0, 8).map((rest) => (
                                <Link to={`/restaurants/${rest._id}`} key={rest._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
                                    <div className="restaurant-card-img">
                                        <img
                                            src={rest.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'}
                                            alt={rest.name}
                                        />
                                        {rest.isFeatured && (
                                            <div className="restaurant-card-badge">
                                                <span className="badge badge-primary">⭐ Featured</span>
                                            </div>
                                        )}
                                        <div className="restaurant-card-time">
                                            <FiClock style={{ marginRight: 4 }} />
                                            {rest.deliveryTime?.min || 25}–{rest.deliveryTime?.max || 40} min
                                        </div>
                                    </div>
                                    <div className="restaurant-card-body">
                                        <div className="restaurant-card-name">{rest.name}</div>
                                        <div className="restaurant-card-cuisine">
                                            {(rest.cuisine || []).slice(0, 3).join(', ')}
                                        </div>
                                        <div className="restaurant-card-footer">
                                            <div className="restaurant-card-rating">
                                                <FiStar /> {rest.rating?.toFixed(1) || '4.0'}
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                                                    ({rest.totalReviews || 0})
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                ₹{rest.deliveryFee || 30} delivery
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {restaurants.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                            <Link to="/restaurants" className="btn btn-secondary">
                                View All Restaurants <FiArrowRight />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== CLOUD KITCHENS ===== */}
            {kitchens.length > 0 && (
                <section className="section" style={{ paddingTop: 0 }}>
                    <div className="container">
                        <div className="section-header">
                            <h2>Cloud Kitchens</h2>
                            <p>Delivery-only kitchens crafting amazing meals</p>
                        </div>
                        <div className="grid grid-4 gap-lg">
                            {kitchens.slice(0, 4).map((kitchen) => (
                                <Link to={`/cloud-kitchens/${kitchen._id}`} key={kitchen._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
                                    <div className="restaurant-card-img">
                                        <img
                                            src={kitchen.images?.[0] || 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=250&fit=crop'}
                                            alt={kitchen.name}
                                        />
                                        <div className="restaurant-card-badge">
                                            <span className="badge badge-accent">☁️ Cloud Kitchen</span>
                                        </div>
                                        <div className="restaurant-card-time">
                                            <FiClock style={{ marginRight: 4 }} />
                                            {kitchen.deliveryTime?.min || 20}–{kitchen.deliveryTime?.max || 35} min
                                        </div>
                                    </div>
                                    <div className="restaurant-card-body">
                                        <div className="restaurant-card-name">{kitchen.name}</div>
                                        <div className="restaurant-card-cuisine">
                                            {(kitchen.specialities || kitchen.cuisine || []).slice(0, 3).join(', ')}
                                        </div>
                                        <div className="restaurant-card-footer">
                                            <div className="restaurant-card-rating">
                                                <FiStar /> {kitchen.rating?.toFixed(1) || '4.0'}
                                            </div>
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                ₹{kitchen.deliveryFee || 25} delivery
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CTA ===== */}
            <section className="section">
                <div className="container">
                    <div className="cta-section">
                        <h2>Subscribe & Save Up To 15%</h2>
                        <p>Get free deliveries, exclusive discounts, and priority support with QuickBite subscriptions.</p>
                        <Link to="/subscriptions" className="cta-btn">
                            <FiShoppingBag /> Explore Plans <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
