import { useEffect, useState } from 'react';
import { FiCalendar, FiUsers, FiClock, FiMapPin } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Services.css';
import './Customer.css';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM',
  '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
];

const TableBooking = () => {
  const { isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRest, setSelectedRest] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialReq, setSpecialReq] = useState('');
  const [placing, setPlacing] = useState(false);
  const [tab, setTab] = useState('book'); // 'book' | 'my'

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

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (!selectedRest || !date || !timeSlot) { toast.error('Please fill all fields'); return; }

    setPlacing(true);
    try {
      await api.post('/bookings', {
        restaurant: selectedRest._id,
        date,
        timeSlot,
        numberOfGuests: guests,
        specialRequests: specialReq,
      });
      toast.success('Table booked successfully! 🎉');
      setSelectedRest(null); setDate(''); setTimeSlot(''); setGuests(2); setSpecialReq('');
      // Refresh
      const bookRes = await api.get('/bookings/my-bookings');
      setMyBookings(bookRes.data?.bookings || []);
      setTab('my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
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
          <p>Reserve a table at your favourite restaurant</p>
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
                    <div key={slot} className={`time-slot ${timeSlot === slot ? 'selected' : ''}`} onClick={() => setTimeSlot(slot)}>
                      {slot}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="booking-form-section">
                <h3><FiUsers /> Additional Details</h3>
                <div className="input-group">
                  <label>Special Requests (optional)</label>
                  <textarea className="input" rows={3} value={specialReq} onChange={(e) => setSpecialReq(e.target.value)} placeholder="Birthday celebration, window seat, dietary requirements…" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              {selectedRest ? (
                <>
                  <div className="booking-detail-row"><span>Restaurant</span><strong>{selectedRest.name}</strong></div>
                  <div className="booking-detail-row"><span>Date</span><strong>{date || '—'}</strong></div>
                  <div className="booking-detail-row"><span>Time</span><strong>{timeSlot || '—'}</strong></div>
                  <div className="booking-detail-row"><span>Guests</span><strong>{guests}</strong></div>
                  {specialReq && <div className="booking-detail-row"><span>Notes</span><span style={{ fontSize: '0.8125rem' }}>{specialReq}</span></div>}
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)' }} onClick={handleBook} disabled={placing}>
                    {placing ? 'Booking…' : 'Confirm Booking'}
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
                        <span><FiClock style={{ marginRight: 4 }} />{b.timeSlot}</span>
                        <span><FiUsers style={{ marginRight: 4 }} />{b.numberOfGuests} guests</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span className="badge" style={{ background: statusColor(b.status), color: 'white', textTransform: 'capitalize' }}>{b.status}</span>
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
