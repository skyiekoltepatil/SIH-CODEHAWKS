import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';
import './Profile.css';

export default function Profile() {
    const [activeSidebar, setActiveSidebar] = useState('PERSONAL_DETAILS');
    const [activeTab, setActiveTab] = useState('PERSONAL_DETAILS');
    const location = useLocation();
    const { user } = useContext(AuthContext);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        officialEmail: '',
        admissionCategory: '',
        caste: '',
        subCaste: '',
        nationality: '',
        domicile: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveSidebar(location.state.tab);
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Fetch existing data on mount
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user?.uid) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData(prev => ({ ...prev, ...data.personalDetails }));
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                }
            }
        };
        fetchProfileData();
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!user?.uid) throw new Error("User not found");
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, { personalDetails: formData }, { merge: true });
            alert('Profile saved successfully!');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert('Failed to save profile: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div id="profile">
            <div className="profile-ui-container">
                {/* Left Sidebar */}
                <aside className="profile-sidebar">
                    <button className={`profile-nav-btn ${activeSidebar === 'PERSONAL_DETAILS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('PERSONAL_DETAILS'); setActiveTab('PERSONAL_DETAILS'); }}><i className="fa-solid fa-user"></i> PERSONAL DETAILS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'CONTACT_DETAILS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('CONTACT_DETAILS'); setActiveTab('CONTACT_DETAILS'); }}><i className="fa-solid fa-phone"></i> CONTACT DETAILS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'FAMILY_DETAILS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('FAMILY_DETAILS'); setActiveTab('FAMILY_DETAILS'); }}><i className="fa-solid fa-users"></i> FAMILY DETAILS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'EDUCATION_DETAILS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('EDUCATION_DETAILS'); setActiveTab('EDUCATION_DETAILS'); }}><i className="fa-solid fa-graduation-cap"></i> EDUCATION DETAILS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'BANK_DETAILS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('BANK_DETAILS'); setActiveTab('BANK_DETAILS'); }}><i className="fa-solid fa-building-columns"></i> BANK DETAILS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'UPLOAD_DOCUMENTS' ? 'active' : ''}`} onClick={() => { setActiveSidebar('UPLOAD_DOCUMENTS'); setActiveTab('UPLOAD_DOCUMENTS'); }}><i className="fa-solid fa-upload"></i> UPLOAD DOCUMENTS</button>
                    <button className={`profile-nav-btn ${activeSidebar === 'CHANGE_PASSWORD' ? 'active' : ''}`} onClick={() => { setActiveSidebar('CHANGE_PASSWORD'); setActiveTab('CHANGE_PASSWORD'); }}><i className="fa-solid fa-lock"></i> CHANGE PASSWORD</button>
                </aside>

                {/* Right Content Area */}
                <main className="profile-content-area">
                    {/* Horizontal Tabs */}
                    {activeSidebar !== 'CHANGE_PASSWORD' && (
                    <div className="profile-top-tabs">
                        <button className={`profile-top-tab-btn ${activeTab === 'PERSONAL_DETAILS' ? 'active' : ''}`} onClick={() => setActiveTab('PERSONAL_DETAILS')}>PERSONAL DETAILS</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'IDENTITY' ? 'active' : ''}`} onClick={() => setActiveTab('IDENTITY')}>IDENTITY</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'RELIGION' ? 'active' : ''}`} onClick={() => setActiveTab('RELIGION')}>RELIGION</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'PHYSICALLY_HANDICAPPED' ? 'active' : ''}`} onClick={() => setActiveTab('PHYSICALLY_HANDICAPPED')}>PHYSICALLY HANDICAPPED</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'MINORITY_DETAILS' ? 'active' : ''}`} onClick={() => setActiveTab('MINORITY_DETAILS')}>MINORITY DETAILS</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'PASSPORT_DETAILS' ? 'active' : ''}`} onClick={() => setActiveTab('PASSPORT_DETAILS')}>PASSPORT DETAILS</button>
                        <button className={`profile-top-tab-btn ${activeTab === 'EXAMINATION_DETAILS' ? 'active' : ''}`} onClick={() => setActiveTab('EXAMINATION_DETAILS')}>EXAMINATION DETAILS</button>
                    </div>
                    )}

                    {/* Form Content */}
                    {activeSidebar === 'CHANGE_PASSWORD' ? (
                        <div className="profile-form-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <form id="ui-profile-form" onSubmit={(e) => { e.preventDefault(); alert('Password updated successfully!'); }} style={{ maxWidth: '500px', width: '100%', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                <h3 style={{ marginBottom: '30px', color: '#1e293b', fontSize: '1.5rem', textAlign: 'center' }}>Change Password</h3>
                                
                                <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                                    <div className="ui-input-group">
                                        <label>Current Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-lock"></i>
                                            <input type="password" />
                                        </div>
                                    </div>
                                    <div className="ui-input-group">
                                        <label>New Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-key"></i>
                                            <input type="password" />
                                        </div>
                                    </div>
                                    <div className="ui-input-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-key"></i>
                                            <input type="password" />
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-form-footer" style={{ marginTop: '30px', paddingTop: '0' }}>
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>UPDATE PASSWORD</button>
                                </div>
                            </form>
                        </div>
                    ) : activeTab === 'PERSONAL_DETAILS' && activeSidebar === 'PERSONAL_DETAILS' ? (
                    <div className="profile-form-wrapper">
                        <form id="ui-profile-form" onSubmit={handleSave}>
                            <div className="ui-form-grid">
                                <div className="ui-input-group">
                                    <label>First Name</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-pen"></i>
                                        <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Middle Name</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-pen"></i>
                                        <input type="text" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Last Name</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-pen"></i>
                                        <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Official Email</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-envelope"></i>
                                        <input type="text" value={formData.officialEmail} onChange={e => setFormData({...formData, officialEmail: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Student Admission Main Category</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-list"></i>
                                        <input type="text" value={formData.admissionCategory} onChange={e => setFormData({...formData, admissionCategory: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Caste</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-list"></i>
                                        <input type="text" value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Sub Cast</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-list"></i>
                                        <input type="text" value={formData.subCaste} onChange={e => setFormData({...formData, subCaste: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Nationality</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-flag"></i>
                                        <input type="text" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Domicile</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-home"></i>
                                        <input type="text" value={formData.domicile} onChange={e => setFormData({...formData, domicile: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Mobile Number</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-phone"></i>
                                        <input type="tel" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Birth Place</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-map-marker-alt"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Birth Country</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-globe"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Birth State</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-map"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Birth District</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-map-pin"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Native Place</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-home"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Native Country</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-globe"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Native State</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-map"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Native District</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-map-pin"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Primary_Email (Personal)</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-envelope"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Alternate_Email</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-envelope"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Blood Group</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-tint"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                            </div>

                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Earning Parent Name</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-user-tie"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Earning Parent Relation</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-users"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="ui-input-group">
                                    <label>Career Choice</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-briefcase"></i>
                                        <input type="text" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                                <div className="ui-input-group">
                                    <label>Alumni Institute</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-graduation-cap"></i>
                                        <input type="text" value={formData.alumniInstitute || ''} onChange={e => setFormData({...formData, alumniInstitute: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="profile-form-footer">
                                <button type="submit" className="btn-primary" disabled={isSaving}>
                                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                                </button>
                            </div>
                        </form>
                    </div>
                    ) : (
                        <div className="profile-form-wrapper" style={{ minHeight: '500px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Blank Page for {activeTab.replace(/_/g, ' ')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
