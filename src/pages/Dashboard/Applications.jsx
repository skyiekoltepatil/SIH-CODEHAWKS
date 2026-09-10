import { useLocation } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { openDocumentUrl } from '../../utils/fileUpload';
import './Applications.css';

export default function Applications() {
    const location = useLocation();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const { user } = useContext(AuthContext);
    const [applicationsData, setApplicationsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [helpDrawerAppId, setHelpDrawerAppId] = useState(null);

    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "fa-solid fa-sort";
        return sortConfig.direction === 'asc' ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
    };

    useEffect(() => {
        if (location.state?.filter) {
            setFilter(location.state.filter);
        }
        if (location.state?.expandAppId) {
            setExpandedRowId(location.state.expandAppId);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (user?.uid) {
                try {
                    const appsRef = collection(db, 'users', user.uid, 'applications');
                    const querySnapshot = await getDocs(appsRef);
                    const appsData = [];
                    querySnapshot.forEach((docSnap) => {
                        appsData.push({ id: docSnap.id, ...docSnap.data() });
                    });
                    
                    appsData.sort((a, b) => {
                        const timeA = a.timestamp?.toMillis?.() || 0;
                        const timeB = b.timestamp?.toMillis?.() || 0;
                        return timeB - timeA;
                    });
                    
                    setApplicationsData(appsData);
                } catch (error) {
                    console.error("Error fetching applications:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    let displayedApplications = applicationsData.filter(app => {
        if (filter !== 'All' && app.status !== filter) return false;
        if (search && !app.schemeName?.toLowerCase().includes(search.toLowerCase()) && !app.name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (sortConfig.key) {
        displayedApplications.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            if (sortConfig.key === 'schemeName') {
                valA = (a.schemeName || a.name || '').toLowerCase();
                valB = (b.schemeName || b.name || '').toLowerCase();
            } else if (sortConfig.key === 'dateApplied') {
                valA = new Date(a.dateApplied || a.date || '12 Oct 2023').getTime();
                valB = new Date(b.dateApplied || b.date || '12 Oct 2023').getTime();
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return (
        <div className="applications-container">
            <div className="section-header">
                <h3>Schemes Applied & Details</h3>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                    <option value="All">All Applications</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="search-box">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Search" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('schemeName')} style={{ cursor: 'pointer', userSelect: 'none' }}>Scheme Name <i className={getSortIcon('schemeName')}></i></th>
                                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>Application ID <i className={getSortIcon('id')}></i></th>
                                <th onClick={() => handleSort('dateApplied')} style={{ cursor: 'pointer', userSelect: 'none' }}>Application Date <i className={getSortIcon('dateApplied')}></i></th>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>Status <i className={getSortIcon('status')}></i></th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedApplications.slice(0, rowsPerPage).map(app => {
                                let badgeClass = 'status-pending-soft';
                                if (app.status === 'Approved') badgeClass = 'status-approved-soft';
                                if (app.status === 'Rejected') badgeClass = 'status-rejected-soft';
                                
                                return (
                                    <React.Fragment key={app.id}>
                                        <tr onClick={() => toggleRow(app.id)} style={{ cursor: 'pointer' }} className={expandedRowId === app.id ? 'active-row' : ''}>
                                            <td className="fw-600">{app.schemeName || app.name}</td>
                                            <td>{typeof app.id === 'string' && app.id.startsWith('APP') ? app.id : (typeof app.id === 'number' && app.id < 1000 ? `APP-2023-894${app.id}` : app.id)}</td>
                                            <td>{app.dateApplied || app.date || '12 Oct 2023'}</td>
                                            <td>
                                                <span className={`status-badge-soft ${badgeClass}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <button className="btn-view-details">View Details</button>
                                                    <i className={`fa-solid fa-chevron-${expandedRowId === app.id ? 'up' : 'down'}`} style={{ color: '#94a3b8' }}></i>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRowId === app.id && (
                                            <tr className="expanded-row-container">
                                                <td colSpan="5" style={{ padding: 0 }}>
                                                    <div className="expanded-card">
                                                        <div className="adaptive-card-summary-v2">
                                                            <div className="acs2-header-section">
                                                                <span className={`acs2-status-badge ${app.status === 'Approved' ? 'disbursed' : app.status.toLowerCase()}`}>
                                                                    {app.status === 'Approved' ? 'Disbursed' : app.status} <i className="fa-solid fa-circle-info"></i>
                                                                </span>
                                                                <div className="acs2-header-titles">
                                                                    <h4>{app.schemeName || app.name} | {app.id < 1000 ? `APP-2023-894${app.id}` : app.id}</h4>
                                                                    <div className="acs2-subtitle">Verification Dependencies found (Post-Audit Review)</div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="acs2-main-layout">
                                                                <div className="acs2-left-sidebar">
                                                                    <h5 className="acs2-title">Applicant Profile</h5>
                                                                    <div className="acs2-profile-info">
                                                                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" className="acs2-profile-img"/>
                                                                        <div className="acs2-profile-text">
                                                                            <strong>{app.schemeName || 'PM-KISAN Samman Nidhi'}</strong>
                                                                            <span>Date {app.dateApplied || '12 Oct 2023'}</span>
                                                                            <span>Application Type: Disbursal</span>
                                                                            <span>Money: ₹70,000</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`acs2-status-alert ${app.status.toLowerCase()}`}>
                                                                        Application Status: Conditional Disbursal (Review Pending)
                                                                    </div>
                                                                    <div className="acs2-divider"></div>
                                                                    <h5 className="acs2-title">Scheme Summary</h5>
                                                                    <p className="acs2-summary-text">PM-KISAN Samman Nidhi; PM-KISAN Samman Nidhi for aown completion applications. Scheme a size to ortor's application regard and scheme application.</p>
                                                                    <div className="acs2-divider"></div>
                                                                    <h5 className="acs2-title">Key Terms</h5>
                                                                    <p className="acs2-summary-text">Fairor: Aadhar verification failed or Missing document in PM-JAY application as Sanctioned, over terms within application as Sancioned.</p>
                                                                </div>
                                                                
                                                                <div className="acs2-right-content">
                                                                    <div className="acs2-stepper-box">
                                                                        <div className="acs2-box-header">
                                                                            <h5 className="acs2-title">Inline Timeline Stepper</h5>
                                                                            <button className="acs2-help-btn" onClick={(e) => { e.stopPropagation(); setHelpDrawerAppId(app.id); }}>
                                                                                <i className="fa-regular fa-circle-question"></i> Help
                                                                                <div className="help-popover">
                                                                                    <strong>Post-Audit Action Required</strong>
                                                                                    <p>Your PM-KISAN funds have been successfully disbursed. However, a routine post-disbursal audit flagged a missing or unreadable Aadhar document. Please upload a clear copy of your Aadhar card to clear this dependency and prevent holds on future disbursals.</p>
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                        <div className="inline-stepper">
                                                                            <div className="stepper-track"></div>
                                                                            <div className={`stepper-progress ${app.status.toLowerCase()}`}></div>
                                                                            
                                                                            <div className="stepper-step completed">
                                                                                <div className="step-dot"></div>
                                                                                <div className="step-label">Submitted</div>
                                                                                <div className="step-sublabel">{app.dateApplied || 'Oct 10, 2023'}</div>
                                                                            </div>
                                                                            <div className={`stepper-step ${['Approved', 'Rejected'].includes(app.status) ? 'completed' : 'active'}`}>
                                                                                <div className="step-dot"></div>
                                                                                <div className="step-label">Under Review</div>
                                                                                <div className="step-sublabel">Oct 12, 2023</div>
                                                                            </div>
                                                                            <div className={`stepper-step hoverable ${app.status === 'Approved' ? 'completed' : (app.status === 'Rejected' ? 'rejected' : '')}`}>
                                                                                <div className="step-dot"></div>
                                                                                <div className="step-label">Verification</div>
                                                                                <div className="step-sublabel">Oct 15, 2023</div>
                                                                                <div className="step-tooltip">
                                                                                    <strong>Past up hover</strong>
                                                                                    <span>Oct 15, 2023</span>
                                                                                    <p>Verification Dependencies found (Post-Audit Review)</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className={`stepper-step ${app.status === 'Approved' ? 'completed' : ''}`}>
                                                                                <div className="step-dot"></div>
                                                                                <div className="step-label">Sanction</div>
                                                                                <div className="step-sublabel">{app.status === 'Approved' ? 'Oct 20, 2023' : ''}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="acs2-bottom-grid">
                                                                        <div className="acs2-col-box">
                                                                            <h5 className="acs2-title">Uploaded Application Documents</h5>
                                                                            <div className="acs2-doc-list">
                                                                                {app.documents && app.documents.length > 0 ? (
                                                                                    app.documents.map((docItem, dIdx) => (
                                                                                        <div 
                                                                                            key={dIdx} 
                                                                                            className="acs2-doc-item verified"
                                                                                            onClick={() => openDocumentUrl(docItem.url, docItem.name || `Document_${dIdx + 1}`)}
                                                                                            style={{ cursor: 'pointer' }}
                                                                                            title="Click to view/download document"
                                                                                        >
                                                                                            <div className="doc-name"><i className="fa-regular fa-file-lines"></i> {docItem.name || `Document ${dIdx + 1}`}</div>
                                                                                            <div className="doc-status"><i className="fa-solid fa-circle-check"></i> View / Download <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: '4px', fontSize: '0.8rem' }}></i></div>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <div style={{ padding: '12px', color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                                                                        No documents attached to this application.
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="acs2-col-box">
                                                                            <h5 className="acs2-title">Official Review & Audit Notes</h5>
                                                                            <div className="acs2-notes-list">
                                                                                <div className="acs2-note-card yellow">
                                                                                    <div className="note-header">
                                                                                        <strong>Dependency Audit Note</strong>
                                                                                        <span>Oct 21, 2023</span>
                                                                                    </div>
                                                                                    <p>Missing document: Aadhar verification failed or Missing document in PM-JAY application as San...</p>
                                                                                    <div className="note-footer">Audit Officer: S. Sharma</div>
                                                                                </div>
                                                                                <div className="acs2-note-card blue">
                                                                                    <div className="note-header">
                                                                                        <strong>Dependency Audit Note</strong>
                                                                                        <span>Oct 21, 2023</span>
                                                                                    </div>
                                                                                    <p>Aadhar data re-verification required per post-facto audit</p>
                                                                                    <div className="note-footer">Verification team</div>
                                                                                </div>
                                                                                <div className="acs2-note-card yellow">
                                                                                    <div className="note-header">
                                                                                        <strong>Dependency Audit Note</strong>
                                                                                        <span>Oct 21, 2023</span>
                                                                                    </div>
                                                                                    <p>Missing document: Aadhar verification failed application as Sanctioned.</p>
                                                                                    <div className="note-footer">Audit Officer: S. Sharma</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="acs2-col-box transparent-col">
                                                                            <div className="acs2-inner-col">
                                                                                <div className="acs2-box-header" style={{marginBottom: '12px'}}>
                                                                                    <h5 className="acs2-title" style={{margin: 0}}>Resolve Conflict & Quick Actions</h5>
                                                                                    <button className="acs2-help-btn" onClick={(e) => { e.stopPropagation(); setHelpDrawerAppId(app.id); }}>
                                                                                        <i className="fa-regular fa-circle-question"></i> Help
                                                                                        <div className="help-popover">
                                                                                            <strong>Post-Audit Action Required</strong>
                                                                                            <p>Your PM-KISAN funds have been successfully disbursed. However, a routine post-disbursal audit flagged a missing or unreadable Aadhar document. Please upload a clear copy of your Aadhar card to clear this dependency and prevent holds on future disbursals.</p>
                                                                                        </div>
                                                                                    </button>
                                                                                </div>
                                                                                <p className="acs2-review-summary">Review Summary: Post-Disbursal Review conditional dependencies found</p>
                                                                                <button className="acs2-btn-primary">Upload Missing Doc</button>
                                                                                <button className="acs2-btn-warning"><i className="fa-solid fa-triangle-exclamation"></i> Download Rejection Letter</button>
                                                                            </div>
                                                                            
                                                                            <div className="acs2-inner-col" style={{marginTop: '16px'}}>
                                                                                <h5 className="acs2-title" style={{marginBottom: '12px'}}>System Tools</h5>
                                                                                <button className="acs2-btn-outline" style={{marginBottom: '12px'}}><i className="fa-solid fa-download"></i> Download Conditional Disbursal Slip</button>
                                                                                <button className="acs2-btn-outline"><i className="fa-solid fa-phone"></i> Contact Audit Officer</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <div className="pagination-info">
                        Rows per page: 
                        <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="rows-select">
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>
            </div>

            {helpDrawerAppId && (
                <div className="help-modal-overlay" onClick={() => setHelpDrawerAppId(null)}>
                    <div className="help-drawer-content" onClick={e => e.stopPropagation()}>
                        <div className="help-drawer-header">
                            <h3>Help: Application {helpDrawerAppId < 1000 ? `APP-2023-894${helpDrawerAppId}` : helpDrawerAppId}</h3>
                            <button onClick={() => setHelpDrawerAppId(null)}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <div className="help-drawer-body">
                            <h4>What does 'Conditional Disbursal' mean?</h4>
                            <p>"You have received your funds, but your application is under temporary review. Our internal audit requires re-verification of your identity documents."</p>
                            
                            <h4>Steps to Resolve</h4>
                            <ul>
                                <li><i className="fa-solid fa-circle-check"></i> <div><strong>Step 1:</strong> Click the <strong>Upload Missing Doc</strong> button on your dashboard.</div></li>
                                <li><i className="fa-solid fa-circle-check"></i> <div><strong>Step 2:</strong> Provide a high-resolution scan (PDF or JPG, max 5MB) of your linked Aadhar Card.</div></li>
                                <li><i className="fa-solid fa-circle-check"></i> <div><strong>Step 3:</strong> Submit the document. The audit team will review it within 48 hours.</div></li>
                            </ul>

                            <h4>Need more help?</h4>
                            <p>"Audit Officer S. Sharma is assigned to your case. If you have questions about the specific rejection reason, you can contact them directly."</p>
                            <button className="acs2-btn-outline"><i className="fa-solid fa-phone"></i> Contact Audit Officer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
