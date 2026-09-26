import { useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { schemesData } from '../../data';

import { uploadDocument } from '../../utils/fileUpload';
import { encryptApplication, decryptProfile } from '../../utils/secureVault';
import './SchemeApplication.css';

export default function SchemeApplication() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDeclared, setIsDeclared] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Details (Step 3)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    aadhaar: '',
    dob: '',
    address: '',
    
    // Academic Details (Step 4)
    collegeName: '',
    courseName: '',
    currentYear: '',
    enrollmentNumber: '',
    previousMarks: '',

    // Family & Income Details (Step 5)
    familyIncome: '',
    fatherOccupation: '',
    motherOccupation: '',

    // Documents (Step 6)
    documents: [],

    // Bank Details (Step 7)
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const [profileDocuments, setProfileDocuments] = useState(null);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [selectedDocsForFetch, setSelectedDocsForFetch] = useState([]);
  const [formError, setFormError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchNotice, setFetchNotice] = useState('');
  const fileInputRef = useRef(null);

  const getMergedProfileData = async (uid, data) => {
    let pData = { firstName: data.personalDetails?.firstName, lastName: data.personalDetails?.lastName, email: data.personalDetails?.officialEmail, dob: '' };
    let cData = { phone: data.contactDetails?.phoneNumber, address: data.contactDetails?.address };
    let iData = { aadhaar: data.identityDetails?.aadhaarNumber };
    let eData = { collegeName: data.educationDetails?.collegeName, courseName: data.educationDetails?.courseName, currentYear: data.educationDetails?.currentYear, enrollmentNumber: data.educationDetails?.enrollmentNumber, previousMarks: data.educationDetails?.previousMarks };
    let fData = { familyIncome: data.familyDetails?.familyIncome, fatherOccupation: data.familyDetails?.fatherOccupation, motherOccupation: data.familyDetails?.motherOccupation };
    let bData = { accountHolderName: data.bankDetails?.accountHolderName, accountNumber: data.bankDetails?.accountNumber, ifscCode: data.bankDetails?.ifscCode, bankName: data.bankDetails?.bankName };
    let docsData = data.documents || {};

    if (data.citizenProfile) {
      try {
        const dec = await decryptProfile(data.citizenProfile, uid);
        const names = dec.basic?.fullName?.trim().split(' ') || [];
        const fName = names[0] || '';
        const lName = names.slice(1).join(' ') || '';
        
        pData.firstName = fName || pData.firstName;
        pData.lastName = lName || pData.lastName;
        pData.email = dec.basic?.email || pData.email;
        pData.dob = dec.basic?.dob || pData.dob;
        cData.phone = dec.basic?.mobile || cData.phone;
        
        const addrSource = dec.address?.sameAsCurrent ? dec.address?.current : (dec.address?.permanent || dec.address?.current);
        const currentAddrParts = [addrSource?.line1, addrSource?.line2, addrSource?.village, addrSource?.district, addrSource?.state, addrSource?.pincode].filter(Boolean);
        const currentAddr = currentAddrParts.join(', ');
        cData.address = currentAddr || cData.address;
        
        iData.aadhaar = dec.identity?.docNumber || iData.aadhaar;
        
        eData.collegeName = dec.education?.institution || eData.collegeName;
        eData.courseName = dec.education?.currentLevel || eData.courseName;
        eData.currentYear = dec.education?.year || eData.currentYear;
        eData.enrollmentNumber = dec.education?.enrollmentNumber || eData.enrollmentNumber;
        eData.previousMarks = dec.education?.prevMarks || eData.previousMarks;
        
        fData.familyIncome = dec.family?.annualIncome || fData.familyIncome;
        fData.fatherOccupation = dec.family?.fatherName ? `Father: ${dec.family.fatherName}` : fData.fatherOccupation;
        fData.motherOccupation = dec.family?.motherName ? `Mother: ${dec.family.motherName}` : fData.motherOccupation;
        
        bData.accountHolderName = dec.basic?.fullName || bData.accountHolderName;
        bData.accountNumber = dec.bank?.accountNumber || bData.accountNumber;
        bData.ifscCode = dec.bank?.ifsc || bData.ifscCode;
        bData.bankName = dec.bank?.bankName || bData.bankName;
        
        docsData = dec.documents || docsData;
      } catch (err) {
        console.error('Decryption error', err);
      }
    }
    return { pData, cData, iData, eData, fData, bData, docsData };
  };

  // Profile data is fetched ON DEMAND — only when the user clicks a "Fetch"
  // button — and merged non-destructively into whatever they already filled.
  // The raw user doc is cached for the session so repeat clicks don't re-fetch.
  const profileCacheRef = useRef(null);

  const loadMergedProfile = async () => {
    if (!profileCacheRef.current) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      profileCacheRef.current = docSnap.exists() ? docSnap.data() : {};
    }
    const merged = await getMergedProfileData(user.uid, profileCacheRef.current);
    if (merged.docsData && Object.keys(merged.docsData).length > 0) {
      setProfileDocuments(merged.docsData);
    }
    return merged;
  };

  const handleFetchEntireForm = async () => {
    if (!user?.uid || isFetching) return;
    setIsFetching(true);
    setFormError('');
    setFetchNotice('');
    try {
      const { pData, cData, iData, eData, fData, bData, docsData } = await loadMergedProfile();

      // Non-destructive merge: user-entered values always win over profile data.
      const pick = (profileVal, currentVal) => currentVal || profileVal || '';
      let updatedData = {
        ...formData,
        firstName: pick(pData.firstName, formData.firstName),
        lastName: pick(pData.lastName, formData.lastName),
        email: pick(pData.email || user.email, formData.email),
        dob: pick(pData.dob, formData.dob),
        phone: pick(cData.phone, formData.phone),
        aadhaar: pick(iData.aadhaar, formData.aadhaar),
        address: pick(cData.address, formData.address),
        collegeName: pick(eData.collegeName, formData.collegeName),
        courseName: pick(eData.courseName, formData.courseName),
        currentYear: pick(eData.currentYear, formData.currentYear),
        enrollmentNumber: pick(eData.enrollmentNumber, formData.enrollmentNumber),
        previousMarks: pick(eData.previousMarks, formData.previousMarks),
        familyIncome: pick(fData.familyIncome, formData.familyIncome),
        fatherOccupation: pick(fData.fatherOccupation, formData.fatherOccupation),
        motherOccupation: pick(fData.motherOccupation, formData.motherOccupation),
        accountHolderName: pick(bData.accountHolderName, formData.accountHolderName),
        accountNumber: pick(bData.accountNumber, formData.accountNumber),
        ifscCode: pick(bData.ifscCode, formData.ifscCode),
        bankName: pick(bData.bankName, formData.bankName),
        documents: [...formData.documents],
      };

      if (docsData) {
        const newDocs = [];
        Object.entries(docsData).forEach(([key, docObj]) => {
          if (docObj?.url && !updatedData.documents.some((d) => d.url === docObj.url)) {
            newDocs.push({
              name: docObj.docName || key,
              originalFilename: docObj.name || key,
              url: docObj.url,
              isFromProfile: true,
            });
          }
        });
        updatedData.documents = [...updatedData.documents, ...newDocs];
      }

      const newlyFetchedDocs = docsData
        ? Object.entries(docsData).filter(
            ([key, docObj]) =>
              docObj?.url && !formData.documents.some((d) => d.url === docObj.url)
          ).length
        : 0;

      const fetchedCount =
        Object.keys(updatedData).filter(
          (k) => k !== 'documents' && updatedData[k] && !formData[k]
        ).length + newlyFetchedDocs;

      setFormData(updatedData);
      setFetchNotice(
        fetchedCount > 0
          ? `${fetchedCount} field${fetchedCount > 1 ? 's' : ''} filled from your profile — please review below.`
          : 'Nothing new to fill — your entered data was kept.'
      );

      // Jump to the first step with missing data so the user can review it.
      if (!updatedData.firstName || !updatedData.lastName || !updatedData.email || !updatedData.phone || !updatedData.aadhaar || !updatedData.dob || !updatedData.address) {
        setCurrentStep(1);
        setFormError('Some Personal Details are still missing — please complete them.');
      } else if (!updatedData.collegeName || !updatedData.courseName || !updatedData.currentYear || !updatedData.enrollmentNumber || !updatedData.previousMarks) {
        setCurrentStep(2);
        setFormError('Some Academic Details are still missing — please complete them.');
      } else if (!updatedData.familyIncome || !updatedData.fatherOccupation || !updatedData.motherOccupation) {
        setCurrentStep(3);
        setFormError('Some Family & Income Details are still missing — please complete them.');
      } else if (updatedData.documents.length === 0) {
        setCurrentStep(4);
        setFormError('Please upload mandatory documents.');
      } else if (!updatedData.accountHolderName || !updatedData.bankName || !updatedData.accountNumber || !updatedData.ifscCode) {
        setCurrentStep(5);
        setFormError('Some Bank Details are still missing — please complete them.');
      } else {
        setCurrentStep(6);
        setFormError('');
      }
    } catch (err) {
      console.error('Error fetching entire form:', err);
      setFormError('Could not fetch your profile data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchSpecificForm = async (step) => {
    if (!user?.uid || isFetching) return;
    setIsFetching(true);
    setFormError('');
    setFetchNotice('');
    try {
      const { pData, cData, iData, eData, fData, bData } = await loadMergedProfile();

      // Non-destructive: only fills EMPTY fields, never overwrites user input.
      const merge = (updates) =>
        setFormData((prev) => {
          const filled = {};
          let count = 0;
          Object.entries(updates).forEach(([field, profileVal]) => {
            if (!prev[field] && profileVal) {
              filled[field] = profileVal;
              count++;
            }
          });
          setFetchNotice(
            count > 0
              ? `${count} field${count > 1 ? 's' : ''} filled from your profile.`
              : 'Nothing new to fill — your entered data was kept.'
          );
          return { ...prev, ...filled };
        });

      if (step === 1) {
        merge({
          firstName: pData.firstName,
          lastName: pData.lastName,
          email: pData.email || user.email,
          dob: pData.dob,
          phone: cData.phone,
          aadhaar: iData.aadhaar,
          address: cData.address,
        });
      } else if (step === 2) {
        merge({
          collegeName: eData.collegeName,
          courseName: eData.courseName,
          currentYear: eData.currentYear,
          enrollmentNumber: eData.enrollmentNumber,
          previousMarks: eData.previousMarks,
        });
      } else if (step === 3) {
        merge({
          familyIncome: fData.familyIncome,
          fatherOccupation: fData.fatherOccupation,
          motherOccupation: fData.motherOccupation,
        });
      } else if (step === 5) {
        merge({
          accountHolderName: bData.accountHolderName,
          accountNumber: bData.accountNumber,
          ifscCode: bData.ifscCode,
          bankName: bData.bankName,
        });
      }
    } catch (err) {
      console.error('Error fetching specific form:', err);
      setFormError('Could not fetch your profile data. Please try again.');
    } finally {
      setIsFetching(false);
      setTimeout(() => setFetchNotice(''), 5000);
    }
  };

  const handleNext = () => {
    setFormError('');
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.aadhaar || !formData.dob || !formData.address) {
        setFormError('Please fill all the personal details before proceeding.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.collegeName || !formData.courseName || !formData.currentYear || !formData.enrollmentNumber || !formData.previousMarks) {
        setFormError('Please fill all the academic details before proceeding.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.familyIncome || !formData.fatherOccupation || !formData.motherOccupation) {
        setFormError('Please fill all the family & income details before proceeding.');
        return;
      }
    } else if (currentStep === 4) {
      if (formData.documents.length === 0) {
        setFormError('It is mandatory to upload at least 1 document.');
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.accountHolderName || !formData.bankName || !formData.accountNumber || !formData.ifscCode) {
        setFormError('Please fill all the bank details before proceeding.');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrev = () => {
    setFormError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = [];

      for (let file of newFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert(
            `Warning: File "${file.name}" exceeds the 10MB limit. Please upload a smaller file.`
          );
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, ...validFiles],
        }));
      }
    }
  };

  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== indexToRemove),
    }));
  };

  const toggleFetchSelection = (docObj) => {
    setSelectedDocsForFetch((prev) => {
      const isSelected = prev.some((d) => d.url === docObj.url);
      if (isSelected) {
        return prev.filter((d) => d.url !== docObj.url);
      } else {
        return [...prev, docObj];
      }
    });
  };

  const handleConfirmFetch = () => {
    if (selectedDocsForFetch.length === 0) {
      setIsFetchModalOpen(false);
      return;
    }
    const newDocs = selectedDocsForFetch.map((docObj) => {
      // Find key in profileDocuments to get the correct label
      const entry = Object.entries(profileDocuments || {}).find(
        ([, value]) => value.url === docObj.url
      );
      const docKey = entry ? entry[0] : '';
      const docLabels = {
        aadhaar: 'Aadhaar Card',
        pan: 'PAN Card',
        income: 'Income Certificate',
        passbook: 'Bank Passbook / Cheque',
        photo: 'Passport Size Photograph',
      };
      const label = docLabels[docKey] || docObj.docName || docObj.name || 'Profile Document';

      return {
        name: label,
        originalFilename: docObj.name,
        url: docObj.url,
        isFromProfile: true,
      };
    });

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));

    setSelectedDocsForFetch([]);
    setIsFetchModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!user?.uid) {
      setFormError('Please log in to submit an application.');
      return;
    }
    if (formData.documents.length === 0) {
      setFormError('It is mandatory to upload at least 1 document.');
      setCurrentStep(4);
      return;
    }
    if (!isDeclared) {
      setFormError('Please declare that the information is correct by checking the box.');
      return;
    }
    setIsUpdateProfileModalOpen(true);
  };

  const executeSubmit = async (shouldUpdateProfile) => {
    setIsUpdateProfileModalOpen(false);
    setIsSubmitting(true);
    setUploadProgress('Uploading documents...');

    try {
      if (shouldUpdateProfile && user?.uid) {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          personalDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          contactDetails: {
            phoneNumber: formData.phone,
            address: formData.address,
          },
          identityDetails: {
            aadhaarNumber: formData.aadhaar,
          },
          educationDetails: {
            collegeName: formData.collegeName,
            courseName: formData.courseName,
            currentYear: formData.currentYear,
            enrollmentNumber: formData.enrollmentNumber,
            previousMarks: formData.previousMarks,
          },
          familyDetails: {
            familyIncome: formData.familyIncome,
            fatherOccupation: formData.fatherOccupation,
            motherOccupation: formData.motherOccupation,
          },
          bankDetails: {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            bankName: formData.bankName,
          }
        }, { merge: true });
      }

      // Upload documents with multi-tier storage (Cloudinary + Firestore Cloud fallback)
      const uploadedDocumentUrls = [];

      for (let i = 0; i < formData.documents.length; i++) {
        const item = formData.documents[i];

        if (item.isFromProfile) {
          // Already uploaded, just push the reference
          uploadedDocumentUrls.push({
            name: item.name,
            url: item.url,
          });
        } else {
          setUploadProgress(`Processing document ${i + 1} of ${formData.documents.length}...`);
          const uploadedDoc = await uploadDocument(item);
          uploadedDocumentUrls.push({
            name: uploadedDoc.name,
            url: uploadedDoc.url,
          });
        }
      }

      setUploadProgress('Saving application...');

      const scheme = schemesData.find((s) => s.id === schemeId) || { name: 'Unknown Scheme' };

      const applicationData = {
        userId: user.uid,
        schemeId: schemeId,
        schemeName: scheme.name,
        dateApplied: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        timestamp: serverTimestamp(),
        status: 'Pending',
        desc: 'Application submitted and under review',
        currentStep: 1,
        totalSteps: 6,
        dataProtection: { encrypted: true, consentBased: true },
        applicantName:
          `${formData.firstName} ${formData.lastName}`.trim() || user.displayName || 'Applicant',
        applicantEmail: formData.email || user.email || '',
        applicantPhone: formData.phone || '',
        applicantAadhaar: formData.aadhaar || '',
        applicantDob: formData.dob || '',
        applicantAddress: formData.address || '',
        
        academicDetails: {
          collegeName: formData.collegeName,
          courseName: formData.courseName,
          currentYear: formData.currentYear,
          enrollmentNumber: formData.enrollmentNumber,
          previousMarks: formData.previousMarks,
        },
        
        familyIncomeDetails: {
          familyIncome: formData.familyIncome,
          fatherOccupation: formData.fatherOccupation,
          motherOccupation: formData.motherOccupation,
        },
        
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
        },
        
        documents: uploadedDocumentUrls,
      };

      // Sensitive fields (Aadhaar, phone, bank account) are encrypted client-side before storage
      const savedApplication = await encryptApplication(applicationData, user.uid);
      await addDoc(collection(db, 'users', user.uid, 'applications'), savedApplication);

      // Consent + encryption are recorded in the user's Data Access History
      await addDoc(collection(db, 'users', user.uid, 'dataAccessHistory'), {
        department: scheme.name,
        departmentId: schemeId,
        requested: 'Application data (Aadhaar & bank fields encrypted, AES-256-GCM)',
        purpose: 'Scheme application processing',
        status: 'Authorized',
        type: 'consent-granted',
        createdAt: serverTimestamp(),
      });

      // Create a notification for the submission
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        type: 'info',
        message: `Your application for ${scheme.name} was successfully submitted.`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setIsSubmitting(false);
      setUploadProgress('');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(
        `Application submission failed: ${error.message || 'Please check your connection and try again.'}`
      );
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (isSuccess) {
    return (
      <div className="application-success">
        <div className="success-icon-wrapper">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2>Application Submitted!</h2>
        <p>
          Your application has been successfully submitted. You can track its status in the
          Applications tab.
        </p>
        <button className="btn-primary" onClick={() => navigate('/dashboard/applications')}>
          View My Applications
        </button>
      </div>
    );
  }

  return (
    <div className="scheme-application-container">
      <div className="application-header">
        <button className="back-btn" onClick={() => navigate('/schemes')}>
          <i className="fa-solid fa-arrow-left"></i> Back to Schemes
        </button>
        <h2>Apply for Scheme</h2>
        <p>Complete the steps below to submit your application.</p>
        
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--icon-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Want to save time?</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click below to autofill this form from your saved profile — only empty fields are filled.</p>
          </div>
          <button type="button" className="btn-primary" onClick={handleFetchEntireForm} disabled={isFetching}>
            {isFetching ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Fetching…
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt" style={{ marginRight: '8px' }}></i> Fetch Entire Data & Review
              </>
            )}
          </button>
        </div>
      </div>

      <div className="application-main-content">
        <div className="stepper-ui vertical-stepper">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-circle">{currentStep > 1 ? <i className="fa-solid fa-check"></i> : 1}</div>
          <span>Personal Details</span>
        </div>
        <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-circle">{currentStep > 2 ? <i className="fa-solid fa-check"></i> : 2}</div>
          <span>Academic</span>
        </div>
        <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-circle">{currentStep > 3 ? <i className="fa-solid fa-check"></i> : 3}</div>
          <span>Family</span>
        </div>
        <div className={`step-line ${currentStep >= 4 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-circle">{currentStep > 4 ? <i className="fa-solid fa-check"></i> : 4}</div>
          <span>Documents</span>
        </div>
        <div className={`step-line ${currentStep >= 5 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
          <div className="step-circle">{currentStep > 5 ? <i className="fa-solid fa-check"></i> : 5}</div>
          <span>Bank Details</span>
        </div>
        <div className={`step-line ${currentStep >= 6 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 6 ? 'active' : ''}`}>
          <div className="step-circle">6</div>
          <span>Review</span>
        </div>
      </div>

      <div className="application-card">
        {currentStep === 1 && (
          <div className="step-content form-slide-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3>Personal Information</h3>
                <p className="step-desc">Verify your pre-filled details from your profile.</p>
              </div>
              <button type="button" className="btn-outline" onClick={() => handleFetchSpecificForm(1)} disabled={isFetching} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <i className={`fa-solid ${isFetching ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> {isFetching ? 'Fetching…' : 'Fetch Data'}
              </button>
            </div>
            <div className="app-form-grid">
              <div className="app-floating-input">
                <input
                  type="text"
                  id="fname"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="fname">First Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="lname"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="lname">Last Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="email">Email Address</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="phone">Phone Number</label>
              </div>
              <div className="app-floating-input" style={{ gridColumn: '1 / -1' }}>
                <input
                  type="text"
                  id="aadhaar"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="aadhaar">Aadhaar Number</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="date"
                  id="dob"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="dob">Date of Birth</label>
              </div>
              <div className="app-floating-input" style={{ gridColumn: '1 / -1' }}>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="address">Permanent Address</label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content form-slide-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3>Academic Details</h3>
                <p className="step-desc">Provide your current and previous academic records.</p>
              </div>
              <button type="button" className="btn-outline" onClick={() => handleFetchSpecificForm(2)} disabled={isFetching} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <i className={`fa-solid ${isFetching ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> {isFetching ? 'Fetching…' : 'Fetch Data'}
              </button>
            </div>
            <div className="app-form-grid">
              <div className="app-floating-input" style={{ gridColumn: '1 / -1' }}>
                <input
                  type="text"
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="collegeName">College / Institute Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="courseName">Course Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="currentYear"
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="currentYear">Current Year (e.g. 1st, 2nd)</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="enrollmentNumber">Enrollment Number</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="previousMarks"
                  value={formData.previousMarks}
                  onChange={(e) => setFormData({ ...formData, previousMarks: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="previousMarks">Previous Year Marks (%)</label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content form-slide-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3>Family & Income Details</h3>
                <p className="step-desc">Provide details regarding your family income.</p>
              </div>
              <button type="button" className="btn-outline" onClick={() => handleFetchSpecificForm(3)} disabled={isFetching} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <i className={`fa-solid ${isFetching ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> {isFetching ? 'Fetching…' : 'Fetch Data'}
              </button>
            </div>
            <div className="app-form-grid">
              <div className="app-floating-input">
                <input
                  type="number"
                  id="familyIncome"
                  value={formData.familyIncome}
                  onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="familyIncome">Annual Family Income (₹)</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="fatherOccupation">Father's Occupation</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="motherOccupation">Mother's Occupation</label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content form-slide-in">
            <h3>Upload Documents</h3>
            <p className="step-desc">
              Please upload the required documents for verification. At least 1 document is
              mandatory.
            </p>

            <div style={{
              background: 'var(--icon-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', fontSize: '1rem' }}>Documents Needed:</h4>
              <ul style={{ margin: 0, paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Aadhaar Card',
                  'PAN Card',
                  'Income Certificate',
                  'Bank Passbook / Cheque',
                  'Passport Size Photograph'
                ].map(docName => {
                  const isUploaded = formData.documents.some(d => {
                     const fName = (d.name || '').toLowerCase();
                     const oName = (d.originalFilename || '').toLowerCase();
                     if (docName === 'Aadhaar Card') return fName.includes('aadhaar') || oName.includes('aadhaar');
                     if (docName === 'PAN Card') return fName.includes('pan') || oName.includes('pan');
                     if (docName === 'Income Certificate') return fName.includes('income') || oName.includes('income');
                     if (docName === 'Bank Passbook / Cheque') return fName.includes('bank') || fName.includes('passbook') || fName.includes('cheque') || oName.includes('bank') || oName.includes('passbook') || oName.includes('cheque');
                     if (docName === 'Passport Size Photograph') return fName.includes('photo') || fName.includes('passport') || oName.includes('photo') || oName.includes('passport');
                     return false;
                  });
                  return (
                    <li key={docName} style={{ 
                      color: isUploaded ? '#16a34a' : 'var(--text-muted)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      listStyle: 'none',
                      fontWeight: isUploaded ? '600' : '400'
                    }}>
                      <i className={`fa-solid ${isUploaded ? 'fa-circle-check' : 'fa-circle'}`} style={{ fontSize: '1.1rem' }}></i>
                      {docName}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', marginBottom: '30px' }}>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                Browse Files
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFetchModalOpen(true);
                }}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                Fetch from Profile
              </button>
            </div>

            {formData.documents.length > 0 && (
              <div className="selected-files-list" style={{ marginTop: '20px' }}>
                <h4>Selected Documents</h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '10px',
                  }}
                >
                  {formData.documents.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 15px',
                        background: 'var(--icon-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          overflow: 'hidden',
                        }}
                      >
                        <i className="fa-solid fa-file-lines" style={{ color: '#3b82f6' }}></i>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                          }}
                        >
                          {file.name}
                        </span>
                        <i
                          className="fa-solid fa-check-circle"
                          style={{ color: '#22c55e' }}
                          title="Valid file size"
                        ></i>
                        {file.isFromProfile && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              borderRadius: '4px',
                              marginLeft: '5px',
                            }}
                          >
                            From Profile
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const url = file.url || (file.size ? URL.createObjectURL(file) : '');
                              if (url) {
                                const a = document.createElement('a');
                                a.href = url;
                                a.target = '_blank';
                                a.rel = 'noopener noreferrer';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              } else {
                                alert("Cannot preview this file.");
                              }
                            } catch (e) {
                              console.error('Preview error:', e);
                              alert('Could not preview file.');
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Preview file"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Remove file"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content form-slide-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3>Bank Details</h3>
                <p className="step-desc">Enter bank details for Direct Benefit Transfer (DBT).</p>
              </div>
              <button type="button" className="btn-outline" onClick={() => handleFetchSpecificForm(5)} disabled={isFetching} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <i className={`fa-solid ${isFetching ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> {isFetching ? 'Fetching…' : 'Fetch Data'}
              </button>
            </div>
            <div className="app-form-grid">
              <div className="app-floating-input">
                <input
                  type="text"
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="accountHolderName">Account Holder Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="bankName">Bank Name</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="accountNumber">Account Number</label>
              </div>
              <div className="app-floating-input">
                <input
                  type="text"
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder=" "
                />
                <label htmlFor="ifscCode">IFSC Code</label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="step-content form-slide-in">
            <h3>Review Application</h3>
            <p className="step-desc">Please review your details before final submission.</p>
            <div className="review-section-box">
              <h4><i className="fa-solid fa-user"></i> Personal Details</h4>
              <div className="review-item">
                <span className="review-label">Name:</span>
                <strong>{formData.firstName} {formData.lastName}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Email:</span>
                <strong>{formData.email}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Phone:</span>
                <strong>{formData.phone}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Aadhaar:</span>
                <strong>{formData.aadhaar}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Date of Birth:</span>
                <strong>{formData.dob}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Address:</span>
                <strong>{formData.address}</strong>
              </div>
            </div>

            <div className="review-section-box">
              <h4><i className="fa-solid fa-graduation-cap"></i> Academic Details</h4>
              <div className="review-item">
                <span className="review-label">College:</span>
                <strong>{formData.collegeName}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Course:</span>
                <strong>{formData.courseName}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Current Year:</span>
                <strong>{formData.currentYear}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Enrollment No:</span>
                <strong>{formData.enrollmentNumber}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Previous Marks:</span>
                <strong>{formData.previousMarks}%</strong>
              </div>
            </div>

            <div className="review-section-box">
              <h4><i className="fa-solid fa-users"></i> Family & Income Details</h4>
              <div className="review-item">
                <span className="review-label">Family Income:</span>
                <strong>₹{formData.familyIncome}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Father's Occupation:</span>
                <strong>{formData.fatherOccupation}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Mother's Occupation:</span>
                <strong>{formData.motherOccupation}</strong>
              </div>
            </div>

            <div className="review-section-box">
              <h4><i className="fa-solid fa-building-columns"></i> Bank Details</h4>
              <div className="review-item">
                <span className="review-label">Account Holder:</span>
                <strong>{formData.accountHolderName}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Bank Name:</span>
                <strong>{formData.bankName}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">Account No:</span>
                <strong>{formData.accountNumber}</strong>
              </div>
              <div className="review-item">
                <span className="review-label">IFSC Code:</span>
                <strong>{formData.ifscCode}</strong>
              </div>
            </div>

            <div className="review-section-box">
              <h4><i className="fa-solid fa-file-lines"></i> Uploaded Documents</h4>
              {formData.documents.map((doc, idx) => (
                <div className="review-item" key={idx}>
                  <span className="review-label">Document {idx + 1}:</span>
                  <strong>{doc.name}</strong>
                </div>
              ))}
            </div>
            <div className="declaration-box">
              <input
                type="checkbox"
                id="declare"
                checked={isDeclared}
                onChange={(e) => setIsDeclared(e.target.checked)}
              />
              <label htmlFor="declare">
                I declare that all the information provided is correct to the best of my knowledge.
              </label>
            </div>
          </div>
        )}

        {fetchNotice && (
          <div style={{ color: '#047857', background: '#d1fae5', padding: '12px', borderRadius: '8px', marginTop: '20px', border: '1px solid #6ee7b7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <span>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>
              {fetchNotice}
            </span>
            <button
              type="button"
              onClick={() => setFetchNotice('')}
              style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '1rem' }}
              aria-label="Dismiss"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {formError && (
          <div style={{ color: '#ef4444', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginTop: '20px', border: '1px solid #fca5a5' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
            {formError}
          </div>
        )}

        <div className="step-footer">
          {currentStep > 1 ? (
            <button type="button" className="btn-outline" onClick={handlePrev}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              Next Step
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? uploadProgress || 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
      </div>

      {isFetchModalOpen && (
        <div
          className="modal-overlay active"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--card-bg)',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0 }}>Select Required Documents</h3>
              <button
                type="button"
                onClick={() => setIsFetchModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {!profileDocuments || Object.keys(profileDocuments).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p>No documents found in your profile.</p>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ marginTop: '10px' }}
                  onClick={() => setIsFetchModalOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {Object.entries(profileDocuments).map(([key, docObj]) => {
                  const docLabels = {
                    aadhaar: 'Aadhaar Card',
                    pan: 'PAN Card',
                    income: 'Income Certificate',
                    passbook: 'Bank Passbook / Cheque',
                    photo: 'Passport Size Photograph',
                  };
                  const displayName =
                    docLabels[key] || docObj.docName || docObj.name || key || 'Document';

                  return docObj?.url ? (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocsForFetch.some((d) => d.url === docObj.url)}
                        onChange={() => toggleFetchSelection(docObj)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#2563eb',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '1rem',
                          color: 'var(--text-main)',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}
                      >
                        {displayName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginLeft: 'auto',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {docObj.name || 'File'}
                      </span>
                    </label>
                  ) : null;
                })}
              </div>
            )}

            {profileDocuments && Object.keys(profileDocuments).length > 0 && (
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsFetchModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleConfirmFetch}>
                  Add Selected
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isUpdateProfileModalOpen && (
        <div
          className="modal-overlay active"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--card-bg)',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Update Profile?</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>
              Would you like to save this new information to your main profile for faster applications in the future?
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className="btn-outline"
                onClick={() => executeSubmit(false)}
              >
                No, Just Submit
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => executeSubmit(true)}
              >
                Yes, Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
