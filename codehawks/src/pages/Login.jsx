import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                const userCredential = await register(email, password);
                // Update the user's profile with their real name
                await updateProfile(userCredential.user, {
                    displayName: name
                });
                
                // Force a context refresh so the UI sees the new name immediately
                await auth.currentUser.reload();
                window.location.href = '/dashboard/profile';
            } else {
                await login(email, password);
                navigate('/dashboard/profile');
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-color)', padding: '20px' }}>
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#111827' }}>
                    {isRegistering ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    {isRegistering ? 'Register to access SIH CODEHAWKS' : 'Sign in to continue to SIH CODEHAWKS'}
                </p>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                {isRegistering && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem' }}>Full Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', background: 'white' }}>
                            <i className="fa-regular fa-user" style={{ color: '#94a3b8', width: '20px' }}></i>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', width: '100%' }} placeholder="John Doe" />
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem' }}>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', background: 'white', position: 'relative' }}>
                        <i className="fa-regular fa-envelope" style={{ color: '#94a3b8', width: '20px' }}></i>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', width: '100%', minWidth: '0' }} placeholder="Enter your email" />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem' }}>Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', background: 'white', position: 'relative' }}>
                        <i className="fa-solid fa-lock" style={{ color: '#94a3b8', width: '20px' }}></i>
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', width: '100%', minWidth: '0' }} placeholder="••••••••" />
                        <i 
                            className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                            style={{ color: '#94a3b8', cursor: 'pointer', padding: '0 5px' }} 
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '600', justifyContent: 'center' }} disabled={isLoading}>
                    {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </button>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '0.9rem' }}>
                    {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                    <span 
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        style={{ color: '#2563eb', fontWeight: '600', marginLeft: '8px', cursor: 'pointer' }}
                    >
                        {isRegistering ? 'Sign In' : 'Register'}
                    </span>
                </p>
            </form>
        </div>
    );
}
