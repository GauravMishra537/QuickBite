import { useAuth } from '../context/AuthContext';
import RestaurantDashboard from './RestaurantDashboard';
import CloudKitchenDashboard from './CloudKitchenDashboard';
import GroceryDashboard from './GroceryDashboard';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiClock, FiStar, FiSettings, FiBarChart2 } from 'react-icons/fi';
import './Auth.css';

const dashboardMap = {
  restaurant: RestaurantDashboard,
  cloudkitchen: CloudKitchenDashboard,
  grocery: GroceryDashboard,
};

const fallbackConfig = {
  delivery: {
    title: 'Delivery Dashboard',
    icon: '🏍️',
    desc: 'Manage deliveries and track your earnings',
    links: [
      { label: 'Available Deliveries', to: '/deliveries', icon: <FiShoppingBag /> },
      { label: 'Earnings', to: '/earnings', icon: <FiBarChart2 /> },
      { label: 'Profile', to: '/profile', icon: <FiSettings /> },
    ],
  },
  ngo: {
    title: 'NGO Dashboard',
    icon: '🤝',
    desc: 'Manage food donations and requests',
    links: [
      { label: 'Available Donations', to: '/donations', icon: <FiShoppingBag /> },
      { label: 'My Requests', to: '/requests', icon: <FiClock /> },
      { label: 'Profile', to: '/profile', icon: <FiSettings /> },
    ],
  },
  admin: {
    title: 'Admin Panel',
    icon: '👑',
    desc: 'Manage all aspects of QuickBite',
    links: [
      { label: 'All Orders', to: '/admin/orders', icon: <FiShoppingBag /> },
      { label: 'All Users', to: '/admin/users', icon: <FiStar /> },
      { label: 'Analytics', to: '/admin/analytics', icon: <FiBarChart2 /> },
      { label: 'Settings', to: '/profile', icon: <FiSettings /> },
    ],
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  // If we have a full dashboard component for this role, render it
  const DashboardComponent = dashboardMap[role];
  if (DashboardComponent) return <DashboardComponent />;

  // Customers shouldn't see dashboard
  if (role === 'customer') return null;

  // Fallback card for delivery, ngo, admin (full dashboards will come later)
  const config = fallbackConfig[role];
  if (!config) return null;

  return (
    <div className="profile-page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar" style={{ fontSize: '2.5rem' }}>{config.icon}</div>
            <div className="profile-info">
              <h2>{config.title}</h2>
              <p>{config.desc}</p>
              <div className="profile-role-badge">{user?.name}</div>
            </div>
          </div>
          <div className="profile-body">
            <div className="profile-section">
              <h3>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                {config.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="profile-detail"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{link.icon}</span>
                    <span className="profile-detail-value">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
