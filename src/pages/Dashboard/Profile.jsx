import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { uploadDocument } from '../../utils/fileUpload';
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
    domicile: '',
    mobileNumber: '',
    birthPlace: '',
    birthCountry: '',
    birthState: '',
    birthDistrict: '',
    nativePlace: '',
    nativeCountry: '',
    nativeState: '',
    nativeDistrict: '',
    primaryEmail: '',
    alternateEmail: '',
    bloodGroup: '',
    parentName: '',
    parentRelation: '',
    careerChoice: '',
    alumniInstitute: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Permission Modal State for Pushing Data
  const [pushModal, setPushModal] = useState({
    isOpen: false,
    collectionName: '',
    siteName: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Contact Details & Phone Auth State
  const [contactData, setContactData] = useState({
    phoneNumber: '',
    address: '',
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Identity Details State
  const [identityData, setIdentityData] = useState({
    aadhaarNumber: '',
    panNumber: '',
  });
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // OTP states for Aadhaar and PAN
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);
  const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState('');

  const [panOtp, setPanOtp] = useState('');
  const [isPanOtpSent, setIsPanOtpSent] = useState(false);
  const [expectedPanOtp, setExpectedPanOtp] = useState('');

  // Uploaded Documents State
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaar: null,
    pan: null,
    income: null,
    passbook: null,
    photo: null,
  });

  const [docModal, setDocModal] = useState({ isOpen: false, type: null });
  const [docFormData, setDocFormData] = useState({ file: null, docName: '', subjectText: '' });

  // Profile Lock State
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [isLockingProfile, setIsLockingProfile] = useState(false);

  const openDocModal = (type) => {
    const existing = uploadedFiles[type];
    setDocModal({ isOpen: true, type });
    setDocFormData({
      file: null,
      docName: existing?.docName || '',
      subjectText: existing?.subjectText || '',
    });
  };

  const closeDocModal = () => {
    setDocModal({ isOpen: false, type: null });
  };

  const handleDocFormChange = (e, field) => {
    if (field === 'file') {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 10 * 1024 * 1024) {
          alert('Warning: File size exceeds 10MB limit. Please upload a smaller file.');
          return;
        }
        setDocFormData((prev) => ({ ...prev, file }));
      }
    } else {
      setDocFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleSaveDocModal = () => {
    const type = docModal.type;
    const existing = uploadedFiles[type] || {};

    const updatedDoc = {
      ...existing,
      docName: docFormData.docName,
      subjectText: docFormData.subjectText,
    };

    if (docFormData.file) {
      updatedDoc.file = docFormData.file;
    }

    setUploadedFiles((prev) => ({ ...prev, [type]: updatedDoc }));
    closeDocModal();
  };

  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const handleUploadAllDocuments = async () => {
    if (!user?.uid) return;

    setIsUploadingDocs(true);
    try {
      const newDocUrls = {};

      // Loop through uploadedFiles and upload any new File objects with multi-tier storage
      for (const [docType, docObj] of Object.entries(uploadedFiles)) {
        if (!docObj) continue;

        if (docObj.file instanceof File) {
          const fileObj = docObj.file;
          const uploaded = await uploadDocument(fileObj);

          newDocUrls[docType] = {
            name: fileObj.name,
            url: uploaded.url,
            size: fileObj.size,
            docName: docObj.docName || '',
            subjectText: docObj.subjectText || '',
          };
        } else if (docObj.url) {
          newDocUrls[docType] = docObj;
        }
      }

      // Save references to Firestore
      await setDoc(doc(db, 'users', user.uid), { documents: newDocUrls }, { merge: true });

      // Update local state to be the URL objects instead of File objects
      setUploadedFiles((prev) => ({ ...prev, ...newDocUrls }));
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Error uploading documents: ', error);
      alert(`Document upload issue: ${error.message || 'Please try again'}`);
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const handleLockProfile = async () => {
    if (
      !window.confirm(
        'Are you sure you want to lock your profile? You will not be able to edit any details after locking.'
      )
    ) {
      return;
    }
    setIsLockingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { isProfileLocked: true }, { merge: true });
      setIsProfileLocked(true);
      alert('Profile successfully locked and verified!');
    } catch (error) {
      console.error('Error locking profile:', error);
      alert('Failed to lock profile. Please try again.');
    } finally {
      setIsLockingProfile(false);
    }
  };

  const handleUnlockProfile = async () => {
    if (
      !window.confirm(
        'Are you sure you want to unlock your profile? You will be able to edit your details again.'
      )
    ) {
      return;
    }
    setIsLockingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { isProfileLocked: false }, { merge: true });
      setIsProfileLocked(false);
      alert('Profile successfully unlocked!');
    } catch (error) {
      console.error('Error unlocking profile:', error);
      alert('Failed to unlock profile. Please try again.');
    } finally {
      setIsLockingProfile(false);
    }
  };

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
            if (data.personalDetails) setFormData((prev) => ({ ...prev, ...data.personalDetails }));
            if (data.contactDetails) {
              setContactData((prev) => ({ ...prev, ...data.contactDetails }));
              if (data.contactDetails.phoneVerified) {
                setPhoneVerified(true);
              }
            }
            if (data.identityDetails) {
              setIdentityData((prev) => ({ ...prev, ...data.identityDetails }));
              if (data.identityDetails.aadhaarVerified) setAadhaarVerified(true);
              if (data.identityDetails.panVerified) setPanVerified(true);
            }
            if (data.documents) {
              setUploadedFiles((prev) => ({ ...prev, ...data.documents }));
            }
            if (data.isProfileLocked) {
              setIsProfileLocked(true);
            }
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const handleRequestPush = (collectionName, siteName) => {
    setPushModal({
      isOpen: true,
      collectionName,
      siteName,
    });
  };

  const handleCancelPush = () => {
    setPushModal({
      isOpen: false,
      collectionName: '',
      siteName: '',
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
          phoneVerified,
        },
        identityDetails: {
          ...identityData,
          aadhaarVerified,
          panVerified,
        },
        documents: uploadedFiles,
        timestamp: Date.now(),
      };

      await addDoc(collection(db, pushModal.collectionName), payload);

      const targetSite = pushModal.siteName;
      setPushModal({ isOpen: false, collectionName: '', siteName: '' });
      alert(`Profile securely submitted to ${targetSite}!`);
    } catch (error) {
      console.error('Error pushing profile:', error);
      alert('Failed to submit profile: ' + error.message);
    } finally {
      setIsPushing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user?.uid) throw new Error('User not found');
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { personalDetails: formData }, { merge: true });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    const userEmail = auth.currentUser?.email || user?.email || formData.officialEmail;
    if (!userEmail) {
      alert('No registered email found for this account. Please ensure you are logged in.');
      return;
    }

    const confirmSend = window.confirm(`Send password reset email to ${userEmail}?`);
    if (!confirmSend) return;

    try {
      await sendPasswordResetEmail(auth, userEmail);
      alert(
        `Password reset link has been sent to ${userEmail}.\n\nPlease check your Gmail inbox (and spam folder) to set your new password.`
      );
    } catch (err) {
      console.error('Error sending password reset email:', err);
      alert('Failed to send reset email: ' + err.message.replace('Firebase: ', ''));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password should be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-login-credentials'
      ) {
        alert('Current password is incorrect.');
      } else {
        alert('Failed to update password: ' + error.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };



  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user?.uid) throw new Error('User not found');
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { contactDetails: { ...contactData, phoneVerified } }, { merge: true });
      alert('Contact details saved successfully!');
    } catch (error) {
      console.error('Error saving contact details:', error);
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
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
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

  const [aadhaarLoadingText, setAadhaarLoadingText] = useState('');
  const [panLoadingText, setPanLoadingText] = useState('');

  const sendEmailOTP = async (otp, type) => {
    // Simulated OTP without EmailJS
    console.warn(`[DEV MODE] Simulated OTP for ${type} is: ${otp}`);
    return true;
  };

  const handleVerifyAadhaar = async () => {
    if (!identityData.aadhaarNumber) return;
    setAadhaarLoadingText('Connecting to UIDAI...');

    setTimeout(async () => {
      if (validateAadhaar(identityData.aadhaarNumber)) {
        setAadhaarLoadingText('Sending OTP to Email...');

        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailSent = await sendEmailOTP(generatedOTP, 'Aadhaar');

        if (emailSent) {
          setExpectedAadhaarOtp(generatedOTP);
          setIsAadhaarOtpSent(true);
          setAadhaarLoadingText('');
        } else {
          setAadhaarLoadingText('');
          alert('Failed to send OTP to your email. Please check your EmailJS configuration.');
        }
      } else {
        setAadhaarLoadingText('');
        alert('Invalid Aadhaar Number! Checksum verification failed.');
      }
    }, 1000);
  };

  const handleSubmitAadhaarOtp = async () => {
    if (!aadhaarOtp) return;
    if (aadhaarOtp === expectedAadhaarOtp) {
      setAadhaarLoadingText('Verifying OTP...');
      setTimeout(async () => {
        setAadhaarVerified(true);
        setIsAadhaarOtpSent(false);
        setAadhaarLoadingText('');
        alert('Aadhaar e-KYC Verified Successfully!');
        if (user?.uid) {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(
            docRef,
            { identityDetails: { ...identityData, aadhaarVerified: true, panVerified } },
            { merge: true }
          );
        }
      }, 1000);
    } else {
      alert('Verification cancelled or invalid OTP.');
    }
  };

  const handleVerifyPan = async () => {
    if (!identityData.panNumber) return;
    setPanLoadingText('Connecting to NSDL...');
    setTimeout(async () => {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (panRegex.test(identityData.panNumber.toUpperCase())) {
        setPanLoadingText('Sending OTP to Email...');

        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailSent = await sendEmailOTP(generatedOTP, 'PAN');

        if (emailSent) {
          setExpectedPanOtp(generatedOTP);
          setIsPanOtpSent(true);
          setPanLoadingText('');
        } else {
          setPanLoadingText('');
          alert('Failed to send OTP to your email. Please check your EmailJS configuration.');
        }
      } else {
        setPanLoadingText('');
        alert('Invalid PAN Card Number format! Must be 5 Letters, 4 Numbers, 1 Letter.');
      }
    }, 1000);
  };

  const handleSubmitPanOtp = async () => {
    if (!panOtp) return;
    if (panOtp === expectedPanOtp) {
      setPanLoadingText('Fetching PAN Details...');
      setTimeout(async () => {
        setPanVerified(true);
        setIsPanOtpSent(false);
        setPanLoadingText('');
        alert('PAN Card Verified Successfully!');
        if (user?.uid) {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(
            docRef,
            { identityDetails: { ...identityData, panVerified: true, aadhaarVerified } },
            { merge: true }
          );
        }
      }, 1200);
    } else {
      alert('Verification cancelled or invalid OTP.');
    }
  };

  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user?.uid) throw new Error('User not found');
      const docRef = doc(db, 'users', user.uid);
      await setDoc(
        docRef,
        { identityDetails: { ...identityData, aadhaarVerified, panVerified } },
        { merge: true }
      );
      alert('Identity details saved successfully!');
    } catch (error) {
      console.error('Error saving identity details:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile">
      <div className="profile-ui-container">
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <button
            className={`profile-nav-btn ${activeSidebar === 'PERSONAL_DETAILS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('PERSONAL_DETAILS');
              setActiveTab('PERSONAL_DETAILS');
            }}
          >
            <i className="fa-solid fa-user"></i> PERSONAL DETAILS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'CONTACT_DETAILS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('CONTACT_DETAILS');
              setActiveTab('CONTACT_DETAILS');
            }}
          >
            <i className="fa-solid fa-phone"></i> CONTACT DETAILS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'FAMILY_DETAILS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('FAMILY_DETAILS');
              setActiveTab('FAMILY_DETAILS');
            }}
          >
            <i className="fa-solid fa-users"></i> FAMILY DETAILS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'EDUCATION_DETAILS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('EDUCATION_DETAILS');
              setActiveTab('EDUCATION_DETAILS');
            }}
          >
            <i className="fa-solid fa-graduation-cap"></i> EDUCATION DETAILS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'BANK_DETAILS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('BANK_DETAILS');
              setActiveTab('BANK_DETAILS');
            }}
          >
            <i className="fa-solid fa-building-columns"></i> BANK DETAILS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'UPLOAD_DOCUMENTS' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('UPLOAD_DOCUMENTS');
              setActiveTab('UPLOAD_DOCUMENTS');
            }}
          >
            <i className="fa-solid fa-upload"></i> UPLOAD DOCUMENTS
          </button>
          <button
            className={`profile-nav-btn ${activeSidebar === 'CHANGE_PASSWORD' ? 'active' : ''}`}
            onClick={() => {
              setActiveSidebar('CHANGE_PASSWORD');
              setActiveTab('CHANGE_PASSWORD');
            }}
          >
            <i className="fa-solid fa-lock"></i> CHANGE PASSWORD
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="profile-content-area">
          {/* Lock Profile Banner */}
          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              background: isProfileLocked ? '#dcfce7' : '#fef3c7',
              borderRadius: '8px',
              border: `1px solid ${isProfileLocked ? '#86efac' : '#fde68a'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: isProfileLocked ? '#166534' : '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isProfileLocked ? (
                  <>
                    <i className="fa-solid fa-lock"></i> Profile Locked & Finalized
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock-open"></i> Profile Unlocked
                  </>
                )}
              </h3>
              <p
                style={{
                  margin: '5px 0 0 0',
                  color: isProfileLocked ? '#15803d' : '#b45309',
                  fontSize: '0.9rem',
                }}
              >
                {isProfileLocked
                  ? 'Your profile is locked for verification and cannot be edited.'
                  : 'Lock your profile when you have finished entering your details.'}
              </p>
            </div>
            {isProfileLocked ? (
              <button
                onClick={handleUnlockProfile}
                disabled={isLockingProfile}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#15803d',
                  border: '1px solid #15803d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {isLockingProfile ? 'UNLOCKING...' : 'UNLOCK PROFILE'}
              </button>
            ) : (
              <button
                onClick={handleLockProfile}
                disabled={isLockingProfile}
                style={{
                  padding: '10px 20px',
                  background: '#b45309',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {isLockingProfile ? 'LOCKING...' : 'LOCK PROFILE'}
              </button>
            )}
          </div>

          {/* Horizontal Tabs */}
          {activeSidebar === 'PERSONAL_DETAILS' && (
            <div className="profile-top-tabs">
              <button
                className={`profile-top-tab-btn ${activeTab === 'PERSONAL_DETAILS' ? 'active' : ''}`}
                onClick={() => setActiveTab('PERSONAL_DETAILS')}
              >
                PERSONAL DETAILS
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'IDENTITY' ? 'active' : ''}`}
                onClick={() => setActiveTab('IDENTITY')}
              >
                IDENTITY
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'RELIGION' ? 'active' : ''}`}
                onClick={() => setActiveTab('RELIGION')}
              >
                RELIGION
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'PHYSICALLY_HANDICAPPED' ? 'active' : ''}`}
                onClick={() => setActiveTab('PHYSICALLY_HANDICAPPED')}
              >
                PHYSICALLY HANDICAPPED
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'MINORITY_DETAILS' ? 'active' : ''}`}
                onClick={() => setActiveTab('MINORITY_DETAILS')}
              >
                MINORITY DETAILS
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'PASSPORT_DETAILS' ? 'active' : ''}`}
                onClick={() => setActiveTab('PASSPORT_DETAILS')}
              >
                PASSPORT DETAILS
              </button>
              <button
                className={`profile-top-tab-btn ${activeTab === 'EXAMINATION_DETAILS' ? 'active' : ''}`}
                onClick={() => setActiveTab('EXAMINATION_DETAILS')}
              >
                EXAMINATION DETAILS
              </button>
            </div>
          )}

          {/* Form Content */}
          {activeSidebar === 'CHANGE_PASSWORD' ? (
            <div
              className="profile-form-wrapper"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <form
                id="ui-profile-form"
                onSubmit={handleChangePassword}
                style={{
                  maxWidth: '500px',
                  width: '100%',
                  padding: '40px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <fieldset
                  disabled={isProfileLocked}
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <h3
                    style={{
                      marginBottom: '30px',
                      color: '#1e293b',
                      fontSize: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    Change Password
                  </h3>

                  <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                    <div className="ui-input-group">
                      <label>Current Password</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-lock"></i>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                        />
                        <i
                          className={`fa-solid ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            paddingLeft: '10px',
                            color: '#94a3b8',
                          }}
                        ></i>
                      </div>
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}
                      >
                        <span
                          onClick={handleForgotPassword}
                          style={{
                            color: '#2563eb',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                          title="Send password reset link to your email"
                        >
                          Forgot Password?
                        </span>
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>New Password</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-key"></i>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                        />
                        <i
                          className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            paddingLeft: '10px',
                            color: '#94a3b8',
                          }}
                        ></i>
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Confirm New Password</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-key"></i>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={passwordData.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                          }
                        />
                        <i
                          className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            paddingLeft: '10px',
                            color: '#94a3b8',
                          }}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <div
                    className="profile-form-footer"
                    style={{ marginTop: '20px', paddingTop: '0' }}
                  >
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: '100%' }}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          ) : activeTab === 'PERSONAL_DETAILS' && activeSidebar === 'PERSONAL_DETAILS' ? (
            <div className="profile-form-wrapper">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h3 style={{ margin: 0, color: '#1e293b' }}>Personal Details</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href="/mock-b"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site B
                    </a>
                    <a
                      href="/mock-c"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site C
                    </a>
                    <a
                      href="/mock-d"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Site D
                    </a>
                  </div>
                  <div className="submit-dropdown-container">
                    <button
                      type="button"
                      disabled={isPushing}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      {isPushing ? (
                        'SUBMITTING...'
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i> PUSH DATA OPTIONS{' '}
                          <i
                            className="fa-solid fa-chevron-down"
                            style={{ fontSize: '0.8em', marginLeft: '5px' }}
                          ></i>
                        </>
                      )}
                    </button>
                    <div className="submit-dropdown-content">
                      <button
                        type="button"
                        onClick={() => handleRequestPush('mock_site_b', 'Site B')}
                      >
                        <i className="fa-solid fa-globe"></i> Push to Site B
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <form id="ui-profile-form" onSubmit={handleSave}>
                <fieldset
                  disabled={isProfileLocked}
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <div className="ui-form-grid">
                    <div className="ui-input-group">
                      <label>
                        First Name{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-pen"></i>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Middle Name</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-pen"></i>
                        <input
                          type="text"
                          value={formData.middleName}
                          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>
                        Last Name{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-pen"></i>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>
                        Official Email{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                          type="email"
                          required
                          value={formData.officialEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, officialEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Student Admission Main Category</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-list"></i>
                        <input
                          type="text"
                          value={formData.admissionCategory}
                          onChange={(e) =>
                            setFormData({ ...formData, admissionCategory: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Caste</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-list"></i>
                        <input
                          type="text"
                          value={formData.caste}
                          onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Sub Cast</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-list"></i>
                        <input
                          type="text"
                          value={formData.subCaste}
                          onChange={(e) => setFormData({ ...formData, subCaste: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Nationality</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-flag"></i>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) =>
                            setFormData({ ...formData, nationality: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Domicile</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-home"></i>
                        <input
                          type="text"
                          value={formData.domicile}
                          onChange={(e) => setFormData({ ...formData, domicile: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Mobile Number</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-phone"></i>
                        <input
                          type="tel"
                          pattern="\d{10}"
                          title="10-digit mobile number"
                          maxLength="10"
                          value={formData.mobileNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, mobileNumber: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Birth Place</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-map-marker-alt"></i>
                        <input
                          type="text"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Birth Country</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-globe"></i>
                        <input
                          type="text"
                          value={formData.birthCountry}
                          onChange={(e) =>
                            setFormData({ ...formData, birthCountry: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Birth State</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-map"></i>
                        <input
                          type="text"
                          value={formData.birthState}
                          onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Birth District</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-map-pin"></i>
                        <input
                          type="text"
                          value={formData.birthDistrict}
                          onChange={(e) =>
                            setFormData({ ...formData, birthDistrict: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Native Place</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-home"></i>
                        <input
                          type="text"
                          value={formData.nativePlace}
                          onChange={(e) =>
                            setFormData({ ...formData, nativePlace: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Native Country</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-globe"></i>
                        <input
                          type="text"
                          value={formData.nativeCountry}
                          onChange={(e) =>
                            setFormData({ ...formData, nativeCountry: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Native State</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-map"></i>
                        <input
                          type="text"
                          value={formData.nativeState}
                          onChange={(e) =>
                            setFormData({ ...formData, nativeState: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Native District</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-map-pin"></i>
                        <input
                          type="text"
                          value={formData.nativeDistrict}
                          onChange={(e) =>
                            setFormData({ ...formData, nativeDistrict: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>
                        Primary_Email (Personal){' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                          type="email"
                          required
                          value={formData.primaryEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, primaryEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Alternate_Email</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                          type="email"
                          value={formData.alternateEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, alternateEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Blood Group</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-tint"></i>
                        <input
                          type="text"
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Earning Parent Name</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-user-tie"></i>
                        <input
                          type="text"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Earning Parent Relation</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-users"></i>
                        <input
                          type="text"
                          value={formData.parentRelation}
                          onChange={(e) =>
                            setFormData({ ...formData, parentRelation: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="ui-input-group">
                      <label>Career Choice</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-briefcase"></i>
                        <input
                          type="text"
                          value={formData.careerChoice}
                          onChange={(e) =>
                            setFormData({ ...formData, careerChoice: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ui-form-grid" style={{ marginTop: '24px' }}>
                    <div className="ui-input-group">
                      <label>Alumni Institute</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <input
                          type="text"
                          value={formData.alumniInstitute || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, alumniInstitute: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-footer">
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                      {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          ) : activeTab === 'CONTACT_DETAILS' && activeSidebar === 'CONTACT_DETAILS' ? (
            <div className="profile-form-wrapper">
              <form id="ui-profile-form" onSubmit={handleSaveContact}>
                <fieldset
                  disabled={isProfileLocked}
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="ui-input-group">
                      <label>
                        Phone Number (10 digits){' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div
                          className="input-wrapper"
                          style={{ flex: 1, border: phoneVerified ? '1px solid #22c55e' : '' }}
                        >
                          <i
                            className="fa-solid fa-phone"
                            style={{ color: phoneVerified ? '#22c55e' : '' }}
                          ></i>
                          <input
                            type="text"
                            placeholder="9876543210"
                            required
                            pattern="\d{10}"
                            title="10-digit mobile number"
                            value={contactData.phoneNumber}
                            onChange={(e) =>
                              setContactData({ ...contactData, phoneNumber: e.target.value })
                            }
                            maxLength="10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ui-input-group" style={{ marginTop: '20px' }}>
                      <label>
                        Full Residential Address{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div
                        className="input-wrapper"
                        style={{ height: 'auto', alignItems: 'flex-start' }}
                      >
                        <i
                          className="fa-solid fa-map-location-dot"
                          style={{ marginTop: '14px' }}
                        ></i>
                        <textarea
                          required
                          rows="4"
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            padding: '12px 10px',
                            width: '100%',
                            resize: 'vertical',
                            background: 'transparent',
                          }}
                          placeholder="Enter your full address"
                          value={contactData.address}
                          onChange={(e) =>
                            setContactData({ ...contactData, address: e.target.value })
                          }
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-footer">
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                      {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          ) : activeTab === 'IDENTITY' ? (
            <div className="profile-form-wrapper">
              <form id="ui-profile-form" onSubmit={handleSaveIdentity}>
                <fieldset
                  disabled={isProfileLocked}
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <div className="ui-form-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
                    <div className="ui-input-group">
                      <label>
                        Aadhaar Card Number{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div
                          className="input-wrapper"
                          style={{ flex: 1, border: aadhaarVerified ? '1px solid #22c55e' : '' }}
                        >
                          <i
                            className="fa-solid fa-id-card"
                            style={{ color: aadhaarVerified ? '#22c55e' : '' }}
                          ></i>
                          <input
                            type={showAadhaar || !aadhaarVerified ? 'text' : 'password'}
                            placeholder="12 Digit Aadhaar Number"
                            required
                            pattern="\d{12}"
                            title="12-digit Aadhaar number"
                            value={
                              aadhaarVerified && !showAadhaar
                                ? `XXXX-XXXX-${identityData.aadhaarNumber.slice(-4)}`
                                : identityData.aadhaarNumber
                            }
                            onChange={(e) => {
                              if (!aadhaarVerified) {
                                setIdentityData({ ...identityData, aadhaarNumber: e.target.value });
                              }
                            }}
                            disabled={aadhaarVerified}
                            maxLength="12"
                          />
                          {aadhaarVerified && (
                            <i
                              className={`fa-solid ${showAadhaar ? 'fa-eye-slash' : 'fa-eye'}`}
                              style={{
                                cursor: 'pointer',
                                position: 'absolute',
                                right: '15px',
                                color: '#64748b',
                              }}
                              onClick={() => setShowAadhaar(!showAadhaar)}
                              title={showAadhaar ? 'Hide Aadhaar' : 'Show Aadhaar'}
                            ></i>
                          )}
                        </div>
                        {!aadhaarVerified && !isAadhaarOtpSent && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleVerifyAadhaar}
                            disabled={aadhaarLoadingText !== ''}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {aadhaarLoadingText !== '' ? aadhaarLoadingText : 'VERIFY AADHAAR'}
                          </button>
                        )}
                        {aadhaarVerified && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '0 15px',
                              borderRadius: '6px',
                              fontWeight: '600',
                            }}
                          >
                            <i
                              className="fa-solid fa-check-circle"
                              style={{ marginRight: '8px' }}
                            ></i>{' '}
                            VERIFIED
                          </div>
                        )}
                      </div>
                      <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
                        We will send an OTP to your email for e-KYC.
                      </small>
                    </div>

                    {isAadhaarOtpSent && !aadhaarVerified && (
                      <div
                        className="ui-input-group"
                        style={{
                          background: '#f8fafc',
                          padding: '20px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '-10px',
                          marginBottom: '20px',
                        }}
                      >
                        <label style={{ color: '#2563eb' }}>
                          Enter 6-Digit OTP sent to your email
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div className="input-wrapper" style={{ flex: 1 }}>
                            <i className="fa-solid fa-key"></i>
                            <input
                              type="text"
                              placeholder="123456"
                              value={aadhaarOtp}
                              onChange={(e) => setAadhaarOtp(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSubmitAadhaarOtp}
                            disabled={aadhaarLoadingText !== ''}
                          >
                            {aadhaarLoadingText !== '' ? 'VERIFYING...' : 'SUBMIT OTP'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="ui-input-group">
                      <label>
                        PAN Card Number{' '}
                        <span className="req" style={{ color: '#ef4444' }}>
                          *
                        </span>
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div
                          className="input-wrapper"
                          style={{ flex: 1, border: panVerified ? '1px solid #22c55e' : '' }}
                        >
                          <i
                            className="fa-solid fa-address-card"
                            style={{ color: panVerified ? '#22c55e' : '' }}
                          ></i>
                          <input
                            type="text"
                            placeholder="ABCDE1234F"
                            style={{ textTransform: 'uppercase' }}
                            required
                            pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                            title="Format: ABCDE1234F"
                            value={identityData.panNumber}
                            onChange={(e) =>
                              setIdentityData({
                                ...identityData,
                                panNumber: e.target.value.toUpperCase(),
                              })
                            }
                            disabled={panVerified}
                            maxLength="10"
                          />
                        </div>
                        {!panVerified && !isPanOtpSent && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleVerifyPan}
                            disabled={panLoadingText !== ''}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {panLoadingText !== '' ? panLoadingText : 'VERIFY PAN'}
                          </button>
                        )}
                        {panVerified && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '0 15px',
                              borderRadius: '6px',
                              fontWeight: '600',
                            }}
                          >
                            <i
                              className="fa-solid fa-check-circle"
                              style={{ marginRight: '8px' }}
                            ></i>{' '}
                            VERIFIED
                          </div>
                        )}
                      </div>
                    </div>

                    {isPanOtpSent && !panVerified && (
                      <div
                        className="ui-input-group"
                        style={{
                          background: '#f8fafc',
                          padding: '20px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '-10px',
                        }}
                      >
                        <label style={{ color: '#2563eb' }}>
                          Enter 6-Digit OTP sent to your email
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div className="input-wrapper" style={{ flex: 1 }}>
                            <i className="fa-solid fa-key"></i>
                            <input
                              type="text"
                              placeholder="123456"
                              value={panOtp}
                              onChange={(e) => setPanOtp(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSubmitPanOtp}
                            disabled={panLoadingText !== ''}
                          >
                            {panLoadingText !== '' ? 'VERIFYING...' : 'SUBMIT OTP'}
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
                </fieldset>
              </form>
            </div>
          ) : activeSidebar === 'UPLOAD_DOCUMENTS' ? (
            <div
              className="profile-form-wrapper"
              style={{ minHeight: '500px', background: 'white' }}
            >
              <h3 style={{ marginBottom: '30px', color: '#1e293b', fontSize: '1.4rem' }}>
                Upload Required Documents
              </h3>
              <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.9rem' }}>
                Please upload clear, legible copies of the original documents. Max file size: 5MB
                per document.
              </p>

              <div
                className="doc-cards-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px',
                  marginTop: '10px',
                }}
              >
                {[
                  { type: 'aadhaar', label: 'Aadhaar Card (Front & Back)', required: true },
                  { type: 'pan', label: 'PAN Card', required: true },
                  { type: 'income', label: 'Income Certificate', required: true },
                  { type: 'passbook', label: 'Bank Passbook / Cheque', required: true },
                  { type: 'photo', label: 'Passport Size Photograph', required: true },
                ].map((doc) => {
                  const fileData = uploadedFiles[doc.type];
                  const hasFile = !!(fileData?.url || fileData?.file);

                  return (
                    <div
                      key={doc.type}
                      className="doc-card"
                      onClick={() => !isProfileLocked && openDocModal(doc.type)}
                      style={{
                        opacity: isProfileLocked ? 0.6 : 1,
                        cursor: isProfileLocked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="doc-card-preview">
                        {fileData?.url ? (
                          fileData.url.toLowerCase().endsWith('.pdf') ? (
                            <div className="pdf-preview">
                              <i className="fa-solid fa-file-pdf"></i>
                              <span>PDF Document</span>
                            </div>
                          ) : (
                            <img src={fileData.url} alt="preview" />
                          )
                        ) : fileData?.file ? (
                          <div className="file-preview-ready">
                            <i className="fa-solid fa-file-circle-check"></i>
                            <span>Ready to Upload</span>
                          </div>
                        ) : (
                          <div className="doc-card-empty">
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            <span>Upload {doc.label}</span>
                          </div>
                        )}
                      </div>
                      <div className="doc-card-info">
                        <h4 style={{ textTransform: 'none' }}>
                          {fileData?.docName || doc.label}{' '}
                          {doc.required && !fileData?.docName && <span className="req">*</span>}
                        </h4>
                        <p>{fileData?.subjectText || 'No subject provided'}</p>
                        {hasFile && <div className="status-badge success">Ready</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="profile-form-footer" style={{ marginTop: '40px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isUploadingDocs || isProfileLocked}
                  onClick={handleUploadAllDocuments}
                >
                  {isUploadingDocs ? 'UPLOADING...' : 'UPLOAD ALL DOCUMENTS'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="profile-form-wrapper"
              style={{
                minHeight: '500px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
                Blank Page for {activeTab.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Document Upload Modal */}
      {docModal.isOpen && (
        <div
          className="modal-overlay active"
          style={{
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
          }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '500px',
              width: '100%',
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Upload Document</h3>

            <div className="ui-input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                File <span className="req">*</span>
              </label>
              <div
                className="file-upload-wrapper"
                style={{
                  border: '2px dashed #cbd5e1',
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <i
                  className="fa-solid fa-cloud-arrow-up upload-icon"
                  style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '10px' }}
                ></i>
                <div className="upload-text" style={{ fontSize: '0.9rem', color: '#475569' }}>
                  {docFormData.file ? (
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {docFormData.file.name}
                      <i
                        className="fa-solid fa-check-circle"
                        style={{ color: '#22c55e', fontSize: '1.2rem' }}
                        title="Valid file size"
                      ></i>
                    </span>
                  ) : (
                    <span>
                      Drag & Drop or{' '}
                      <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Browse</span>{' '}
                      (Max 10MB)
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  className="file-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocFormChange(e, 'file')}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            <div className="ui-input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Document Name
              </label>
              <input
                type="text"
                value={docFormData.docName}
                onChange={(e) => handleDocFormChange(e, 'docName')}
                placeholder="E.g. Aadhaar Card Front"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div className="ui-input-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Subject Text
              </label>
              <textarea
                rows="3"
                value={docFormData.subjectText}
                onChange={(e) => handleDocFormChange(e, 'subjectText')}
                placeholder="Any additional details or subject..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  resize: 'vertical',
                }}
              ></textarea>
            </div>

            <div
              className="modal-actions"
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
            >
              <button
                type="button"
                onClick={closeDocModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Save to Profile
              </button>
            </div>
          </div>
        </div>
      )}

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
            padding: '20px',
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
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: 'white',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'white' }}>
                    Data Sharing Permission
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>
                    Security & Consent Verification
                  </span>
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
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-circle-question"></i>
                </div>
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '1.05rem',
                      color: '#1e293b',
                      fontWeight: 600,
                    }}
                  >
                    Submit Data to {pushModal.siteName}?
                  </h4>
                  <p
                    style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.5' }}
                  >
                    Do you really want to submit and sync your profile data with{' '}
                    <strong>{pushModal.siteName}</strong>?
                  </p>
                </div>
              </div>

              {/* Data Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '24px',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-list-check" style={{ color: '#2563eb' }}></i> Details to
                  be transferred:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i
                      className="fa-solid fa-user"
                      style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                    ></i>
                    <span>
                      <strong>Name:</strong>{' '}
                      {formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i
                      className="fa-solid fa-envelope"
                      style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                    ></i>
                    <span>
                      <strong>Email:</strong> {formData.officialEmail || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i
                      className="fa-solid fa-phone"
                      style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                    ></i>
                    <span>
                      <strong>Phone:</strong> {phoneVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i
                      className="fa-solid fa-id-card"
                      style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                    ></i>
                    <span>
                      <strong>KYC:</strong>{' '}
                      {aadhaarVerified || panVerified ? 'Verified' : 'Pending'}
                    </span>
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
                    transition: 'background 0.2s',
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
                    transition: 'background 0.2s',
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
