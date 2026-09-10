import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './DashboardOverview.css';

export default function DashboardOverview() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Approved', 'Pending', 'Rejected'
    const [currentPage, setCurrentPage] = useState(1);
    const [showAlert, setShowAlert] = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(0); // Default base percentage
    
    // Notifications Tracking
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Deadline for PM-KISAN document correction: 25 Oct 2023.', read: false },
        { id: 2, text: 'Schedule Mudra re-apply counseling.', read: true },
        { id: 3, text: 'New scheme available: PM Awas Yojana', read: false }
    ]);
    const readNotifications = notifications.filter(n => n.read).length;
    const notificationsPercentage = Math.round((readNotifications / notifications.length) * 100) || 0;

    const applications = [
        { id: 1, name: 'PM-KISAN', status: 'Pending', desc: 'Field Inspection in Progress', currentStep: 3, totalSteps: 5 },
        { id: 2, name: 'Ayushman Bharat PM-JAY', status: 'Approved', desc: 'Awaiting card pick-up at CSC center', currentStep: 4, totalSteps: 4 },
        { id: 3, name: 'Mudra Yojana Loan', status: 'Rejected', desc: 'Reason: Incomplete Business Plan', currentStep: 1, totalSteps: 4 },
        { id: 4, name: 'PM Awas Yojana', status: 'Approved', desc: 'Funds disbursed to bank account', currentStep: 5, totalSteps: 5 },
        { id: 5, name: 'Kisan Credit Card', status: 'Pending', desc: 'Document verification pending', currentStep: 2, totalSteps: 4 },
        { id: 6, name: 'PM Shram Yogi Maandhan', status: 'Approved', desc: 'Policy generated', currentStep: 3, totalSteps: 3 },
        { id: 7, name: 'Soil Health Card', status: 'Approved', desc: 'Card dispatched via post', currentStep: 3, totalSteps: 3 }
    ];

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
                            { section: 'personalDetails', fields: [
                                'firstName', 'lastName', 'officialEmail', 
                                'admissionCategory', 'caste', 'nationality', 'domicile',
                                'mobileNumber', 'birthPlace', 'birthCountry', 'birthState', 'birthDistrict',
                                'nativePlace', 'nativeCountry', 'nativeState', 'nativeDistrict',
                                'primaryEmail', 'bloodGroup', 'parentName', 'parentRelation',
                                'careerChoice'
                            ]},
                            { section: 'contactDetails', fields: ['phoneNumber', 'address'] },
                            { section: 'identityDetails', fields: ['aadhaarNumber', 'panNumber'] }
                        ];
                        
                        fieldsToCheck.forEach(group => {
                            group.fields.forEach(field => {
                                totalFields++;
                                if (userData?.[group.section]?.[field]) {
                                    completedFields++;
                                }
                            });
                        });
                        
                        const calculatedPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
                        setProfileCompletion(calculatedPercentage);
                    } else {
                        setProfileCompletion(0);
                    }
                } catch (error) {
                    console.error("Error fetching profile for completion tracking:", error);
                }
            }
        };
        fetchProfileData();
    }, [user]);

    const totalCount = applications.length;
    const approvedCount = applications.filter(a => a.status === 'Approved').length;
    const pendingCount = applications.filter(a => a.status === 'Pending').length;
    const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

    const handleFilterClick = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
    };

    const filteredApps = selectedFilter === 'All' 
        ? applications 
        : applications.filter(app => app.status === selectedFilter);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="dashboard-overview">
            {showAlert && (
                <div className="active-alerts-banner">
                    <i className="fa-solid fa-bell"></i>
                    <strong>Active Alerts</strong> 
                    <span className="alerts-divider"></span>
                    <span className="alert-text">Deadline for PM-KISAN document correction: 25 Oct 2023. Schedule Mudra re-apply counseling.</span>
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
                            <div className="profile-avatar">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" />
                                ) : (
                                    <i className="fa-solid fa-user"></i>
                                )}
                            </div>
                            <div className="profile-info">
                                <h2>{user?.name || 'John Doe'} <span className="farmer-id">(Farmer ID: 7890)</span></h2>
                                
                                <div className="progress-section">
                                    <div className="progress-header">
                                        <span>Profile Status ({profileCompletion}%)</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }}></div>
                                    </div>
                                </div>

                                <div className="verification-badges">
                                    <div className="ver-badge">
                                        <i className="fa-solid fa-square-check checked"></i> Contact Info Verified
                                    </div>
                                    <div className="ver-badge">
                                        <i className="fa-solid fa-square-check checked"></i> Bank Details Added
                                    </div>
                                    <div className="ver-badge">
                                        <i className="fa-regular fa-square unchecked"></i> Aadhaar e-KYC
                                    </div>
                                </div>

                                <div className="profile-completion-action" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <button className="btn-primary" onClick={() => navigate('/dashboard/profile')} style={{ padding: '12px 24px', fontSize: '1rem', letterSpacing: '0.5px' }}>Complete Profile</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="scheme-status-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>PM-KISAN</h3>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6' }}>Progress: 60%</span>
                        </div>
                        <div className="stepper-container">
                            <div className="stepper-line"></div>
                            <div className="stepper-line-fill" style={{ width: '60%' }}></div>
                            
                            <div className="step-item completed">
                                <div className="step-icon"><i className="fa-solid fa-check"></i></div>
                                <div className="step-label">Application</div>
                            </div>
                            
                            <div className="step-item completed">
                                <div className="step-icon"><i className="fa-solid fa-check"></i></div>
                                <div className="step-label">Verification</div>
                            </div>
                            
                            <div className="step-item active">
                                <div className="step-icon"><i className="fa-solid fa-stopwatch"></i></div>
                                <div className="step-label">Field Inspection</div>
                                <div className="step-sublabel">Field Inspection in Progress</div>
                            </div>
                            
                            <div className="step-item">
                                <div className="step-icon"><i className="fa-solid fa-file-invoice"></i></div>
                                <div className="step-label">Sanction</div>
                            </div>
                            
                            <div className="step-item">
                                <div className="step-icon"><i className="fa-solid fa-coins"></i></div>
                                <div className="step-label">Fund Disbursal</div>
                            </div>
                        </div>
                    </div>

                    <div className="scheme-status-card">
                        <div className="scheme-flex">
                            <div style={{ width: '100%' }}>
                                <h3>Ayushman Bharat PM-JAY</h3>
                                <div className="scheme-status-text">
                                    Status: <span className="status-approved">Approved</span> (Awaiting card pick-up at CSC center)
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Progress: 100%</span>
                                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: '100%', height: '100%', background: '#10b981' }}></div>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-track">Track Card</button>
                        </div>
                    </div>

                    <div className="scheme-status-card">
                        <div className="scheme-flex">
                            <div style={{ width: '100%' }}>
                                <h3>Mudra Yojana Loan</h3>
                                <div className="scheme-status-text">
                                    Status: <span className="status-rejected">Rejected</span> (Reason: Incomplete Business Plan)
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Progress: Stopped at 25%</span>
                                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: '25%', height: '100%', background: '#ef4444' }}></div>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-reapply">Re-apply</button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="right-column">
                    <div className="sidebar-card">
                        <h3>My Performance Snapshot</h3>
                        <div className="chart-container">
                            <div className={`bar-wrapper ${selectedFilter === 'All' ? 'active-filter' : ''}`} onClick={() => handleFilterClick('All')} style={{cursor: 'pointer'}}>
                                <span className="bar-value">{totalCount}</span>
                                <div className="bar bar-total"></div>
                            </div>
                            <div className={`bar-wrapper ${selectedFilter === 'Approved' ? 'active-filter' : ''}`} onClick={() => handleFilterClick('Approved')} style={{cursor: 'pointer'}}>
                                <span className="bar-value">{approvedCount}</span>
                                <div className="bar bar-approved" style={{ height: `${(approvedCount/totalCount)*100}%` }}></div>
                            </div>
                            <div className={`bar-wrapper ${selectedFilter === 'Pending' ? 'active-filter' : ''}`} onClick={() => handleFilterClick('Pending')} style={{cursor: 'pointer'}}>
                                <span className="bar-value">{pendingCount}</span>
                                <div className="bar bar-pending" style={{ height: `${(pendingCount/totalCount)*100}%` }}></div>
                            </div>
                            <div className={`bar-wrapper ${selectedFilter === 'Rejected' ? 'active-filter' : ''}`} onClick={() => handleFilterClick('Rejected')} style={{cursor: 'pointer'}}>
                                <span className="bar-value">{rejectedCount}</span>
                                <div className="bar bar-rejected" style={{ height: `${(rejectedCount/totalCount)*100}%` }}></div>
                            </div>
                        </div>
                        <div className="chart-labels">
                            <div className={`chart-label-item ${selectedFilter === 'All' ? 'active-label' : ''}`} onClick={() => handleFilterClick('All')} style={{cursor: 'pointer'}}>Total Applications: {totalCount}</div>
                            <div className={`chart-label-item ${selectedFilter === 'Approved' ? 'active-label' : ''}`} onClick={() => handleFilterClick('Approved')} style={{cursor: 'pointer'}}>Approved: {approvedCount}</div>
                            <div className={`chart-label-item ${selectedFilter === 'Pending' ? 'active-label' : ''}`} onClick={() => handleFilterClick('Pending')} style={{cursor: 'pointer'}}>Pending: {pendingCount}</div>
                            <div className={`chart-label-item ${selectedFilter === 'Rejected' ? 'active-label' : ''}`} onClick={() => handleFilterClick('Rejected')} style={{cursor: 'pointer'}}>Rejected: {rejectedCount}</div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={() => navigate('/dashboard/applications')} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
                                <i className="fa-solid fa-file-lines" style={{ marginRight: '8px' }}></i>
                                View All Applications
                            </button>
                        </div>
                        <div className="filtered-schemes-list">
                            <h4>{selectedFilter === 'All' ? 'All' : selectedFilter} Applications</h4>
                            
                            {paginatedApps.map(app => (
                                <div key={app.id} className="mini-scheme-item" style={{ marginBottom: '8px' }}>
                                    <div className="mini-scheme-header">
                                        <strong>{app.name}</strong>
                                        <span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
                                    </div>
                                    <p>{app.desc}</p>
                                </div>
                            ))}

                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <span className="pagination-text">Page {currentPage} of {totalPages}</span>
                                    <div className="pagination-buttons">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                            disabled={currentPage === 1}
                                            className="pagination-btn"
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
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
                                <div className="rec-icon"><i className="fa-solid fa-file-contract"></i></div>
                                <div className="rec-info">
                                    <h4>PM-SY Mandaan</h4>
                                    <p>Hom uploood application Verificaton<br/>Ayushman applications application modinating application.</p>
                                </div>
                            </div>
                            <div className="rec-actions">
                                <button className="btn-sm btn-primary-sm">Apply Now</button>
                                <button className="btn-sm btn-outline">Learn More</button>
                            </div>
                        </div>
                        <div className="rec-card">
                            <div className="rec-header">
                                <div className="rec-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><i className="fa-solid fa-credit-card"></i></div>
                                <div className="rec-info">
                                    <h4>Kisan Credit Card</h4>
                                    <p>Your name certificity for Aapliman Bhent<br/>Kisan Credit Card is mplood certificastors for mavination narivats.</p>
                                </div>
                            </div>
                            <div className="rec-actions">
                                <button className="btn-sm btn-primary-sm">Apply Now</button>
                                <button className="btn-sm btn-outline">Learn More</button>
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
                        <button className="btn-outline" style={{ width: '100%', padding: '10px' }}>Manage Documents</button>
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
