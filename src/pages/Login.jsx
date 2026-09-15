import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { verifyRecaptcha } from '../utils/recaptcha';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          } catch {}
          return;
        }
        try {
          const siteKey =
            import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
          if (siteKey) {
            widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
              sitekey: siteKey,
              callback: (token) => setCaptchaToken(token),
              'expired-callback': () => setCaptchaToken(null),
            });
          }
        } catch (err) {
          console.warn('reCAPTCHA v2 render error:', err);
        }
      }
    };

    const timer = setTimeout(initCaptcha, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      setResetMessage('');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
      setError('');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setResetMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      try {
        await verifyRecaptcha(captchaToken, isRegistering ? 'register' : 'login');
      } catch (captchaErr) {
        console.warn('Captcha verification bypassed:', captchaErr.message);
        if (
          captchaErr.message?.includes('solve the captcha') ||
          captchaErr.message?.includes('Security check failed')
        ) {
          throw captchaErr;
        }
      }

      if (isRegistering) {
        const userCredential = await register(email.trim().toLowerCase(), password);
        // Update the user's profile with their real name
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        // Force a context refresh so the UI sees the new name immediately
        await auth.currentUser.reload();
        window.location.href = '/';
      } else {
        await login(email.trim().toLowerCase(), password);
        navigate('/');
      }
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError(
          'Email or password is incorrect. Check the complete email address, or use Forgot Password.'
        );
      } else if (err.code === 'auth/firebase-app-check-token-is-invalid') {
        setError(
          'Security configuration is not valid yet. Refresh once, then ask the project owner to verify Firebase App Check.'
        );
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        background: 'var(--bg-color)',
        padding: '20px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '450px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#111827' }}>
          {isRegistering ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#64748b',
            fontSize: '0.9rem',
          }}
        >
          {isRegistering
            ? 'Register to access SIH CODEHAWKS'
            : 'Sign in to continue to SIH CODEHAWKS'}
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '10px 15px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}
        {resetMessage && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '10px 15px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.85rem',
            }}
          >
            {resetMessage}
          </div>
        )}

        {isRegistering && (
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#1e293b',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              Full Name
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0 12px',
                background: 'white',
              }}
            >
              <i className="fa-regular fa-user" style={{ color: '#94a3b8', width: '20px' }}></i>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '12px 10px',
                  width: '100%',
                }}
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#1e293b',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
          >
            Email Address
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0 12px',
              background: 'white',
              position: 'relative',
            }}
          >
            <i className="fa-regular fa-envelope" style={{ color: '#94a3b8', width: '20px' }}></i>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 10px',
                width: '100%',
                minWidth: '0',
              }}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label
              style={{ display: 'block', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem' }}
            >
              Password
            </label>
            {!isRegistering && (
              <span
                onClick={handleForgotPassword}
                style={{
                  color: '#2563eb',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Forgot Password?
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0 12px',
              background: 'white',
              position: 'relative',
            }}
          >
            <i className="fa-solid fa-lock" style={{ color: '#94a3b8', width: '20px' }}></i>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 10px',
                width: '100%',
                minWidth: '0',
              }}
              placeholder="••••••••"
            />
            <i
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              style={{ color: '#94a3b8', cursor: 'pointer', padding: '0 5px' }}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div ref={captchaRef}></div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            justifyContent: 'center',
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '0.9rem' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{ color: '#2563eb', fontWeight: '600', marginLeft: '8px', cursor: 'pointer' }}
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  );
}
