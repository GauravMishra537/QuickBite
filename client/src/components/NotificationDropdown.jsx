import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { connectSocket, onSocketEvent } from '../services/socketService';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'welcome', text: '🎉 Welcome to QuickBite!', time: 'Just now', read: true },
  ]);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!user?._id) return;

    connectSocket(user._id, user.role);

    const unsubs = [];

    // New order (for business owners)
    unsubs.push(onSocketEvent('newOrder', (data) => {
      setNotifications(prev => [{
        id: `order_${data.orderId}_${Date.now()}`,
        text: `📦 New order from ${data.customerName}! ${data.itemCount} items · ₹${data.totalAmount}`,
        time: 'Just now',
        read: false,
      }, ...prev].slice(0, 20));
    }));

    // Order status changed (for customers, delivery partners, business owners)
    unsubs.push(onSocketEvent('orderStatusChanged', (data) => {
      const statusMessages = {
        confirmed: `✅ Order #${data.orderNumber} confirmed by ${data.businessName}`,
        preparing: `👨‍🍳 Order #${data.orderNumber} is being prepared`,
        ready: `📦 Order #${data.orderNumber} is ready for pickup!`,
        pickedUp: `🤝 ${data.deliveryPartner || 'Delivery partner'} picked up your order`,
        outForDelivery: `🏍️ Order #${data.orderNumber} is on the way!`,
        delivered: `✅ Order #${data.orderNumber} delivered! ${data.message || ''}`,
      };
      const msg = statusMessages[data.status] || `📋 Order #${data.orderNumber} → ${data.status}`;
      setNotifications(prev => [{
        id: `status_${data.orderId}_${data.status}_${Date.now()}`,
        text: msg,
        time: 'Just now',
        read: false,
      }, ...prev].slice(0, 20));
    }));

    // New delivery request (for delivery partners)
    unsubs.push(onSocketEvent('newDeliveryRequest', (data) => {
      setNotifications(prev => [{
        id: `delivery_${data.orderId}_${Date.now()}`,
        text: `🆕 New delivery! ${data.businessName} · ${data.itemCount} items · ₹${data.totalAmount}`,
        time: 'Just now',
        read: false,
      }, ...prev].slice(0, 20));
    }));

    return () => unsubs.forEach(u => u());
  }, [user?._id, user?.role]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(!open); if (!open) setTimeout(markAllRead, 2000); }} style={{
        background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
        color: 'var(--text-primary)', padding: 6, borderRadius: 'var(--radius-full)',
      }}>
        <FiBell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff', fontSize: '0.625rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 360,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden',
          maxHeight: 400, overflowY: 'auto',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔔 Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
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
