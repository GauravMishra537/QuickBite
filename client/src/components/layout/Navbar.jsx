import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiCalendar, FiHeart } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const getInitials = (name) =>
        name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">🍔</div>
                    <span>QuickBite</span>
                </Link>

                {/* Nav Links */}
                <div className={`navbar-nav ${mobileOpen ? 'mobile-open' : ''}`}>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        Home
                    </NavLink>
                    <NavLink to="/restaurants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        <MdRestaurant /> Restaurants
                    </NavLink>
                    <NavLink to="/cloud-kitchens" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        Cloud Kitchens
                    </NavLink>
                    <NavLink to="/grocery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        Grocery
                    </NavLink>
                    <NavLink to="/subscriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        <FiHeart /> Subscribe
                    </NavLink>
                </div>

                {/* Actions */}
                <div className="navbar-actions">
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>

                    {isAuthenticated ? (
                        <div className="user-menu" ref={dropdownRef}>
                            <div
                                className="user-avatar"
                                onClick={() => setDropdownOpen((v) => !v)}
                                title={user?.name}
                            >
                                {getInitials(user?.name)}
                            </div>
                            <div className={`user-dropdown ${dropdownOpen ? 'open' : ''}`}>
                                <div className="user-dropdown-header">
                                    {user?.name}
                                    <br />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</span>
                                </div>
                                <div className="user-dropdown-divider" />
                                <Link to="/profile" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <FiUser /> Profile
                                </Link>
                                <Link to="/orders" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <FiShoppingBag /> My Orders
                                </Link>
                                <Link to="/bookings" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <FiCalendar /> Bookings
                                </Link>
                                <div className="user-dropdown-divider" />
                                <button className="user-dropdown-item danger" onClick={handleLogout}>
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}

                    <button className="mobile-menu-btn" onClick={() => setMobileOpen((v) => !v)}>
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
