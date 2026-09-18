import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schemesData } from '../data';
import './SchemeDetails.css';

export default function SchemeDetails() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [scheme, setScheme] = useState(null);

  useEffect(() => {
    const found = schemesData.find((s) => s.id === schemeId);
    if (found) {
      setScheme(found);
    } else {
      // Default to PM-KISAN if not found for demo purposes
      setScheme(schemesData[0]);
    }
  }, [schemeId]);

  if (!scheme) return <div className="loading">Loading...</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="tab-content overview-content">
            <div className="overview-left-card">
              <div className="category-header">
                <div className="icon-wrapper">
                  <i className={`fa-solid ${scheme.icon}`}></i>
                </div>
                <h3>{scheme.category}</h3>
              </div>
              <p className="description-text">
                {scheme.description}
                <br />
                <br />
                This scheme provides crucial support, eligibility applies to all verified
                individuals within the criteria. The benefits cover substantial financial aid or
                resources directly to the beneficiaries.
              </p>
              <h4>Key Benefits:</h4>
              <ul>
                <li>Income support to eligible beneficiaries</li>
                <li>Direct benefit transfer to bank accounts</li>
                <li>Enhances financial stability</li>
                <li>Benefits amount disbursed seamlessly</li>
              </ul>
            </div>

            <div className="overview-right-card">
              <div className="emblem-container">
                <i className="fa-solid fa-building-columns emblem-icon"></i>
                <div className="emblem-text">
                  <span>{scheme.department}</span>
                  <span>GOVERNMENT OF INDIA</span>
                </div>
              </div>
              <div className="stats-section">
                <h5>Key Scheme Statistics:</h5>
                <p className="stat-value">₹6,000 - 13.93%</p>
                <p className="stat-value">Scheme: Reg: 2,299</p>
              </div>
              <div className="progress-section">
                <h5>Next Projected Disbursement:</h5>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="progress-dates">
                  <span>10 Sep 2023</span>
                  <span>10 Sep 2024</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Documentation':
        return (
          <div className="tab-content documentation-content">
            <div className="doc-col">
              <h4>{scheme.name}</h4>
              <p>{scheme.description}</p>
              <h5>Eligibility:</h5>
              <ul>
                <li>Income support for verified applicants.</li>
                <li>Benefit amounts applied per verified year.</li>
              </ul>
            </div>
            <div className="doc-col middle-col">
              <div className="doc-upload-item">
                <span>
                  <i className="fa-solid fa-square-check" style={{ color: '#3b82f6' }}></i> Upload
                  Land Record
                </span>
                <button className="upload-btn-mini">
                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                </button>
              </div>
              <div className="doc-upload-item">
                <span>
                  <i className="fa-solid fa-square-check" style={{ color: '#3b82f6' }}></i> Upload
                  Aadhaar
                </span>
                <button className="upload-btn-mini">
                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                </button>
              </div>
              <div className="doc-upload-item">
                <span>
                  <i className="fa-solid fa-square-check" style={{ color: '#3b82f6' }}></i> Upload
                  Bank Passbook
                </span>
                <button className="upload-btn-mini">
                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                </button>
              </div>
            </div>
            <div className="doc-col">
              <h4>{scheme.name}</h4>
              <p>
                Facilitates financial empowerment and health cover where applicable. Next projected
                disbursement for our bank branch.
              </p>
            </div>
          </div>
        );
      case 'Apply Process':
        return (
          <div className="tab-content apply-process-content dark-theme-timeline">
            <h3>1. Complete application workflow</h3>
            <div className="app-timeline-card">
              <div className="app-timeline-header">
                <h4>Scholarship application</h4>
                <span className="step-count-badge">8 steps</span>
              </div>
              <p className="app-timeline-desc">Students complete each stage in order. The next stage unlocks only after successful validation.</p>
              
              <div className="app-timeline">
                <div className="app-timeline-item">
                  <div className="timeline-marker">1</div>
                  <div className="timeline-content">
                    <h5>Register / Login</h5>
                    <p>Create an account or sign in using a verified student identity.</p>
                    <span className="timeline-status success-text">Account verified → Unlock Step 2</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">2</div>
                  <div className="timeline-content">
                    <h5>Select Scholarship Scheme</h5>
                    <p>Choose the scholarship and check eligibility, income limits, course requirements, and deadlines.</p>
                    <span className="timeline-status success-text">Eligibility checked → Unlock Step 3</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">3</div>
                  <div className="timeline-content">
                    <h5>Enter Personal Details</h5>
                    <p>Name, date of birth, contact details, address, and required identity information.</p>
                    <span className="timeline-status success-text">Required fields validated → Unlock Step 4</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">4</div>
                  <div className="timeline-content">
                    <h5>Enter Academic Details</h5>
                    <p>College, course, current year, enrollment number, previous marks, and academic records.</p>
                    <span className="timeline-status success-text">Academic details verified → Unlock Step 5</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">5</div>
                  <div className="timeline-content">
                    <h5>Enter Family & Income Details</h5>
                    <p>Family income, occupation, and other scheme-specific information.</p>
                    <span className="timeline-status success-text">Required details validated → Unlock Step 6</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">6</div>
                  <div className="timeline-content">
                    <h5>Upload Documents</h5>
                    <p>Upload required certificates and records, such as income certificate, marksheet, admission proof, and other scheme-specific documents.</p>
                    <span className="timeline-status success-text">Documents checked → Unlock Step 7</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">7</div>
                  <div className="timeline-content">
                    <h5>Bank Details & Verification</h5>
                    <p>Enter required bank account information and complete any prescribed verification.</p>
                    <span className="timeline-status success-text">Verification passed → Unlock Step 8</span>
                  </div>
                </div>

                <div className="app-timeline-item">
                  <div className="timeline-marker">8</div>
                  <div className="timeline-content">
                    <h5>Review & Final Submission</h5>
                    <p>Display all entered information, allow corrections, obtain consent/declaration, and submit the application.</p>
                    <span className="timeline-status success-text">Submitted → Generate application ID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="tab-content empty-content">
            <p>
              Detailed information for <strong>{activeTab}</strong> is currently being updated.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="scheme-details-page">
      <div className="sd-container">
        <button className="back-btn" onClick={() => navigate('/schemes')}>
          <i className="fa-solid fa-arrow-left"></i> Back to Schemes
        </button>

        <h1 className="sd-title">{scheme.name} - Details</h1>

        <div className="sd-tabs">
          {['Overview', 'Eligibility', 'Documentation', 'Apply Process', 'FAQ'].map((tab) => (
            <button
              key={tab}
              className={`sd-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="sd-content-area">{renderTabContent()}</div>
      </div>

      <div className="sd-bottom-bar">
        <button className="apply-now-btn" onClick={() => navigate(`/dashboard/apply/${scheme.id}`)}>
          Apply Now
        </button>
      </div>
    </div>
  );
}
