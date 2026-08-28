import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import '../Dashboard/Profile.css'; // Re-use the existing form grid CSS

const MockSite = ({ siteName, collectionName }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            setData(docs);
        });

        return () => unsubscribe();
    }, [collectionName]);

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px', color: '#334155' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ color: '#0f172a', fontSize: '2.2rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fa-solid fa-server" style={{ color: '#2563eb' }}></i> {siteName} Dashboard
                </h1>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>
                    This is a mock dashboard dynamically generated via Firestore (Route: /{collectionName}).
                </p>

                {data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: '1.1rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <i className="fa-solid fa-satellite-dish" style={{ fontSize: '2.5rem', marginBottom: '15px', display: 'block', color: '#cbd5e1' }}></i>
                        Waiting for incoming data from SIH-CODEHAWKS...
                    </div>
                ) : (
                    data.map((item, index) => {
                        const pd = item.personalDetails || {};
                        const cd = item.contactDetails || {};
                        const id = item.identityDetails || {};
                        const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just Now';
                        
                        return (
                            <div key={item.id} className="profile-form-wrapper" style={{ marginBottom: '30px', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Incoming Submission #{data.length - index}</h3>
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-check-circle"></i> Received: {timestamp}
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', marginBottom: '25px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>Personal Details</div>
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
                                            <input type="text" value={item.userId} readOnly style={{ fontFamily: 'monospace' }} />
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
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MockSite;
