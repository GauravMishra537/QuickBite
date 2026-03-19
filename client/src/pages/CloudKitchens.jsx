import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiClock } from 'react-icons/fi';
import api from '../services/api';
import './Customer.css';

const CUISINES = ['All', 'North Indian', 'South Indian', 'Chinese', 'Continental', 'Biryani', 'Healthy', 'Desserts'];

const CloudKitchens = () => {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (activeCuisine !== 'All') params.cuisine = activeCuisine;
        const res = await api.get('/cloud-kitchens', { params });
        setKitchens(res.data?.kitchens || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchKitchens, 300);
    return () => clearTimeout(debounce);
  }, [search, activeCuisine]);

  return (
    <div>
      <div className="page-banner" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #74b9ff 100%)' }}>
        <div className="container">
          <h1>☁️ Cloud Kitchens</h1>
          <p>Order from delivery-only kitchens with top-rated meals</p>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input placeholder="Search cloud kitchens, cuisines…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="filter-bar">
          {CUISINES.map((c) => (
            <button key={c} className={`filter-chip ${activeCuisine === c ? 'active' : ''}`} onClick={() => setActiveCuisine(c)}>
              {c}
            </button>
          ))}
        </div>

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
        ) : kitchens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>☁️</div>
            <p>No cloud kitchens found. Try a different search or cuisine.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {kitchens.map((kitchen) => (
              <Link to={`/cloud-kitchens/${kitchen._id}`} key={kitchen._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
                <div className="restaurant-card-img">
                  <img src={kitchen.images?.[0] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop'} alt={kitchen.name} />
                  {kitchen.isFeatured && <div className="restaurant-card-badge"><span className="badge badge-primary">⭐ Featured</span></div>}
                  <div className="restaurant-card-time"><FiClock style={{ marginRight: 4 }} />{kitchen.deliveryTime?.min || 20}–{kitchen.deliveryTime?.max || 35} min</div>
                </div>
                <div className="restaurant-card-body">
                  <div className="restaurant-card-name">{kitchen.name}</div>
                  <div className="restaurant-card-cuisine">{(kitchen.cuisine || []).slice(0, 3).join(', ')}</div>
                  <div className="restaurant-card-footer">
                    <div className="restaurant-card-rating"><FiStar /> {kitchen.rating?.toFixed(1) || '4.0'} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({kitchen.totalReviews || 0})</span></div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>₹{kitchen.deliveryFee || 25} delivery</span>
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

export default CloudKitchens;
