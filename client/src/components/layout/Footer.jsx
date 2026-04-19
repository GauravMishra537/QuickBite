import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span>🍔 QuickBite</span>
                        </Link>
                        <p className="footer-description">
                            Your favourite food, groceries, and more — delivered fast.
                            From restaurants and cloud kitchens to grocery shops, all in one app.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram"><FiInstagram /></a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Twitter"><FiTwitter /></a>
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook"><FiFacebook /></a>
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube"><FiYoutube /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4>Explore</h4>
                        <ul>
                            <li><Link to="/restaurants">Restaurants</Link></li>
                            <li><Link to="/cloud-kitchens">Cloud Kitchens</Link></li>
                            <li><Link to="/grocery">Grocery</Link></li>
                            <li><Link to="/subscriptions">Subscriptions</Link></li>

                        </ul>
                    </div>

                    {/* Company */}
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/partner">Partner With Us</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/safety">Safety</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} QuickBite. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
