import { useEffect, useState } from 'react';
import { FiCheck, FiTruck, FiPercent, FiStar, FiClock, FiShield } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Services.css';

const PLAN_ICONS = { weekly: '🚀', monthly: '💎', quarterly: '👑' };

const Subscriptions = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const planRes = await api.get('/subscriptions/plans');
        setPlans(planRes.data?.plans || planRes.data || []);
        if (isAuthenticated) {
          try {
            const subRes = await api.get('/subscriptions/my-subscription');
            setMySub(subRes.data?.subscription || null);
          } catch { /* no active sub */ }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSubscribe = async (planType) => {
    if (!isAuthenticated) { toast.error('Please login to subscribe'); return; }
    setSubscribing(planType);
    try {
      // Step 1: Create subscription as pending
      const res = await api.post('/subscriptions', { plan: planType });
      const subscription = res.data?.subscription || res.data;

      // Step 2: Redirect to Stripe checkout for payment
      try {
        const checkoutRes = await api.post('/payments/create-checkout/subscription', { subscriptionId: subscription._id });
        const stripeUrl = checkoutRes.data?.url;
        if (stripeUrl) {
          window.location.href = stripeUrl;
          return;
        }
      } catch (stripeErr) {
        toast.error('Payment gateway unavailable. Please try again later.');
        return;
      }

      toast.info('Subscription created. Complete payment to activate.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally { setSubscribing(null); }
  };

  const handleCancel = async () => {
    try {
      await api.patch(`/subscriptions/${mySub._id}/cancel`);
      setMySub({ ...mySub, status: 'cancelled' });
      toast.success('Subscription cancelled');
    } catch (err) { toast.error('Cancel failed'); }
  };

  const defaultPlans = [
    {
      type: 'weekly',
      name: 'Weekly Plan',
      price: 149,
      duration: '7 days',
      features: [
        { icon: <FiTruck />, text: '5 free deliveries' },
        { icon: <FiPercent />, text: '5% off on all orders' },
        { icon: <FiStar />, text: 'Priority support' },
        { icon: <FiClock />, text: 'Early access to deals' },
      ],
    },
    {
      type: 'monthly',
      name: 'Monthly Plan',
      price: 399,
      duration: '30 days',
      popular: true,
      features: [
        { icon: <FiTruck />, text: '15 free deliveries' },
        { icon: <FiPercent />, text: '10% off on all orders' },
        { icon: <FiStar />, text: 'Priority support' },
        { icon: <FiClock />, text: 'Early access to deals' },
        { icon: <FiShield />, text: 'Exclusive member rewards' },
      ],
    },
    {
      type: 'quarterly',
      name: 'Quarterly Plan',
      price: 999,
      duration: '90 days',
      features: [
        { icon: <FiTruck />, text: '50 free deliveries' },
        { icon: <FiPercent />, text: '15% off on all orders' },
        { icon: <FiStar />, text: 'VIP support' },
        { icon: <FiClock />, text: 'Early access to deals' },
        { icon: <FiShield />, text: 'Exclusive member rewards' },
        { icon: <FiCheck />, text: 'Free table bookings' },
      ],
    },
  ];

  return (
    <div className="sub-page">
      <div className="container">
        <div className="sub-hero">
          <h1>QuickBite <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Subscriptions</span></h1>
          <p>Save more on every order with free deliveries, exclusive discounts, and premium benefits</p>
        </div>

        {/* Active subscription banner */}
        {mySub && mySub.status === 'active' && (
          <div style={{ background: 'var(--primary-gradient)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', color: 'white', textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xs)' }}>
              {PLAN_ICONS[mySub.plan]} You're subscribed to the {mySub.plan} plan!
            </h3>
            <p style={{ opacity: 0.9, fontSize: '0.9375rem' }}>
              Free deliveries left: <strong>{mySub.freeDeliveriesRemaining ?? 'N/A'}</strong> •
              Expires: <strong>{new Date(mySub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </p>
            <button className="btn" style={{ marginTop: 'var(--space-md)', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} onClick={handleCancel}>
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Plan Cards */}
        {loading ? (
          <div className="sub-plans">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 20 }} />)}
          </div>
        ) : (
          <div className="sub-plans">
            {defaultPlans.map((plan) => (
              <div key={plan.type} className={`sub-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="sub-popular-tag">🔥 Most Popular</div>}
                <div className="sub-card-icon">{PLAN_ICONS[plan.type]}</div>
                <h3>{plan.name}</h3>
                <div className="sub-card-price">
                  <span className="sub-card-amount">₹{plan.price}</span>
                  <span className="sub-card-period"> / {plan.duration}</span>
                </div>
                <ul className="sub-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <span className="sub-check">{f.icon}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                  onClick={() => handleSubscribe(plan.type)}
                  disabled={subscribing === plan.type || (mySub?.status === 'active')}
                >
                  {subscribing === plan.type ? 'Processing…' : mySub?.status === 'active' ? 'Already Subscribed' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Benefits section */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 'var(--space-lg)' }}>Why Subscribe?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xl)', maxWidth: 800, margin: '0 auto' }}>
            {[
              { icon: '🚚', title: 'Free Deliveries', desc: 'Save on delivery fees with every order' },
              { icon: '💰', title: 'Exclusive Discounts', desc: 'Up to 15% off on all food & grocery orders' },
              { icon: '⚡', title: 'Priority Service', desc: 'Fast-track orders & premium customer support' },
            ].map((b) => (
              <div key={b.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>{b.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{b.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
