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
    status: 'idle',
    message: '',
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
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
  const [showUnlockConfirmModal, setShowUnlockConfirmModal] = useState(false);

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
    setIsLockingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { isProfileLocked: true }, { merge: true });
      setIsProfileLocked(true);
      setShowLockConfirmModal(false);
    } catch (error) {
      console.error('Error locking profile:', error);
      alert('Failed to lock profile. Please try again.');
    } finally {
      setIsLockingProfile(false);
    }
  };

  const handleUnlockProfile = async () => {
    setIsLockingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { isProfileLocked: false }, { merge: true });
      setIsProfileLocked(false);
      setShowUnlockConfirmModal(false);
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
      status: 'idle',
      message: '',
    });
  };

  const handleCancelPush = () => {
    setPushModal({
      isOpen: false,
      collectionName: '',
      siteName: '',
      status: 'idle',
      message: '',
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
      setPushModal((prev) => ({
        ...prev,
        status: 'success',
        message: `Profile securely submitted to ${targetSite}!`,
      }));
    } catch (error) {
      console.error('Error pushing profile:', error);
      setPushModal((prev) => ({
        ...prev,
        status: 'error',
        message: 'Failed to submit profile: ' + error.message,
      }));
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
    try {
      const toEmail = user?.email;
      
      if (!toEmail) {
        alert("No registered email address found. Please ensure you are properly logged in.");
        return false;
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: formData.firstName || user?.name || 'User',
          to_email: toEmail,
          user_email: toEmail,
          email: toEmail,
          reply_to: toEmail,
          otp: otp,
          type: type,
          verification_type: type,
          doc_type: type,
          message: `Your OTP for ${type} verification is ${otp}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      return true;
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Failed to send OTP to your email. Please check your EmailJS configuration or network connection.');
      return false;
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!identityData.aadhaarNumber) return;
    setAadhaarLoadingText('Connecting to UIDAI...');
    setAadhaarVerified(false);

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

  const handleVerifyPhone = async () => {
    if (!contactData.phoneNumber) return;
    setIsVerifyingPhone(true);
    setPhoneVerified(false);
    setTimeout(async () => {
      if (contactData.phoneNumber.length === 10) {
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailSent = await sendEmailOTP(generatedOTP, 'Phone');

        if (emailSent) {
          setConfirmationResult(generatedOTP);
          setIsOtpSent(true);
        } else {
          alert('Failed to send OTP to your email. Please check your EmailJS configuration.');
        }
      } else {
        alert('Invalid Phone Number! Must be 10 digits.');
      }
      setIsVerifyingPhone(false);
    }, 1000);
  };

  const handleSubmitPhoneOtp = async () => {
    if (!otp) return;
    if (otp === confirmationResult) {
      setIsVerifyingPhone(true);
      setTimeout(async () => {
        setPhoneVerified(true);
        setIsOtpSent(false);
        setIsVerifyingPhone(false);
        alert('Phone Verified Successfully!');
        if (user?.uid) {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(
            docRef,
            { contactDetails: { ...contactData, phoneVerified: true } },
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
    setPanVerified(false);
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
    <div id="profile" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
      <div
        className="password-change-container"
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >

        <form
          id="ui-profile-form"
          onSubmit={handleChangePassword}
          style={{ padding: '40px 32px' }}
        >
          <fieldset
            disabled={isProfileLocked}
            style={{ border: 'none', padding: 0, margin: 0 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.05)'
              }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.8rem', color: '#6366f1' }}></i>
              </div>
              <h3
                style={{
                  margin: 0,
                  color: '#1e293b',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  letterSpacing: '-0.5px'
                }}
              >
                Secure Password
              </h3>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Update your password to keep your account safe.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '12px 40px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <i
                    className={`fa-solid ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                  ></i>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <span
                    onClick={handleForgotPassword}
                    style={{
                      color: '#6366f1',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#4f46e5'}
                    onMouseOut={(e) => e.target.style.color = '#6366f1'}
                    title="Send password reset link to your email"
                  >
                    Forgot Password?
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-key" style={{ position: 'absolute', left: '14px', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '12px 40px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <i
                    className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                  ></i>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-check-double" style={{ position: 'absolute', left: '14px', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordData.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '12px 40px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <i
                    className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                  ></i>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isUpdatingPassword ? '#94a3b8' : '#6366f1',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isUpdatingPassword ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => !isUpdatingPassword && (e.currentTarget.style.background = '#4f46e5')}
                onMouseOut={(e) => !isUpdatingPassword && (e.currentTarget.style.background = '#6366f1')}
              >
                {isUpdatingPassword ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> UPDATING...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> UPDATE PASSWORD
                  </>
                )}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
