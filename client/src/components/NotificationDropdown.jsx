import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Simulated notifications
  const notifications = user ? [
    { id: 1, text: '🎉 Welcome to QuickBite!', time: 'Just now', read: false },
    { id: 2, text: '🍔 New restaurants near you', time: '2h ago', read: false },
    { id: 3, text: '🛒 Your order is being prepared', time: '5h ago', read: true },
    { id: 4, text: '⭐ Rate your recent order', time: '1d ago', read: true },
  ] : [];

  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
        color: 'var(--text-primary)', padding: 6, borderRadius: 'var(--radius-full)',
      }}>
        <FiBell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff', fontSize: '0.625rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 320,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            🔔 Notifications
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: 'var(--space-lg)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{
                padding: '10px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                background: n.read ? 'transparent' : 'rgba(255, 126, 0, 0.05)',
                transition: 'background 0.15s',
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
