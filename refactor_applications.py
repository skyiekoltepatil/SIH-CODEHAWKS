import re

with open('src/pages/Dashboard/Applications.jsx', 'r') as f:
    jsx_content = f.read()

# Replace the adaptive-card-summary with the new one
new_jsx = """
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
                                                                            <button className="acs2-help-btn"><i className="fa-regular fa-circle-question"></i> Help</button>
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
                                                                                <div className="acs2-doc-item verified">
                                                                                    <div className="doc-name"><i className="fa-regular fa-file-lines"></i> Aadhar file</div>
                                                                                    <div className="doc-status"><i className="fa-solid fa-circle-check"></i> Verified <span className="doc-light">(Internal Data Audit)</span></div>
                                                                                </div>
                                                                                <div className="acs2-doc-item verified">
                                                                                    <div className="doc-name"><i className="fa-regular fa-file-lines"></i> Aadhar file</div>
                                                                                    <div className="doc-status"><i className="fa-solid fa-circle-check"></i> Verified <span className="doc-light">(Internal Data Audit)</span> <i className="fa-solid fa-chevron-down"></i></div>
                                                                                </div>
                                                                                <div className="acs2-doc-item pending">
                                                                                    <div className="doc-name"><i className="fa-regular fa-file-lines"></i> PM-JAY document</div>
                                                                                    <div className="doc-status">More <i className="fa-solid fa-chevron-down"></i></div>
                                                                                </div>
                                                                                <div className="acs2-doc-item pending">
                                                                                    <div className="doc-name"><i className="fa-regular fa-file-lines"></i> File docs</div>
                                                                                    <div className="doc-status">More <i className="fa-solid fa-chevron-down"></i></div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="acs2-file-drop">
                                                                                <i className="fa-solid fa-arrow-up-from-bracket"></i> File drop area
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
                                                                                    <button className="acs2-help-btn"><i className="fa-regular fa-circle-question"></i> Help</button>
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
"""

start_str = '<div className="adaptive-card-summary">'
end_str = '</div>\\n                                                    </div>\\n                                                </td>'

idx1 = jsx_content.find(start_str)
idx2 = jsx_content.find(end_str, idx1)

modified_jsx = jsx_content[:idx1] + new_jsx.strip() + '\\n                                                    ' + jsx_content[idx2:]

with open('src/pages/Dashboard/Applications.jsx', 'w') as f:
    f.write(modified_jsx)


with open('src/pages/Dashboard/Applications.css', 'r') as f:
    css_content = f.read()

# Add the new CSS
new_css = """
/* V2 Adaptive Card Summary (Matches Image) */
.adaptive-card-summary-v2 {
    background: #f8fafc;
    padding: 0;
}

.acs2-header-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
}

.acs2-status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
}

.acs2-status-badge.disbursed, .acs2-status-badge.approved {
    background-color: #dcfce7;
    color: #166534;
    border-color: #bbf7d0;
}

.acs2-status-badge.pending {
    background-color: #fef9c3;
    color: #854d0e;
    border-color: #fef08a;
}

.acs2-status-badge.rejected {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
}

.acs2-header-titles h4 {
    margin: 0 0 4px 0;
    font-size: 1.15rem;
    color: #0f172a;
    font-weight: 600;
}

.acs2-subtitle {
    font-size: 0.85rem;
    color: #475569;
}

.acs2-main-layout {
    display: flex;
    gap: 24px;
    align-items: stretch;
}

.acs2-left-sidebar {
    width: 280px;
    flex-shrink: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.acs2-title {
    margin: 0 0 16px 0;
    font-size: 0.95rem;
    color: #0f172a;
    font-weight: 700;
}

.acs2-profile-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.acs2-profile-img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
}

.acs2-profile-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.acs2-profile-text strong {
    color: #0f172a;
    font-size: 0.9rem;
}

.acs2-profile-text span {
    font-size: 0.75rem;
    color: #475569;
}

.acs2-status-alert {
    background: #ffedd5;
    color: #9a3412;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.4;
}
.acs2-status-alert.approved { background: #dcfce7; color: #166534; }
.acs2-status-alert.rejected { background: #fee2e2; color: #991b1b; }

.acs2-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 16px 0;
}

.acs2-summary-text {
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.5;
    margin: 0;
}

.acs2-right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.acs2-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.acs2-box-header h5 {
    margin: 0;
}

.acs2-help-btn {
    background: #f1f5f9;
    border: none;
    color: #475569;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}

.acs2-stepper-box {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px 24px;
}

.acs2-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}

.acs2-col-box {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.acs2-col-box.transparent-col {
    background: transparent;
    border: none;
    padding: 0;
}

.acs2-inner-col {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
}

.acs2-doc-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.acs2-doc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

.acs2-doc-item.verified {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.acs2-doc-item.pending {
    background: white;
}

.doc-name {
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
}

.doc-status {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.acs2-doc-item.verified .doc-status { color: #16a34a; }
.acs2-doc-item.pending .doc-status { color: #64748b; }
.doc-light { color: #86efac; font-weight: 400; }

.acs2-file-drop {
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    padding: 16px;
    text-align: center;
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    background: #f8fafc;
}

.acs2-notes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.acs2-note-card {
    padding: 12px 16px;
    border-radius: 6px;
    border-left: 4px solid transparent;
}

.acs2-note-card.yellow {
    background: #fef3c7;
    border-left-color: #f59e0b;
}

.acs2-note-card.blue {
    background: #eff6ff;
    border-left-color: #3b82f6;
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 0.8rem;
}

.note-header strong { color: #1e293b; }
.note-header span { color: #64748b; }

.acs2-note-card p {
    margin: 0 0 8px 0;
    font-size: 0.85rem;
    color: #334155;
    line-height: 1.4;
}

.note-footer {
    font-size: 0.75rem;
    color: #475569;
    text-align: right;
}

.acs2-review-summary {
    font-size: 0.85rem;
    color: #334155;
    line-height: 1.5;
    margin: 0 0 16px 0;
}

.acs2-btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
    width: 100%;
}

.acs2-btn-warning {
    background: white;
    color: #d97706;
    border: 1px solid #fcd34d;
    padding: 10px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.acs2-btn-outline {
    background: white;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 10px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

/* Tooltip for stepper */
.stepper-step.hoverable {
    position: relative;
    cursor: pointer;
}

.step-tooltip {
    position: absolute;
    top: 40px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    width: 200px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    text-align: left;
}

.stepper-step.hoverable:hover .step-tooltip {
    opacity: 1;
    visibility: visible;
}

.step-tooltip strong { display: block; font-size: 0.85rem; color: #0f172a; margin-bottom: 2px; }
.step-tooltip span { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 8px; }
.step-tooltip p { margin: 0; font-size: 0.8rem; color: #475569; line-height: 1.4; }
"""

with open('src/pages/Dashboard/Applications.css', 'a') as f:
    f.write(new_css)
