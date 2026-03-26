import { FiPhone, FiMail, FiLinkedin, FiMapPin, FiClock, FiHeart, FiShield, FiUsers, FiTruck, FiAward, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── shared styles ─── */
const pageStyle = { padding: 'var(--space-3xl) 0', minHeight: '70vh' };
const heroStyle = {
  background: 'var(--primary-gradient)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-3xl)',
  color: '#fff', marginBottom: 'var(--space-2xl)', textAlign: 'center',
};
const sectionStyle = { marginBottom: 'var(--space-2xl)' };
const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' };
const card = {
  background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-lg)', transition: 'transform 0.2s',
};

/* ════════════════  ABOUT US  ════════════════ */
export const AboutPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>About QuickBite</h1>
      <p style={{ maxWidth: 600, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>
        Delivering happiness, one meal at a time — connecting food lovers with the best restaurants, cloud kitchens & grocery shops.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', ...sectionStyle }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Our Story</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          QuickBite started in 2024 as a college project and quickly grew into a full‑stack food‑tech platform.
          We believe great food should be just a few taps away — whether you're craving a gourmet meal, home‑style tiffin,
          or fresh groceries delivered to your door.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: 12 }}>
          Built with the MERN stack, QuickBite showcases modern web development practices including real‑time order tracking,
          Stripe payments, subscription models, table bookings, and a surplus‑food donation system for NGOs.
        </p>
      </div>
      <div style={cardGrid}>
        {[
          { icon: <FiUsers size={24} />, title: '35+ Users', desc: 'Growing community of food enthusiasts' },
          { icon: <FiTruck size={24} />, title: 'Fast Delivery', desc: '25–40 min average delivery time' },
          { icon: <FiHeart size={24} />, title: 'NGO Donations', desc: 'Surplus food goes to those in need' },
          { icon: <FiStar size={24} />, title: '4.5★ Average', desc: 'Highly rated restaurants & kitchens' },
        ].map((item, i) => (
          <div key={i} style={{ ...card, textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', marginBottom: 8 }}>{item.icon}</div>
            <h4 style={{ fontWeight: 700 }}>{item.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div style={{ ...sectionStyle, textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Meet the Team</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {[
          { name: 'Gaurav Mishra', role: 'Full Stack Developer', linkedin: 'https://www.linkedin.com/in/gaurav-mishra-08a486336/' },
          { name: 'Abhishek Kumar Patel', role: 'Full Stack Developer', linkedin: 'https://www.linkedin.com/in/abhishek-kumar-patel-47b376247/' },
        ].map((m, i) => (
          <div key={i} style={{ ...card, textAlign: 'center', minWidth: 220 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 12px' }}>
              {m.name.charAt(0)}
            </div>
            <h4 style={{ fontWeight: 700 }}>{m.name}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{m.role}</p>
            <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}><FiLinkedin /> LinkedIn</a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ════════════════  CAREERS  ════════════════ */
export const CareersPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Join Our Team</h1>
      <p style={{ maxWidth: 550, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>Build the future of food delivery with us.</p>
    </div>
    <div style={cardGrid}>
      {[
        { title: 'Frontend Developer', type: 'Full-time', loc: 'Remote', desc: 'Build beautiful UIs with React, create pixel‑perfect designs, and drive user engagement.' },
        { title: 'Backend Developer', type: 'Full-time', loc: 'Lucknow, UP', desc: 'Design APIs, manage databases, and scale our Node.js + MongoDB infrastructure.' },
        { title: 'Delivery Partner', type: 'Part-time', loc: 'Pan India', desc: 'Earn on your schedule. Deliver smiles along with meals.' },
        { title: 'UI/UX Designer', type: 'Contract', loc: 'Remote', desc: 'Craft intuitive experiences that make food ordering a joy.' },
        { title: 'Marketing Intern', type: 'Internship', loc: 'Remote', desc: 'Grow our brand, manage social media, and run campaigns.' },
        { title: 'Data Analyst', type: 'Full-time', loc: 'Lucknow, UP', desc: 'Crunch numbers, find insights, and help us make smarter decisions.' },
      ].map((job, i) => (
        <div key={i} style={card}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{job.title}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary)22', color: 'var(--primary)', border: '1px solid var(--primary)44' }}>{job.type}</span>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>📍 {job.loc}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{job.desc}</p>
          <a href="mailto:mishragaurav9235@gmail.com?subject=Application for ${job.title}" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-block' }}>Apply Now</a>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════  PARTNER  ════════════════ */
export const PartnerPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Partner With QuickBite</h1>
      <p style={{ maxWidth: 550, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>Grow your business by reaching thousands of hungry customers.</p>
    </div>
    <div style={cardGrid}>
      {[
        { icon: '🍽️', title: 'Restaurant Owners', desc: 'List your restaurant, manage menus, and accept online orders. Join 6+ restaurants already on the platform.', link: '/register' },
        { icon: '☁️', title: 'Cloud Kitchen Operators', desc: 'No dine‑in? No problem. Reach customers directly from your kitchen with zero overheads.', link: '/register' },
        { icon: '🥬', title: 'Grocery Shop Owners', desc: 'Sell groceries, fresh produce, and daily essentials. Quick delivery in under 30 minutes.', link: '/register' },
        { icon: '🏍️', title: 'Delivery Partners', desc: 'Earn money on your own schedule. Flexible hours, daily payouts, and zero joining fees.', link: '/register' },
        { icon: '🤝', title: 'NGO Partners', desc: 'Receive surplus food donations from restaurants. Together, we can reduce food waste.', link: '/register' },
      ].map((p, i) => (
        <div key={i} style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{p.icon}</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</p>
          <Link to={p.link} className="btn btn-primary btn-sm">Get Started →</Link>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════  BLOG  ════════════════ */
export const BlogPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>QuickBite Blog</h1>
      <p style={{ maxWidth: 500, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>Food stories, tech updates, and platform news.</p>
    </div>
    <div style={cardGrid}>
      {[
        { title: 'How We Built QuickBite with MERN Stack', date: 'Mar 15, 2026', cat: 'Tech', excerpt: 'A deep dive into our architecture — React frontend, Node.js backend, MongoDB database, and real‑time features with Socket.IO.' },
        { title: '5 Best Biryani Spots in Lucknow', date: 'Mar 10, 2026', cat: 'Food', excerpt: 'From Royal Biryani House to Awadh Spice Kitchen — we rank the top biryani joints available on QuickBite.' },
        { title: 'Reducing Food Waste: Our NGO Partnership Program', date: 'Mar 5, 2026', cat: 'Impact', excerpt: 'How QuickBite connects restaurants with NGOs to ensure surplus food reaches those who need it most.' },
        { title: 'Cloud Kitchens: The Future of Food Delivery', date: 'Feb 28, 2026', cat: 'Industry', excerpt: 'No dine‑in, no overheads — how cloud kitchens are disrupting the food industry and why we support them.' },
        { title: 'Stripe Integration: Accepting Payments Globally', date: 'Feb 20, 2026', cat: 'Tech', excerpt: 'How we implemented secure Stripe Checkout for subscriptions, table bookings, and food orders.' },
        { title: 'Weekly Meal Subscriptions: Save More, Eat Better', date: 'Feb 15, 2026', cat: 'Features', excerpt: 'Our subscription model offers weekly/monthly plans with free delivery and auto‑renewal for busy professionals.' },
      ].map((post, i) => (
        <div key={i} style={card}>
          <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, background: 'var(--primary)22', color: 'var(--primary)' }}>{post.cat}</span>
          <h3 style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '1.0625rem' }}>{post.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>{post.date}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{post.excerpt}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════  CONTACT  ════════════════ */
export const ContactPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Contact Us</h1>
      <p style={{ maxWidth: 500, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>We'd love to hear from you. Reach out anytime!</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Get in Touch</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {[
            { icon: <FiPhone size={20} />, label: 'Phone', value: '+91 92353 60734', href: 'tel:+919235360734' },
            { icon: <FiPhone size={20} />, label: 'Phone', value: '+91 95281 46153', href: 'tel:+919528146153' },
            { icon: <FiMail size={20} />, label: 'Email', value: 'mishragaurav9235@gmail.com', href: 'mailto:mishragaurav9235@gmail.com' },
            { icon: <FiMapPin size={20} />, label: 'Address', value: 'Lucknow, Uttar Pradesh, India' },
            { icon: <FiClock size={20} />, label: 'Hours', value: 'Mon – Sat, 9 AM – 9 PM' },
          ].map((c, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'var(--primary)15', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{c.label}</p>
                {c.href ? <a href={c.href} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}</a> : <p style={{ fontWeight: 600 }}>{c.value}</p>}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: 'var(--space-xl) 0 var(--space-md)' }}>Team</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {[
            { name: 'Gaurav Mishra', linkedin: 'https://www.linkedin.com/in/gaurav-mishra-08a486336/' },
            { name: 'Abhishek Kumar Patel', linkedin: 'https://www.linkedin.com/in/abhishek-kumar-patel-47b376247/' },
          ].map((m, i) => (
            <a key={i} href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>{m.name[0]}</div>
              <div>
                <p style={{ fontWeight: 600 }}>{m.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><FiLinkedin size={12} /> View LinkedIn</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Send a Message</h3>
        <form onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:mishragaurav9235@gmail.com?subject=${encodeURIComponent('QuickBite Inquiry')}&body=${encodeURIComponent('Hi QuickBite team,\n\n')}`; }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <input className="form-input" placeholder="Your Name" required />
          <input className="form-input" type="email" placeholder="Your Email" required />
          <input className="form-input" placeholder="Subject" />
          <textarea className="form-input" placeholder="Your message..." rows={5} style={{ resize: 'vertical' }} required />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
        </form>
      </div>
    </div>
  </div>
);

/* ════════════════  HELP CENTER  ════════════════ */
export const HelpPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Help Center</h1>
      <p style={{ maxWidth: 500, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>Find answers to common questions.</p>
    </div>
    <div style={cardGrid}>
      {[
        { icon: '📦', title: 'Orders & Delivery', items: ['Track your order in real‑time', 'Report a missing item', 'Cancel or modify an order', 'Delivery not received'] },
        { icon: '💳', title: 'Payments & Refunds', items: ['Stripe payment issues', 'Cash on Delivery', 'Request a refund', 'Subscription billing'] },
        { icon: '👤', title: 'Account & Profile', items: ['Update profile details', 'Change password', 'Delete account', 'Login issues'] },
        { icon: '🍽️', title: 'Restaurant Partners', items: ['How to list your restaurant', 'Managing menu items', 'Payout schedule', 'Handling reviews'] },
        { icon: '🏍️', title: 'Delivery Partners', items: ['Sign up as partner', 'Earnings & payouts', 'Delivery guidelines', 'Vehicle requirements'] },
        { icon: '🎫', title: 'Subscriptions', items: ['Plan benefits', 'Free delivery perks', 'Cancel subscription', 'Upgrade plan'] },
      ].map((cat, i) => (
        <div key={i} style={card}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{cat.icon}</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{cat.title}</h3>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 2, paddingLeft: 16 }}>
            {cat.items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Still need help?</p>
      <Link to="/contact" className="btn btn-primary">Contact Support</Link>
    </div>
  </div>
);

/* ════════════════  FAQ  ════════════════ */
export const FAQPage = () => {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'How do I place an order on QuickBite?', a: 'Browse restaurants or cloud kitchens from the homepage, add items to your cart, choose delivery address, select payment method (Stripe or COD), and confirm your order.' },
    { q: 'What payment methods are accepted?', a: 'We accept Stripe (credit/debit cards) and Cash on Delivery (COD) for all orders, table bookings, and subscriptions.' },
    { q: 'How do I track my order?', a: 'After placing an order, go to "My Orders" in your profile. You can see real-time status updates from preparation to delivery.' },
    { q: 'Can I book a table at a restaurant?', a: 'Yes! Visit any restaurant page and click "Book a Table". Select date, time, guests, and optionally pre-order menu items. Pay via Stripe.' },
    { q: 'How do subscriptions work?', a: 'Subscribe to weekly or monthly meal plans. You get free delivery, discounted meals, and auto-renewal. Pay via Stripe checkout.' },
    { q: 'How can I donate food to NGOs?', a: 'Visit the "Donate Food" page. Select an NGO, specify food items and quantity, choose pickup time, and submit.' },
    { q: 'How do I become a delivery partner?', a: 'Register as a delivery partner, provide vehicle details, and get verified. Start accepting deliveries and earn on your schedule.' },
    { q: 'Can I cancel an order?', a: 'Orders can be cancelled before the restaurant starts preparing. Go to "My Orders" and click "Cancel" if available.' },
    { q: 'Is there a minimum order amount?', a: 'Each restaurant/shop sets their own minimum. Typically ₹99–₹199. Free delivery is available for subscribers.' },
    { q: 'How do I contact support?', a: 'Visit our Contact page or email mishragaurav9235@gmail.com. You can also call +91 92353 60734.' },
  ];
  return (
    <div className="container" style={pageStyle}>
      <div style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Frequently Asked Questions</h1>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {faqs.map((faq, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ ...card, marginBottom: 'var(--space-sm)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 600 }}>{faq.q}</h4>
              {open === i ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {open === i && <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9375rem', lineHeight: 1.7 }}>{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════  SAFETY  ════════════════ */
export const SafetyPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}><FiShield style={{ marginRight: 8 }} /> Safety at QuickBite</h1>
      <p style={{ maxWidth: 500, margin: '16px auto 0', fontSize: '1.125rem', opacity: 0.9 }}>Your safety is our top priority.</p>
    </div>
    <div style={cardGrid}>
      {[
        { icon: '🧼', title: 'Hygiene Standards', desc: 'All partner restaurants undergo regular hygiene audits. Kitchens must maintain FSSAI compliance and food handling certifications.' },
        { icon: '📦', title: 'Tamper-Proof Packaging', desc: 'Every order is sealed with tamper-proof packaging. If the seal is broken, refuse the delivery and report it immediately.' },
        { icon: '🛡️', title: 'Secure Payments', desc: 'All payments are processed through Stripe\'s PCI‑compliant infrastructure. We never store your card details.' },
        { icon: '🔒', title: 'Data Privacy', desc: 'Your personal data is encrypted and stored securely. We never share your information with third parties without consent.' },
        { icon: '🏍️', title: 'Delivery Partner Safety', desc: 'All delivery partners are verified with ID checks. Real‑time GPS tracking ensures accountability.' },
        { icon: '📞', title: '24/7 Support', desc: 'Report any safety concern anytime. Our team investigates every report within 24 hours.' },
      ].map((item, i) => (
        <div key={i} style={card}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{item.icon}</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════  TERMS & CONDITIONS  ════════════════ */
export const TermsPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Terms & Conditions</h1>
      <p style={{ opacity: 0.9, marginTop: 8 }}>Last updated: March 2026</p>
    </div>
    <div style={{ maxWidth: 780, margin: '0 auto', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      {[
        { title: '1. Acceptance of Terms', content: 'By accessing or using QuickBite, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.' },
        { title: '2. User Accounts', content: 'You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials. QuickBite reserves the right to suspend accounts that violate our policies.' },
        { title: '3. Orders & Payments', content: 'All orders are subject to availability. Prices are set by the respective restaurants/shops. Payment is processed via Stripe or Cash on Delivery. Refunds are handled on a case‑by‑case basis.' },
        { title: '4. Delivery', content: 'Estimated delivery times are approximate. QuickBite is not liable for delays caused by weather, traffic, or restaurant preparation time. Delivery partners are independent contractors.' },
        { title: '5. Cancellation Policy', content: 'Orders can be cancelled before restaurant confirmation. After preparation begins, cancellation may not be possible. Subscription cancellations take effect at the end of the current billing cycle.' },
        { title: '6. User Conduct', content: 'Users must not abuse the platform, harass delivery partners or restaurant staff, post fraudulent reviews, or use the service for illegal activities.' },
        { title: '7. Intellectual Property', content: 'All content, logos, and designs on QuickBite are owned by us. You may not reproduce, distribute, or create derivative works without written permission.' },
        { title: '8. Limitation of Liability', content: 'QuickBite is a platform connecting users with food service providers. We are not responsible for food quality, allergic reactions, or disputes between users and partners.' },
        { title: '9. Changes to Terms', content: 'We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
        { title: '10. Contact', content: 'For questions about these terms, contact us at mishragaurav9235@gmail.com or call +91 92353 60734.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════  PRIVACY POLICY  ════════════════ */
export const PrivacyPage = () => (
  <div className="container" style={pageStyle}>
    <div style={heroStyle}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Privacy Policy</h1>
      <p style={{ opacity: 0.9, marginTop: 8 }}>Last updated: March 2026</p>
    </div>
    <div style={{ maxWidth: 780, margin: '0 auto', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      {[
        { title: '1. Information We Collect', content: 'We collect your name, email, phone number, and delivery addresses when you create an account. Order history and payment details (processed by Stripe) are stored securely.' },
        { title: '2. How We Use Your Data', content: 'Your data is used to process orders, improve our service, personalize recommendations, and communicate updates. We never sell your personal information.' },
        { title: '3. Data Storage & Security', content: 'All data is stored in MongoDB Atlas with encryption at rest and in transit. Passwords are hashed with bcrypt. Sessions are managed with JWT tokens.' },
        { title: '4. Cookies', content: 'We use localStorage to maintain your session and cart. No third-party tracking cookies are used.' },
        { title: '5. Third-Party Services', content: 'Stripe processes payments. MongoDB Atlas hosts our database. No personal data is shared beyond what is necessary for these services.' },
        { title: '6. Your Rights', content: 'You can view, edit, or delete your personal data from your profile page. To request full data deletion, contact us at mishragaurav9235@gmail.com.' },
        { title: '7. Data Retention', content: 'Account data is retained as long as your account is active. Deleted accounts are purged within 30 days.' },
        { title: '8. Changes to Policy', content: 'We will notify registered users via email if this policy changes significantly.' },
        { title: '9. Contact', content: 'For privacy concerns, email mishragaurav9235@gmail.com or call +91 92353 60734.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  </div>
);
