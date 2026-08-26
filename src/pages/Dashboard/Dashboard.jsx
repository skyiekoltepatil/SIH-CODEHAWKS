import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Dashboard() {
    const location = useLocation();
    
    const isActive = (path) => location.pathname.includes(path) ? 'tab-btn active' : 'tab-btn';
    const isProfilePage = location.pathname.includes('profile');

    return (
        <section className="page active">
            <div className="stats-container">
                <Link to="/dashboard/applications" state={{ filter: 'All' }} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-icon"><i className="fa-solid fa-file-signature"></i></div>
                    <div className="stat-info">
                        <h3>3</h3>
                        <p>Schemes Applied</p>
                    </div>
                </Link>
                <Link to="/dashboard/applications" state={{ filter: 'Approved' }} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-icon" style={{ color: 'var(--success)', backgroundColor: '#d1fae5' }}><i className="fa-solid fa-check-circle"></i></div>
                    <div className="stat-info">
                        <h3>1</h3>
                        <p>Approved</p>
                    </div>
                </Link>
                <Link to="/dashboard/applications" state={{ filter: 'Pending' }} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-icon" style={{ color: 'var(--warning)', backgroundColor: '#fef3c7' }}><i className="fa-solid fa-clock-rotate-left"></i></div>
                    <div className="stat-info">
                        <h3>1</h3>
                        <p>Pending</p>
                    </div>
                </Link>
                <Link to="/dashboard/applications" state={{ filter: 'Rejected' }} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-icon" style={{ color: 'var(--danger)', backgroundColor: '#fee2e2' }}><i className="fa-solid fa-circle-xmark"></i></div>
                    <div className="stat-info">
                        <h3>1</h3>
                        <p>Rejected</p>
                    </div>
                </Link>
            </div>

            <main className="dashboard-main" style={isProfilePage ? { gridTemplateColumns: '1fr' } : {}}>
                <div className="main-content">
                    <div className="welcome-header">
                        <h2>User Dashboard</h2>
                        <p>Track your applications, manage your profile, and get help from our AI Assistant.</p>
                    </div>

                    <div className="tabs">
                        <Link to="/dashboard/applications" className={location.pathname === '/dashboard' || location.pathname === '/dashboard/applications' ? 'tab-btn active' : 'tab-btn'}>
                            <i className="fa-regular fa-clock"></i> My Applications
                        </Link>
                        <Link to="/dashboard/profile" className={isActive('profile')}>
                            <i className="fa-regular fa-user"></i> Profile
                        </Link>
                        <Link to="/dashboard/ai-assistant" className={isActive('ai-assistant')}>
                            <i className="fa-solid fa-robot"></i> AI Assistant
                        </Link>
                    </div>

                    <div className="tab-content-container">
                        <Outlet />
                    </div>
                </div>

                {!isProfilePage && (
                    <aside className="sidebar-right">
                        <div className="card notifications-card">
                            <h3>Recent Notifications</h3>
                            <div className="notification-item unread">
                                <div className="notif-dot green"></div>
                                <div className="notif-content">
                                    <h4>Application Approved</h4>
                                    <p>Your PM-KISAN application has been approved.</p>
                                    <span className="notif-date">Today, 10:30 AM</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <div className="notif-dot blue"></div>
                                <div className="notif-content">
                                    <h4>Document Verification</h4>
                                    <p>Please upload income certificate for Ayushman Bharat.</p>
                                    <span className="notif-date">Yesterday, 02:15 PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="card support-card">
                            <h3>Help & Support</h3>
                            <button className="support-btn" onClick={() => alert('Calling National Helpline: 1800-111-555')}>
                                <i className="fa-solid fa-phone"></i> Call Helpline: 1800-111-555
                            </button>
                        </div>
                    </aside>
                )}
            </main>
        </section>
    );
}
