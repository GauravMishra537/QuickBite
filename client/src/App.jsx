import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import GroceryShops from './pages/GroceryShops';
import GroceryDetail from './pages/GroceryDetail';
import TableBooking from './pages/TableBooking';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="restaurants/:id" element={<RestaurantDetail />} />
          <Route path="grocery" element={<GroceryShops />} />
          <Route path="grocery/:id" element={<GroceryDetail />} />
          <Route path="bookings/new" element={<TableBooking />} />
          <Route path="subscriptions" element={<Subscriptions />} />

          {/* Protected */}
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><PlaceholderPage title="My Orders" /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute><TableBooking /></ProtectedRoute>} />

          {/* Stubs */}
          <Route path="cloud-kitchens" element={<PlaceholderPage title="Cloud Kitchens" />} />
          <Route path="cloud-kitchens/:id" element={<PlaceholderPage title="Cloud Kitchen Details" />} />
          <Route path="donations" element={<PlaceholderPage title="Donate Food" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>This page will be built in an upcoming commit. Stay tuned! 🚀</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', color: 'var(--primary)', fontWeight: 800 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: 'var(--space-lg)' }}>Page not found.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
}

export default App;
