import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import emailjs from '@emailjs/browser';
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
    const [isPushing, setIsPushing] = useState(false);

    // Permission Modal State for Pushing Data
    const [pushModal, setPushModal] = useState({
        isOpen: false,
        collectionName: '',
        siteName: ''
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Contact Details & Phone Auth State
    const [contactData, setContactData] = useState({
        phoneNumber: '',
        address: ''
    });
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Identity Details State
    const [identityData, setIdentityData] = useState({
        aadhaarNumber: '',
        panNumber: ''
    });
    const [aadhaarVerified, setAadhaarVerified] = useState(false);
    const [panVerified, setPanVerified] = useState(false);
    const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
    
    // OTP states for Aadhaar and PAN
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);
    const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState('');

    const [panOtp, setPanOtp] = useState('');
    const [isPanOtpSent, setIsPanOtpSent] = useState(false);
    const [expectedPanOtp, setExpectedPanOtp] = useState('');

    useEffect(() => {
        if (location.state?.tab) {
            setActiveSidebar(location.state.tab);
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Load initial data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user?.uid) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.personalDetails) setFormData(prev => ({ ...prev, ...data.personalDetails }));
                        if (data.contactDetails) {
                            setContactData(prev => ({ ...prev, ...data.contactDetails }));
                            if (data.contactDetails.phoneVerified) {
                                setPhoneVerified(true);
                            }
                        }
                        if (data.identityDetails) {
                            setIdentityData(prev => ({ ...prev, ...data.identityDetails }));
                            if (data.identityDetails.aadhaarVerified) setAadhaarVerified(true);
                            if (data.identityDetails.panVerified) setPanVerified(true);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                }
            }
        };
        fetchProfileData();
    }, [user]);

    const handleRequestPush = (collectionName, siteName) => {
        setPushModal({
            isOpen: true,
            collectionName,
            siteName
        });
    };

    const handleCancelPush = () => {
        setPushModal({
            isOpen: false,
            collectionName: '',
            siteName: ''
        });
    };

    const handleConfirmPush = async () => {
        if (!pushModal.collectionName) return;
        setIsPushing(true);
        try {
            const payload = {
                userId: user?.uid || 'anonymous',
                personalDetails: formData,
                contactDetails: {
                    ...contactData,
                    phoneVerified
                },
                identityDetails: {
                    ...identityData,
                    aadhaarVerified,
                    panVerified
                },
                timestamp: Date.now()
            };

            await addDoc(collection(db, pushModal.collectionName), payload);
            
            const targetSite = pushModal.siteName;
            setPushModal({ isOpen: false, collectionName: '', siteName: '' });
            alert(`Profile securely submitted to ${targetSite}!`);
        } catch (error) {
            console.error("Error pushing profile:", error);
            alert('Failed to submit profile: ' + error.message);
        } finally {
            setIsPushing(false);
        }
    };

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

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
    };

    const handleSendOTP = async () => {
        if (!auth.currentUser) {
            alert("You must be logged in to verify your phone number!");
            return;
        }
        if (!contactData.phoneNumber || contactData.phoneNumber.length < 10) {
            alert('Please enter a valid phone number with country code (e.g., +919876543210)');
            return;
        }
        setIsVerifyingPhone(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await linkWithPhoneNumber(auth.currentUser, contactData.phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            alert('OTP sent to your phone!');
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP: " + error.message);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setIsVerifyingPhone(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return;
        setIsVerifyingPhone(true);
        try {
            await confirmationResult.confirm(otp);
            setPhoneVerified(true);
            if (user?.uid) {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, { contactDetails: { ...contactData, phoneVerified: true } }, { merge: true });
            }
            alert('Phone Number Verified Successfully!');
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP: " + error.message);
        } finally {
            setIsVerifyingPhone(false);
        }
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!user?.uid) throw new Error("User not found");
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, { contactDetails: { ...contactData, phoneVerified } }, { merge: true });
            alert('Contact details saved successfully!');
        } catch (error) {
            console.error("Error saving contact details:", error);
            alert('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Aadhaar Verhoeff algorithm logic
    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    
    const validateAadhaar = (aadhaar) => {
        if (!/^\d{12}$/.test(aadhaar)) return false;
        let c = 0;
        let invertedArray = aadhaar.split('').reverse().map(Number);
        for (let i = 0; i < invertedArray.length; i++) {
            c = d[c][p[i % 8][invertedArray[i]]];
        }
        return c === 0;
    };

    const [aadhaarLoadingText, setAadhaarLoadingText] = useState("");
    const [panLoadingText, setPanLoadingText] = useState("");

    const sendEmailOTP = async (otp, type) => {
        try {
            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
            
            // If keys are not set up, just log to console for development
            if (!SERVICE_ID || SERVICE_ID === 'YOUR_SERVICE_ID') {
                console.warn(`[DEV MODE] EmailJS not configured. Simulated OTP for ${type} is: ${otp}`);
                return true; // Simulate success
            }

            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    to_email: user?.email,
                    to_name: user?.displayName || formData.firstName || 'User',
                    otp: otp,
                    document_type: type
                },
                PUBLIC_KEY
            );
            return true;
        } catch (error) {
            console.error("EmailJS Error:", error);
            return false;
        }
    };

    const handleVerifyAadhaar = async () => {
        if (!identityData.aadhaarNumber) return;
        setAadhaarLoadingText("Connecting to UIDAI...");
        
        setTimeout(async () => {
            if (validateAadhaar(identityData.aadhaarNumber)) {
                setAadhaarLoadingText("Sending OTP to Email...");
                
                const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
                const emailSent = await sendEmailOTP(generatedOTP, 'Aadhaar');
                
                if (emailSent) {
                    setExpectedAadhaarOtp(generatedOTP);
                    setIsAadhaarOtpSent(true);
                    setAadhaarLoadingText("");
                } else {
                    setAadhaarLoadingText("");
                    alert("Failed to send OTP to your email. Please check your EmailJS configuration.");
                }
            } else {
                setAadhaarLoadingText("");
                alert("Invalid Aadhaar Number! Checksum verification failed.");
            }
        }, 1000);
    };

    const handleSubmitAadhaarOtp = async () => {
        if (!aadhaarOtp) return;
        if (aadhaarOtp === expectedAadhaarOtp) {
            setAadhaarLoadingText("Verifying OTP...");
            setTimeout(async () => {
                setAadhaarVerified(true);
                setIsAadhaarOtpSent(false);
                setAadhaarLoadingText("");
                alert("Aadhaar e-KYC Verified Successfully!");
                if (user?.uid) {
                    const docRef = doc(db, 'users', user.uid);
                    await setDoc(docRef, { identityDetails: { ...identityData, aadhaarVerified: true, panVerified } }, { merge: true });
                }
            }, 1000);
        } else {
            alert("Verification cancelled or invalid OTP.");
        }
    };

    const handleVerifyPan = async () => {
        if (!identityData.panNumber) return;
        setPanLoadingText("Connecting to NSDL...");
        setTimeout(async () => {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (panRegex.test(identityData.panNumber.toUpperCase())) {
                setPanLoadingText("Sending OTP to Email...");
                
                const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
                const emailSent = await sendEmailOTP(generatedOTP, 'PAN');

                if (emailSent) {
                    setExpectedPanOtp(generatedOTP);
                    setIsPanOtpSent(true);
                    setPanLoadingText("");
                } else {
                    setPanLoadingText("");
                    alert("Failed to send OTP to your email. Please check your EmailJS configuration.");
                }
            } else {
                setPanLoadingText("");
                alert("Invalid PAN Card Number format! Must be 5 Letters, 4 Numbers, 1 Letter.");
            }
        }, 1000);
    };

    const handleSubmitPanOtp = async () => {
        if (!panOtp) return;
        if (panOtp === expectedPanOtp) {
            setPanLoadingText("Fetching PAN Details...");
            setTimeout(async () => {
                setPanVerified(true);
                setIsPanOtpSent(false);
                setPanLoadingText("");
                alert("PAN Card Verified Successfully!");
                if (user?.uid) {
                    const docRef = doc(db, 'users', user.uid);
                    await setDoc(docRef, { identityDetails: { ...identityData, panVerified: true, aadhaarVerified } }, { merge: true });
                }
            }, 1200);
        } else {
            alert("Verification cancelled or invalid OTP.");
        }
    };
    
    const handleSaveIdentity = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!user?.uid) throw new Error("User not found");
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, { identityDetails: { ...identityData, aadhaarVerified, panVerified } }, { merge: true });
            alert('Identity details saved successfully!');
        } catch (error) {
            console.error("Error saving identity details:", error);
            alert('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            alert("New passwords do not match!");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert("Password should be at least 6 characters.");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not logged in");
            
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Update password
            await updatePassword(currentUser, passwordData.newPassword);
            alert("Password updated successfully!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
                alert('Current password is incorrect.');
            } else {
                alert('Failed to update password: ' + error.message);
            }
        } finally {
            setIsUpdatingPassword(false);
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
                            <form id="ui-profile-form" onSubmit={handleChangePassword} style={{ maxWidth: '500px', width: '100%', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                <h3 style={{ marginBottom: '30px', color: '#1e293b', fontSize: '1.5rem', textAlign: 'center' }}>Change Password</h3>
                                
                                <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                                    <div className="ui-input-group">
                                        <label>Current Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-lock"></i>
                                            <input type={showCurrentPassword ? "text" : "password"} required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                                            <i className={`fa-solid ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ cursor: 'pointer', margin: 0, paddingLeft: '10px', color: '#94a3b8' }}></i>
                                        </div>
                                    </div>
                                    <div className="ui-input-group">
                                        <label>New Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-key"></i>
                                            <input type={showNewPassword ? "text" : "password"} required value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                                            <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowNewPassword(!showNewPassword)} style={{ cursor: 'pointer', margin: 0, paddingLeft: '10px', color: '#94a3b8' }}></i>
                                        </div>
                                    </div>
                                    <div className="ui-input-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-wrapper">
                                            <i className="fa-solid fa-key"></i>
                                            <input type={showConfirmPassword ? "text" : "password"} required value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} />
                                            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer', margin: 0, paddingLeft: '10px', color: '#94a3b8' }}></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-form-footer" style={{ marginTop: '30px', paddingTop: '0' }}>
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isUpdatingPassword}>{isUpdatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}</button>
                                </div>
                            </form>
                        </div>
                    ) : activeTab === 'PERSONAL_DETAILS' && activeSidebar === 'PERSONAL_DETAILS' ? (
                    <div className="profile-form-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>Personal Details</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href="/mock-b" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site B</a>
                                    <a href="/mock-c" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site C</a>
                                    <a href="/mock-d" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site D</a>
                                </div>
                                <div className="submit-dropdown-container">
                                    <button type="button" disabled={isPushing} style={{ background: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {isPushing ? 'SUBMITTING...' : <><i className="fa-solid fa-paper-plane"></i> PUSH DATA OPTIONS <i className="fa-solid fa-chevron-down" style={{fontSize: '0.8em', marginLeft: '5px'}}></i></>}
                                    </button>
                                    <div className="submit-dropdown-content">
                                        <button type="button" onClick={() => handleRequestPush('mock_site_b', 'Site B')}><i className="fa-solid fa-globe"></i> Push to Site B</button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                    ) : activeTab === 'CONTACT_DETAILS' && activeSidebar === 'CONTACT_DETAILS' ? (
                        <div className="profile-form-wrapper">
                            <form id="ui-profile-form" onSubmit={handleSaveContact}>
                                <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    
                                    <div className="ui-input-group">
                                        <label>Phone Number (with country code)</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div className="input-wrapper" style={{ flex: 1, border: phoneVerified ? '1px solid #22c55e' : '' }}>
                                                <i className="fa-solid fa-phone" style={{ color: phoneVerified ? '#22c55e' : '' }}></i>
                                                <input type="text" placeholder="+919876543210" value={contactData.phoneNumber} onChange={e => setContactData({...contactData, phoneNumber: e.target.value})} disabled={phoneVerified || isOtpSent} />
                                            </div>
                                            {!phoneVerified && !isOtpSent && (
                                                <button type="button" className="btn-primary" onClick={handleSendOTP} disabled={isVerifyingPhone} style={{ whiteSpace: 'nowrap' }}>
                                                    {isVerifyingPhone ? 'SENDING...' : 'VERIFY PHONE'}
                                                </button>
                                            )}
                                            {phoneVerified && (
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0 15px', borderRadius: '6px', fontWeight: '600' }}>
                                                    <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> VERIFIED
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isOtpSent && !phoneVerified && (
                                        <div className="ui-input-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}>
                                            <label style={{ color: '#2563eb' }}>Enter 6-Digit OTP</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div className="input-wrapper" style={{ flex: 1 }}>
                                                    <i className="fa-solid fa-key"></i>
                                                    <input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} />
                                                </div>
                                                <button type="button" className="btn-primary" onClick={handleVerifyOTP} disabled={isVerifyingPhone}>
                                                    {isVerifyingPhone ? 'VERIFYING...' : 'SUBMIT OTP'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="ui-input-group" style={{ marginTop: '20px' }}>
                                        <label>Full Residential Address</label>
                                        <div className="input-wrapper" style={{ height: 'auto', alignItems: 'flex-start' }}>
                                            <i className="fa-solid fa-map-location-dot" style={{ marginTop: '14px' }}></i>
                                            <textarea rows="4" style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', width: '100%', resize: 'vertical', background: 'transparent' }} placeholder="Enter your full address" value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})}></textarea>
                                        </div>
                                    </div>

                                </div>
                                
                                <div id="recaptcha-container"></div>

                                <div className="profile-form-footer">
                                    <button type="submit" className="btn-primary" disabled={isSaving}>
                                        {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : activeTab === 'IDENTITY' ? (
                        <div className="profile-form-wrapper">
                            <form id="ui-profile-form" onSubmit={handleSaveIdentity}>
                                <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
                                    
                                    <div className="ui-input-group">
                                        <label>Aadhaar Card Number</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div className="input-wrapper" style={{ flex: 1, border: aadhaarVerified ? '1px solid #22c55e' : '' }}>
                                                <i className="fa-solid fa-id-card" style={{ color: aadhaarVerified ? '#22c55e' : '' }}></i>
                                                <input type="text" placeholder="12 Digit Aadhaar Number" value={identityData.aadhaarNumber} onChange={e => setIdentityData({...identityData, aadhaarNumber: e.target.value})} disabled={aadhaarVerified} maxLength="12" />
                                            </div>
                                            {!aadhaarVerified && !isAadhaarOtpSent && (
                                                <button type="button" className="btn-primary" onClick={handleVerifyAadhaar} disabled={aadhaarLoadingText !== ""} style={{ whiteSpace: 'nowrap' }}>
                                                    {aadhaarLoadingText !== "" ? aadhaarLoadingText : 'VERIFY AADHAAR'}
                                                </button>
                                            )}
                                            {aadhaarVerified && (
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0 15px', borderRadius: '6px', fontWeight: '600' }}>
                                                    <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> VERIFIED
                                                </div>
                                            )}
                                        </div>
                                        <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>We will send an OTP to your email for e-KYC.</small>
                                    </div>

                                    {isAadhaarOtpSent && !aadhaarVerified && (
                                        <div className="ui-input-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '-10px', marginBottom: '20px' }}>
                                            <label style={{ color: '#2563eb' }}>Enter 6-Digit OTP sent to your email</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div className="input-wrapper" style={{ flex: 1 }}>
                                                    <i className="fa-solid fa-key"></i>
                                                    <input type="text" placeholder="123456" value={aadhaarOtp} onChange={e => setAadhaarOtp(e.target.value)} />
                                                </div>
                                                <button type="button" className="btn-primary" onClick={handleSubmitAadhaarOtp} disabled={aadhaarLoadingText !== ""}>
                                                    {aadhaarLoadingText !== "" ? 'VERIFYING...' : 'SUBMIT OTP'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="ui-input-group">
                                        <label>PAN Card Number</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div className="input-wrapper" style={{ flex: 1, border: panVerified ? '1px solid #22c55e' : '' }}>
                                                <i className="fa-solid fa-address-card" style={{ color: panVerified ? '#22c55e' : '' }}></i>
                                                <input type="text" placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} value={identityData.panNumber} onChange={e => setIdentityData({...identityData, panNumber: e.target.value.toUpperCase()})} disabled={panVerified} maxLength="10" />
                                            </div>
                                            {!panVerified && !isPanOtpSent && (
                                                <button type="button" className="btn-primary" onClick={handleVerifyPan} disabled={panLoadingText !== ""} style={{ whiteSpace: 'nowrap' }}>
                                                    {panLoadingText !== "" ? panLoadingText : 'VERIFY PAN'}
                                                </button>
                                            )}
                                            {panVerified && (
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0 15px', borderRadius: '6px', fontWeight: '600' }}>
                                                    <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> VERIFIED
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isPanOtpSent && !panVerified && (
                                        <div className="ui-input-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '-10px' }}>
                                            <label style={{ color: '#2563eb' }}>Enter 6-Digit OTP sent to your email</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div className="input-wrapper" style={{ flex: 1 }}>
                                                    <i className="fa-solid fa-key"></i>
                                                    <input type="text" placeholder="123456" value={panOtp} onChange={e => setPanOtp(e.target.value)} />
                                                </div>
                                                <button type="button" className="btn-primary" onClick={handleSubmitPanOtp} disabled={panLoadingText !== ""}>
                                                    {panLoadingText !== "" ? 'VERIFYING...' : 'SUBMIT OTP'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="profile-form-footer" style={{ marginTop: '40px' }}>
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

            {/* Permission Pop-up Confirmation Modal */}
            {pushModal.isOpen && (
                <div 
                    className="modal-overlay active" 
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isPushing) {
                            handleCancelPush();
                        }
                    }}
                >
                    <div 
                        className="modal" 
                        style={{ 
                            maxWidth: '480px', 
                            width: '100%', 
                            padding: 0, 
                            borderRadius: '16px', 
                            backgroundColor: '#ffffff',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            animation: 'modalSlideUp 0.25s ease-out'
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', 
                            color: 'white', 
                            padding: '18px 24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    background: 'rgba(255, 255, 255, 0.2)', 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '1.1rem' 
                                }}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'white' }}>Data Sharing Permission</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>Security & Consent Verification</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                disabled={isPushing}
                                onClick={handleCancelPush} 
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'rgba(255,255,255,0.85)', 
                                    fontSize: '1.2rem', 
                                    cursor: isPushing ? 'not-allowed' : 'pointer', 
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Close"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ 
                                    background: '#eff6ff', 
                                    color: '#2563eb', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    fontSize: '1.4rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0 
                                }}>
                                    <i className="fa-solid fa-circle-question"></i>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: 600 }}>
                                        Submit Data to {pushModal.siteName}?
                                    </h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.5' }}>
                                        Do you really want to submit and sync your profile data with <strong>{pushModal.siteName}</strong>?
                                    </p>
                                </div>
                            </div>

                            {/* Data Summary Card */}
                            <div style={{ 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '10px', 
                                padding: '14px 16px', 
                                marginBottom: '24px', 
                                fontSize: '0.85rem', 
                                color: '#475569' 
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-list-check" style={{ color: '#2563eb' }}></i> Details to be transferred:
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-user" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                        <span><strong>Name:</strong> {formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-envelope" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                        <span><strong>Email:</strong> {formData.officialEmail || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-phone" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                        <span><strong>Phone:</strong> {phoneVerified ? 'Verified' : 'Unverified'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-id-card" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                        <span><strong>KYC:</strong> {aadhaarVerified || panVerified ? 'Verified' : 'Pending'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons: Yes / No */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    disabled={isPushing}
                                    onClick={handleCancelPush}
                                    style={{ 
                                        padding: '10px 22px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1', 
                                        background: '#f1f5f9', 
                                        color: '#475569', 
                                        fontWeight: '600', 
                                        fontSize: '0.9rem',
                                        cursor: isPushing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => !isPushing && (e.currentTarget.style.background = '#e2e8f0')}
                                    onMouseOut={(e) => !isPushing && (e.currentTarget.style.background = '#f1f5f9')}
                                >
                                    <i className="fa-solid fa-xmark"></i> No
                                </button>
                                <button 
                                    type="button" 
                                    disabled={isPushing}
                                    onClick={handleConfirmPush}
                                    style={{ 
                                        padding: '10px 26px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        background: isPushing ? '#93c5fd' : '#2563eb', 
                                        color: 'white', 
                                        fontWeight: '600', 
                                        fontSize: '0.9rem',
                                        cursor: isPushing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => !isPushing && (e.currentTarget.style.background = '#1d4ed8')}
                                    onMouseOut={(e) => !isPushing && (e.currentTarget.style.background = '#2563eb')}
                                >
                                    {isPushing ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check"></i> Yes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
