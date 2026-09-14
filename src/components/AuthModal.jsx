import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { verifyRecaptcha } from '../utils/recaptcha';

export default function AuthModal({ onClose }) {
    const { login } = useContext(AuthContext);
    const [tab, setTab] = useState('login'); // 'login' or 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [captchaToken, setCaptchaToken] = useState(null);
    const captchaRef = useRef(null);
    const widgetIdRef = useRef(null);

    useEffect(() => {
        const initCaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && captchaRef.current) {
                if (widgetIdRef.current !== null) {
                    try {
                        window.grecaptcha.reset(widgetIdRef.current);
                        setCaptchaToken(null);
                    } catch (e) {}
                    return;
                }
                try {
                    const siteKey = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
                    if (siteKey) {
                        widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
                            sitekey: siteKey,
                            callback: (token) => setCaptchaToken(token),
                            'expired-callback': () => setCaptchaToken(null)
                        });
                    }
                } catch (err) {
                    console.warn("reCAPTCHA v2 render error:", err);
                }
            }
        };

        // Delay to ensure the modal DOM is fully painted
        const timer = setTimeout(initCaptcha, 250);
        return () => clearTimeout(timer);
    }, [tab]); // Re-initialize if they switch tabs and the ref remounts

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!captchaToken) {
                setError('Please verify that you are not a robot.');
                setIsLoading(false);
                return;
            }
            // Anti-bot check: verify token with backend
            await verifyRecaptcha(captchaToken, 'login');
            await login();
            onClose();
        } catch (err) {
            setError(err.message || 'Security verification failed.');
            if (widgetIdRef.current !== null && window.grecaptcha) {
                window.grecaptcha.reset(widgetIdRef.current);
            }
            setCaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!captchaToken) {
                setError('Please verify that you are not a robot.');
                setIsLoading(false);
                return;
            }
            // Anti-bot check: verify token with backend
            await verifyRecaptcha(captchaToken, 'register');
            await login();
            onClose();
        } catch (err) {
            setError(err.message || 'Security verification failed.');
            if (widgetIdRef.current !== null && window.grecaptcha) {
                window.grecaptcha.reset(widgetIdRef.current);
            }
            setCaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
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
                        onClick={() => { setTab('login'); setError(''); }}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`} 
                        onClick={() => { setTab('register'); setError(''); }}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div style={{ margin: '15px 24px 0', background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> {error}
                    </div>
                )}

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
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div ref={captchaRef}></div>
                            </div>
                            <button type="submit" className="btn-primary full-width" disabled={isLoading}>
                                {isLoading ? 'Verifying Security...' : 'Secure Login'}
                            </button>
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
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div ref={captchaRef}></div>
                            </div>
                            <button type="submit" className="btn-primary full-width" disabled={isLoading}>
                                {isLoading ? 'Verifying Security...' : 'Register Now'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
