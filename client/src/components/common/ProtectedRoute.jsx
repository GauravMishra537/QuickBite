import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — wraps pages that require authentication.
 * Optionally restrict to specific roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}> ... </Route>
 *   <Route element={<ProtectedRoute roles={['admin']} />}> ... </Route>
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--danger)', fontWeight: 800 }}>403</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: 'var(--space-lg)' }}>
          Access Denied — You don't have permission to view this page.
        </p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
