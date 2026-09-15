import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { PieChart, PieSlice, PieCenter } from '../../components/ui/charts';
import { uploadDocument } from '../../utils/fileUpload';
import './DashboardOverview.css';

export default function DashboardOverview() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const selectedFilter = 'All';
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0); // Default base percentage
  const [verificationStatus, setVerificationStatus] = useState({
    contact: false,
    bank: false,
    aadhaar: false,
  });

  const [applications, setApplications] = useState([]);

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();

            let completedFields = 0;
            let totalFields = 0;

            const fieldsToCheck = [
              {
                section: 'personalDetails',
                fields: [
                  'firstName',
                  'lastName',
                  'officialEmail',
                  'admissionCategory',
                  'caste',
                  'nationality',
                  'domicile',
                  'mobileNumber',
                  'birthPlace',
                  'birthCountry',
                  'birthState',
                  'birthDistrict',
                  'nativePlace',
                  'nativeCountry',
                  'nativeState',
                  'nativeDistrict',
                  'primaryEmail',
                  'bloodGroup',
                  'parentName',
                  'parentRelation',
                  'careerChoice',
                ],
              },
              { section: 'contactDetails', fields: ['phoneNumber', 'address'] },
              { section: 'identityDetails', fields: ['aadhaarNumber', 'panNumber'] },
            ];

            fieldsToCheck.forEach((group) => {
              group.fields.forEach((field) => {
                totalFields++;
                if (userData?.[group.section]?.[field]) {
                  completedFields++;
                }
              });
            });

            const calculatedPercentage =
              totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
            setProfileCompletion(calculatedPercentage);

            // Check verifications
            const contactVerified = !!(
              userData?.personalDetails?.mobileNumber && userData?.personalDetails?.primaryEmail
            );
            const bankAdded = !!userData?.documents?.passbook;
            const aadhaarVerified = !!userData?.identityDetails?.aadhaarNumber;

            setVerificationStatus({
              contact: contactVerified,
              bank: bankAdded,
              aadhaar: aadhaarVerified,
            });

            // Set Avatar from Firestore if available
            if (userData?.documents?.photo?.url) {
              setAvatarUrl(userData.documents.photo.url);
            } else if (user?.photoURL) {
              setAvatarUrl(user.photoURL);
            }
          } else {
            setProfileCompletion(0);
            setVerificationStatus({
              contact: false,
              bank: false,
              aadhaar: false,
            });
          }
        } catch (error) {
          console.error('Error fetching profile for completion tracking:', error);
        }
      }
    };

    const fetchApplications = async () => {
      if (user?.uid) {
        try {
          const appsRef = collection(db, 'users', user.uid, 'applications');
          const querySnapshot = await getDocs(appsRef);
          const appsData = [];
          querySnapshot.forEach((docSnap) => {
            appsData.push({ id: docSnap.id, ...docSnap.data() });
          });

          // Sort by timestamp if available
          appsData.sort((a, b) => {
            const timeA = a.timestamp?.toMillis?.() || 0;
            const timeB = b.timestamp?.toMillis?.() || 0;
            return timeB - timeA;
          });

          setApplications(appsData);
        } catch (error) {
          console.error('Error fetching applications:', error);
        }
      }
    };

    fetchProfileData();
    fetchApplications();
  }, [user]);

  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const filteredApps =
    selectedFilter === 'All'
      ? applications
      : applications.filter((app) => app.status === selectedFilter);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadDocument(file);
      const newUrl = uploaded.url;

      // Save to Firestore under documents.photo
      await setDoc(
        doc(db, 'users', user.uid),
        {
          documents: { photo: { url: newUrl } },
        },
        { merge: true }
      );

      setAvatarUrl(newUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile photo.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="dashboard-overview">
      {showAlert && (
        <div className="active-alerts-banner">
          <i className="fa-solid fa-bell"></i>
          <strong>Active Alerts</strong>
          <span className="alerts-divider"></span>
          <span className="alert-text">
            Deadline for PM-KISAN document correction: 25 Oct 2023. Schedule Mudra re-apply
            counseling.
          </span>
          <button className="close-alert-btn" onClick={() => setShowAlert(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          <div className="profile-card">
            <div className="profile-header">
              <label className="profile-avatar" htmlFor="avatar-upload">
                {isUploadingAvatar ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" />
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
                {!isUploadingAvatar && (
                  <div className="avatar-overlay">
                    <i className="fa-solid fa-camera"></i>
                    <span>Update Photo</span>
                  </div>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  className="avatar-upload-input"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </label>
              <div className="profile-info">
                <h2>
                  {user?.name || 'John Doe'}{' '}
                  <span className="farmer-id">
                    (User ID: {user?.uid ? user.uid.substring(0, 8).toUpperCase() : '7890'})
                  </span>
                </h2>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Profile Status ({profileCompletion}%)</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>

                <div className="verification-badges">
                  <div className="ver-badge">
                    <i
                      className={`fa-${verificationStatus.contact ? 'solid fa-square-check checked' : 'regular fa-square unchecked'}`}
                    ></i>{' '}
                    Contact Info Verified
                  </div>
                  <div className="ver-badge">
                    <i
                      className={`fa-${verificationStatus.bank ? 'solid fa-square-check checked' : 'regular fa-square unchecked'}`}
                    ></i>{' '}
                    Bank Details Added
                  </div>
                  <div className="ver-badge">
                    <i
                      className={`fa-${verificationStatus.aadhaar ? 'solid fa-square-check checked' : 'regular fa-square unchecked'}`}
                    ></i>{' '}
                    Aadhaar e-KYC
                  </div>
                </div>

                <div
                  className="profile-completion-action"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/dashboard/profile')}
                    style={{ padding: '12px 24px', fontSize: '1rem', letterSpacing: '0.5px' }}
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div
              className="scheme-status-card"
              style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}
            >
              <i
                className="fa-solid fa-folder-open"
                style={{ fontSize: '3rem', marginBottom: '16px', color: '#cbd5e1' }}
              ></i>
              <h3>No Applications Yet</h3>
              <p>
                You haven't applied for any schemes. Check out the Recommendations or Schemes page
                to get started!
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => navigate('/schemes')}
              >
                Browse Schemes
              </button>
            </div>
          ) : (
            applications.map((app) => {
              let progressPercent = 25;
              if (app.status === 'Approved') {
                progressPercent = 100;
              } else if (app.status === 'Rejected') {
                progressPercent = 75;
              } else if (app.totalSteps && app.currentStep !== undefined) {
                progressPercent = Math.round((app.currentStep / app.totalSteps) * 100);
              } else {
                progressPercent = 50;
              }

              const statusClass =
                app.status === 'Approved'
                  ? 'status-approved'
                  : app.status === 'Rejected'
                    ? 'status-rejected'
                    : 'status-pending';

              return (
                <div className="scheme-status-card" key={app.id}>
                  <div className="scheme-flex">
                    <div style={{ width: '100%' }}>
                      <h3>{app.schemeName || 'Unknown Scheme'}</h3>
                      <div className="scheme-status-text">
                        Status: <span className={statusClass}>{app.status}</span> (
                        {app.desc || 'Application submitted'})
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                          {app.status === 'Rejected'
                            ? `Progress: Stopped at ${progressPercent}%`
                            : `Progress: ${progressPercent}%`}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${progressPercent}%`,
                              height: '100%',
                              background:
                                app.status === 'Approved'
                                  ? '#10b981'
                                  : app.status === 'Rejected'
                                    ? '#ef4444'
                                    : '#3b82f6',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <button
                      className={app.status === 'Rejected' ? 'btn-reapply' : 'btn-track'}
                      onClick={() =>
                        navigate('/dashboard/applications', { state: { expandAppId: app.id } })
                      }
                    >
                      {app.status === 'Rejected' ? 'Re-apply' : 'Track'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar */}
        <div className="right-column">
          <div className="sidebar-card">
            <h3>My Performance Snapshot</h3>
            <div
              className="donut-chart-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0',
                position: 'relative',
              }}
            >
              <svg width="0" height="0">
                <defs>
                  <pattern
                    id="lines"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="8" height="8" fill="#fee2e2" />
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="2" />
                  </pattern>
                  <pattern id="vertical-lines" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="#fef3c7" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="1" />
                  </pattern>
                  <pattern id="horizontal-lines" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="#d1fae5" />
                    <line x1="0" y1="3" x2="6" y2="3" stroke="#10b981" strokeWidth="1" />
                  </pattern>
                </defs>
              </svg>
              <PieChart
                data={[
                  {
                    label: 'Approved',
                    value: approvedCount,
                    color: '#10b981',
                    fill: 'url(#horizontal-lines)',
                  },
                  {
                    label: 'Pending',
                    value: pendingCount,
                    color: '#f59e0b',
                    fill: 'url(#vertical-lines)',
                  },
                  {
                    label: 'Rejected',
                    value: rejectedCount,
                    color: '#ef4444',
                    fill: 'url(#lines)',
                  },
                ].filter((d) => d.value > 0)}
                size={220}
                innerRadius={70}
                padAngle={0.03}
                cornerRadius={4}
              >
                {totalCount > 0 ? (
                  [
                    {
                      label: 'Approved',
                      value: approvedCount,
                      color: '#10b981',
                      fill: 'url(#horizontal-lines)',
                    },
                    {
                      label: 'Pending',
                      value: pendingCount,
                      color: '#f59e0b',
                      fill: 'url(#vertical-lines)',
                    },
                    {
                      label: 'Rejected',
                      value: rejectedCount,
                      color: '#ef4444',
                      fill: 'url(#lines)',
                    },
                  ]
                    .filter((d) => d.value > 0)
                    .map((_, index) => <PieSlice key={index} index={index} />)
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      border: '40px solid #e2e8f0',
                      boxSizing: 'border-box',
                    }}
                  ></div>
                )}
                <PieCenter defaultLabel="Total" />
              </PieChart>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard/applications')}
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                <i className="fa-solid fa-file-lines" style={{ marginRight: '8px' }}></i>
                View All Applications
              </button>
            </div>
            <div className="filtered-schemes-list">
              <h4>{selectedFilter === 'All' ? 'All' : selectedFilter} Applications</h4>

              {paginatedApps.map((app) => (
                <div key={app.id} className="mini-scheme-item" style={{ marginBottom: '8px' }}>
                  <div className="mini-scheme-header">
                    <strong>{app.schemeName || app.name}</strong>
                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                  <p>{app.desc}</p>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <span className="pagination-text">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="pagination-buttons">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Scheme Recommendations</h3>
            <div className="rec-card">
              <div className="rec-header">
                <div className="rec-icon">
                  <i className="fa-solid fa-file-contract"></i>
                </div>
                <div className="rec-info">
                  <h4>PM-SY Mandaan</h4>
                  <p>
                    Hom uploood application Verificaton
                    <br />
                    Ayushman applications application modinating application.
                  </p>
                </div>
              </div>
              <div className="rec-actions">
                <button
                  className="btn-sm btn-primary-sm"
                  onClick={() => navigate('/dashboard/apply/SCH-007')}
                >
                  Apply Now
                </button>
                <button className="btn-sm btn-outline" onClick={() => navigate('/schemes/SCH-007')}>
                  Learn More
                </button>
              </div>
            </div>
            <div className="rec-card">
              <div className="rec-header">
                <div className="rec-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <i className="fa-solid fa-credit-card"></i>
                </div>
                <div className="rec-info">
                  <h4>Kisan Credit Card</h4>
                  <p>
                    Your name certificity for Aapliman Bhent
                    <br />
                    Kisan Credit Card is mplood certificastors for mavination narivats.
                  </p>
                </div>
              </div>
              <div className="rec-actions">
                <button
                  className="btn-sm btn-primary-sm"
                  onClick={() => navigate('/dashboard/apply/SCH-008')}
                >
                  Apply Now
                </button>
                <button className="btn-sm btn-outline" onClick={() => navigate('/schemes/SCH-008')}>
                  Learn More
                </button>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>My Documents Vault</h3>
            <div className="doc-list">
              <div className="doc-item">
                <i className="fa-regular fa-file-pdf"></i>
                <span>Aadhaar Card.pdf</span>
              </div>
              <div className="doc-item">
                <i className="fa-regular fa-file-pdf"></i>
                <span>Income Certificate.pdf</span>
              </div>
            </div>
            <button
              className="btn-outline"
              onClick={() => navigate('/dashboard/profile', { state: { tab: 'UPLOAD_DOCUMENTS' } })}
              style={{ width: '100%', padding: '10px' }}
            >
              Manage Documents
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Help and Support</h3>
            <div className="help-grid">
              <div className="help-item">
                <i className="fa-regular fa-circle-question"></i>
                <span>FAQs</span>
              </div>
              <div className="help-item">
                <i className="fa-regular fa-comments"></i>
                <span>Contact Support Chat</span>
              </div>
              <div className="help-item">
                <i className="fa-solid fa-phone-volume"></i>
                <span>Call Helpline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
