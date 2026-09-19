import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import './VirtualIdCard.css';

export default function VirtualIdCard() {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const setupListener = (uid) => {
      const docRef = doc(db, 'users', uid);
      unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData({ uid, ...docSnap.data() });
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching real-time user data:', error);
        setLoading(false);
      });
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupListener(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);
  const handleDownload = () => {
    alert('Downloading ID Card...');
    // In a real application, you would generate a PDF or image here.
  };

  return (
    <div className="id-card-page-container">
      <div className="id-card-wrapper">
        <div className="virtual-id-card">
          {/* Header */}
          <div className="id-card-header">
            <div className="id-card-logo">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '32px' }} className="emblem-logo-card" />
              <div className="logo-text">
                <span className="logo-title">SIH</span>
                <span className="logo-subtitle">CODEHAWKS</span>
              </div>
            </div>
            <div className="id-card-address">
              <strong>Government of India</strong>
              <br />
              Survey No. 47 and 50, Near Rajiv Gandhi
              <br />
              Infotech Park, Marunji Road, Hinjawadi,
              <br />
              Pune 411057.
            </div>
          </div>

          {/* Body */}
          <div className="id-card-body">
            <div className="id-card-photo">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Student Photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.personalDetails?.firstName || user?.name || 'Student')}&background=0D8ABC&color=fff&size=120`}
                  alt="Student Photo"
                />
              )}
            </div>

            <div className="id-card-details">
              {loading ? (
                <p>Loading ID...</p>
              ) : userData ? (
                <>
                  <h4 className="reg-no">UID: {userData.uid.substring(0, 8).toUpperCase()}</h4>
                  <h3 className="student-name">
                    {userData.personalDetails?.firstName || ''}{' '}
                    {userData.personalDetails?.lastName || 'STUDENT'}
                  </h3>
                  <p className="course-name">
                    {userData.personalDetails?.admissionCategory || 'UG(Engg & Tech)'}
                  </p>
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
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar narrow"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar narrow"></div>
              <div className="bar wide"></div>
              <div className="bar wide"></div>
              <div className="bar narrow"></div>
              <div className="bar narrow"></div>
            </div>
            <div className="barcode-text">
              {loading ? '...' : userData ? userData.uid.substring(0, 8).toUpperCase() : 'INVALID'}
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
