import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
    const { login } = useContext(AuthContext);
    const [tab, setTab] = useState('login'); // 'login' or 'register'

    const handleLogin = (e) => {
        e.preventDefault();
        login();
        onClose();
    };

    const handleRegister = (e) => {
        e.preventDefault();
        login();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal auth-card">
                <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <h3>{tab === 'login' ? 'Welcome Back' : 'Create an Account'}</h3>
                    <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <div className="auth-tabs">
                    <button 
                        className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`} 
                        onClick={() => setTab('login')}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`} 
                        onClick={() => setTab('register')}
                    >
                        Register
                    </button>
                </div>

                <div className="modal-body" style={{ paddingTop: '1rem' }}>
                    {tab === 'login' ? (
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Mobile Number or Email</label>
                                <input type="text" placeholder="Enter your mobile or email" required />
                            </div>
                            <div className="form-group">
                                <label>Password / OTP</label>
                                <input type="password" placeholder="Enter your password or OTP" required />
                            </div>
                            <div className="form-row-checkbox">
                                <label className="checkbox-container">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember Me
                                </label>
                                <a href="#" className="forgot-link">Forgot Password?</a>
                            </div>
                            <button type="submit" className="btn-primary full-width">Secure Login</button>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleRegister}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="As per Aadhar" required />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input type="tel" placeholder="+91 XXXXX XXXXX" required />
                            </div>
                            <div className="form-group">
                                <label>Create Password</label>
                                <input type="password" placeholder="Min 8 characters" required />
                            </div>
                            <button type="submit" className="btn-primary full-width">Register Now</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
