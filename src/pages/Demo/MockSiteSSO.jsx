import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../Dashboard/Profile.css';

const MockSiteSSO = ({ siteName }) => {
    const [data, setData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setError('');

        try {
            // Authenticate with the central SIH Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch data from central database (simulating API pull)
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData({ id: docSnap.id, ...docSnap.data() });
                setIsAuthenticated(true);
            } else {
                throw new Error("Profile data not found in SIH-CODEHAWKS.");
            }
        } catch (err) {
            console.error("SSO Error:", err);
            // Make error messages more user-friendly
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid SIH email or password.');
            } else {
                setError(err.message);
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px', color: '#334155' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ color: '#0f172a', fontSize: '2.2rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fa-solid fa-server" style={{ color: '#2563eb' }}></i> {siteName} Secure Portal
                </h1>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>
                    Demonstrating Approach 2: Fetching data via Single Sign-On (SSO).
                </p>

                {!isAuthenticated ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: '3.5rem', color: '#64748b', marginBottom: '20px' }}></i>
                        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Authentication Required</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
                            {siteName} requires access to your verified profile data. Please login using your central SIH-CODEHAWKS identity to securely pull your information.
                        </p>

                        {error && (
                            <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '20px', display: 'inline-block' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ maxWidth: '350px', margin: '0 auto', textAlign: 'left' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>SIH Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                                    placeholder="student@example.com"
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>SIH Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isAuthenticating}
                                style={{
                                    width: '100%',
                                    background: '#0f172a',
                                    color: 'white',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isAuthenticating ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-right-to-bracket"></i>
                                        Secure Login
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="profile-form-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Authenticated Profile Data</h3>
                            <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-solid fa-check-double"></i> Data Fetched Successfully
                            </div>
                        </div>

                        {/* Rendering the data */}
                        {(() => {
                            const pd = data.personalDetails || {};
                            const cd = data.contactDetails || {};
                            const id = data.identityDetails || {};

                            return (
                                <>
                                    <div style={{ marginTop: '20px', marginBottom: '25px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>Personal Details</div>
                                    <div className="ui-form-grid">
                                        <div className="ui-input-group">
                                            <label>First Name</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-user"></i>
                                                <input type="text" value={pd.firstName || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Middle Name</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-user"></i>
                                                <input type="text" value={pd.middleName || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Last Name</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-user"></i>
                                                <input type="text" value={pd.lastName || ''} readOnly />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                        <div className="ui-input-group">
                                            <label>Official Email</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-envelope"></i>
                                                <input type="text" value={pd.officialEmail || pd.email || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Admission Category</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-list"></i>
                                                <input type="text" value={pd.admissionCategory || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Caste</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-list"></i>
                                                <input type="text" value={pd.caste || ''} readOnly />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                        <div className="ui-input-group">
                                            <label>Sub Caste</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-list"></i>
                                                <input type="text" value={pd.subCaste || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Nationality</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-flag"></i>
                                                <input type="text" value={pd.nationality || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Domicile</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-map-pin"></i>
                                                <input type="text" value={pd.domicile || ''} readOnly />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '40px', marginBottom: '25px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>Contact Details</div>
                                    <div className="ui-form-grid">
                                        <div className="ui-input-group">
                                            <label>Phone Number</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-phone"></i>
                                                <input type="text" value={cd.phoneNumber || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Phone Verified?</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-shield"></i>
                                                <input type="text" value={cd.phoneVerified ? 'YES' : 'NO'} readOnly style={{ color: cd.phoneVerified ? '#166534' : '#991b1b', fontWeight: 700 }} />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Address</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-home"></i>
                                                <input type="text" value={cd.address || ''} readOnly />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '40px', marginBottom: '25px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>Identity Details</div>
                                    <div className="ui-form-grid">
                                        <div className="ui-input-group">
                                            <label>User ID / UID</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-id-card"></i>
                                                <input type="text" value={data.id} readOnly style={{ fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Aadhaar Number</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-address-card"></i>
                                                <input type="text" value={id.aadhaarNumber || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="ui-input-group">
                                            <label>Aadhaar Verified?</label>
                                            <div className="input-wrapper" style={{ background: '#f8fafc' }}>
                                                <i className="fa-solid fa-shield"></i>
                                                <input type="text" value={id.aadhaarVerified ? 'YES' : 'NO'} readOnly style={{ color: id.aadhaarVerified ? '#166534' : '#991b1b', fontWeight: 700 }} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockSiteSSO;
