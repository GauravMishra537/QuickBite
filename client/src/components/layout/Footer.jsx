import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiPhone, FiMail, FiLinkedin, FiMapPin } from 'react-icons/fi';
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
                            <a href="https://www.linkedin.com/in/gaurav-mishra-08a486336/" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn - Gaurav"><FiLinkedin /></a>
                            <a href="https://www.linkedin.com/in/abhishek-kumar-patel-47b376247/" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn - Abhishek"><FiLinkedin /></a>
                            <a href="mailto:mishragaurav9235@gmail.com" className="footer-social-icon" aria-label="Email"><FiMail /></a>
                            <a href="tel:+919235360734" className="footer-social-icon" aria-label="Phone"><FiPhone /></a>
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
                            <li><Link to="/donations">Donate Food</Link></li>
                            <li><Link to="/book-table">Book a Table</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <a href="tel:+919235360734"><FiPhone size={14} /> +91 92353 60734</a>
                            </li>
                            <li>
                                <a href="tel:+919528146153"><FiPhone size={14} /> +91 95281 46153</a>
                            </li>
                            <li>
                                <a href="mailto:mishragaurav9235@gmail.com"><FiMail size={14} /> mishragaurav9235@gmail.com</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/gaurav-mishra-08a486336/" target="_blank" rel="noopener noreferrer">
                                    <FiLinkedin size={14} /> Gaurav Mishra
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/abhishek-kumar-patel-47b376247/" target="_blank" rel="noopener noreferrer">
                                    <FiLinkedin size={14} /> Abhishek Kumar Patel
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/profile">My Account</Link></li>
                            <li><Link to="/orders">My Orders</Link></li>
                            <li><Link to="/checkout">Cart</Link></li>
                            <li><Link to="/login">Login / Register</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} QuickBite. Built by Gaurav Mishra & Abhishek Kumar Patel</p>
                    <div className="footer-bottom-links">
                        <a href="mailto:mishragaurav9235@gmail.com">Contact</a>
                        <a href="https://www.linkedin.com/in/gaurav-mishra-08a486336/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
