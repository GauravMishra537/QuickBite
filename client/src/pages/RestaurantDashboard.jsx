import { useEffect, useState } from 'react';
import { FiToggleLeft, FiToggleRight, FiEdit2, FiTrash2, FiPlus, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import OrderTable from '../components/dashboard/OrderTable';
import MenuForm from '../components/dashboard/MenuForm';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'orders', label: '📋 Orders' },
  { key: 'menu', label: '🍽️ Menu' },
  { key: 'tables', label: '🪑 Tables' },
  { key: 'surplus', label: '💚 Surplus Food' },
  { key: 'analytics', label: '📈 Analytics' },
];

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationForm, setDonationForm] = useState({ items: [{ name: '', quantity: '', unit: 'servings' }], notes: '', expiresAt: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [restRes, ordersRes, bookingsRes, donationsRes] = await Promise.all([
        api.get('/restaurants/my/restaurant'),
        api.get('/orders/business'),
        api.get('/bookings/restaurant').catch(() => ({ data: { bookings: [] } })),
        api.get('/donations/my-donations').catch(() => ({ data: { donations: [] } })),
      ]);
      const rest = restRes.data?.restaurant || restRes.data;
      setRestaurant(rest);
      setOrders(ordersRes.data?.orders || []);
      setBookings(bookingsRes.data?.bookings || bookingsRes.bookings || []);
      setDonations(donationsRes.data?.donations || donationsRes.donations || []);
      if (rest?._id) {
        const menuRes = await api.get(`/menu/restaurant/${rest._id}`);
        setMenuItems(menuRes.data?.items || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/restaurants/${restaurant._id}/toggle-status`);
      setRestaurant((r) => ({ ...r, isOpen: !r.isOpen }));
      toast.success(restaurant.isOpen ? 'Restaurant closed' : 'Restaurant opened');
    } catch { toast.error('Toggle failed'); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Status update failed'); }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.patch(`/menu/${itemId}/toggle-availability`);
      setMenuItems((prev) => prev.map((m) => m._id === itemId ? { ...m, isAvailable: !m.isAvailable } : m));
      toast.success('Updated');
    } catch { toast.error('Toggle failed'); }
  };

  const handleAddMenu = async (data) => {
    try {
      const res = await api.post('/menu', data);
      const newItem = res.data?.item || res.item;
      setMenuItems((prev) => [...prev, newItem]);
      setShowMenuForm(false);
      toast.success('Item added! 🎉');
    } catch (err) { toast.error(err.message || 'Failed to add item'); }
  };

  const handleEditMenu = async (data) => {
    try {
      await api.put(`/menu/${editItem._id}`, data);
      setMenuItems((prev) => prev.map((m) => m._id === editItem._id ? { ...m, ...data } : m));
      setEditItem(null);
      toast.success('Item updated');
    } catch { toast.error('Update failed'); }
  };

  const handleDeleteMenu = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== itemId));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    try {
      const totalServings = donationForm.items.reduce((s, i) => s + Number(i.quantity || 0), 0);
      const payload = { ...donationForm, totalServings, expiresAt: new Date(donationForm.expiresAt).toISOString() };
      const res = await api.post('/donations', payload);
      setDonations((prev) => [res.data?.donation || res.donation, ...prev]);
      setShowDonationForm(false);
      setDonationForm({ items: [{ name: '', quantity: '', unit: 'servings' }], notes: '', expiresAt: '' });
      toast.success('Surplus food listed for donation! 💚');
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleAcceptDonation = async (id) => {
    try {
      await api.patch(`/donations/${id}/accept`);
      setDonations((prev) => prev.map((d) => d._id === id ? { ...d, status: 'accepted' } : d));
      toast.success('Donation accepted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 12 }} />)}
    </div>
  );

  const pendingOrders = orders.filter((o) => o.status === 'placed').length;
  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;

  // Analytics data
  const categoryStats = {};
  menuItems.forEach((i) => { categoryStats[i.category] = (categoryStats[i.category] || 0) + 1; });
  const statusBreakdown = {};
  orders.forEach((o) => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });

  return (
    <div className="container dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>🍽️ {restaurant?.name || 'Restaurant Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
        <div className="dash-header-actions">
          <button className={`btn ${restaurant?.isOpen ? 'btn-primary' : 'btn-secondary'}`} onClick={handleToggleStatus}>
            {restaurant?.isOpen ? <><FiToggleRight /> Open</> : <><FiToggleLeft /> Closed</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="orders" color="orange" value={orders.length} label="Total Orders" />
            <StatCard icon="pending" color="blue" value={pendingOrders} label="Pending" />
            <StatCard icon="rating" color="purple" value={restaurant?.rating?.toFixed(1) || '0.0'} label="Rating" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Revenue" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📋 Recent Orders</h3>
              {orders.slice(0, 5).map((o) => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>#{o._id?.slice(-6).toUpperCase()}</span>
                  <span>₹{o.totalAmount}</span>
                  <span className={`status-badge ${o.status}`}>{o.status}</span>
                </div>
              ))}
              {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent orders</p>}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🪑 Upcoming Bookings</h3>
              {bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed').slice(0, 5).map((b) => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{b.user?.name || 'Guest'}</span>
                  <span>{b.guests} guests</span>
                  <span style={{ fontSize: '0.8125rem' }}>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {b.timeSlot?.from}</span>
                </div>
              ))}
              {confirmedBookings === 0 && <p style={{ color: 'var(--text-muted)' }}>No upcoming bookings</p>}
            </div>
          </div>
        </>
      )}

      {/* ── MANAGE ORDERS ── */}
      {tab === 'orders' && <OrderTable orders={orders} onStatusChange={handleOrderStatus} />}

      {/* ── MANAGE MENU ── */}
      {tab === 'menu' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Menu Items ({menuItems.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowMenuForm(!showMenuForm); }}>
              <FiPlus /> Add Item
            </button>
          </div>
          {showMenuForm && <MenuForm onSubmit={handleAddMenu} onCancel={() => setShowMenuForm(false)} />}
          {editItem && <MenuForm item={editItem} onSubmit={handleEditMenu} onCancel={() => setEditItem(null)} />}
          {menuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>🍔</div><p>No menu items yet. Add your first item!</p>
            </div>
          ) : (
            menuItems.map((item) => (
              <div key={item._id} className="menu-manage-card">
                {item.image && <img src={item.image} alt={item.name} className="menu-manage-img" />}
                <div className="menu-manage-info">
                  <div className="menu-manage-name">
                    <span className={`veg-badge ${item.isVeg === false ? 'nonveg-badge' : ''}`} style={{ display: 'inline-block', width: 12, height: 12, marginRight: 6, verticalAlign: 'middle' }} />
                    {item.name}
                  </div>
                  <div className="menu-manage-meta">
                    <span>₹{item.price}</span>
                    <span>{item.category}</span>
                    {item.isBestseller && <span style={{ color: 'var(--warning)' }}>★ Bestseller</span>}
                  </div>
                </div>
                <div className="menu-manage-actions">
                  <div className={`toggle-switch ${item.isAvailable !== false ? 'active' : ''}`} onClick={() => handleToggleAvailability(item._id)} title={item.isAvailable !== false ? 'Available' : 'Unavailable'} />
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowMenuForm(false); setEditItem(item); }}><FiEdit2 /></button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteMenu(item._id)}><FiTrash2 /></button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── MANAGE TABLES ── */}
      {tab === 'tables' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Table Bookings ({bookings.length})</h3>
          </div>
          {/* Tables overview */}
          {restaurant?.tables && restaurant.tables.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              {restaurant.tables.map((t) => {
                const isBooked = bookings.some((b) => b.tableNumber === t.tableNumber && (b.status === 'confirmed' || b.status === 'pending'));
                return (
                  <div key={t.tableNumber} style={{ background: 'var(--bg-card)', border: `2px solid ${isBooked ? 'var(--danger)' : 'var(--success)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🪑</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>Table {t.tableNumber}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.capacity} seats • {t.location || 'Indoor'}</div>
                    <span className={`status-badge ${isBooked ? 'pending' : 'ready'}`} style={{ marginTop: 4 }}>
                      {isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Bookings list */}
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>🪑</div><p>No bookings yet</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead><tr><th>Guest</th><th>Table</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.user?.name || 'Guest'}</td>
                    <td style={{ fontWeight: 600 }}>Table {b.tableNumber}</td>
                    <td>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{b.timeSlot?.from} – {b.timeSlot?.to}</td>
                    <td>{b.guests}</td>
                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {b.status === 'pending' && <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleBookingStatus(b._id, 'confirmed')}>Confirm</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleBookingStatus(b._id, 'cancelled')}>Reject</button>
                        </>}
                        {b.status === 'confirmed' && <button className="btn btn-secondary btn-sm" onClick={() => handleBookingStatus(b._id, 'completed')}><FiCheckCircle /> Complete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ── SURPLUS FOOD ── */}
      {tab === 'surplus' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Surplus Food Donations ({donations.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDonationForm(!showDonationForm)}>
              <FiPlus /> List Surplus Food
            </button>
          </div>
          {showDonationForm && (
            <form onSubmit={handleCreateDonation} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>💚 List Surplus Food for Donation</h3>
              {donationForm.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                  <input className="form-input" placeholder="Item name" value={item.name} onChange={(e) => { const items = [...donationForm.items]; items[idx].name = e.target.value; setDonationForm({...donationForm, items}); }} required />
                  <input className="form-input" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const items = [...donationForm.items]; items[idx].quantity = e.target.value; setDonationForm({...donationForm, items}); }} required />
                  <select className="form-input" value={item.unit} onChange={(e) => { const items = [...donationForm.items]; items[idx].unit = e.target.value; setDonationForm({...donationForm, items}); }}>
                    <option value="servings">servings</option><option value="kg">kg</option><option value="pcs">pieces</option>
                  </select>
                  {donationForm.items.length > 1 && <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => { const items = donationForm.items.filter((_, i) => i !== idx); setDonationForm({...donationForm, items}); }}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-md)' }} onClick={() => setDonationForm({...donationForm, items: [...donationForm.items, { name: '', quantity: '', unit: 'servings' }]})}>+ Add item</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Expires At *</label>
                  <input className="form-input" type="datetime-local" value={donationForm.expiresAt} onChange={(e) => setDonationForm({...donationForm, expiresAt: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={donationForm.notes} onChange={(e) => setDonationForm({...donationForm, notes: e.target.value})} placeholder="Any special instructions" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button type="submit" className="btn btn-primary">Submit Donation</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowDonationForm(false)}>Cancel</button>
              </div>
            </form>
          )}
          {donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>💚</div><p>No donations listed yet. Help reduce food waste!</p>
            </div>
          ) : (
            donations.map((d) => (
              <div key={d._id} className="menu-manage-card">
                <div className="menu-manage-info">
                  <div className="menu-manage-name">🍱 {d.items?.map((i) => i.name).join(', ') || 'Food items'}</div>
                  <div className="menu-manage-meta">
                    <span>🍽️ {d.totalServings} servings</span>
                    <span>Expires: {new Date(d.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    {d.ngo && <span>NGO: {d.ngo.name}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span className={`status-badge ${d.status === 'available' ? 'ready' : d.status === 'requested' ? 'pending' : 'confirmed'}`}>{d.status}</span>
                  {d.status === 'requested' && <button className="btn btn-primary btn-sm" onClick={() => handleAcceptDonation(d._id)}>Accept</button>}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── ANALYTICS ── */}
      {tab === 'analytics' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="orders" color="orange" value={orders.length} label="Total Orders" />
            <StatCard icon="revenue" color="green" value={`₹${totalRevenue.toLocaleString()}`} label="Total Revenue" />
            <StatCard icon="products" color="blue" value={menuItems.length} label="Menu Items" />
            <StatCard icon="users" color="purple" value={bookings.length} label="Total Bookings" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Order Status Breakdown</h3>
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span className={`status-badge ${status}`}>{status}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}>
                    <div style={{ width: `${(count / orders.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🍽️ Menu by Category</h3>
              {Object.entries(categoryStats).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{cat}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{count}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--border-color)', borderRadius: 4 }}>
                    <div style={{ width: `${(count / menuItems.length) * 100}%`, height: '100%', background: '#9b59b6', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🏆 Top Items by Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
              {menuItems.filter((i) => i.isBestseller).slice(0, 6).map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                  <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price}</div></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;
