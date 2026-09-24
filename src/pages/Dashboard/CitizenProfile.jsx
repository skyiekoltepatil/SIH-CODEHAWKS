import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { uploadDocument } from '../../utils/fileUpload';
import emailjs from '@emailjs/browser';
import AuditLogModal from '../../components/AuditLogModal';
import './CitizenProfile.css';

/* ============================================================
   Departments define the MINIMUM fields they may request.
   Data minimization + purpose limitation live here.
   ============================================================ */
const DEPARTMENTS = [
  {
    id: 'scholarship',
    name: 'Scholarship Department',
    icon: 'fa-graduation-cap',
    purpose: 'Scholarship application processing',
    duration: 'For the duration required to process the application (max 180 days)',
    fields: ['basic', 'education', 'bank'],
    fieldLabels: {
      basic: 'Basic identity (name, DOB)',
      education: 'Education information',
      bank: 'Bank verification (status only)',
    },
  },
  {
    id: 'education',
    name: 'Education Department',
    icon: 'fa-book',
    purpose: 'Certificate verification',
    duration: 'Single verification (7 days)',
    fields: ['identity', 'education'],
    fieldLabels: {
      identity: 'Identity document (masked)',
      education: 'Education certificates',
    },
  },
  {
    id: 'health',
    name: 'Health Department',
    icon: 'fa-heart-pulse',
    purpose: 'Health scheme eligibility',
    duration: 'Until scheme processing completes (max 90 days)',
    fields: ['basic', 'address', 'family'],
    fieldLabels: {
      basic: 'Basic identity (name, DOB)',
      address: 'Address information',
      family: 'Family information',
    },
  },
  {
    id: 'revenue',
    name: 'Revenue / Income Department',
    icon: 'fa-landmark',
    purpose: 'Income certificate issuance',
    duration: 'Single issuance (30 days)',
    fields: ['basic', 'address', 'family', 'employment', 'bank'],
    fieldLabels: {
      basic: 'Basic identity (name, DOB)',
      address: 'Address information',
      family: 'Family information',
      employment: 'Employment information',
      bank: 'Bank verification (status only)',
    },
  },
  {
    id: 'utility',
    name: 'Utility Services Board',
    icon: 'fa-bolt',
    purpose: 'Subsidy application',
    duration: 'Until subsidy is processed (max 60 days)',
    fields: ['basic', 'address', 'bank'],
    fieldLabels: {
      basic: 'Basic identity (name, DOB)',
      address: 'Address information',
      bank: 'Bank verification (status only)',
    },
  },
];

const STEPS = [
  { id: 1, label: 'Personal', icon: 'fa-user' },
  { id: 2, label: 'Identity', icon: 'fa-id-card' },
  { id: 3, label: 'Address', icon: 'fa-house' },
  { id: 4, label: 'Family', icon: 'fa-users' },
  { id: 5, label: 'Education', icon: 'fa-graduation-cap' },
  { id: 6, label: 'Employment', icon: 'fa-briefcase' },
  { id: 7, label: 'Bank', icon: 'fa-building-columns' },
  { id: 8, label: 'Documents', icon: 'fa-file-shield' },
  { id: 9, label: 'Emergency', icon: 'fa-truck-medical' },
  { id: 10, label: 'Review & Consent', icon: 'fa-file-signature' },
];

const DOC_CATALOG = [
  { type: 'identityProof', label: 'Identity Proof (Aadhaar / Voter ID)', required: true },
  { type: 'addressProof', label: 'Address Proof', required: false },
  { type: 'birthCertificate', label: 'Birth Certificate', required: false },
  { type: 'educationCertificate', label: 'Education Certificate', required: false },
  { type: 'incomeCertificate', label: 'Income Certificate', required: false },
  { type: 'casteCertificate', label: 'Caste Certificate (if applicable)', required: false },
  { type: 'otherCertificate', label: 'Other Government Certificate', required: false },
];

const emptyAddress = () => ({
  line1: '',
  line2: '',
  village: '',
  district: '',
  state: '',
  pincode: '',
  country: 'India',
  residenceType: '',
});

const initialData = {
  basic: {
    fullName: '',
    nameAsPerId: '',
    dob: '',
    gender: '',
    nationality: 'Indian',
    maritalStatus: '',
    photograph: null,
    preferredLanguage: '',
    mobile: '',
    email: '',
    mobileVerified: false,
    emailVerified: false,
  },
  identity: {
    docType: '',
    docNumber: '',
    issueDate: '',
    issuingAuthority: '',
    verified: false,
  },
  address: {
    sameAsCurrent: true,
    current: emptyAddress(),
    permanent: emptyAddress(),
  },
  family: {
    father: { name: '', dob: '', currentLocation: '', permanentLocation: '', occupation: '', contact: '' },
    mother: { name: '', dob: '', currentLocation: '', permanentLocation: '', occupation: '', contact: '' },
    guardian: { applicable: false, name: '', relationship: '', dob: '', contact: '', address: '' },
  },
  education: {
    entries: [
      { level: '', institution: '', board: '', course: '', passingYear: '', rollNumber: '' },
    ],
  },
  employment: {
    status: '',
    organization: '',
    jobRole: '',
    workLocation: '',
    employmentId: '',
    institution: '',
    course: '',
    yearSemester: '',
    studentId: '',
  },
  bank: {
    accountHolder: '',
    bankName: '',
    branch: '',
    accountType: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    verified: false,
    acknowledged: false,
  },
  documents: {},
  emergency: { name: '', relationship: '', mobile: '', address: '' },
  consents: {},
  submitted: false,
};

/* ---------------- helpers ---------------- */

const maskIdNumber = (num) => {
  if (!num) return '';
  const clean = String(num).replace(/\s/g, '');
  if (clean.length <= 4) return '•'.repeat(clean.length);
  return 'XXXX XXXX ' + clean.slice(-4);
};

const maskAccount = (num) => {
  if (!num) return '';
  const clean = String(num).replace(/\s/g, '');
  if (clean.length <= 4) return '•'.repeat(clean.length);
  return '•'.repeat(Math.max(clean.length - 4, 4)) + clean.slice(-4);
};

const validIFSC = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
const validPIN = (v) => /^\d{6}$/.test(v);
const validPhone = (v) => /^\d{10}$/.test(v);
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const validateAadhaarVerhoeff = (aadhaar) => {
  if (!/^\d{12}$/.test(aadhaar)) return false;
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
  let c = 0;
  const inverted = aadhaar.split('').reverse().map(Number);
  for (let i = 0; i < inverted.length; i++) {
    c = d[c][p[i % 8][inverted[i]]];
  }
  return c === 0;
};

