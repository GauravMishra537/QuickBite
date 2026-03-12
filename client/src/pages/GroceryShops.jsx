import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiMapPin } from 'react-icons/fi';
import api from '../services/api';
import './Customer.css';
import './Services.css';

const GroceryShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/grocery', { params: search ? { search } : {} });
        setShops(res.data?.shops || res.data?.groceryShops || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    const t = setTimeout(fetch, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>🥬 Grocery Stores</h1>
          <p>Fresh fruits, vegetables, dairy & essentials delivered to your door</p>
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input placeholder="Search grocery stores…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
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
        ) : shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🛒</div>
            <p>No grocery stores found.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {shops.map((shop) => (
              <Link to={`/grocery/${shop._id}`} key={shop._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
                <div className="restaurant-card-img">
                  <img src={shop.images?.[0] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=250&fit=crop'} alt={shop.name} />
                  {shop.isFeatured && <div className="restaurant-card-badge"><span className="badge badge-primary">⭐ Featured</span></div>}
                </div>
                <div className="restaurant-card-body">
                  <div className="restaurant-card-name">{shop.name}</div>
                  <div className="restaurant-card-cuisine">
                    <FiMapPin style={{ marginRight: 4 }} />{shop.address?.city || 'Multiple locations'}
                  </div>
                  <div className="restaurant-card-footer">
                    <div className="restaurant-card-rating"><FiStar /> {shop.rating?.toFixed(1) || '4.0'}</div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {shop.deliveryTime?.min || 20}–{shop.deliveryTime?.max || 40} min
                    </span>
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

export default GroceryShops;
