import { useEffect, useState } from 'react';
import { FiHeart, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import donationService from '../services/donationService';
import './Customer.css';
import './Services.css';

const SurplusFood = () => {
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('food');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, ngoRes] = await Promise.all([
          donationService.getAvailable().catch(() => ({ data: { donations: [] } })),
          donationService.getAllNGOs().catch(() => ({ data: { ngos: [] } })),
        ]);
        setDonations(donRes.data?.donations || []);
        setNgos(ngoRes.data?.ngos || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="page-banner" style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #1abc9c 100%)' }}>
        <div className="container">
          <h1>🤝 Surplus Food — Donate & Help</h1>
          <p>Connect restaurants with NGOs to fight food waste and feed those in need</p>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)' }}>
              <FiHeart /> <strong>{donations.length}</strong> Donations Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)' }}>
              <FiUsers /> <strong>{ngos.length}</strong> Partner NGOs
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
          <button className={`filter-chip ${tab === 'food' ? 'active' : ''}`} onClick={() => setTab('food')}>
            🍱 Available Food ({donations.length})
          </button>
          <button className={`filter-chip ${tab === 'ngos' ? 'active' : ''}`} onClick={() => setTab('ngos')}>
            🏛️ Partner NGOs ({ngos.length})
          </button>
        </div>

        {loading ? (
          <div className="listing-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        ) : tab === 'food' ? (
          donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍱</div>
              <p>No surplus food available right now.</p>
              <p style={{ fontSize: '0.875rem', marginTop: 8 }}>Restaurants can list surplus food from their dashboard.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {donations.map((don) => (
                <div key={don._id} className="restaurant-card" style={{ cursor: 'default' }}>
                  <div className="restaurant-card-img" style={{ background: 'linear-gradient(135deg, #2ecc71, #1abc9c)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                    <span style={{ fontSize: '3rem' }}>🍲</span>
                  </div>
                  <div className="restaurant-card-body">
                    <div className="restaurant-card-name">{don.restaurant?.name || 'Restaurant'}</div>
                    <div className="restaurant-card-cuisine" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {don.items?.map((i) => i.name).join(', ') || 'Food items'}
                    </div>
                    <div style={{ margin: 'var(--space-sm) 0', display: 'flex', gap: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span>🍽️ {don.totalServings} servings</span>
                      <span><FiClock style={{ marginRight: 2 }} /> {new Date(don.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="restaurant-card-footer">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}><FiMapPin /> {don.pickupAddress?.city || 'City'}</span>
                      <span className="badge" style={{ background: 'rgba(46,204,113,0.15)', color: 'var(--success)' }}>Available</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          ngos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🏛️</div>
              <p>No partner NGOs registered yet.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {ngos.map((ngo) => (
                <div key={ngo._id} className="restaurant-card" style={{ cursor: 'default' }}>
                  <div className="restaurant-card-img" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                    <span style={{ fontSize: '3rem' }}>🏛️</span>
                  </div>
                  <div className="restaurant-card-body">
                    <div className="restaurant-card-name">{ngo.name}</div>
                    <div className="restaurant-card-cuisine">{ngo.description?.slice(0, 80) || 'Food donation partner'}</div>
                    <div style={{ margin: 'var(--space-sm) 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <FiMapPin style={{ marginRight: 4 }} /> {ngo.address?.city || 'City'}, {ngo.address?.state || ''}
                    </div>
                    <div className="restaurant-card-footer">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📞 {ngo.phone || 'N/A'}</span>
                      <span className="badge" style={{ background: ngo.isVerified ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)', color: ngo.isVerified ? 'var(--success)' : 'var(--warning)' }}>
                        {ngo.isVerified ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* How it works */}
        <div style={{ marginTop: 'var(--space-3xl)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 'var(--space-xl)' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xl)', maxWidth: 800, margin: '0 auto' }}>
            {[
              { step: '1', icon: '🏪', title: 'Restaurant Lists', desc: 'Restaurants list surplus food that would otherwise go to waste' },
              { step: '2', icon: '🤝', title: 'NGO Requests', desc: 'Registered NGOs browse and request available food donations' },
              { step: '3', icon: '🚚', title: 'Food Delivered', desc: 'Delivery partners pick up food and deliver it to those in need' },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>{s.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurplusFood;
