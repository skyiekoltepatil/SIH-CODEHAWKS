export default function Home() {
    return (
        <section className="page active">
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #0b5b9c 0%, #2563eb 100%)',
                color: 'white',
                padding: '4rem 2rem',
                textAlign: 'center',
                marginBottom: '0'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>One App for all Government Services</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>Access Central and State Government services easily and securely.</p>
                <div className="hero-search" style={{
                    maxWidth: '600px', margin: '0 auto', display: 'flex', background: 'white', borderRadius: '30px', padding: '0.5rem 1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#64748b', margin: 'auto 0' }}></i>
                    <input type="text" placeholder="Search for schemes, services..." style={{
                        flex: 1, border: 'none', outline: 'none', padding: '0.5rem 1rem', fontSize: '1rem'
                    }} />
                    <button className="btn-primary" style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}>Search</button>
                </div>
            </div>

            {/* UMANG Style Stats */}
            <div className="home-stats-wrapper" style={{ marginTop: '0' }}>
                <div className="home-stats-container">
                    
                    <div className="home-stat-item">
                        <div className="home-stat-header">
                            <i className="fa-regular fa-building stat-icon-large"></i>
                            <div className="home-stat-title">
                                <h3>207</h3>
                                <p>Departments/Entities</p>
                            </div>
                        </div>
                        <div className="home-stat-sub">
                            <div>
                                <span>Central</span>
                                <strong>80</strong>
                            </div>
                            <div>
                                <span>State</span>
                                <strong>127</strong>
                            </div>
                        </div>
                    </div>

                    <div className="home-stat-item">
                        <div className="home-stat-header">
                            <i className="fa-solid fa-mobile-screen stat-icon-large"></i>
                            <div className="home-stat-title">
                                <h3>2,106</h3>
                                <p>Services</p>
                            </div>
                        </div>
                        <div className="home-stat-sub">
                            <div>
                                <span>Central</span>
                                <strong>918</strong>
                            </div>
                            <div>
                                <span>State</span>
                                <strong>1,188</strong>
                            </div>
                        </div>
                    </div>

                    <div className="home-stat-item">
                        <div className="home-stat-header">
                            <i className="fa-solid fa-user-shield stat-icon-large"></i>
                            <div className="home-stat-title">
                                <h3 className="invisible-num">.</h3>
                                <p>Registrations</p>
                            </div>
                        </div>
                        <div className="home-stat-sub single-sub">
                            <div>
                                <span>Total</span>
                                <strong>7.75 Crores</strong>
                            </div>
                        </div>
                    </div>

                    <div className="home-stat-item no-border">
                        <div className="home-stat-header">
                            <i className="fa-solid fa-money-check-dollar stat-icon-large"></i>
                            <div className="home-stat-title">
                                <h3 className="invisible-num">.</h3>
                                <p>Transactions</p>
                            </div>
                        </div>
                        <div className="home-stat-sub single-sub">
                            <div>
                                <span>Total</span>
                                <strong>554.86 Crores</strong>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* What's New Section */}
            <div className="whats-new-section">
                <h2>What's New ?</h2>
                <p className="whats-new-subtitle">Citizens may explore the newly added services on SIH CODEHAWKS!</p>
                
                <div className="whats-new-grid">
                    <div className="whats-new-card">
                        <div className="icon-circle" style={{ color: '#e67e22' }}><i className="fa-solid fa-hands-holding-child"></i></div>
                        <p>Poshan Tracker</p>
                    </div>
                    <div className="whats-new-card">
                        <div className="icon-circle" style={{ color: '#27ae60' }}><i className="fa-solid fa-landmark"></i></div>
                        <p>Aaple Sarkar</p>
                    </div>
                    <div className="whats-new-card">
                        <div className="icon-circle" style={{ color: '#f39c12' }}><i className="fa-solid fa-fingerprint"></i></div>
                        <p>Jeevan Pramaan</p>
                    </div>
                    <div className="whats-new-card">
                        <div className="icon-circle" style={{ color: '#8e44ad' }}><i className="fa-solid fa-dharmachakra"></i></div>
                        <p>Indian Culture</p>
                    </div>
                    <div className="whats-new-card">
                        <div className="icon-circle" style={{ color: '#2c3e50' }}><i className="fa-solid fa-torii-gate"></i></div>
                        <p>Goa Online</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
