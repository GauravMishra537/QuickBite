import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiClock } from 'react-icons/fi';
import api from '../services/api';
import './Customer.css';

const CUISINES = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mughlai', 'Street Food', 'Desserts'];

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (activeCuisine !== 'All') params.cuisine = activeCuisine;
        const res = await api.get('/restaurants', { params });
        setRestaurants(res.data?.restaurants || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(debounce);
  }, [search, activeCuisine]);

  return (
    <div>
      {/* Banner */}
      <div className="page-banner">
        <div className="container">
          <h1>Restaurants</h1>
          <p>Discover the best restaurants near you</p>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input placeholder="Search restaurants, cuisines…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Cuisine filters */}
        <div className="filter-bar">
          {CUISINES.map((c) => (
            <button key={c} className={`filter-chip ${activeCuisine === c ? 'active' : ''}`} onClick={() => setActiveCuisine(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="listing-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="restaurant-card">
                <div className="skeleton" style={{ height: 180 }} />
                <div className="restaurant-card-body">
                  <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍽️</div>
            <p>No restaurants found. Try a different search or cuisine.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {restaurants.map((rest) => (
              <Link to={`/restaurants/${rest._id}`} key={rest._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
                <div className="restaurant-card-img">
                  <img src={rest.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'} alt={rest.name} />
                  {rest.isFeatured && <div className="restaurant-card-badge"><span className="badge badge-primary">⭐ Featured</span></div>}
                  <div className="restaurant-card-time"><FiClock style={{ marginRight: 4 }} />{rest.deliveryTime?.min || 25}–{rest.deliveryTime?.max || 40} min</div>
                </div>
                <div className="restaurant-card-body">
                  <div className="restaurant-card-name">{rest.name}</div>
                  <div className="restaurant-card-cuisine">{(rest.cuisine || []).slice(0, 3).join(', ')}</div>
                  <div className="restaurant-card-footer">
                    <div className="restaurant-card-rating"><FiStar /> {rest.rating?.toFixed(1) || '4.0'} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({rest.totalReviews || 0})</span></div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>₹{rest.deliveryFee || 30} delivery</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
