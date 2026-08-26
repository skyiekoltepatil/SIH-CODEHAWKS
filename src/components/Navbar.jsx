import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAuthModalOpen(false);
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <>
            <header className="navbar">
                <div className="navbar-brand">
                    <i className="fa-solid fa-hawk icon-brand"></i>
                    <h1>SIH CODEHAWKS</h1>
                </div>
                <nav className="navbar-links">
                    <Link to="/" className={isActive('/')}>Home</Link>
                    <Link to="/about" className={isActive('/about')}>About Us</Link>
                    <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                    <Link to="/schemes" className={isActive('/schemes')}>Schemes</Link>
                    <Link to="/services" className={isActive('/services')}>Services</Link>
                </nav>
                <div className="navbar-actions" ref={dropdownRef}>
                    {!isLoggedIn ? (
                        <Link 
                            className="btn-primary login-btn" 
                            to="/login"
                        >
                            Login/Register
                        </Link>
                    ) : (
                        <div className="user-profile" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div className="notification-icon" style={{ position: 'relative', cursor: 'pointer', color: '#4b5563', fontSize: '1.2rem' }} onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsAuthModalOpen(false); }}>
                                <i className="fa-regular fa-bell"></i>
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>{unreadCount}</span>
                                )}
                            </div>
                            
                            {isNotificationOpen && (
                                <div className="notification-dropdown" style={{ position: 'absolute', top: '50px', right: '50px', width: '320px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden', textAlign: 'left' }}>
                                    <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Notifications</h4>
                                        <span onClick={() => setUnreadCount(0)} style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }}>Mark all as read</span>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Your application for <strong style={{color: '#2563eb'}}>PM-KISAN</strong> was approved.</p>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>2 hours ago</span>
                                        </div>
                                        <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Please update your <strong style={{color: '#2563eb'}}>Bank Details</strong> to receive funds.</p>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1 day ago</span>
                                        </div>
                                        <div style={{ padding: '15px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>New scheme matches your profile: <strong style={{color: '#2563eb'}}>Mudra Yojana</strong>.</p>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>3 days ago</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="avatar" style={{ cursor: 'pointer', background: '#1d4ed8' }} onClick={() => { setIsAuthModalOpen(!isAuthModalOpen); setIsNotificationOpen(false); }}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            
                            {isAuthModalOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar-img">
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        </div>
                                        <div className="dropdown-user-info">
                                            <h4>{user?.name || 'User Name'}</h4>
                                            <p>{user?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <ul className="dropdown-menu-list">
                                        <li>
                                            <Link to="/dashboard/profile" onClick={() => setIsAuthModalOpen(false)}>
                                                <i className="fa-solid fa-user" style={{ color: '#3b82f6' }}></i> User Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/dashboard/profile" state={{ tab: 'CHANGE_PASSWORD' }} onClick={() => setIsAuthModalOpen(false)}>
                                                <i className="fa-solid fa-lock" style={{ color: '#64748b' }}></i> Change Password
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/dashboard/id-card" onClick={() => setIsAuthModalOpen(false)}>
                                                <i className="fa-solid fa-id-badge" style={{ color: '#3b82f6' }}></i> Virtual ID Card
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={() => { logout(); setIsAuthModalOpen(false); }}>
                                                <i className="fa-solid fa-power-off" style={{ color: '#ef4444' }}></i> Log Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
