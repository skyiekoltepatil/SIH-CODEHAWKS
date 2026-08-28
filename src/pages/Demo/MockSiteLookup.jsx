import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../Dashboard/Profile.css';

const MockSiteLookup = ({ siteName }) => {
    const [data, setData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchUid, setSearchUid] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleLookup = async (e) => {
        e.preventDefault();
        
        if (!searchUid.trim()) {
            setError('Please enter a User ID');
            return;
        }

        setIsSearching(true);
        setError('');
        setSuccessMsg('');
        setData(null);

        try {
            // Fetch data directly from central database using the UID
            const docRef = doc(db, 'users', searchUid.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData({ id: docSnap.id, ...docSnap.data() });
                setSuccessMsg('Profile successfully fetched from SIH-CODEHAWKS API');
            } else {
                throw new Error("No student found with that ID.");
            }
        } catch (err) {
            console.error("Lookup Error:", err);
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px', color: '#334155' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ color: '#0f172a', fontSize: '2.2rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fa-solid fa-server" style={{ color: '#2563eb' }}></i> {siteName} Admin Portal
                </h1>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>
                    Demonstrating Approach 1: Fetching data via API Lookup using a Unique ID.
                </p>

                <div style={{ marginBottom: '30px', padding: '25px', background: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}><i className="fa-solid fa-magnifying-glass"></i> Lookup Student Profile</h3>
                    
                    <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <input 
                                type="text" 
                                value={searchUid}
                                onChange={(e) => setSearchUid(e.target.value)}
                                placeholder="Enter SIH User ID (UID)..."
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isSearching}
                            style={{
                                background: '#2563eb',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isSearching ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                minWidth: '160px',
                                justifyContent: 'center'
                            }}
                        >
                            {isSearching ? (
                                <><i className="fa-solid fa-circle-notch fa-spin"></i> Searching...</>
                            ) : (
                                <><i className="fa-solid fa-cloud-arrow-down"></i> Fetch Data</>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginTop: '15px', display: 'inline-block' }}>
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '6px', marginTop: '15px', display: 'inline-block' }}>
                            <i className="fa-solid fa-circle-check"></i> {successMsg}
                        </div>
                    )}
                </div>

                {data && (
                    <div className="profile-form-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Student Profile Data</h3>
                        </div>

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

export default MockSiteLookup;
