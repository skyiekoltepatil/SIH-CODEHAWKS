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
            <div className="overview-top-row">
              <div className="overview-card hero-card">
                <div className="hero-badge">
                  <i className="fa-solid fa-heart-pulse"></i> Health
                </div>
                <h2>Ayushman Bharat<br/>Pradhan Mantri Jan Arogya Yojana</h2>
                <p className="hero-desc">
                  Provides health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization to eligible beneficiaries across India. The scheme aims to ensure access to quality healthcare and reduce out-of-pocket expenditure for vulnerable families.
                </p>
                <div className="hero-stats">
                  <div className="hero-stat-item">
                    <div className="hero-icon"><i className="fa-solid fa-users"></i></div>
                    <div>
                      <strong>₹5 Lakh</strong>
                      <span>Health cover<br/>per family per year</span>
                    </div>
                  </div>
                  <div className="hero-stat-item">
                    <div className="hero-icon"><i className="fa-solid fa-building"></i></div>
                    <div>
                      <strong>Cashless</strong>
                      <span>Treatment at<br/>empanelled hospitals</span>
                    </div>
                  </div>
                  <div className="hero-stat-item">
                    <div className="hero-icon"><i className="fa-solid fa-users-viewfinder"></i></div>
                    <div>
                      <strong>All India</strong>
                      <span>Valid across India</span>
                    </div>
                  </div>
                  <div className="hero-stat-item">
                    <div className="hero-icon"><i className="fa-solid fa-shield-halved"></i></div>
                    <div>
                      <strong>Pre & Post Care</strong>
                      <span>Covers pre and post<br/>hospitalization</span>
                    </div>
                  </div>
                </div>
                {/* Decorative background circle */}
                <div className="hero-bg-circle"></div>
              </div>

              <div className="overview-card ministry-card">
                <div className="ministry-header">
                  <div className="min-left">
                    <i className="fa-solid fa-building-columns min-icon"></i>
                    <div>
                      <strong>Ministry of Health and Family Welfare</strong>
                      <span>GOVERNMENT OF INDIA</span>
                    </div>
                  </div>
                  <div className="min-logo-text">
                    <i className="fa-brands fa-envira" style={{color: '#22c55e', fontSize: '1.5rem', marginBottom: '4px'}}></i>
                    <span style={{fontSize: '0.6rem', fontWeight: 'bold', textAlign: 'center', lineHeight: '1'}}>Ayushman Bharat<br/>PM-JAY</span>
                  </div>
                </div>
                
                <h5 className="section-title">Key Scheme Statistics</h5>
                <div className="stats-row">
                  <div className="stat-box">
                    <strong>₹6,000 - 13.93%</strong>
                    <span>Income Group Covered</span>
                  </div>
                  <div className="stat-box">
                    <strong>2,299</strong>
                    <span>Registered Schemes</span>
                  </div>
                  <div className="stat-box">
                    <strong>50+ Crore</strong>
                    <span>Beneficiaries Targeted</span>
                  </div>
                </div>

                <h5 className="section-title" style={{marginTop: '25px'}}>Next Projected Disbursement</h5>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="progress-dates">
                  <span>10 Sep 2023</span>
                  <span>10 Sep 2024</span>
                </div>
              </div>
            </div>

            <div className="overview-bottom-row">
              {/* Column 1 */}
              <div className="bottom-col">
                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-users green-icon"></i>
                      <h4>Eligibility Criteria</h4>
                    </div>
                    <a href="#" className="view-link">View Detailed Criteria &rarr;</a>
                  </div>
                  <p className="card-subtitle">The following individuals and families are eligible under Ayushman Bharat PM-JAY:</p>
                  <ul className="check-list">
                    <li><i className="fa-solid fa-circle-check"></i> <span>Families listed in the SECC 2011 database (deprivation and occupational criteria)</span></li>
                    <li><i className="fa-solid fa-circle-check"></i> <span>Economically vulnerable households as per defined criteria</span></li>
                    <li><i className="fa-solid fa-circle-check"></i> <span>No age limit – covers all family members</span></li>
                    <li><i className="fa-solid fa-circle-check"></i> <span>Applicable to both rural and urban areas</span></li>
                    <li><i className="fa-solid fa-circle-check"></i> <span>Other categories as notified by the Government</span></li>
                  </ul>
                </div>

                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-briefcase-medical blue-icon"></i>
                      <h4>Coverage & Services</h4>
                    </div>
                  </div>
                  <p className="card-subtitle">The scheme covers a wide range of medical treatments, including:</p>
                  <div className="services-grid">
                    <div className="service-item"><i className="fa-solid fa-scissors"></i><span>Surgery</span></div>
                    <div className="service-item"><i className="fa-solid fa-pills"></i><span>Medical<br/>Management</span></div>
                    <div className="service-item"><i className="fa-solid fa-clipboard-list"></i><span>Diagnostic<br/>Services</span></div>
                    <div className="service-item"><i className="fa-solid fa-bed-pulse"></i><span>Hospitalization</span></div>
                    <div className="service-item"><i className="fa-solid fa-heart-pulse"></i><span>ICU Care</span></div>
                    <div className="service-item"><i className="fa-solid fa-stethoscope"></i><span>Pre & Post<br/>Hospitalization</span></div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="bottom-col">
                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-gift red-icon"></i>
                      <h4>Key Benefits</h4>
                    </div>
                  </div>
                  <div className="benefits-list">
                    <div className="benefit-item">
                      <div className="b-icon"><i className="fa-solid fa-wallet"></i></div>
                      <div className="b-text">
                        <strong>₹5 Lakh Health Cover</strong>
                        <span>Per family per year for secondary and tertiary care hospitalization</span>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="b-icon"><i className="fa-solid fa-building-columns"></i></div>
                      <div className="b-text">
                        <strong>Cashless Treatment</strong>
                        <span>At empanelled public and private hospitals</span>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="b-icon"><i className="fa-solid fa-users"></i></div>
                      <div className="b-text">
                        <strong>Pan-India Coverage</strong>
                        <span>Valid across all empanelled hospitals in India</span>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="b-icon"><i className="fa-solid fa-shield-halved"></i></div>
                      <div className="b-text">
                        <strong>Pre and Post Hospitalization</strong>
                        <span>Covers pre and post hospitalization expenses</span>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="b-icon"><i className="fa-solid fa-people-group"></i></div>
                      <div className="b-text">
                        <strong>No Cap on Family Size</strong>
                        <span>All members of the eligible family are covered</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-hospital blue-icon"></i>
                      <div className="h-text">
                        <h4>Empanelled Hospitals</h4>
                        <span className="card-subtitle-inline">Get treatment at any empanelled hospital across India</span>
                      </div>
                    </div>
                  </div>
                  <div className="hospitals-stats">
                    <div className="h-stat">
                      <strong>25,000+</strong>
                      <span>Public Hospitals</span>
                    </div>
                    <div className="h-stat">
                      <strong>30,000+</strong>
                      <span>Private Hospitals</span>
                    </div>
                  </div>
                  <button className="search-hosp-btn">Search Empanelled Hospitals &rarr;</button>
                </div>
              </div>

              {/* Column 3 */}
              <div className="bottom-col">
                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-file-lines purple-icon"></i>
                      <div className="h-text">
                        <h4>Important Documents</h4>
                        <span className="card-subtitle-inline">Keep the following documents ready before applying</span>
                      </div>
                    </div>
                  </div>
                  <ul className="docs-list">
                    <li>
                      <div className="doc-left"><i className="fa-regular fa-file-lines"></i> Aadhaar Card</div>
                      <a href="#" className="view-sample">View Sample</a>
                    </li>
                    <li>
                      <div className="doc-left"><i className="fa-regular fa-file-lines"></i> Ration Card / SECC 2011 Proof</div>
                      <a href="#" className="view-sample">View Sample</a>
                    </li>
                    <li>
                      <div className="doc-left"><i className="fa-regular fa-file-lines"></i> Family Identity Document</div>
                      <a href="#" className="view-sample">View Sample</a>
                    </li>
                    <li>
                      <div className="doc-left"><i className="fa-regular fa-file-lines"></i> Bank Account Details (for DBT)</div>
                      <a href="#" className="view-sample">View Sample</a>
                    </li>
                  </ul>
                </div>

                <div className="overview-card help-card">
                  <div className="help-content">
                    <div className="help-icon-wrap"><i className="fa-solid fa-headset"></i></div>
                    <div className="help-text">
                      <h4>Need Help?</h4>
                      <span>For any queries related to this scheme</span>
                    </div>
                  </div>
                  <button className="contact-btn">Contact Support &rarr;</button>
                </div>

                <div className="overview-card feature-card">
                  <div className="card-header">
                    <div className="header-left">
                      <i className="fa-solid fa-download blue-icon"></i>
                      <h4>Download Resources</h4>
                    </div>
                  </div>
                  <ul className="download-list">
                    <li>
                      <div className="dl-left"><i className="fa-regular fa-file-pdf red-pdf"></i> Scheme Guidelines (PDF)</div>
                      <a href="#" className="dl-link">Download <i className="fa-solid fa-download"></i></a>
                    </li>
                    <li>
                      <div className="dl-left"><i className="fa-regular fa-file-pdf red-pdf"></i> Official Brochure (PDF)</div>
                      <a href="#" className="dl-link">Download <i className="fa-solid fa-download"></i></a>
                    </li>
                    <li>
                      <div className="dl-left"><i className="fa-regular fa-file-pdf red-pdf"></i> Frequently Asked Questions (PDF)</div>
                      <a href="#" className="dl-link">Download <i className="fa-solid fa-download"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Eligibility':
        return (
          <div className="tab-content layout-2-col">
            <div className="col-main">
              <div className="tab-header">
                <div className="icon-title">
                  <i className="fa-solid fa-clipboard-user blue-icon"></i>
                  <h3>Eligibility Criteria</h3>
                </div>
                <p>The following individuals and families are eligible under Ayushman Bharat PM-JAY, as per the Government of India guidelines.</p>
              </div>

              <div className="eligibility-boxes">
                <div className="eligibility-box">
                  <i className="fa-solid fa-flag text-blue-muted"></i>
                  <div>
                    <strong>Indian Citizens</strong>
                    <span>Must be a citizen of India</span>
                  </div>
                </div>
                <div className="eligibility-box">
                  <i className="fa-solid fa-house-chimney text-blue-muted"></i>
                  <div>
                    <strong>Economically Vulnerable</strong>
                    <span>Families identified under SECC 2011 database</span>
                  </div>
                </div>
                <div className="eligibility-box">
                  <i className="fa-solid fa-infinity text-blue-muted"></i>
                  <div>
                    <strong>No Age Limit</strong>
                    <span>Covers all family members</span>
                  </div>
                </div>
              </div>

              <div className="who-can-apply">
                <h4>Who can apply?</h4>
                <div className="area-boxes">
                  <div className="area-box">
                    <div className="area-icon"><i className="fa-solid fa-tractor blue-icon"></i></div>
                    <div className="area-content">
                      <strong>Rural Areas</strong>
                      <span>Based on deprivation as per SECC 2011 criteria (D1 deprivation and occupational categories)</span>
                      <a href="#" className="view-link">View Rural Categories &rarr;</a>
                    </div>
                  </div>
                  <div className="area-box">
                    <div className="area-icon"><i className="fa-solid fa-city blue-icon"></i></div>
                    <div className="area-content">
                      <strong>Urban Areas</strong>
                      <span>Identified occupational categories of urban poor (as per SECC 2011)</span>
                      <a href="#" className="view-link">View Urban Categories &rarr;</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="key-points">
                <h4>Key Eligibility Points</h4>
                <ul className="check-list">
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Families listed in the SECC 2011 database (deprivation and occupational criteria)</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Economically vulnerable households as per defined criteria</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>No age limit – covers all family members</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Applicable to both rural and urban areas</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Other categories as notified by the Government</span></li>
                </ul>
              </div>

              <div className="docs-required">
                <h4><i className="fa-solid fa-file-lines blue-icon"></i> Documents required to verify eligibility</h4>
                <div className="doc-icons-row">
                  <div className="doc-icon-item"><i className="fa-regular fa-address-card blue-icon"></i><span>Aadhaar<br/>Card</span></div>
                  <div className="doc-icon-item"><i className="fa-solid fa-book blue-icon"></i><span>Ration Card /<br/>SECC 2011 Proof</span></div>
                  <div className="doc-icon-item"><i className="fa-solid fa-id-card-clip blue-icon"></i><span>Family Identity<br/>Document</span></div>
                  <div className="doc-icon-item"><i className="fa-regular fa-folder-open blue-icon"></i><span>Other documents<br/>(as applicable)</span></div>
                </div>
              </div>
            </div>

            <div className="col-side">
              <div className="check-eligibility-card">
                <div className="icon-title">
                  <i className="fa-solid fa-shield-halved blue-icon"></i>
                  <h4>Check Your Eligibility</h4>
                </div>
                <p>Enter basic details to check if you are eligible under PM-JAY.</p>
                <div className="form-group">
                  <label>State</label>
                  <select><option>Select State</option></select>
                </div>
                <div className="form-group">
                  <label>Household Category</label>
                  <select><option>Select Category</option></select>
                </div>
                <div className="form-group">
                  <label>Ration Card Number (Optional)</label>
                  <input type="text" placeholder="Enter ration card number" />
                </div>
                <button className="primary-btn-full">Check Eligibility &rarr;</button>
              </div>
              
              <div className="note-card">
                <div className="note-header">
                  <i className="fa-solid fa-circle-exclamation text-yellow"></i>
                  <strong>Please Note</strong>
                </div>
                <p>This is a preliminary check. Final eligibility will be verified through official government records.</p>
              </div>
            </div>
          </div>
        );
      case 'Benefits':
        return (
          <div className="tab-content benefits-tab">
            <div className="tab-header">
              <div className="icon-title">
                <i className="fa-solid fa-hand-holding-medical blue-icon"></i>
                <h3>Benefits & Entitlements</h3>
              </div>
              <p>Ayushman Bharat PM-JAY provides comprehensive health coverage to eligible families to ensure access to quality healthcare and reduce out-of-pocket expenditure.</p>
            </div>

            <div className="highlight-benefit">
              <div className="hb-left">
                <div className="hb-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="hb-text">
                  <h2>₹5 Lakh</h2>
                  <strong>Annual Health Cover</strong>
                  <p>Per eligible family per year for secondary and tertiary care hospitalization</p>
                </div>
              </div>
              <div className="hb-right">
                <span className="status-badge-lg"><i className="fa-solid fa-circle-check"></i> Cashless Treatment</span>
              </div>
            </div>

            <div className="benefits-grid-box">
              <div className="b-grid-item">
                <i className="fa-solid fa-building-columns blue-icon"></i>
                <div>
                  <strong>Cashless Treatment</strong>
                  <span>At empanelled public and private hospitals</span>
                </div>
              </div>
              <div className="b-grid-item">
                <i className="fa-solid fa-staff-snake blue-icon"></i>
                <div>
                  <strong>Pre-existing Diseases</strong>
                  <span>Covered from day one</span>
                </div>
              </div>
              <div className="b-grid-item">
                <i className="fa-solid fa-bed-pulse blue-icon"></i>
                <div>
                  <strong>Pre and Post Hospitalization</strong>
                  <span>Covers 3 days pre and 15 days post hospitalization</span>
                </div>
              </div>
              <div className="b-grid-item">
                <i className="fa-solid fa-people-group blue-icon"></i>
                <div>
                  <strong>No Cap on Family Size</strong>
                  <span>All members of the family are covered</span>
                </div>
              </div>
              <div className="b-grid-item">
                <i className="fa-solid fa-map-location-dot blue-icon"></i>
                <div>
                  <strong>Nationwide Portability</strong>
                  <span>Valid across all states and union territories</span>
                </div>
              </div>
              <div className="b-grid-item">
                <i className="fa-solid fa-stethoscope blue-icon"></i>
                <div>
                  <strong>Wide Range of Treatments</strong>
                  <span>Covers a large number of medical packages</span>
                </div>
              </div>
            </div>

            <div className="coverage-lists">
              <div className="cov-list">
                <h4><i className="fa-solid fa-circle-check text-green"></i> Covered Costs (Examples)</h4>
                <ul className="cov-ul">
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Surgery and medical management</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Hospitalization and ICU care</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Diagnostic services (lab tests, imaging, etc.)</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Medicines and consumables during hospitalization</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Pre and post hospitalization expenses</span></li>
                  <li><i className="fa-solid fa-circle-check text-green"></i> <span>Complications arising during treatment</span></li>
                </ul>
              </div>
              <div className="cov-list">
                <h4><i className="fa-solid fa-circle-xmark text-red"></i> Not Covered (Examples)</h4>
                <ul className="cov-ul">
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Outpatient consultation (OPD)</span></li>
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Cosmetic or aesthetic procedures</span></li>
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Non-medical expenses (food, transport, etc.)</span></li>
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Treatment outside empanelled hospitals</span></li>
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Experimental or unproven treatments</span></li>
                  <li><i className="fa-solid fa-circle-xmark text-red"></i> <span>Services not included in the package list</span></li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'Coverage':
        return (
          <div className="tab-content coverage-tab">
            <div className="tab-header">
              <div className="icon-title">
                <i className="fa-solid fa-file-contract blue-icon"></i>
                <h3>Coverage & Medical Services</h3>
              </div>
              <p>The scheme covers a wide range of medical treatments, procedures and services at empanelled public and private hospitals across India.</p>
            </div>

            <div className="services-grid-4">
              <div className="service-card-sm">
                <i className="fa-solid fa-scissors blue-icon"></i>
                <div>
                  <strong>Surgery</strong>
                  <span>All major surgeries</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-pills blue-icon"></i>
                <div>
                  <strong>Medical Management</strong>
                  <span>Non-surgical treatment</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-flask-vial blue-icon"></i>
                <div>
                  <strong>Diagnostics</strong>
                  <span>Lab tests, imaging, etc.</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-bed blue-icon"></i>
                <div>
                  <strong>Hospitalization</strong>
                  <span>Room, board and treatment</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-heart-pulse blue-icon"></i>
                <div>
                  <strong>ICU Care</strong>
                  <span>Intensive care services</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-baby blue-icon"></i>
                <div>
                  <strong>Maternity Care</strong>
                  <span>For eligible cases</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-kit-medical blue-icon"></i>
                <div>
                  <strong>Pre & Post Hospitalization</strong>
                  <span>3 days pre, 15 days post</span>
                </div>
              </div>
              <div className="service-card-sm">
                <i className="fa-solid fa-clock blue-icon"></i>
                <div>
                  <strong>Day Care Procedures</strong>
                  <span>As per package list</span>
                </div>
              </div>
            </div>

            <div className="hospitals-banner">
              <div className="hb-left-cov">
                <i className="fa-solid fa-hospital blue-icon big-icon"></i>
                <div>
                  <h4>Empanelled Hospitals</h4>
                  <span>Get treated at 55,000+ empanelled hospitals across India.</span>
                </div>
              </div>
              <div className="hb-stats-cov">
                <div className="hb-stat-box">
                  <i className="fa-solid fa-building text-blue-muted"></i>
                  <div>
                    <strong>25,000+</strong>
                    <span>Public Hospitals<br/>Across all states and UTs</span>
                  </div>
                </div>
                <div className="hb-stat-box">
                  <i className="fa-solid fa-building-user text-blue-muted"></i>
                  <div>
                    <strong>30,000+</strong>
                    <span>Private Hospitals<br/>Across all states and UTs</span>
                  </div>
                </div>
              </div>
              <button className="outline-btn">View Full Hospital List &rarr;</button>
            </div>

            <div className="find-hospitals">
              <h4>Find Empanelled Hospitals</h4>
              <div className="fh-filters">
                <div className="form-group">
                  <label>State</label>
                  <select><option>Select State</option></select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <select><option>Select District</option></select>
                </div>
                <div className="form-group">
                  <label>Specialty</label>
                  <select><option>Select Specialty</option></select>
                </div>
                <button className="primary-btn-fixed">Find Hospitals &rarr;</button>
              </div>
            </div>

            <div className="popular-packages">
              <div className="pp-header">
                <h4>Popular Treatment Packages (Examples)</h4>
                <a href="#" className="view-link">View All Packages &rarr;</a>
              </div>
              <div className="packages-grid">
                <div className="package-card">
                  <div className="pkg-icon text-red"><i className="fa-solid fa-heart"></i></div>
                  <div className="pkg-name">CABG Surgery<br/><span>Heart surgery</span></div>
                  <div className="pkg-price">₹1,44,200<br/><span>Package amount (approx)</span></div>
                </div>
                <div className="package-card">
                  <div className="pkg-icon text-blue"><i className="fa-solid fa-bone"></i></div>
                  <div className="pkg-name">Knee Replacement<br/><span>Orthopedic surgery</span></div>
                  <div className="pkg-price">₹54,720<br/><span>Package amount (approx)</span></div>
                </div>
                <div className="package-card">
                  <div className="pkg-icon text-purple"><i className="fa-solid fa-ribbon"></i></div>
                  <div className="pkg-name">Chemotherapy<br/><span>Cancer treatment</span></div>
                  <div className="pkg-price">₹1,06,000<br/><span>Package amount (approx)</span></div>
                </div>
                <div className="package-card">
                  <div className="pkg-icon text-green"><i className="fa-solid fa-baby"></i></div>
                  <div className="pkg-name">Normal Delivery<br/><span>Maternity care</span></div>
                  <div className="pkg-price">₹12,000<br/><span>Package amount (approx)</span></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Documents':
        return (
          <div className="tab-content layout-2-col">
            <div className="col-main">
              <div className="tab-header">
                <div className="icon-title">
                  <i className="fa-solid fa-file-lines blue-icon"></i>
                  <h3>Required Documents</h3>
                </div>
                <p>Keep the following documents ready before applying for Ayushman Bharat PM-JAY. Documents may vary based on your category and state guidelines.</p>
              </div>

              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Purpose</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="doc-name"><i className="fa-regular fa-address-card red-icon"></i> Aadhaar Card</div></td>
                      <td><div className="doc-purpose"><i className="fa-solid fa-shield-check text-green"></i> Identity verification for all family members</div></td>
                      <td><a href="#" className="view-link">View Sample &rarr;</a></td>
                    </tr>
                    <tr>
                      <td><div className="doc-name"><i className="fa-solid fa-book blue-icon"></i> Ration Card / SECC 2011 Proof</div></td>
                      <td><div className="doc-purpose"><i className="fa-solid fa-shield-check text-green"></i> To establish eligibility (ECONOMIC criteria)</div></td>
                      <td><a href="#" className="view-link">View Sample &rarr;</a></td>
                    </tr>
                    <tr>
                      <td><div className="doc-name"><i className="fa-solid fa-id-card-clip purple-icon"></i> Family Identity Document</div></td>
                      <td><div className="doc-purpose"><i className="fa-solid fa-shield-check text-green"></i> Family details and relationship proof</div></td>
                      <td><a href="#" className="view-link">View Sample &rarr;</a></td>
                    </tr>
                    <tr>
                      <td><div className="doc-name"><i className="fa-solid fa-building-columns text-blue-muted"></i> Bank Account Details <span>(where applicable)</span></div></td>
                      <td><div className="doc-purpose"><i className="fa-solid fa-shield-check text-green"></i> For claim settlement and DBT (if required)</div></td>
                      <td><a href="#" className="view-link">View Sample &rarr;</a></td>
                    </tr>
                    <tr>
                      <td><div className="doc-name"><i className="fa-solid fa-mobile-screen blue-icon"></i> Mobile Number</div></td>
                      <td><div className="doc-purpose"><i className="fa-solid fa-shield-check text-green"></i> For OTP and communication</div></td>
                      <td><a href="#" className="view-link">View Sample &rarr;</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="outline-btn mt-20"><i className="fa-solid fa-download"></i> Download Checklist (PDF)</button>
            </div>

            <div className="col-side">
              <div className="before-apply-card">
                <div className="ba-header">
                  <i className="fa-solid fa-circle-check text-green"></i> <strong>Before You Apply</strong>
                </div>
                <p>Ensure all documents are valid, clear and self-attested.</p>
                <ul className="ba-steps">
                  <li><div className="ba-num">1</div><span>Keep scanned or photocopies ready.</span></li>
                  <li><div className="ba-num">2</div><span>Ensure name, age and family details match across documents.</span></li>
                  <li><div className="ba-num">3</div><span>For rural areas, have your ration card and SECC details ready.</span></li>
                  <li><div className="ba-num">4</div><span>For urban areas, keep occupational category proof (if applicable).</span></li>
                  <li><div className="ba-num">5</div><span>Carry original documents while visiting the help desk for verification.</span></li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'Apply Process':
        return (
          <div className="tab-content process-tab">
            <div className="tab-header">
              <div className="icon-title">
                <i className="fa-solid fa-list-check blue-icon"></i>
                <h3>How to Apply</h3>
              </div>
              <p>Follow these simple steps to apply for Ayushman Bharat PM-JAY and get your Ayushman card.</p>
            </div>

            <div className="process-stepper">
              <div className="p-step">
                <div className="p-num">1</div>
                <h5>Check Eligibility</h5>
                <p>Verify if you are eligible under the scheme using the eligibility criteria or online check.</p>
                <a href="#" className="view-link">Check Eligibility &rarr;</a>
              </div>
              <div className="p-step">
                <div className="p-num">2</div>
                <h5>Visit Help Desk / CSC</h5>
                <p>Visit an Ayushman help desk, Common Service Centre (CSC) or empanelled hospital with required documents.</p>
                <a href="#" className="view-link">Find Help Desk &rarr;</a>
              </div>
              <div className="p-step">
                <div className="p-num">3</div>
                <h5>Verify Identity and Documents</h5>
                <p>Your documents will be verified in the system by the operator.</p>
                <a href="#" className="view-link">Required Documents &rarr;</a>
              </div>
              <div className="p-step">
                <div className="p-num">4</div>
                <h5>Get Ayushman Card</h5>
                <p>Once verified, your Ayushman card will be generated. You can also download the digital card.</p>
                <a href="#" className="view-link">Download Card &rarr;</a>
              </div>
            </div>

            <div className="process-bottom">
              <div className="where-apply">
                <h4><i className="fa-solid fa-location-dot text-green"></i> Where can you apply?</h4>
                <div className="wa-grid">
                  <div className="wa-box">
                    <i className="fa-solid fa-hospital-user blue-icon"></i>
                    <div>
                      <strong>Ayushman Help Desk</strong>
                      <span>At empanelled hospitals</span>
                    </div>
                  </div>
                  <div className="wa-box">
                    <i className="fa-solid fa-desktop blue-icon"></i>
                    <div>
                      <strong>Common Service Centre (CSC)</strong>
                      <span>Across India</span>
                    </div>
                  </div>
                  <div className="wa-box">
                    <i className="fa-solid fa-building-flag blue-icon"></i>
                    <div>
                      <strong>State Health Agency Office</strong>
                      <span>In your state/UT</span>
                    </div>
                  </div>
                  <div className="wa-box">
                    <i className="fa-solid fa-globe blue-icon"></i>
                    <div>
                      <strong>Online (if available in your state)</strong>
                      <span>Through official portal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="assistance-box">
                <div className="ast-icon"><i className="fa-solid fa-headset blue-icon"></i></div>
                <div className="ast-content">
                  <h5>Need assistance?</h5>
                  <p>For any queries related to the application process, contact the helpline or visit the nearest help-desk.</p>
                  <button className="outline-btn">Find Nearby Help Desk &rarr;</button>
                  <div className="helpline">
                    <strong>Helpline: 14555</strong>
                    <span>(Toll-free, 24x7)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'FAQ':
        return (
          <div className="tab-content layout-2-col">
            <div className="col-main">
              <div className="tab-header">
                <div className="icon-title">
                  <i className="fa-solid fa-circle-question blue-icon"></i>
                  <h3>Frequently Asked Questions</h3>
                </div>
                <p>Find answers to common questions about Ayushman Bharat PM-JAY.</p>
              </div>
              
              <div className="search-bar-wrap">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" placeholder="Search questions..." className="search-input" />
              </div>

              <div className="faq-pills">
                <button className="faq-pill active">General</button>
                <button className="faq-pill">Eligibility</button>
                <button className="faq-pill">Benefits</button>
                <button className="faq-pill">Hospitals</button>
                <button className="faq-pill">Ayushman Card</button>
              </div>

              <div className="faq-list">
                <div className="faq-item expanded">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">1</div> <strong>Who is eligible for PM-JAY?</strong></div>
                    <i className="fa-solid fa-minus"></i>
                  </div>
                  <div className="faq-a">
                    Families listed in the SECC 2011 database (as per deprivation and occupational criteria) are eligible. The scheme covers economically vulnerable households in both rural and urban areas. There is no age limit and all family members are covered.
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">2</div> <strong>Is treatment cashless under PM-JAY?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">3</div> <strong>Can I use the Ayushman card outside my state?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">4</div> <strong>Are pre-existing conditions covered?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">5</div> <strong>How can I find an empanelled hospital?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">6</div> <strong>What documents are required to apply?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-q">
                    <div className="q-left"><div className="q-num">7</div> <strong>How do I download my Ayushman card?</strong></div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-side">
              <div className="still-need-help">
                <div className="snh-icon-wrap"><i className="fa-solid fa-headset text-green"></i></div>
                <div className="snh-content">
                  <h4>Still need help?</h4>
                  <p>If you could not find the answer to your question, please contact our support team.</p>
                  <button className="outline-btn-full">Contact Support &rarr;</button>
                  <div className="contact-list">
                    <div className="c-item">
                      <i className="fa-solid fa-phone blue-icon"></i>
                      <div>
                        <strong>Helpline: 14555</strong>
                        <span>(Toll-free, 24x7)</span>
                      </div>
                    </div>
                    <div className="c-item">
                      <i className="fa-solid fa-envelope blue-icon"></i>
                      <div>
                        <strong>pmjay@gov.in</strong>
                        <span>(For general queries)</span>
                      </div>
                    </div>
                    <div className="c-item">
                      <i className="fa-solid fa-location-dot blue-icon"></i>
                      <div>
                        <span>You can also visit the nearest Ayushman help desk or CSC for assistance.</span>
                      </div>
                    </div>
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
        <div className="sd-header-top">
          <button className="back-btn" onClick={() => navigate('/schemes')}>
            <i className="fa-solid fa-arrow-left"></i> Back to Schemes
          </button>
        </div>

        <div className="sd-header-main">
          <div className="sd-title-area">
            <h1 className="sd-title">Ayushman Bharat PM-JAY <span className="status-badge"><i className="fa-solid fa-circle"></i> Active</span></h1>
            <p className="sd-subtitle">Pradhan Mantri Jan Arogya Yojana</p>
          </div>
          <div className="sd-actions">
            <button className="action-btn"><i className="fa-solid fa-share-nodes"></i> Share</button>
            <button className="action-btn"><i className="fa-regular fa-bookmark"></i> Save</button>
            <button className="apply-now-btn-top" onClick={() => navigate(`/dashboard/apply/${scheme.id}`)}>Apply Now &rarr;</button>
          </div>
        </div>

        <div className="sd-tabs">
          {['Overview', 'Eligibility', 'Benefits', 'Coverage', 'Documents', 'Apply Process', 'FAQ'].map((tab) => (
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
    </div>
  );
}
