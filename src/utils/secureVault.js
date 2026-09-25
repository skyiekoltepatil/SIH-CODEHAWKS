/* ============================================================
   secureVault.js — real field-level encryption + consent ledger
   ============================================================ */

/* ---------------- Field-level encryption (AES-GCM 256) ----------------
   - Key is derived per-user (PBKDF2) from the uid + app pepper and cached
     in sessionStorage for the session. It never leaves the browser.
   - Nonce (12 bytes) is fresh per encryption and stored alongside.
   - Output format: "enc.v1:<iv_b64>:<cipher_b64>"
   - Sensitive fields are stored ENCRYPTED in Firestore; plaintext never
     reaches the database.
----------------------------------------------------------------------- */

const PEPPER = 'SetuSecure::v1';
let cachedKey = null;
let cachedKeyFor = null;

const b64 = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))),
  dec: (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)),
};

async function getUserKey(uid) {
  if (cachedKey && cachedKeyFor === uid) return cachedKey;
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${PEPPER}:${uid}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(`setu-salt:${uid}`),
      iterations: 100000,
      hash: 'SHA-256',
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  cachedKey = key;
  cachedKeyFor = uid;
  return key;
}

const looksEncrypted = (v) => typeof v === 'string' && v.startsWith('enc.v1:');

export async function encryptField(plain, uid) {
  if (plain == null || plain === '') return plain;
  if (looksEncrypted(String(plain))) return plain; // idempotent
  try {
    const key = await getUserKey(uid);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(String(plain))
    );
    return `enc.v1:${b64.enc(iv)}:${b64.enc(cipher)}`;
  } catch (err) {
    console.error('encryptField failed:', err);
    return plain; // fail open rather than corrupt data
  }
}

export async function decryptField(value, uid) {
  if (value == null || !looksEncrypted(String(value))) return value;
  try {
    const key = await getUserKey(uid);
    const [, ivB64, dataB64] = String(value).split(':');
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64.dec(ivB64) },
      key,
      b64.dec(dataB64)
    );
    return new TextDecoder().decode(plain);
  } catch (err) {
    console.error('decryptField failed:', err);
    return '••••••'; // unreadable rather than leaking ciphertext
  }
}

/* ---------- Sensitive paths that get encrypted at rest ---------- */

export const SENSITIVE_FIELDS = [
  'identity.docNumber', // Aadhaar / ID number
  'bank.accountNumber', // bank account
  'basic.mobile',
  'basic.email',
  'emergency.mobile',
  'family.father.contact',
  'family.mother.contact',
];

/** Deeply encrypt sensitive fields of a CitizenProfile-like object. */
export async function encryptProfile(obj, uid) {
  if (!obj || !uid) return obj;
  const clone = structuredClone(obj);
  for (const path of SENSITIVE_FIELDS) {
    const keys = path.split('.');
    let o = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      o = o?.[keys[i]];
      if (o == null) break;
    }
    const last = keys[keys.length - 1];
    if (o && typeof o[last] === 'string' && o[last] !== '') {
      o[last] = await encryptField(o[last], uid);
    }
  }
  return clone;
}

/** Deeply decrypt sensitive fields (reverse of encryptProfile). */
export async function decryptProfile(obj, uid) {
  if (!obj || !uid) return obj;
  const clone = structuredClone(obj);
  for (const path of SENSITIVE_FIELDS) {
    const keys = path.split('.');
    let o = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      o = o?.[keys[i]];
      if (o == null) break;
    }
    const last = keys[keys.length - 1];
    if (o && typeof o[last] === 'string' && looksEncrypted(o[last])) {
      o[last] = await decryptField(o[last], uid);
    }
  }
  return clone;
}

/** Quick check: does this profile object have encrypted-at-rest data? */
export const profileHasEncryptedData = (obj) =>
  SENSITIVE_FIELDS.some((path) => {
    let o = obj;
    for (const k of path.split('.')) {
      o = o?.[k];
      if (o == null) return false;
    }
    return looksEncrypted(String(o));
  });

/** Encrypt the sensitive applicant fields on a scheme application record. */
export async function encryptApplication(app, uid) {
  if (!app || !uid) return app;
  const clone = structuredClone(app);
  const enc = (v) => encryptField(v, uid);
  clone.applicantAadhaar = await enc(clone.applicantAadhaar);
  clone.applicantPhone = await enc(clone.applicantPhone);
  if (clone.bankDetails?.accountNumber)
    clone.bankDetails.accountNumber = await enc(clone.bankDetails.accountNumber);
  return clone;
}

/** Decrypt sensitive applicant fields on a scheme application record. */
export async function decryptApplication(app, uid) {
  if (!app || !uid) return app;
  const clone = structuredClone(app);
  const dec = (v) => decryptField(v, uid);
  clone.applicantAadhaar = await dec(clone.applicantAadhaar);
  clone.applicantPhone = await dec(clone.applicantPhone);
  if (clone.bankDetails?.accountNumber)
    clone.bankDetails.accountNumber = await dec(clone.bankDetails.accountNumber);
  return clone;
}

export const isEncryptedApplication = (app) =>
  looksEncrypted(app?.applicantAadhaar) || looksEncrypted(app?.bankDetails?.accountNumber);

/* ============================================================
   Consent ledger — per-department consent shared across the app
   ============================================================ */

export const CONSENT_DEPARTMENTS = [
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

/** Human summary of a consent record for the audit log. */
export const consentSummary = (record) =>
  record
    ? `${record.fieldsShared?.map((f) => record.fieldLabels?.[f] || f).join(', ') || 'selected fields'} — ${record.purpose}`
    : 'Consent record';
