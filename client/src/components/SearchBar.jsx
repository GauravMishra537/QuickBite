import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = (q) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults(res.data);
        setOpen(true);
      } catch { setResults(null); }
    }, 300);
  };

  const handleChange = (e) => { setQuery(e.target.value); doSearch(e.target.value); };

  const go = (path) => { setOpen(false); setQuery(''); navigate(path); };

  const hasResults = results && (
    results.restaurants?.length || results.kitchens?.length || results.shops?.length || results.menuItems?.length
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text" value={query} onChange={handleChange} onFocus={() => results && setOpen(true)}
          placeholder="Search restaurants, kitchens, grocery..."
          style={{
            padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', width: 260,
            outline: 'none', transition: 'border-color 0.2s',
          }}
        />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: 'var(--bg-card)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          maxHeight: 360, overflowY: 'auto', zIndex: 1000, minWidth: 300,
        }}>
          {!hasResults ? (
            <p style={{ padding: 'var(--space-md)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>No results found</p>
          ) : (
            <>
              {results.restaurants?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Restaurants</div>
                  {results.restaurants.map((r) => (
                    <button key={r._id} onClick={() => go(`/restaurants/${r._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.875rem' }}>
                      <span>🍽️</span><span style={{ fontWeight: 600 }}>{r.name}</span>
                      {r.rating > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>⭐ {r.rating}</span>}
                    </button>
                  ))}
                </div>
              )}
              {results.kitchens?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1, borderTop: '1px solid var(--border-light)' }}>Cloud Kitchens</div>
                  {results.kitchens.map((k) => (
                    <button key={k._id} onClick={() => go(`/cloud-kitchens/${k._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.875rem' }}>
                      <span>☁️</span><span style={{ fontWeight: 600 }}>{k.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.shops?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1, borderTop: '1px solid var(--border-light)' }}>Grocery Shops</div>
                  {results.shops.map((s) => (
                    <button key={s._id} onClick={() => go(`/grocery/${s._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.875rem' }}>
                      <span>🥬</span><span style={{ fontWeight: 600 }}>{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.menuItems?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1, borderTop: '1px solid var(--border-light)' }}>Menu Items</div>
                  {results.menuItems.map((m) => (
                    <button key={m._id} onClick={() => go(m.restaurant ? `/restaurants/${m.restaurant}` : `/cloud-kitchens/${m.cloudKitchen}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.875rem' }}>
                      <span>🍲</span>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>₹{m.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
