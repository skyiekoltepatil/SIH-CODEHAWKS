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
