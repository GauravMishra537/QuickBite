import { useEffect, useState } from 'react';
import { FiCalendar, FiUsers, FiClock, FiMapPin, FiCreditCard, FiPlus, FiMinus } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Services.css';
import './Customer.css';

const TIME_SLOTS = [
  { from: '12:00', to: '13:30', label: '12:00 PM' },
  { from: '12:30', to: '14:00', label: '12:30 PM' },
  { from: '13:00', to: '14:30', label: '1:00 PM' },
  { from: '13:30', to: '15:00', label: '1:30 PM' },
  { from: '19:00', to: '20:30', label: '7:00 PM' },
  { from: '19:30', to: '21:00', label: '7:30 PM' },
  { from: '20:00', to: '21:30', label: '8:00 PM' },
  { from: '20:30', to: '22:00', label: '8:30 PM' },
  { from: '21:00', to: '22:30', label: '9:00 PM' },
];

const BOOKING_FEE = 199;

const TableBooking = () => {
  const { isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRest, setSelectedRest] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(null);
  const [guests, setGuests] = useState(2);
  const [specialReq, setSpecialReq] = useState('');
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [placing, setPlacing] = useState(false);
  const [tab, setTab] = useState('book');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restRes = await api.get('/restaurants');
        setRestaurants(restRes.data?.restaurants || []);
        if (isAuthenticated) {
          try {
            const bookRes = await api.get('/bookings/my-bookings');
            setMyBookings(bookRes.data?.bookings || []);
          } catch (e) { /* not logged in */ }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isAuthenticated]);

  // Fetch menu when restaurant selected
  useEffect(() => {
    if (selectedRest?._id) {
      api.get(`/menu/restaurant/${selectedRest._id}`)
        .then((res) => setMenuItems(res.data?.items || res.data?.menuItems || []))
        .catch(() => setMenuItems([]));
    } else {
      setMenuItems([]);
    }
    setSelectedTable(null);
    setPreOrderItems([]);
  }, [selectedRest]);

  const addPreOrder = (item) => {
    setPreOrderItems((prev) => {
      const ex = prev.find((p) => p._id === item._id);
      if (ex) return prev.map((p) => p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updatePreOrderQty = (itemId, qty) => {
    if (qty <= 0) { setPreOrderItems((prev) => prev.filter((p) => p._id !== itemId)); return; }
    setPreOrderItems((prev) => prev.map((p) => p._id === itemId ? { ...p, quantity: qty } : p));
  };

  const menuTotal = preOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalAmount = BOOKING_FEE + menuTotal;

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (!selectedRest || !date || !timeSlot || !selectedTable) {
      toast.error('Please select restaurant, table, date, and time');
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post('/bookings', {
        restaurant: selectedRest._id,
        tableNumber: selectedTable.tableNumber,
        date,
        timeSlot: { from: timeSlot.from, to: timeSlot.to },
        guests,
        preOrderTotal: menuTotal,
        specialRequests: specialReq + (preOrderItems.length > 0 ? `\n\n📋 Pre-ordered menu: ${preOrderItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}` : ''),
      });

      const booking = res.data?.booking;

      if (paymentMethod === 'stripe' && booking?._id) {
        try {
          const checkoutRes = await api.post('/payments/create-checkout/booking', { bookingId: booking._id });
          const stripeUrl = checkoutRes.data?.url;
          if (stripeUrl) {
            window.location.href = stripeUrl;
            return;
          }
        } catch (stripeErr) {
          toast.info('Stripe unavailable. Booking placed as pending.');
        }
      }

      toast.success('Table booked successfully! 🎉');
      setSelectedRest(null); setSelectedTable(null); setDate(''); setTimeSlot(null); setGuests(2); setSpecialReq(''); setPreOrderItems([]);
      const bookRes = await api.get('/bookings/my-bookings');
      setMyBookings(bookRes.data?.bookings || []);
      setTab('my');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
    } finally { setPlacing(false); }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setMyBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) { toast.error('Cancel failed'); }
  };

  const statusColor = (s) => {
    const map = { confirmed: 'var(--success)', pending: 'var(--warning)', completed: 'var(--info)', cancelled: 'var(--danger)' };
    return map[s] || 'var(--text-muted)';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>🍽️ Table Booking</h1>
          <p>Reserve a table and pre-order your meal</p>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
            <button className={`filter-chip ${tab === 'book' ? 'active' : ''}`} onClick={() => setTab('book')}>Book a Table</button>
            {isAuthenticated && (
              <button className={`filter-chip ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
                My Bookings ({myBookings.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container booking-page">
        {tab === 'book' ? (
          <div className="booking-grid">
            <div>
              {/* Select Restaurant */}
              <div className="booking-form-section">
                <h3><FiMapPin /> Select Restaurant</h3>
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 8, borderRadius: 12 }} />)
                ) : (
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {restaurants.map((rest) => (
                      <div key={rest._id} className={`restaurant-select-card ${selectedRest?._id === rest._id ? 'selected' : ''}`} onClick={() => setSelectedRest(rest)}>
                        <img src={rest.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop'} alt={rest.name} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{rest.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{(rest.cuisine || []).slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Table */}
              {selectedRest?.tables?.length > 0 && (
                <div className="booking-form-section">
                  <h3>🪑 Select Table</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-sm)' }}>
                    {selectedRest.tables.filter((t) => t.capacity >= guests).map((t) => (
                      <div key={t.tableNumber}
                        className={`time-slot ${selectedTable?.tableNumber === t.tableNumber ? 'selected' : ''}`}
                        onClick={() => setSelectedTable(t)}
                        style={{ textAlign: 'center', padding: '10px' }}>
                        <div style={{ fontWeight: 700 }}>Table {t.tableNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.capacity} seats • {t.location || 'Indoor'}</div>
                      </div>
                    ))}
                  </div>
                  {selectedRest.tables.filter((t) => t.capacity >= guests).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tables available for {guests} guests. Try fewer guests.</p>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="booking-form-section">
                <h3><FiCalendar /> Date & Time</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label>Date</label>
                    <input type="date" className="input" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Guests</label>
                    <select className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                    </select>
                  </div>
                </div>
                <label style={{ fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'block' }}>Select Time Slot</label>
                <div className="time-slots">
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.from} className={`time-slot ${timeSlot?.from === slot.from ? 'selected' : ''}`} onClick={() => setTimeSlot(slot)}>
                      {slot.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-order Menu */}
              {selectedRest && menuItems.length > 0 && (
                <div className="booking-form-section">
                  <h3>📋 Pre-order Menu (Optional)</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>Get your food ready when you arrive!</p>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {menuItems.filter((m) => m.isAvailable !== false).slice(0, 15).map((item) => {
                      const qty = preOrderItems.find((p) => p._id === item._id)?.quantity || 0;
                      return (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <div>
                            <span style={{ fontSize: '0.6875rem', padding: '1px 4px', border: `1px solid ${item.isVeg ? 'var(--success)' : '#e74c3c'}`, color: item.isVeg ? 'var(--success)' : '#e74c3c', borderRadius: 3, marginRight: 6 }}>●</span>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: 8 }}>₹{item.price}</span>
                          </div>
                          {qty === 0 ? (
                            <button className="btn btn-primary btn-sm" onClick={() => addPreOrder(item)}>Add</button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => updatePreOrderQty(item._id, qty - 1)}><FiMinus /></button>
                              <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                              <button className="btn btn-primary btn-sm" onClick={() => updatePreOrderQty(item._id, qty + 1)}><FiPlus /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="booking-form-section">
                <h3><FiUsers /> Additional Details</h3>
                <div className="input-group">
                  <label>Special Requests (optional)</label>
                  <textarea className="input" rows={3} value={specialReq} onChange={(e) => setSpecialReq(e.target.value)} placeholder="Birthday celebration, window seat, dietary requirements…" />
                </div>
              </div>

              {/* Payment Method */}
              <div className="booking-form-section">
                <h3><FiCreditCard /> Payment Method</h3>
                <div className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                  <div className="payment-option-radio" />
                  <div>
                    <div style={{ fontWeight: 600 }}>💳 Pay Online (Stripe)</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Secure payment via credit/debit card</div>
                  </div>
                </div>
                <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')} style={{ marginTop: 8 }}>
                  <div className="payment-option-radio" />
                  <div>
                    <div style={{ fontWeight: 600 }}>💵 Pay at Restaurant</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pay when you arrive</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              {selectedRest ? (
                <>
                  <div className="booking-detail-row"><span>Restaurant</span><strong>{selectedRest.name}</strong></div>
                  {selectedTable && <div className="booking-detail-row"><span>Table</span><strong>Table {selectedTable.tableNumber} ({selectedTable.capacity} seats)</strong></div>}
                  <div className="booking-detail-row"><span>Date</span><strong>{date || '—'}</strong></div>
                  <div className="booking-detail-row"><span>Time</span><strong>{timeSlot?.label || '—'}</strong></div>
                  <div className="booking-detail-row"><span>Guests</span><strong>{guests}</strong></div>

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: 'var(--space-md) 0', paddingTop: 'var(--space-md)' }}>
                    <div className="booking-detail-row"><span>Table Booking Fee</span><strong>₹{BOOKING_FEE}</strong></div>
                    {preOrderItems.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>Pre-ordered Items:</div>
                        {preOrderItems.map((item) => (
                          <div key={item._id} className="booking-detail-row" style={{ fontSize: '0.875rem' }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="booking-detail-row"><span>Menu Subtotal</span><strong>₹{menuTotal}</strong></div>
                      </>
                    )}
                    <div className="booking-detail-row" style={{ fontSize: '1.125rem', marginTop: 8 }}>
                      <span style={{ fontWeight: 700 }}>Total</span>
                      <strong style={{ color: 'var(--primary)' }}>₹{totalAmount}</strong>
                    </div>
                  </div>

                  {specialReq && <div className="booking-detail-row"><span>Notes</span><span style={{ fontSize: '0.8125rem' }}>{specialReq}</span></div>}
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)' }} onClick={handleBook} disabled={placing}>
                    {placing ? 'Booking…' : paymentMethod === 'stripe' ? `Pay & Book — ₹${totalAmount}` : `Book Table — ₹${totalAmount}`}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📋</div>
                  <p>Select a restaurant to begin</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* My Bookings */
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>My Bookings</h2>
            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📅</div>
                <p>No bookings yet. Book your first table!</p>
              </div>
            ) : (
              <div className="my-bookings-list">
                {myBookings.map((b) => (
                  <div key={b._id} className="booking-card">
                    <div className="booking-card-info">
                      <h4>{b.restaurant?.name || 'Restaurant'}</h4>
                      <div className="booking-card-meta">
                        <span><FiCalendar style={{ marginRight: 4 }} />{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span><FiClock style={{ marginRight: 4 }} />{b.timeSlot?.from || '—'}</span>
                        <span><FiUsers style={{ marginRight: 4 }} />{b.guests || b.numberOfGuests} guests</span>
                        {b.bookingAmount > 0 && <span>₹{b.bookingAmount}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span className="badge" style={{ background: statusColor(b.status), color: 'white', textTransform: 'capitalize' }}>{b.status}</span>
                      {b.paymentStatus === 'completed' && <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>Paid</span>}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleCancel(b._id)}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBooking;