/* ---------------- reusable UI (defined outside to avoid remounts) ---------------- */

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  optional = false,
  options = null,
  maxLength,
  placeholder,
  hint,
  error,
  disabled,
}) {
  return (
    <div className={`cp-field ${error ? 'cp-field-invalid' : ''}`}>
      <label>
        {label} {required && <span className="cp-req">*</span>}
        {optional && <span className="cp-optional">(optional)</span>}
      </label>
      {options ? (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          rows={2}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
      {hint && <small className="cp-hint">{hint}</small>}
      {error && <span className="cp-field-error">{error}</span>}
    </div>
  );
}

function OtpBox({ title, sent, verified, busy, value, onValueChange, onStart, onConfirm }) {
  return (
    <div className="cp-otp-box">
      <div className="cp-otp-head">
        <span>{title}</span>
        {verified && (
          <span className="cp-badge cp-badge-green">
            <i className="fa-solid fa-check"></i> Verified
          </span>
        )}
      </div>
      {!verified && (
        <>
          {!sent ? (
            <button
              type="button"
              className="cp-btn cp-btn-outline"
              onClick={onStart}
              disabled={busy}
            >
              {busy ? 'Sending…' : 'Send OTP'}
            </button>
          ) : (
            <div className="cp-otp-input-row">
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
              />
              <button type="button" className="cp-btn cp-btn-primary" onClick={onConfirm}>
                Verify
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AddressFields({ prefix, required, get, set, errors }) {
  return (
    <div className="cp-grid">
      <Field label="Address Line 1" required={required} value={get(`${prefix}.line1`)} onChange={(v) => set(`${prefix}.line1`, v)} error={errors[`${prefix}.line1`]} />
      <Field label="Address Line 2" value={get(`${prefix}.line2`)} onChange={(v) => set(`${prefix}.line2`, v)} />
      <Field label="Village / Town / City" required={required} value={get(`${prefix}.village`)} onChange={(v) => set(`${prefix}.village`, v)} error={errors[`${prefix}.village`]} />
      <Field label="District" required={required} value={get(`${prefix}.district`)} onChange={(v) => set(`${prefix}.district`, v)} error={errors[`${prefix}.district`]} />
      <Field label="State" required={required} value={get(`${prefix}.state`)} onChange={(v) => set(`${prefix}.state`, v)} error={errors[`${prefix}.state`]} />
      <Field label="PIN Code" required={required} maxLength={6} value={get(`${prefix}.pincode`)} onChange={(v) => set(`${prefix}.pincode`, v)} error={errors[`${prefix}.pincode`]} />
      <Field label="Country" required={required} value={get(`${prefix}.country`)} onChange={(v) => set(`${prefix}.country`, v)} error={errors[`${prefix}.country`]} />
      <Field
        label="Residence Type"
        options={['Owned', 'Rented', 'Government Quarters', 'With Family', 'Other']}
        value={get(`${prefix}.residenceType`)}
        onChange={(v) => set(`${prefix}.residenceType`, v)}
      />
    </div>
  );
}

/* ---------------- main component ---------------- */

export default function CitizenProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const photoInputRef = useRef(null);
  const topRef = useRef(null);
  const loadedRef = useRef(false);

  // Local (session) OTP artifacts — never persisted
  const [mobileOtp, setMobileOtp] = useState({ sent: false, value: '', expected: '', busy: false });
  const [emailOtp, setEmailOtp] = useState({ sent: false, value: '', expected: '', busy: false });
  const [idOtp, setIdOtp] = useState({ sent: false, value: '', expected: '', busy: false });
  const [bankOtp, setBankOtp] = useState({ sent: false, value: '', expected: '', busy: false });

  const [docModal, setDocModal] = useState(null);
  const [docForm, setDocForm] = useState({ file: null, name: '', number: '', expiry: '' });
  const [auditOpen, setAuditOpen] = useState(false);

  /* ---------- deep get/set ---------- */

  const get = (path, obj = data) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

  const set = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  /* ---------- load / persistence (save & resume) ---------- */

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || loadedRef.current) return;
      loadedRef.current = true;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.citizenProfile) {
            setData((prev) => ({ ...prev, ...d.citizenProfile }));
          }
        }
      } catch (err) {
        console.error('Failed to load citizen profile:', err);
      }
    };
    load();
  }, [user]);

  const persist = async (overrides = {}, stepForSave = step) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { citizenProfile: { ...data, ...overrides, lastStep: stepForSave } },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  /* ---------- audit trail ---------- */

  const logAuditEvent = async (event) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'dataAccessHistory'), {
        ...event,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to write audit event:', err);
    }
  };

  /* ---------- validation ---------- */

  const validateStep = (s) => {
    const errs = {};
    const req = (path, label) => {
      const v = get(path);
      if (v == null || String(v).trim() === '') errs[path] = `${label} is required`;
    };
    const mobileVerified = get('basic.mobileVerified');
    const emailVerified = get('basic.emailVerified');

    if (s === 1) {
      req('basic.fullName', 'Full name');
      req('basic.nameAsPerId', 'Name as per government ID');
      req('basic.dob', 'Date of birth');
      req('basic.gender', 'Gender');
      req('basic.preferredLanguage', 'Preferred language');
      req('basic.mobile', 'Mobile number');
      req('basic.email', 'Email address');
      if (get('basic.mobile') && !validPhone(get('basic.mobile')))
        errs['basic.mobile'] = 'Enter a valid 10-digit mobile number';
      if (get('basic.email') && !validEmail(get('basic.email')))
        errs['basic.email'] = 'Enter a valid email address';
      if (!errs['basic.mobile'] && !mobileVerified)
        errs['basic.mobile'] = 'Verify your mobile number with OTP';
      if (!errs['basic.email'] && !emailVerified)
        errs['basic.email'] = 'Verify your email with OTP';
    }
    if (s === 2) {
      req('identity.docType', 'Identity document type');
      req('identity.docNumber', 'Identity document number');
      req('identity.issueDate', 'Date of issue');
      req('identity.issuingAuthority', 'Issuing authority');
      const num = get('identity.docNumber');
      if (num && get('identity.docType') === 'Aadhaar' && !validateAadhaarVerhoeff(num)) {
        errs['identity.docNumber'] = 'Invalid Aadhaar number (checksum failed)';
      }
    }
    if (s === 3) {
      const reqAddr = (prefix, labelPrefix) => {
        req(`${prefix}.line1`, `${labelPrefix} address line 1`);
        req(`${prefix}.village`, `${labelPrefix} village / town / city`);
        req(`${prefix}.district`, `${labelPrefix} district`);
        req(`${prefix}.state`, `${labelPrefix} state`);
        req(`${prefix}.pincode`, `${labelPrefix} PIN code`);
        req(`${prefix}.country`, `${labelPrefix} country`);
      };
      reqAddr('address.current', 'Current');
      if (get('address.current.pincode') && !validPIN(get('address.current.pincode')))
        errs['address.current.pincode'] = 'PIN code must be 6 digits';
      if (!get('address.sameAsCurrent')) {
        reqAddr('address.permanent', 'Permanent');
        if (get('address.permanent.pincode') && !validPIN(get('address.permanent.pincode')))
          errs['address.permanent.pincode'] = 'PIN code must be 6 digits';
      }
    }
    if (s === 5) {
      const first = get('education.entries.0');
      if (!first || !first.level) errs['education.entries.0.level'] = 'Education level is required';
      if (!first || !first.institution)
        errs['education.entries.0.institution'] = 'Institution is required';
      if (!first || !first.passingYear)
        errs['education.entries.0.passingYear'] = 'Passing year is required';
    }
    if (s === 6) {
      req('employment.status', 'Employment status');
      if (get('employment.status') === 'Employed') {
        req('employment.organization', 'Organization');
        req('employment.jobRole', 'Job role');
      }
      if (get('employment.status') === 'Student') {
        req('employment.institution', 'Institution');
        req('employment.course', 'Course');
      }
    }
    if (s === 7) {
      req('bank.accountHolder', 'Account holder name');
      req('bank.bankName', 'Bank name');
      req('bank.branch', 'Branch');
      req('bank.accountType', 'Account type');
      req('bank.accountNumber', 'Account number');
      req('bank.confirmAccountNumber', 'Confirm account number');
      req('bank.ifsc', 'IFSC code');
      if (
        get('bank.accountNumber') &&
        get('bank.accountNumber') !== get('bank.confirmAccountNumber')
      )
        errs['bank.confirmAccountNumber'] = 'Account numbers do not match';
      if (get('bank.ifsc') && !validIFSC(get('bank.ifsc')))
        errs['bank.ifsc'] = 'IFSC format: 4 letters + 0 + 6 characters (e.g. SBIN0001234)';
      if (!get('bank.acknowledged'))
        errs['bank.acknowledged'] = 'Please acknowledge the bank data usage notice';
    }
    if (s === 8) {
      if (!get('documents.identityProof'))
        errs['documents.identityProof'] = 'Identity proof upload is required';
    }
    if (s === 9) {
      req('emergency.name', 'Emergency contact name');
      req('emergency.relationship', 'Relationship');
      req('emergency.mobile', 'Mobile number');
      if (get('emergency.mobile') && !validPhone(get('emergency.mobile')))
        errs['emergency.mobile'] = 'Enter a valid 10-digit mobile number';
    }
    return errs;
  };

  /* ---------- OTP delivery (EmailJS) ---------- */

  const sendOtpEmail = async (otp, type) => {
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: user?.name || 'Citizen',
          to_email: user?.email,
          user_email: user?.email,
          email: user?.email,
          reply_to: user?.email,
          otp,
          type,
          verification_type: type,
          doc_type: type,
          message: `Your OTP for ${type} verification is ${otp}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      return true;
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Failed to send OTP email. Please check your EmailJS configuration.');
      return false;
    }
  };

  const startMobileOtp = async () => {
    if (!validPhone(get('basic.mobile'))) {
      alert('Enter a valid 10-digit mobile number first.');
      return;
    }
    setMobileOtp((p) => ({ ...p, busy: true }));
    const otp = generateOtp();
    const ok = await sendOtpEmail(otp, 'Mobile Number');
    setMobileOtp((p) => ({ ...p, busy: false, sent: ok, expected: ok ? otp : '' }));
  };

  const confirmMobileOtp = async () => {
    if (mobileOtp.value !== mobileOtp.expected) {
      alert('Invalid OTP. Please try again.');
      return;
    }
    setMobileOtp((p) => ({ ...p, sent: false, value: '' }));
    set('basic.mobileVerified', true);
    // Deep override so the flag is persisted immediately (closure `data` is stale here)
    persist({ basic: { ...data.basic, mobileVerified: true } });
    logAuditEvent({
      department: 'Citizen Master Profile Registry',
      requested: 'Mobile number ownership (OTP verified)',
      purpose: 'Self-verification of contact details',
      status: 'Verified',
      type: 'otp-verified',
    });
    alert('Mobile number verified!');
  };

  const startEmailOtp = async () => {
    if (!validEmail(get('basic.email'))) {
      alert('Enter a valid email address first.');
      return;
    }
    setEmailOtp((p) => ({ ...p, busy: true }));
    const otp = generateOtp();
    const ok = await sendOtpEmail(otp, 'Email Address');
    setEmailOtp((p) => ({ ...p, busy: false, sent: ok, expected: ok ? otp : '' }));
  };

  const confirmEmailOtp = () => {
    if (emailOtp.value !== emailOtp.expected) {
      alert('Invalid OTP. Please try again.');
      return;
    }
    setEmailOtp((p) => ({ ...p, sent: false, value: '' }));
    set('basic.emailVerified', true);
    persist({ basic: { ...data.basic, emailVerified: true } });
    logAuditEvent({
      department: 'Citizen Master Profile Registry',
      requested: 'Email address ownership (OTP verified)',
      purpose: 'Self-verification of contact details',
      status: 'Verified',
      type: 'otp-verified',
    });
    alert('Email verified!');
  };

  const startIdOtp = async () => {
    if (!get('identity.docNumber')) {
      alert('Enter an identity document number first.');
      return;
    }
    setIdOtp((p) => ({ ...p, busy: true }));
    const otp = generateOtp();
    const ok = await sendOtpEmail(otp, 'Identity Verification');
    setIdOtp((p) => ({ ...p, busy: false, sent: ok, expected: ok ? otp : '' }));
  };

  const confirmIdOtp = () => {
    if (idOtp.value !== idOtp.expected) {
      alert('Invalid OTP. Please try again.');
      return;
    }
    setIdOtp((p) => ({ ...p, sent: false, value: '' }));
    set('identity.verified', true);
    persist({ identity: { ...data.identity, verified: true } });
    logAuditEvent({
      department: 'Citizen Master Profile Registry',
      requested: 'Identity document ownership (OTP verified)',
      purpose: 'Self-verification of identity details',
      status: 'Verified',
      type: 'otp-verified',
    });
    alert('Identity document verified!');
  };

  const startBankOtp = async () => {
    setBankOtp((p) => ({ ...p, busy: true }));
    const otp = generateOtp();
    const ok = await sendOtpEmail(otp, 'Bank Account Verification');
    setBankOtp((p) => ({ ...p, busy: false, sent: ok, expected: ok ? otp : '' }));
  };

  const confirmBankOtp = () => {
    if (bankOtp.value !== bankOtp.expected) {
      alert('Invalid OTP. Please try again.');
      return;
    }
    setBankOtp((p) => ({ ...p, sent: false, value: '' }));
    set('bank.verified', true);
    persist({ bank: { ...data.bank, verified: true } });
    logAuditEvent({
      department: 'Citizen Master Profile Registry',
      requested: 'Bank account ownership (OTP verified)',
      purpose: 'Self-verification of bank details',
      status: 'Verified',
      type: 'otp-verified',
    });
    alert('Bank account verified!');
  };

  /* ---------- documents ---------- */

  const openDocModal = (type) => {
    const existing = get(`documents.${type}`);
    setDocForm({
      file: null,
      name: existing?.name || '',
      number: existing?.number || '',
      expiry: existing?.expiry || '',
    });
    setDocModal(type);
  };

  const saveDocModal = async () => {
    if (!docModal) return;
    const existing = get(`documents.${docModal}`);
    if (!docForm.file && !existing?.url) {
      alert('Please choose a file to upload.');
      return;
    }
    try {
      let payload = {
        name: docForm.name,
        number: docForm.number,
        expiry: docForm.expiry,
      };
      if (docForm.file) {
        const uploaded = await uploadDocument(docForm.file);
        payload = {
          ...payload,
          fileName: docForm.file.name,
          url: uploaded.url,
          uploadedAt: new Date().toISOString(),
          status: 'Uploaded',
        };
      } else if (existing) {
        payload = { ...existing, ...payload };
      }
      set(`documents.${docModal}`, payload);
      setDocModal(null);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`documents.${docModal}`];
        return next;
      });
      // Deep override so the document is persisted immediately (closure `data` is stale here)
      persist({ documents: { ...data.documents, [docModal]: payload } });
      const docMeta = DOC_CATALOG.find((d) => d.type === docModal);
      logAuditEvent({
        department: 'Citizen Master Profile Registry',
        requested: `${docMeta?.label || docModal} uploaded${docForm.file ? ` (${docForm.file.name})` : ''}`,
        purpose: 'Document vault upload',
        status: 'Uploaded',
        type: 'document-uploaded',
      });
    } catch (err) {
      console.error('Document upload failed:', err);
      alert('Failed to upload document. Please try again.');
    }
  };

  const docStatusClass = (status) => {
    const map = {
      Uploaded: 'cp-badge-blue',
      'Under Verification': 'cp-badge-amber',
      Verified: 'cp-badge-green',
      Rejected: 'cp-badge-red',
    };
    return map[status] || 'cp-badge-gray';
  };

  /* ---------- consent ---------- */

  const grantConsent = async (dept) => {
    const record = {
      departmentId: dept.id,
      departmentName: dept.name,
      purpose: dept.purpose,
      duration: dept.duration,
      fieldsShared: dept.fields,
      fieldLabels: dept.fieldLabels,
      grantedAt: new Date().toISOString(),
      status: 'Authorized',
    };
    const nextConsents = { ...data.consents, [dept.id]: record };
    setData((prev) => ({ ...prev, consents: nextConsents }));
    await persist({ consents: nextConsents });
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'dataAccessHistory'), {
          department: dept.name,
          departmentId: dept.id,
          requested: dept.fields.map((f) => dept.fieldLabels[f]).join(', '),
          purpose: dept.purpose,
          status: 'Authorized',
          type: 'consent-granted',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to write access history:', err);
      }
    }
  };

  const revokeConsent = async (dept) => {
    if (!window.confirm(`Revoke consent for ${dept.name}? They will lose access immediately.`)) return;
    const record = {
      ...data.consents[dept.id],
      status: 'Revoked',
      revokedAt: new Date().toISOString(),
    };
    const nextConsents = { ...data.consents, [dept.id]: record };
    setData((prev) => ({ ...prev, consents: nextConsents }));
    await persist({ consents: nextConsents });
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'dataAccessHistory'), {
          department: dept.name,
          departmentId: dept.id,
          purpose: dept.purpose,
          status: 'Revoked',
          type: 'consent-revoked',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to write access history:', err);
      }
    }
  };

  /* ---------- navigation & submit ---------- */

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  const goTo = (n) => {
    if (n > step) {
      const errs = validateStep(step);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      persist();
    }
    setStep(n);
    setErrors({});
    scrollToTop();
  };

  const next = () => goTo(step + 1);
  const prev = () => goTo(step - 1);

  const saveDraft = async () => {
    setSaving(true);
    await persist();
    await logAuditEvent({
      department: 'Citizen Master Profile Registry',
      requested: `Draft saved at step ${step} of 10 (${STEPS[step - 1]?.label || 'Unknown'})`,
      purpose: 'Save & resume draft',
      status: 'Completed',
      type: 'draft-saved',
    });
    setSaving(false);
    alert('Draft saved. You can resume anytime from this page.');
  };

  const handleSubmit = async () => {
    // Validate ALL steps 1-9 before final submission
    for (let s = 1; s <= 9; s++) {
      const errs = validateStep(s);
      if (Object.keys(errs).length > 0) {
        setStep(s);
        setErrors(errs);
        scrollToTop();
        alert(`Step ${s} has incomplete information. Please complete it before submitting.`);
        return;
      }
    }
    if (!window.confirm('Submit your Citizen Master Profile? You can still edit sections later.')) return;

    setSubmitting(true);
    try {
      const completedAt = new Date().toISOString();
      await setDoc(
        doc(db, 'users', user.uid),
        { citizenProfile: { ...data, submitted: true, completedAt, lastStep: 10 } },
        { merge: true }
      );
      await addDoc(collection(db, 'users', user.uid, 'dataAccessHistory'), {
        department: 'Citizen Master Profile Registry',
        requested: 'Profile creation & self-verification',
        purpose: 'Master profile registration',
        status: 'Completed',
        type: 'profile-submitted',
        createdAt: serverTimestamp(),
      });
      setShowSuccess(true);
      scrollToTop();
    } catch (err) {
      console.error('Failed to submit profile:', err);
      alert('Failed to submit profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- derived ---------- */

  const mobileVerified = get('basic.mobileVerified') || false;
  const emailVerified = get('basic.emailVerified') || false;
  const identityVerified = get('identity.verified') || false;
  const bankVerified = get('bank.verified') || false;

  const reviewSections = [
    {
      title: 'Personal Information',
      icon: 'fa-user',
      editStep: 1,
      rows: [
        ['Full Name', get('basic.fullName')],
        ['Name as per ID', get('basic.nameAsPerId')],
        ['Date of Birth', get('basic.dob')],
        ['Gender', get('basic.gender')],
        ['Nationality', get('basic.nationality')],
        ['Marital Status', get('basic.maritalStatus') || '—'],
        ['Preferred Language', get('basic.preferredLanguage')],
        ['Mobile', get('basic.mobile') ? `${get('basic.mobile')} ${mobileVerified ? '✓ verified' : ''}` : '—'],
        ['Email', get('basic.email') || '—'],
      ],
    },
    {
      title: 'Identity Information',
      icon: 'fa-id-card',
      editStep: 2,
      rows: [
        ['Document Type', get('identity.docType') || '—'],
        ['Document Number', get('identity.docNumber') ? maskIdNumber(get('identity.docNumber')) : '—'],
        ['Date of Issue', get('identity.issueDate') || '—'],
        ['Issuing Authority', get('identity.issuingAuthority') || '—'],
        ['Verification', identityVerified ? 'Verified ✓' : 'Pending'],
      ],
    },
    {
      title: 'Address',
      icon: 'fa-house',
      editStep: 3,
      rows: [
        [
          'Current',
          [
            get('address.current.line1'),
            get('address.current.line2'),
            get('address.current.village'),
            get('address.current.district'),
            get('address.current.state'),
            get('address.current.pincode'),
          ]
            .filter(Boolean)
            .join(', ') || '—',
        ],
        [
          'Permanent',
          get('address.sameAsCurrent')
            ? 'Same as current'
            : [
                get('address.permanent.line1'),
                get('address.permanent.village'),
                get('address.permanent.district'),
                get('address.permanent.state'),
                get('address.permanent.pincode'),
              ]
                .filter(Boolean)
                .join(', ') || '—',
        ],
      ],
    },
    {
      title: 'Family Information',
      icon: 'fa-users',
      editStep: 4,
      rows: [
        ['Father', get('family.father.name') ? `${get('family.father.name')} — ${get('family.father.occupation') || 'occupation not set'}` : '—'],
        ['Mother', get('family.mother.name') ? `${get('family.mother.name')} — ${get('family.mother.occupation') || 'occupation not set'}` : '—'],
        ['Guardian', get('family.guardian.applicable') ? `${get('family.guardian.name')} (${get('family.guardian.relationship')})` : 'Not applicable'],
      ],
    },
    {
      title: 'Education',
      icon: 'fa-graduation-cap',
      editStep: 5,
      rows: (get('education.entries') || []).map((e, i) => [
        `Record ${i + 1}`,
        [e.level, e.institution, e.course, e.passingYear].filter(Boolean).join(' • ') || '—',
      ]),
    },
    {
      title: 'Employment',
      icon: 'fa-briefcase',
      editStep: 6,
      rows: [
        ['Status', get('employment.status') || '—'],
        ...(get('employment.status') === 'Employed'
          ? [
              ['Organization', get('employment.organization') || '—'],
              ['Job Role', get('employment.jobRole') || '—'],
              ['Work Location', get('employment.workLocation') || '—'],
            ]
          : []),
        ...(get('employment.status') === 'Student'
          ? [
              ['Institution', get('employment.institution') || '—'],
              ['Course', get('employment.course') || '—'],
              ['Year / Semester', get('employment.yearSemester') || '—'],
            ]
          : []),
      ],
    },
    {
      title: 'Bank Information (Restricted)',
      icon: 'fa-building-columns',
      editStep: 7,
      rows: [
        ['Account Holder', get('bank.accountHolder') || '—'],
        ['Bank & Branch', [get('bank.bankName'), get('bank.branch')].filter(Boolean).join(', ') || '—'],
        ['Account Number', get('bank.accountNumber') ? maskAccount(get('bank.accountNumber')) : '—'],
        ['IFSC', get('bank.ifsc') || '—'],
        ['Verification', bankVerified ? 'Verified ✓' : 'Pending'],
      ],
    },
    {
      title: 'Documents',
      icon: 'fa-file-shield',
      editStep: 8,
      rows: DOC_CATALOG.map((d) => [
        d.label,
        get(`documents.${d.type}`)?.url ? get(`documents.${d.type}`).status || 'Uploaded' : 'Not uploaded',
      ]),
    },
    {
      title: 'Emergency Contact',
      icon: 'fa-truck-medical',
      editStep: 9,
      rows: [
        ['Name', get('emergency.name') || '—'],
        ['Relationship', get('emergency.relationship') || '—'],
        ['Mobile', get('emergency.mobile') || '—'],
        ['Address', get('emergency.address') || '—'],
      ],
    },
  ];

  /* ---------- render ---------- */

  return (
    <div className="cp-root" ref={topRef}>
      {/* Header */}
      <div className="cp-header">
        <div>
          <h1>
            <i className="fa-solid fa-id-badge"></i> Citizen Master Profile
          </h1>
          <p>
            Provide your information once. Authorized departments receive only the minimum fields
            they need — with your consent, and every access is audit-logged.
          </p>
        </div>
        <div className="cp-header-badges">
          <span className="cp-badge cp-badge-green">
            <i className="fa-solid fa-lock"></i> Encrypted
          </span>
          <button
            type="button"
            className="cp-badge cp-badge-blue cp-badge-clickable"
            onClick={() => setAuditOpen(true)}
            title="View your full data access history"
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Audit-logged
          </button>
          <span className="cp-badge cp-badge-amber">
            <i className="fa-solid fa-user-shield"></i> Consent-based
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="cp-stepper" role="navigation" aria-label="Profile steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            className={`cp-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}
            onClick={() => goTo(s.id)}
            title={`Step ${s.id}: ${s.label}`}
          >
            <span className="cp-step-dot">
              {step > s.id ? <i className="fa-solid fa-check"></i> : s.id}
            </span>
            <span className="cp-step-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="cp-banner cp-banner-success">
          <i className="fa-solid fa-circle-check"></i>
          <div>
            <strong>Citizen Master Profile submitted successfully!</strong>
            <p>
              Your profile is now verified information that authorized departments can request
              through the consent layer. You can edit any section — changes will be re-verified
              where applicable.
            </p>
          </div>
        </div>
      )}

      {/* STEP CONTENT */}
      <div className="cp-card">
        {/* STEP 1 */}
        {step === 1 && (
          <section>
            <h2>Step 1 — Basic Personal Information</h2>
            <p className="cp-section-desc">
              Establishes your identity across all government services. Mobile and email are
              verified via OTP.
            </p>
            <div className="cp-grid">
              <Field label="Full Name" required value={get('basic.fullName')} onChange={(v) => set('basic.fullName', v)} error={errors['basic.fullName']} placeholder="e.g. Aarav Sharma" />
              <Field label="Name as per Government ID" required value={get('basic.nameAsPerId')} onChange={(v) => set('basic.nameAsPerId', v)} error={errors['basic.nameAsPerId']} placeholder="Exactly as printed on your ID" />
              <Field label="Date of Birth" type="date" required value={get('basic.dob')} onChange={(v) => set('basic.dob', v)} error={errors['basic.dob']} />
              <Field label="Gender" required options={['Male', 'Female', 'Other', 'Prefer not to say']} value={get('basic.gender')} onChange={(v) => set('basic.gender', v)} error={errors['basic.gender']} />
              <Field label="Nationality" required value={get('basic.nationality')} onChange={(v) => set('basic.nationality', v)} error={errors['basic.nationality']} />
              <Field label="Marital Status" optional options={['Single', 'Married', 'Widowed', 'Divorced']} value={get('basic.maritalStatus')} onChange={(v) => set('basic.maritalStatus', v)} />
              <Field
                label="Preferred Language"
                required
                options={['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Other']}
                value={get('basic.preferredLanguage')}
                onChange={(v) => set('basic.preferredLanguage', v)}
                error={errors['basic.preferredLanguage']}
              />
              <Field label="Mobile Number" required maxLength={10} placeholder="10-digit mobile" value={get('basic.mobile')} onChange={(v) => set('basic.mobile', v)} error={errors['basic.mobile']} />
              <Field label="Email Address" type="email" required value={get('basic.email')} onChange={(v) => set('basic.email', v)} error={errors['basic.email']} />
              <div className="cp-field">
                <label>Photograph</label>
                <button type="button" className="cp-btn cp-btn-outline" onClick={() => photoInputRef.current?.click()}>
                  <i className="fa-solid fa-camera"></i>{' '}
                  {get('basic.photograph.url') ? 'Photo added ✓ (click to replace)' : 'Upload photograph'}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const uploaded = await uploadDocument(file);
                      const photo = { url: uploaded.url, name: file.name };
                      set('basic.photograph', photo);
                      // Deep override so the photo is persisted immediately (closure `data` is stale here)
                      persist({ basic: { ...data.basic, photograph: photo } });
                      logAuditEvent({
                        department: 'Citizen Master Profile Registry',
                        requested: `Photograph uploaded (${file.name})`,
                        purpose: 'Profile photograph',
                        status: 'Uploaded',
                        type: 'document-uploaded',
                      });
                    } catch {
                      alert('Failed to upload photograph.');
                    }
                  }}
                />
              </div>
            </div>
            <div className="cp-otp-row">
              <OtpBox
                title="Mobile verification (OTP)"
                sent={mobileOtp.sent}
                verified={mobileVerified}
                busy={mobileOtp.busy}
                value={mobileOtp.value}
                onValueChange={(v) => setMobileOtp((p) => ({ ...p, value: v }))}
                onStart={startMobileOtp}
                onConfirm={confirmMobileOtp}
              />
              <OtpBox
                title="Email verification (OTP)"
                sent={emailOtp.sent}
                verified={emailVerified}
                busy={emailOtp.busy}
                value={emailOtp.value}
                onValueChange={(v) => setEmailOtp((p) => ({ ...p, value: v }))}
                onStart={startEmailOtp}
                onConfirm={confirmEmailOtp}
              />
            </div>
          </section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <section>
            <h2>Step 2 — Identity Information</h2>
            <p className="cp-section-desc">
              Sensitive ID numbers are always displayed masked. Departments receive your
              verification status — the raw number is never shared without explicit consent.
            </p>
            <div className="cp-grid">
              <Field
                label="Identity Document Type"
                required
                options={['Aadhaar', 'Voter ID', 'Passport', 'Driving Licence']}
                value={get('identity.docType')}
                onChange={(v) => set('identity.docType', v)}
                error={errors['identity.docType']}
              />
              <Field
                label="Identity Document Number"
                required
                maxLength={12}
                placeholder={get('identity.docType') === 'Aadhaar' ? '12-digit Aadhaar number' : 'Number as printed'}
                value={get('identity.docNumber')}
                onChange={(v) => set('identity.docNumber', v)}
                error={errors['identity.docNumber']}
                hint={get('identity.docNumber') ? `Shown as: ${maskIdNumber(get('identity.docNumber'))}` : undefined}
              />
              <Field label="Date of Issue" type="date" required value={get('identity.issueDate')} onChange={(v) => set('identity.issueDate', v)} error={errors['identity.issueDate']} />
              <Field label="Issuing Authority" required placeholder="e.g. UIDAI / RTO / Passport Office" value={get('identity.issuingAuthority')} onChange={(v) => set('identity.issuingAuthority', v)} error={errors['identity.issuingAuthority']} />
              <div className="cp-field">
                <label>Verification Status</label>
                <div>
                  {identityVerified ? (
                    <span className="cp-badge cp-badge-green">Verified ✓</span>
                  ) : (
                    <span className="cp-badge cp-badge-amber">Pending verification</span>
                  )}
                </div>
              </div>
            </div>

            {!identityVerified && (
              <div className="cp-notice cp-notice-info">
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <strong>Verify your identity document.</strong>
                  <p>An OTP will be sent to your registered email to confirm the number you entered.</p>
                  {!idOtp.sent ? (
                    <button type="button" className="cp-btn cp-btn-primary" onClick={startIdOtp} disabled={idOtp.busy}>
                      {idOtp.busy ? 'Sending…' : 'Verify via OTP'}
                    </button>
                  ) : (
                    <div className="cp-otp-input-row">
                      <input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={idOtp.value}
                        onChange={(e) => setIdOtp((p) => ({ ...p, value: e.target.value }))}
                      />
                      <button type="button" className="cp-btn cp-btn-primary" onClick={confirmIdOtp}>
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <section>
            <h2>Step 3 — Address Information</h2>
            <p className="cp-section-desc">Used for scheme eligibility (domicile) and delivery of benefits.</p>

            <h3 className="cp-subhead">Current Address</h3>
            <AddressFields prefix="address.current" required get={get} set={set} errors={errors} />

            <div className="cp-inline-choice">
              <span>Is your permanent address the same as your current address?</span>
              <label className="cp-radio">
                <input
                  type="radio"
                  name="sameAsCurrent"
                  checked={get('address.sameAsCurrent') === true}
                  onChange={() => set('address.sameAsCurrent', true)}
                />{' '}
                Yes
              </label>
              <label className="cp-radio">
                <input
                  type="radio"
                  name="sameAsCurrent"
                  checked={get('address.sameAsCurrent') === false}
                  onChange={() => set('address.sameAsCurrent', false)}
                />{' '}
                No
              </label>
            </div>

            {get('address.sameAsCurrent') === false && (
              <>
                <h3 className="cp-subhead">Permanent Address</h3>
                <AddressFields prefix="address.permanent" required get={get} set={set} errors={errors} />
              </>
            )}
          </section>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <section>
            <h2>Step 4 — Family Information</h2>
            <p className="cp-section-desc">
              Only needed for family-linked eligibility (e.g. income-based schemes). Contact numbers
              are optional — collect only when a service requires them.
            </p>
            <h3 className="cp-subhead">Father's Information</h3>
            <div className="cp-grid">
              <Field label="Full Name" value={get('family.father.name')} onChange={(v) => set('family.father.name', v)} />
              <Field label="Date of Birth" type="date" value={get('family.father.dob')} onChange={(v) => set('family.father.dob', v)} />
              <Field label="Current Location" value={get('family.father.currentLocation')} onChange={(v) => set('family.father.currentLocation', v)} />
              <Field label="Permanent Location" value={get('family.father.permanentLocation')} onChange={(v) => set('family.father.permanentLocation', v)} />
              <Field label="Occupation" value={get('family.father.occupation')} onChange={(v) => set('family.father.occupation', v)} />
              <Field label="Contact Number" optional maxLength={10} value={get('family.father.contact')} onChange={(v) => set('family.father.contact', v)} />
            </div>

            <h3 className="cp-subhead">Mother's Information</h3>
            <div className="cp-grid">
              <Field label="Full Name" value={get('family.mother.name')} onChange={(v) => set('family.mother.name', v)} />
              <Field label="Date of Birth" type="date" value={get('family.mother.dob')} onChange={(v) => set('family.mother.dob', v)} />
              <Field label="Current Location" value={get('family.mother.currentLocation')} onChange={(v) => set('family.mother.currentLocation', v)} />
              <Field label="Permanent Location" value={get('family.mother.permanentLocation')} onChange={(v) => set('family.mother.permanentLocation', v)} />
              <Field label="Occupation" value={get('family.mother.occupation')} onChange={(v) => set('family.mother.occupation', v)} />
              <Field label="Contact Number" optional maxLength={10} value={get('family.mother.contact')} onChange={(v) => set('family.mother.contact', v)} />
            </div>

            <div className="cp-inline-choice">
              <span>Do you have a legal guardian?</span>
              <label className="cp-radio">
                <input
                  type="radio"
                  name="guardianApplicable"
                  checked={get('family.guardian.applicable') === true}
                  onChange={() => set('family.guardian.applicable', true)}
                />{' '}
                Yes
              </label>
              <label className="cp-radio">
                <input
                  type="radio"
                  name="guardianApplicable"
                  checked={get('family.guardian.applicable') === false}
                  onChange={() => set('family.guardian.applicable', false)}
                />{' '}
                No
              </label>
            </div>

            {get('family.guardian.applicable') === true && (
              <>
                <h3 className="cp-subhead">Guardian Information</h3>
                <div className="cp-grid">
                  <Field label="Guardian Name" value={get('family.guardian.name')} onChange={(v) => set('family.guardian.name', v)} />
                  <Field label="Relationship" value={get('family.guardian.relationship')} onChange={(v) => set('family.guardian.relationship', v)} />
                  <Field label="Date of Birth" type="date" value={get('family.guardian.dob')} onChange={(v) => set('family.guardian.dob', v)} />
                  <Field label="Contact Number" maxLength={10} value={get('family.guardian.contact')} onChange={(v) => set('family.guardian.contact', v)} />
                  <Field label="Address" type="textarea" value={get('family.guardian.address')} onChange={(v) => set('family.guardian.address', v)} />
                </div>
              </>
            )}
          </section>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <section>
            <h2>Step 5 — Education Information</h2>
            <p className="cp-section-desc">
              Shared only with education / scholarship departments after your consent.
            </p>
            {(get('education.entries') || []).map((entry, idx) => (
              <div key={idx} className="cp-entry-card">
                <div className="cp-entry-head">
                  <strong>Education Record {idx + 1}</strong>
                  {idx > 0 && (
                    <button
                      type="button"
                      className="cp-btn cp-btn-danger-outline"
                      onClick={() => {
                        const entries = [...get('education.entries')];
                        entries.splice(idx, 1);
                        set('education.entries', entries);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Remove
                    </button>
                  )}
                </div>
                <div className="cp-grid">
                  <Field
                    label="Education Level"
                    required={idx === 0}
                    options={['Secondary (10th)', 'Senior Secondary (12th)', 'Diploma', 'Graduation', 'Post Graduation', 'Doctorate']}
                    value={entry.level}
                    onChange={(v) => set(`education.entries.${idx}.level`, v)}
                    error={errors[`education.entries.${idx}.level`]}
                  />
                  <Field label="School / College Name" required={idx === 0} value={entry.institution} onChange={(v) => set(`education.entries.${idx}.institution`, v)} error={errors[`education.entries.${idx}.institution`]} />
                  <Field label="Board / University" value={entry.board} onChange={(v) => set(`education.entries.${idx}.board`, v)} />
                  <Field label="Course / Degree" value={entry.course} onChange={(v) => set(`education.entries.${idx}.course`, v)} />
                  <Field label="Passing Year" required={idx === 0} maxLength={4} value={entry.passingYear} onChange={(v) => set(`education.entries.${idx}.passingYear`, v)} error={errors[`education.entries.${idx}.passingYear`]} />
                  <Field label="Registration / Roll Number" value={entry.rollNumber} onChange={(v) => set(`education.entries.${idx}.rollNumber`, v)} />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="cp-btn cp-btn-outline"
              style={{ marginTop: '12px' }}
              onClick={() =>
                set('education.entries', [
                  ...get('education.entries'),
                  { level: '', institution: '', board: '', course: '', passingYear: '', rollNumber: '' },
                ])
              }
            >
              <i className="fa-solid fa-plus"></i> Add Another Education Record
            </button>
          </section>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <section>
            <h2>Step 6 — Employment Information</h2>
            <p className="cp-section-desc">
              Conditional fields — you are only asked what is relevant to your status.
            </p>
            <div className="cp-grid">
              <Field
                label="Current Employment Status"
                required
                options={['Student', 'Employed', 'Self-employed', 'Unemployed', 'Other']}
                value={get('employment.status')}
                onChange={(v) => set('employment.status', v)}
                error={errors['employment.status']}
              />
            </div>
            {get('employment.status') === 'Employed' && (
              <div className="cp-grid" style={{ marginTop: '16px' }}>
                <Field label="Organization" required value={get('employment.organization')} onChange={(v) => set('employment.organization', v)} error={errors['employment.organization']} />
                <Field label="Job Role" required value={get('employment.jobRole')} onChange={(v) => set('employment.jobRole', v)} error={errors['employment.jobRole']} />
                <Field label="Work Location" value={get('employment.workLocation')} onChange={(v) => set('employment.workLocation', v)} />
                <Field label="Employment ID" value={get('employment.employmentId')} onChange={(v) => set('employment.employmentId', v)} />
              </div>
            )}
            {get('employment.status') === 'Student' && (
              <div className="cp-grid" style={{ marginTop: '16px' }}>
                <Field label="Institution" required value={get('employment.institution')} onChange={(v) => set('employment.institution', v)} error={errors['employment.institution']} />
                <Field label="Course" required value={get('employment.course')} onChange={(v) => set('employment.course', v)} error={errors['employment.course']} />
                <Field label="Year / Semester" value={get('employment.yearSemester')} onChange={(v) => set('employment.yearSemester', v)} />
                <Field label="Student ID" value={get('employment.studentId')} onChange={(v) => set('employment.studentId', v)} />
              </div>
            )}
          </section>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <section>
            <h2>Step 7 — Bank Information (Restricted Data)</h2>
            <div className="cp-notice cp-notice-warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Why we ask for this &amp; how it may be used:</strong>
                <ul>
                  <li>Your account number is stored encrypted and always shown to you masked.</li>
                  <li>
                    Departments receive only a <em>verification status</em> (e.g. "account verified"),
                    never the full number — unless you explicitly consent to a service that requires
                    it (e.g. Direct Benefit Transfer).
                  </li>
                  <li>Bank data is <strong>not</strong> part of general profile sharing.</li>
                </ul>
                <label className="cp-checkbox">
                  <input
                    type="checkbox"
                    checked={!!get('bank.acknowledged')}
                    onChange={(e) => set('bank.acknowledged', e.target.checked)}
                  />{' '}
                  I understand how my bank information will be used and shared.
                </label>
                {errors['bank.acknowledged'] && (
                  <span className="cp-field-error">{errors['bank.acknowledged']}</span>
                )}
              </div>
            </div>
            <div className="cp-grid">
              <Field label="Account Holder Name" required value={get('bank.accountHolder')} onChange={(v) => set('bank.accountHolder', v)} error={errors['bank.accountHolder']} />
              <Field label="Bank Name" required value={get('bank.bankName')} onChange={(v) => set('bank.bankName', v)} error={errors['bank.bankName']} />
              <Field label="Branch" required value={get('bank.branch')} onChange={(v) => set('bank.branch', v)} error={errors['bank.branch']} />
              <Field label="Account Type" required options={['Savings', 'Current', 'Other']} value={get('bank.accountType')} onChange={(v) => set('bank.accountType', v)} error={errors['bank.accountType']} />
              <Field label="Account Number" required value={get('bank.accountNumber')} onChange={(v) => set('bank.accountNumber', v)} error={errors['bank.accountNumber']} />
              <Field label="Confirm Account Number" required value={get('bank.confirmAccountNumber')} onChange={(v) => set('bank.confirmAccountNumber', v)} error={errors['bank.confirmAccountNumber']} />
              <Field label="IFSC Code" required maxLength={11} placeholder="SBIN0001234" hint="Format: 4 letters + 0 + 6 characters" value={get('bank.ifsc')} onChange={(v) => set('bank.ifsc', v.toUpperCase())} error={errors['bank.ifsc']} />
              <div className="cp-field">
                <label>Bank Verification Status</label>
                <div>
                  {bankVerified ? (
                    <span className="cp-badge cp-badge-green">Verified ✓</span>
                  ) : (
                    <span className="cp-badge cp-badge-amber">Pending verification</span>
                  )}
                </div>
                {get('bank.accountNumber') && (
                  <div className="cp-masked-value">
                    <i className="fa-solid fa-eye-slash"></i> {maskAccount(get('bank.accountNumber'))}
                  </div>
                )}
              </div>
            </div>

            {!bankVerified && (
              <div className="cp-notice cp-notice-info">
                <i className="fa-solid fa-building-columns"></i>
                <div>
                  <strong>Verify your bank account (recommended).</strong>
                  <p>An OTP will be sent to your registered email to confirm this account belongs to you.</p>
                  {!bankOtp.sent ? (
                    <button type="button" className="cp-btn cp-btn-primary" onClick={startBankOtp} disabled={bankOtp.busy}>
                      {bankOtp.busy ? 'Sending…' : 'Verify via OTP'}
                    </button>
                  ) : (
                    <div className="cp-otp-input-row">
                      <input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={bankOtp.value}
                        onChange={(e) => setBankOtp((p) => ({ ...p, value: e.target.value }))}
                      />
                      <button type="button" className="cp-btn cp-btn-primary" onClick={confirmBankOtp}>
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* STEP 8 */}
        {step === 8 && (
          <section>
            <h2>Step 8 — Government Documents</h2>
            <p className="cp-section-desc">
              Upload once. Verified documents are shared with authorized departments through the
              consent layer — no re-uploading for every service.
            </p>
            <div className="cp-doc-grid">
              {DOC_CATALOG.map((d) => {
                const info = get(`documents.${d.type}`);
                return (
                  <div key={d.type} className="cp-doc-card">
                    <div className="cp-doc-head">
                      <i className="fa-solid fa-file-lines"></i>
                      <strong>{d.label}</strong>
                      {d.required && <span className="cp-req">*</span>}
                    </div>
                    {info?.url ? (
                      <div className="cp-doc-status-row">
                        <span className={`cp-badge ${docStatusClass(info.status)}`}>
                          {info.status || 'Uploaded'}
                        </span>
                        <button type="button" className="cp-btn cp-btn-outline" onClick={() => openDocModal(d.type)}>
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="cp-btn cp-btn-outline" onClick={() => openDocModal(d.type)}>
                        <i className="fa-solid fa-upload"></i> Upload
                      </button>
                    )}
                    {errors[`documents.${d.type}`] && (
                      <span className="cp-field-error">{errors[`documents.${d.type}`]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 9 */}
        {step === 9 && (
          <section>
            <h2>Step 9 — Emergency Contact / Additional Information</h2>
            <p className="cp-section-desc">Used only in emergencies or where a specific service requires it.</p>
            <div className="cp-grid">
              <Field label="Name" required value={get('emergency.name')} onChange={(v) => set('emergency.name', v)} error={errors['emergency.name']} />
              <Field
                label="Relationship"
                required
                options={['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']}
                value={get('emergency.relationship')}
                onChange={(v) => set('emergency.relationship', v)}
                error={errors['emergency.relationship']}
              />
              <Field label="Mobile Number" required maxLength={10} value={get('emergency.mobile')} onChange={(v) => set('emergency.mobile', v)} error={errors['emergency.mobile']} />
              <Field label="Address" type="textarea" value={get('emergency.address')} onChange={(v) => set('emergency.address', v)} />
            </div>
          </section>
        )}

        {/* STEP 10 */}
        {step === 10 && (
          <section>
            <h2>Step 10 — Review &amp; Consent</h2>
            <p className="cp-section-desc">Verify your information before final submission.</p>

            {reviewSections.map((section) => (
              <div key={section.title} className="cp-review-section">
                <div className="cp-review-head">
                  <h3>
                    <i className={`fa-solid ${section.icon}`}></i> {section.title}
                  </h3>
                  <button type="button" className="cp-btn cp-btn-outline" onClick={() => goTo(section.editStep)}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                </div>
                <div className="cp-review-grid">
                  {section.rows.map(([k, v]) => (
                    <div key={k} className="cp-review-row">
                      <span className="cp-review-key">{k}</span>
                      <span className="cp-review-val">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Consent UI */}
            <div className="cp-consent-panel">
              <h3>
                <i className="fa-solid fa-user-shield"></i> Data Sharing Consent
              </h3>
              <p className="cp-section-desc">
                Control which departments can request your information. Each grant records{' '}
                <strong>who</strong> is requesting, <strong>what</strong> they receive,{' '}
                <strong>why</strong> it is needed and <strong>how long</strong> access lasts. All
                consents appear in your Data Access History and can be revoked anytime.
              </p>
              <button
                type="button"
                className="cp-btn cp-btn-outline"
                onClick={() => navigate('/dashboard/audit-log')}
              >
                <i className="fa-solid fa-clock-rotate-left"></i> View Data Access History
              </button>
              {DEPARTMENTS.map((dept) => {
                const consent = get(`consents.${dept.id}`);
                return (
                  <div key={dept.id} className="cp-consent-card">
                    <div className="cp-consent-head">
                      <div className="cp-consent-title">
                        <i className={`fa-solid ${dept.icon}`}></i>
                        <div>
                          <strong>{dept.name}</strong>
                          <div className="cp-consent-purpose">Purpose: {dept.purpose}</div>
                          <div className="cp-consent-duration">Access duration: {dept.duration}</div>
                        </div>
                      </div>
                      {consent ? (
                        <div className="cp-consent-actions">
                          <span className={`cp-badge ${consent.status === 'Authorized' ? 'cp-badge-green' : 'cp-badge-gray'}`}>
                            {consent.status}
                          </span>
                          {consent.status === 'Authorized' ? (
                            <button type="button" className="cp-btn cp-btn-danger-outline" onClick={() => revokeConsent(dept)}>
                              Revoke
                            </button>
                          ) : (
                            <button type="button" className="cp-btn cp-btn-primary" onClick={() => grantConsent(dept)}>
                              Re-grant
                            </button>
                          )}
                        </div>
                      ) : (
                        <button type="button" className="cp-btn cp-btn-primary" onClick={() => grantConsent(dept)}>
                          Grant Consent
                        </button>
                      )}
                    </div>
                    <div className="cp-consent-fields">
                      <span className="cp-consent-fields-label">Requested information (minimum required):</span>
                      <div className="cp-consent-chips">
                        {dept.fields.map((f) => (
                          <span key={f} className="cp-chip">
                            {dept.fieldLabels[f]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cp-submit-row">
              <button type="button" className="cp-btn cp-btn-primary cp-btn-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  'Submitting…'
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Submit Citizen Master Profile
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer navigation */}
      <div className="cp-footer-nav">
        <button type="button" className="cp-btn cp-btn-outline" onClick={prev} disabled={step === 1}>
          <i className="fa-solid fa-arrow-left"></i> Previous
        </button>
        <span className="cp-step-counter">Step {step} of 10</span>
        <div className="cp-footer-actions">
          <button type="button" className="cp-btn cp-btn-outline" onClick={saveDraft} disabled={saving}>
            <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving…' : 'Save Draft'}
          </button>
          {step < 10 && (
            <button type="button" className="cp-btn cp-btn-primary" onClick={next}>
              Save &amp; Continue <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}
          {step === 10 && (
            <button type="button" className="cp-btn cp-btn-primary" onClick={() => goTo(9)}>
              <i className="fa-solid fa-arrow-left"></i> Back to Review
            </button>
          )}
        </div>
      </div>

      {/* Audit log modal */}
      <AuditLogModal open={auditOpen} onClose={() => setAuditOpen(false)} />

      {/* Document modal */}
      {docModal && (
        <div
          className="cp-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDocModal(null);
          }}
        >
          <div className="cp-modal">
            <div className="cp-modal-head">
              <h3>Upload Document</h3>
              <button type="button" className="cp-modal-close" onClick={() => setDocModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="cp-field">
              <label>
                File <span className="cp-req">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
              {docForm.file && <small className="cp-hint">Selected: {docForm.file.name}</small>}
            </div>
            <div className="cp-field">
              <label>Document Name</label>
              <input
                value={docForm.name}
                onChange={(e) => setDocForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Aadhaar Front"
              />
            </div>
            <div className="cp-field">
              <label>Document Number (displayed masked)</label>
              <input
                value={docForm.number}
                onChange={(e) => setDocForm((p) => ({ ...p, number: e.target.value }))}
                placeholder="Number printed on the document"
              />
              {docForm.number && (
                <small className="cp-hint">Shown as: {maskIdNumber(docForm.number)}</small>
              )}
            </div>
            <div className="cp-field">
              <label>Expiry Date (if any)</label>
              <input type="date" value={docForm.expiry} onChange={(e) => setDocForm((p) => ({ ...p, expiry: e.target.value }))} />
            </div>
            <div className="cp-notice cp-notice-info">
              <i className="fa-solid fa-circle-info"></i>
              <span>
                Documents are stored encrypted. Verified documents are shared via consent —
                departments never re-request the same upload.
              </span>
            </div>
            <div className="cp-modal-actions">
              <button type="button" className="cp-btn cp-btn-outline" onClick={() => setDocModal(null)}>
                Cancel
              </button>
              <button type="button" className="cp-btn cp-btn-primary" onClick={saveDocModal}>
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
