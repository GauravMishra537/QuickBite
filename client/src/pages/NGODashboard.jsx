import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiSave } from 'react-icons/fi';
import donationService from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StatCard from '../components/dashboard/StatCard';
import DonationCard from '../components/dashboard/DonationCard';
import './Dashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'available', label: '🍱 Available' },
  { key: 'history', label: '📋 History' },
  { key: 'profile', label: '🏛️ Profile' },
];

const NGODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [available, setAvailable] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '', description: '', registrationNumber: '', contactPerson: '', phone: '',
    address: { street: '', city: '', state: '', zipCode: '' }, areasServed: '',
  });

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({ street: '', city: '', state: '', zipCode: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ngoRes, availRes, recvRes] = await Promise.all([
        donationService.getMyNGO().catch(() => ({ data: null })),
        donationService.getAvailable().catch(() => ({ data: { donations: [] } })),
        donationService.getNGODonations().catch(() => ({ data: { donations: [] } })),
      ]);
      const n = ngoRes.data?.ngo || ngoRes.data;
      setNgo(n);
      if (n) setProfileForm({
        name: n.name || '', description: n.description || '', contactPerson: n.contactPerson || '',
        phone: n.phone || '', email: n.email || '', website: n.website || '',
      });
      setAvailable(availRes.data?.donations || []);
      setReceived(recvRes.data?.donations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Open address modal instead of requesting directly
  const openAddressModal = (donationId) => {
    setSelectedDonationId(donationId);
    if (ngo?.address) {
      setDeliveryAddress({
        street: ngo.address.street || '',
        city: ngo.address.city || '',
        state: ngo.address.state || '',
        zipCode: ngo.address.zipCode || '',
      });
    }
    setShowAddressModal(true);
  };

  const handleRequestDonation = async () => {
    if (!selectedDonationId) return;
    if (!deliveryAddress.street || !deliveryAddress.city) {
      toast.error('Please enter at least street and city');
      return;
    }
    try {
      await donationService.requestDonation(selectedDonationId, deliveryAddress);
      setAvailable((prev) => prev.filter((d) => d._id !== selectedDonationId));
      setShowAddressModal(false);
      setSelectedDonationId(null);
      toast.success('Donation requested! The restaurant will confirm. 🤝');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Request failed'); }
  };

  const handleRegisterNGO = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...registerForm, areasServed: registerForm.areasServed.split(',').map((s) => s.trim()).filter(Boolean) };
      const res = await donationService.registerNGO(payload);
      setNgo(res.data?.ngo || res.data);
      setShowRegister(false);
      toast.success('NGO registered successfully! 🏛️');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  const handleUpdateProfile = async () => {
    try {
      await donationService.updateNGO(ngo._id, profileForm);
      setNgo((prev) => ({ ...prev, ...profileForm }));
      setEditMode(false);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return (
    <div className="container dashboard-page">
      <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}</div>
    </div>
  );

  // If no NGO registered, show registration
  if (!ngo) return (
    <div className="container dashboard-page">
      <div className="dash-header"><div><h1>🤝 NGO Dashboard</h1><p style={{ color: 'var(--text-secondary)' }}>Register your NGO to start receiving food donations</p></div></div>
      {!showRegister ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🏛️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>Register Your NGO</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', maxWidth: 500, margin: '0 auto var(--space-lg)' }}>Join QuickBite's surplus food redistribution network. Help reduce food waste by receiving donations from partner restaurants.</p>
          <button className="btn btn-primary" onClick={() => setShowRegister(true)}>🏛️ Register NGO</button>
        </div>
      ) : (
        <form onSubmit={handleRegisterNGO} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', maxWidth: 700, margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>🏛️ NGO Registration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group"><label className="form-label">NGO Name *</label><input className="form-input" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Registration No. *</label><input className="form-input" value={registerForm.registrationNumber} onChange={(e) => setRegisterForm({...registerForm, registrationNumber: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Contact Person *</label><input className="form-input" value={registerForm.contactPerson} onChange={(e) => setRegisterForm({...registerForm, contactPerson: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description *</label><textarea className="form-input" rows={2} value={registerForm.description} onChange={(e) => setRegisterForm({...registerForm, description: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Street *</label><input className="form-input" value={registerForm.address.street} onChange={(e) => setRegisterForm({...registerForm, address: {...registerForm.address, street: e.target.value}})} required /></div>
            <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={registerForm.address.city} onChange={(e) => setRegisterForm({...registerForm, address: {...registerForm.address, city: e.target.value}})} required /></div>
            <div className="form-group"><label className="form-label">State *</label><input className="form-input" value={registerForm.address.state} onChange={(e) => setRegisterForm({...registerForm, address: {...registerForm.address, state: e.target.value}})} required /></div>
            <div className="form-group"><label className="form-label">Zip Code *</label><input className="form-input" value={registerForm.address.zipCode} onChange={(e) => setRegisterForm({...registerForm, address: {...registerForm.address, zipCode: e.target.value}})} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Areas Served (comma-separated)</label><input className="form-input" value={registerForm.areasServed} onChange={(e) => setRegisterForm({...registerForm, areasServed: e.target.value})} placeholder="Mumbai, Delhi, Pune" /></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
            <button type="submit" className="btn btn-primary">Register NGO</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowRegister(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );

  const deliveredCount = received.filter((d) => d.status === 'delivered').length;
  const statusBreakdown = {};
  received.forEach((d) => { statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1; });

  return (
    <>
    <div className="container dashboard-page">
      <div className="dash-header">
        <div>
          <h1>🤝 {ngo.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Welcome back, {user?.name}</p>
        </div>
        {ngo.isVerified && <span className="status-badge ready" style={{ fontSize: '0.8125rem' }}>✓ Verified NGO</span>}
      </div>

      <div className="dash-tabs">
        {TABS.map((t) => <button key={t.key} className={`dash-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="donations" color="orange" value={available.length} label="Available Donations" />
            <StatCard icon="orders" color="blue" value={received.length} label="Received" />
            <StatCard icon="completed" color="green" value={ngo.totalDonationsReceived || deliveredCount} label="Total Received" />
            <StatCard icon="location" color="purple" value={ngo.address?.city || 'City'} label="Location" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🍱 Recent Available</h3>
              {available.slice(0, 4).map((d) => (
                <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontWeight: 600 }}>{d.restaurant?.name || 'Restaurant'}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{d.totalServings} servings</span>
                  <button className="btn btn-primary btn-sm" onClick={() => openAddressModal(d._id)}>Request</button>
                </div>
              ))}
              {available.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No donations available right now</p>}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📊 Donation Stats</h3>
              {[
                ['Available now', available.length],
                ['Total received', ngo.totalDonationsReceived || deliveredCount],
                ['Areas served', ngo.areasServed?.join(', ') || '—'],
                ['Status', ngo.isVerified ? '✅ Verified' : '⏳ Pending verification'],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
              {/* Status breakdown */}
              {Object.keys(statusBreakdown).length > 0 && (
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>By Status:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(statusBreakdown).map(([status, count]) => (
                      <span key={status} className={`status-badge ${status === 'delivered' ? 'delivered' : status === 'accepted' ? 'confirmed' : 'pending'}`}>
                        {status}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── AVAILABLE DONATIONS ── */}
      {tab === 'available' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            Available Donations ({available.length})
          </h3>
          {available.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍱</div>
              <p>No surplus food available right now</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Check back later — restaurants list surplus food throughout the day</p>
            </div>
          ) : (
            available.map((d) => <DonationCard key={d._id} donation={d} onRequest={openAddressModal} />)
          )}
        </>
      )}

      {/* ── DONATION TRACKING ── */}
      {tab === 'history' && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            Donation Tracking ({received.length})
          </h3>
          {received.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>📦</div><p>No donations received yet</p>
            </div>
          ) : (
            received.map((d) => {
              const steps = [
                { key: 'requested', label: 'Requested', icon: '📩' },
                { key: 'accepted', label: 'Accepted', icon: '✅' },
                { key: 'preparing', label: 'Preparing', icon: '🍳' },
                { key: 'readyForPickup', label: 'Ready', icon: '📦' },
                { key: 'outForDelivery', label: 'On the Way', icon: '🚚' },
                { key: 'delivered', label: 'Delivered', icon: '🎉' },
              ];
              const statusOrder = steps.map((s) => s.key);
              const currentIdx = statusOrder.indexOf(d.status);

              return (
                <div key={d._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>🍱 {d.items?.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        From: <strong>{d.restaurant?.name || 'Restaurant'}</strong> • {d.totalServings} servings
                      </p>
                    </div>
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: d.status === 'delivered' ? '#27ae6022' : '#e67e2222',
                      color: d.status === 'delivered' ? '#27ae60' : '#e67e22',
                      border: `1px solid ${d.status === 'delivered' ? '#27ae6044' : '#e67e2244'}`,
                    }}>
                      {d.status}
                    </span>
                  </div>

                  {/* Status Tracker */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginBottom: 'var(--space-md)' }}>
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                          {idx > 0 && (
                            <div style={{
                              position: 'absolute', top: 16, right: '50%', width: '100%', height: 3,
                              background: idx <= currentIdx ? 'var(--primary)' : 'var(--border-color)',
                              zIndex: 0,
                            }} />
                          )}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', zIndex: 1, position: 'relative',
                            background: isCompleted ? 'var(--primary)' : 'var(--bg-secondary)',
                            border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border-color)'}`,
                            boxShadow: isCurrent ? '0 0 0 4px rgba(255, 107, 53, 0.2)' : 'none',
                            animation: isCurrent ? 'pulse 2s infinite' : 'none',
                          }}>
                            {step.icon}
                          </div>
                          <span style={{ fontSize: '0.625rem', marginTop: 4, color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400, textAlign: 'center' }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pickup Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>📍 Pickup from:</span>
                      <p style={{ fontWeight: 600 }}>{d.restaurant?.name}</p>
                      <p style={{ color: 'var(--text-secondary)' }}>{d.pickupAddress?.street || d.restaurant?.address?.street || ''}, {d.pickupAddress?.city || d.restaurant?.address?.city || ''}</p>
                      {d.restaurant?.phone && <p style={{ color: 'var(--primary)' }}>📞 {d.restaurant.phone}</p>}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>⏰ Expires:</span>
                      <p style={{ fontWeight: 600 }}>{new Date(d.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Listed: {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>

                  {/* Track on Map Button */}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-md)' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/track-donation/${d._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      🗺️ Track Donation on Map
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* ── NGO PROFILE ── */}
      {tab === 'profile' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>🏛️ NGO Profile</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (editMode) handleUpdateProfile(); else setEditMode(true); }}>
              {editMode ? <><FiSave /> Save</> : <><FiEdit2 /> Edit</>}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {[
              { label: 'NGO Name', key: 'name' },
              { label: 'Contact Person', key: 'contactPerson' },
              { label: 'Phone', key: 'phone' },
              { label: 'Email', key: 'email' },
            ].map(({ label, key }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={profileForm[key] || ''} disabled={!editMode} onChange={(e) => setProfileForm({...profileForm, [key]: e.target.value})} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={profileForm.description || ''} disabled={!editMode} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Website</label>
              <input className="form-input" value={profileForm.website || ''} disabled={!editMode} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} />
            </div>
          </div>
          {editMode && (
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <button className="btn btn-primary" onClick={handleUpdateProfile}><FiSave /> Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          )}
          <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, fontSize: '0.9375rem' }}>Registration Details</h4>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <strong>Registration No:</strong> {ngo.registrationNumber}<br />
              <strong>Address:</strong> {ngo.address?.street}, {ngo.address?.city}, {ngo.address?.state} - {ngo.address?.zipCode}<br />
              <strong>Areas Served:</strong> {ngo.areasServed?.join(', ') || '—'}<br />
              <strong>Verified:</strong> {ngo.isVerified ? '✅ Yes' : '❌ No'}<br />
              <strong>Joined:</strong> {new Date(ngo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}
    </div>

      {/* ── ADDRESS ENTRY MODAL ── */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }} onClick={() => setShowAddressModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', maxWidth: 500, width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>📍 Enter Delivery Address</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>Where should this donation be delivered? This address will be shown on the tracking map.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input className="form-input" value={deliveryAddress.street} onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})} placeholder="123, Main Road, Block A" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" value={deliveryAddress.city} onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})} placeholder="New Delhi" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={deliveryAddress.state} onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})} placeholder="Delhi" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input className="form-input" value={deliveryAddress.zipCode} onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})} placeholder="110001" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={handleRequestDonation}>🤝 Request Donation</button>
              <button className="btn btn-ghost" onClick={() => setShowAddressModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NGODashboard;
