import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './VirtualIdCard.css';

export default function VirtualIdCard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const docRef = doc(db, 'users', auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData({ uid: auth.currentUser.uid, ...docSnap.data() });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            setLoading(false);
        };

        // Listen for auth state changes in case it hasn't initialized yet
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchUserData();
            else setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    const handleDownload = () => {
        alert("Downloading ID Card...");
        // In a real application, you would generate a PDF or image here.
    };

    return (
        <div className="id-card-page-container">
            <div className="id-card-wrapper">
                <div className="virtual-id-card">
                    {/* Header */}
                    <div className="id-card-header">
                        <div className="id-card-logo">
                            <i className="fa-solid fa-building-columns" style={{ color: '#6d28d9', fontSize: '24px' }}></i>
                            <div className="logo-text">
                                <span className="logo-title">ALARD</span>
                                <span className="logo-subtitle">UNIVERSITY</span>
                            </div>
                        </div>
                        <div className="id-card-address">
                            <strong>AUP</strong><br/>
                            Survey No. 47 and 50, Near Rajiv Gandhi<br/>
                            Infotech Park, Marunji Road, Hinjawadi,<br/>
                            Pune 411057.
                        </div>
                    </div>

                    {/* Body */}
                    <div className="id-card-body">
                        <div className="id-card-photo">
                            <img src="https://ui-avatars.com/api/?name=Bhushan+Kolte&background=0D8ABC&color=fff&size=120" alt="Student Photo" />
                        </div>
                        
                        <div className="id-card-details">
                            {loading ? (
                                <p>Loading ID...</p>
                            ) : userData ? (
                                <>
                                    <h4 className="reg-no">UID: {userData.uid}</h4>
                                    <h3 className="student-name">
                                        {userData.personalDetails?.firstName || ''} {userData.personalDetails?.lastName || 'STUDENT'}
                                    </h3>
                                    <p className="course-name">{userData.personalDetails?.admissionCategory || 'UG(Engg & Tech)'}</p>
                                </>
                            ) : (
                                <>
                                    <h4 className="reg-no">UID: NOT LOGGED IN</h4>
                                    <h3 className="student-name">UNKNOWN USER</h3>
                                    <p className="course-name">N/A</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer / Barcode */}
                    <div className="id-card-footer">
                        {/* CSS Barcode Placeholder */}
                        <div className="barcode-placeholder">
                            <div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div><div className="bar wide"></div>
                            <div className="bar narrow"></div><div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar wide"></div>
                            <div className="bar narrow"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                        </div>
                        <div className="barcode-text">
                            {loading ? '...' : userData ? userData.uid : 'INVALID'}
                        </div>
                    </div>
                </div>

                <button className="btn-primary download-btn" onClick={handleDownload}>
                    <i className="fa-solid fa-download"></i> Download ID Card
                </button>
            </div>
        </div>
    );
}
