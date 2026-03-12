import { FiShoppingBag, FiDollarSign, FiStar, FiClock, FiUsers, FiPackage, FiHeart, FiTruck, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const iconMap = { orders: FiShoppingBag, revenue: FiDollarSign, rating: FiStar, pending: FiClock, users: FiUsers, products: FiPackage, donations: FiHeart, deliveries: FiTruck, location: FiMapPin, completed: FiCheckCircle };
const colorMap = { orange: 'rgba(255,107,53,0.15)', green: 'rgba(46,204,113,0.15)', blue: 'rgba(52,152,219,0.15)', purple: 'rgba(155,89,182,0.15)' };
const colorText = { orange: 'var(--primary)', green: 'var(--success)', blue: 'var(--info)', purple: '#9b59b6' };

const StatCard = ({ icon = 'orders', color = 'orange', value, label }) => {
  const Icon = iconMap[icon] || FiShoppingBag;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: colorMap[color], color: colorText[color] }}><Icon /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
};

export default StatCard;
