import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, writeBatch, doc } from 'firebase/firestore';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAuthModalOpen(false);
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      let unread = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notifs.push({ id: docSnap.id, ...data });
        if (!data.read) unread++;
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        if (!notif.read) {
          const ref = doc(db, 'users', user.uid, 'notifications', notif.id);
          batch.update(ref, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <i className="fa-solid fa-hawk icon-brand"></i>
          <h1>SIH CODEHAWKS</h1>
        </div>
        <nav className="navbar-links">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/about" className={isActive('/about')}>
            About Us
          </Link>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/schemes" className={isActive('/schemes')}>
            Schemes
          </Link>
          <Link to="/services" className={isActive('/services')}>
            Services
          </Link>
        </nav>
        <div className="navbar-actions" ref={dropdownRef}>
          {!isLoggedIn ? (
            <Link className="btn-primary login-btn" to="/login">
              Login/Register
            </Link>
          ) : (
            <div
              className="user-profile"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px' }}
            >
              <div
                className="notification-icon"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  color: '#4b5563',
                  fontSize: '1.2rem',
                }}
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsAuthModalOpen(false);
                }}
              >
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.6rem',
                      padding: '2px 5px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {isNotificationOpen && (
                <div
                  className="notification-dropdown"
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '50px',
                    width: '320px',
                    background: 'var(--card-bg)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border-color)',
                    zIndex: 100,
                    overflow: 'hidden',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Notifications</h4>
                    <span
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }}
                    >
                      Mark all as read
                    </span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '0.9rem',
                        }}
                      >
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '15px',
                            borderBottom: '1px solid var(--border-color)',
                            background: notif.read ? 'transparent' : 'var(--icon-bg)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <i
                              className={
                                notif.type === 'success'
                                  ? 'fa-solid fa-circle-check'
                                  : notif.type === 'error'
                                    ? 'fa-solid fa-circle-xmark'
                                    : 'fa-solid fa-circle-info'
                              }
                              style={{
                                color:
                                  notif.type === 'success'
                                    ? '#10b981'
                                    : notif.type === 'error'
                                      ? '#ef4444'
                                      : '#3b82f6',
                                marginTop: '3px',
                              }}
                            ></i>
                            <div>
                              <p
                                style={{
                                  margin: '0 0 5px 0',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-main)',
                                  fontWeight: notif.read ? '400' : '600',
                                }}
                              >
                                {notif.message}
                              </p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {notif.timestamp
                                  ? new Date(notif.timestamp.seconds * 1000).toLocaleString()
                                  : 'Just now'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div
                className="avatar"
                style={{
                  cursor: 'pointer',
                  background: user?.photoURL ? 'transparent' : '#1d4ed8',
                  overflow: 'hidden',
                }}
                onClick={() => {
                  setIsAuthModalOpen(!isAuthModalOpen);
                  setIsNotificationOpen(false);
                }}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              {isAuthModalOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar-img">
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: user?.photoURL ? 'transparent' : '#3b82f6',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
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
                      <Link to="/dashboard/citizen-profile" onClick={() => setIsAuthModalOpen(false)}>
                        <i className="fa-solid fa-user" style={{ color: '#3b82f6' }}></i> User
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/profile"
                        state={{ tab: 'CHANGE_PASSWORD' }}
                        onClick={() => setIsAuthModalOpen(false)}
                      >
                        <i className="fa-solid fa-lock" style={{ color: '#64748b' }}></i> Change
                        Password
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/id-card" onClick={() => setIsAuthModalOpen(false)}>
                        <i className="fa-solid fa-id-badge" style={{ color: '#3b82f6' }}></i>{' '}
                        Virtual ID Card
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/audit-log"
                        onClick={() => setIsAuthModalOpen(false)}
                      >
                        <i className="fa-solid fa-clock-rotate-left" style={{ color: '#10b981' }}></i>{' '}
                        Data Access History
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setIsAuthModalOpen(false);
                        }}
                      >
                        <i className="fa-solid fa-power-off" style={{ color: '#ef4444' }}></i> Log
                        Out
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
