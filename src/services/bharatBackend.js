/* ============================================================================
   backend.js — Unified backend for Bharat Connect
   ----------------------------------------------------------------------------
   Integrates the PRAAMAN-PORTAL backend model (Firebase Auth + Firestore,
   encrypted-at-rest profiles, consent ledger, audit trail, document vault)
   with a ZERO-KEY guarantee:

   - If Firebase env vars (VITE_FIREBASE_*) are configured → real Firebase.
   - Otherwise → a complete local engine (IndexedDB via localStorage) that
     implements the SAME interface, so every button works without any API key.
   - emailjs / reCAPTCHA / Cloudinary are NOT required anywhere.
   ============================================================================ */

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { encryptProfile, decryptProfile } from "../utils/secureVault.js";

/* ------------------------------------------------------------------ */
/* Engine selection                                                    */
/* ------------------------------------------------------------------ */

const env = import.meta.env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const ENGINE = firebaseConfig.apiKey && firebaseConfig.projectId ? "firebase" : "local";
export const isDemoMode = ENGINE === "local";

/* ------------------------------------------------------------------ */
/* Local engine storage (localStorage-backed, same doc/collection API) */
/* ------------------------------------------------------------------ */

const LS_PREFIX = "bc-db:";
const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + "db") || "{}");
  } catch {
    return {};
  }
};
const writeStore = (db) => {
  try {
    localStorage.setItem(LS_PREFIX + "db", JSON.stringify(db));
  } catch (e) {
    console.error("Local storage full — document vault may exceed quota", e);
    throw e;
  }
};

function lsGetDoc(path) {
  const db = readStore();
  return db[path] ?? null;
}
function lsSetDoc(path, data) {
  const db = readStore();
  db[path] = { ...(db[path] || {}), ...data };
  writeStore(db);
  emit(path);
}
function lsDelete(path) {
  const db = readStore();
  delete db[path];
  writeStore(db);
  emit(path);
}
function lsCollection(pathPrefix) {
  const db = readStore();
  return Object.entries(db)
    .filter(([k]) => k.startsWith(pathPrefix + "/"))
    .map(([k, v]) => ({ id: k.slice(pathPrefix.length + 1), ...v }));
}
function lsAddDoc(pathPrefix, data) {
  const id = `l${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  lsSetDoc(`${pathPrefix}/${id}`, { ...data, createdAt: new Date().toISOString() });
  return id;
}

/* Live-update bus for the local engine (mirrors onSnapshot) */
const listeners = new Map();
function emit(changedPath) {
  listeners.forEach((cbs, prefix) => {
    if (changedPath.startsWith(prefix)) cbs.forEach((cb) => cb());
  });
}
function onLocalChange(prefix, cb) {
  if (!listeners.has(prefix)) listeners.set(prefix, new Set());
  listeners.get(prefix).add(cb);
  return () => listeners.get(prefix).delete(cb);
}

/* ------------------------------------------------------------------ */
/* Local auth                                                          */
/* ------------------------------------------------------------------ */

const LS_USER = "bc-session";
const localUsersKey = "bc-users";
const readLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(localUsersKey) || "{}");
  } catch {
    return {};
  }
};
const writeLocalUsers = (u) => localStorage.setItem(localUsersKey, JSON.stringify(u));

const localAuthListeners = new Set();
let currentLocalUser = (() => {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || "null");
  } catch {
    return null;
  }
})();

function notifyAuth() {
  localAuthListeners.forEach((cb) => cb(currentLocalUser));
}

function hashPassword(pw) {
  // Demo-grade hash (NOT for production). Firebase path uses real Auth.
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
  return `d${(h >>> 0).toString(36)}`;
}

/** Seed a demo account on first run so everything is testable instantly. */
function seedDemoAccount() {
  const users = readLocalUsers();
  if (users["demo@bharat.in"]) return;
  users["demo@bharat.in"] = {
    uid: "demo-user-0001",
    email: "demo@bharat.in",
    pass: hashPassword("demo1234"),
    name: "Bhushan Kolte",
    createdAt: new Date().toISOString(),
  };
  writeLocalUsers(users);
}

seedDemoAccount();

/* ------------------------------------------------------------------ */
/* Firestore-style document API (works on BOTH engines)                */
/* ------------------------------------------------------------------ */

async function getDocument(path) {
  if (ENGINE === "firebase") {
    const snap = await getDoc(doc(getDb(), path));
    return snap.exists() ? snap.data() : null;
  }
  return lsGetDoc(path);
}

async function setDocument(path, data) {
  if (ENGINE === "firebase") {
    await setDoc(doc(getDb(), path), data, { merge: true });
    return;
  }
  lsSetDoc(path, data);
}

async function deleteDocument(path) {
  if (ENGINE === "firebase") {
    await deleteDoc(doc(getDb(), path));
    return;
  }
  lsDelete(path);
}

async function addDocument(pathPrefix, data) {
  if (ENGINE === "firebase") {
    const ref = await addDoc(collection(getDb(), pathPrefix), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  }
  return lsAddDoc(pathPrefix, data);
}

async function listDocuments(pathPrefix) {
  if (ENGINE === "firebase") {
    const snap = await getDocs(collection(getDb(), pathPrefix));
    const out = [];
    snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
    return out;
  }
  return lsCollection(pathPrefix);
}

function subscribeCollection(pathPrefix, cb) {
  if (ENGINE === "firebase") {
    return onSnapshot(
      collection(getDb(), pathPrefix),
      (snap) => {
        const out = [];
        snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
        cb(out);
      },
      (err) => {
        console.warn(`Firestore subscription notice for ${pathPrefix}:`, err);
      }
    );
  }
  cb(lsCollection(pathPrefix));
  return onLocalChange(pathPrefix, () => cb(lsCollection(pathPrefix)));
}

/* ------------------------------------------------------------------ */
/* Firebase singletons (shared with src/firebase.js)                   */
/* ------------------------------------------------------------------ */

/* PRAAMAN-PORTAL integration: reuse the app's single Firebase app, auth and
   Firestore instances instead of creating a second parallel initialization. */
import { auth as fbAuth, db as fdb } from "../firebase.js";

const getDb = () => fdb;
const getFbAuth = () => fbAuth;

/* ------------------------------------------------------------------ */
/* Time / id helpers                                                   */
/* ------------------------------------------------------------------ */

export const nowIso = () => new Date().toISOString();
export const tsToMs = (ts) =>
  ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : ts ? new Date(ts).getTime() : 0);

export const fmtDate = (ts) => {
  const ms = tsToMs(ts);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
export const fmtDateTime = (ts) => {
  const ms = tsToMs(ts);
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

export function maskAadhaar(n) {
  if (!n) return "—";
  const c = String(n).replace(/\D/g, "");
  return c.length <= 4 ? "•".repeat(c.length) : "XXXX XXXX " + c.slice(-4);
}
export function maskAccount(n) {
  if (!n) return "—";
  const c = String(n).replace(/\s/g, "");
  return c.length <= 4 ? "•".repeat(c.length) : "•".repeat(Math.max(c.length - 4, 4)) + c.slice(-4);
}

/* Aadhaar Verhoeff checksum (from PRAAMAN-PORTAL) */
export function validateAadhaar(aadhaar) {
  if (!/^\d{12}$/.test(aadhaar)) return false;
  const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];
  const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  let c = 0;
  const inv = aadhaar.split("").reverse().map(Number);
  for (let i = 0; i < inv.length; i++) c = d[c][p[i % 8][inv[i]]];
  return c === 0;
}
export const validatePan = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test((v || "").toUpperCase());
export const validateIfsc = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test((v || "").toUpperCase());
export const validatePin = (v) => /^\d{6}$/.test(v || "");
export const validatePhone = (v) => /^\d{10}$/.test(v || "");
export const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

/* ------------------------------------------------------------------ */
/* Public backend API                                                  */
/* ------------------------------------------------------------------ */

export const backend = {
  engine: ENGINE,
  isDemoMode,

  /* ---------------- AUTH ---------------- */

  onAuth(cb) {
    if (ENGINE === "firebase") {
      return onAuthStateChanged(getFbAuth(), (u) =>
        cb(u ? { uid: u.uid, email: u.email, name: u.displayName || u.email.split("@")[0] } : null)
      );
    }
    localAuthListeners.add(cb);
    // emit current value asynchronously for React state init
    setTimeout(() => cb(currentLocalUser), 0);
    return () => localAuthListeners.delete(cb);
  },

  async signUp(name, email, password) {
    if (ENGINE === "firebase") {
      const cred = await createUserWithEmailAndPassword(getFbAuth(), email, password);
      await updateProfile(cred.user, { displayName: name });
      return { uid: cred.user.uid, email, name };
    }
    const users = readLocalUsers();
    const key = email.toLowerCase();
    if (users[key]) throw new Error("An account with this email already exists.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const uid = `u${Date.now().toString(36)}`;
    users[key] = { uid, email, pass: hashPassword(password), name, createdAt: nowIso() };
    writeLocalUsers(users);
    currentLocalUser = { uid, email, name };
    localStorage.setItem(LS_USER, JSON.stringify(currentLocalUser));
    notifyAuth();
    return currentLocalUser;
  },

  async signIn(email, password) {
    if (ENGINE === "firebase") {
      const cred = await signInWithEmailAndPassword(getFbAuth(), email, password);
      await backend.logEvent(cred.user.uid, { type: "device-login", title: "Device Login", body: "Successfully logged in to Bharat Connect.", tone: "blue" });
      return { uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split("@")[0] };
    }
    const users = readLocalUsers();
    const rec = users[email.toLowerCase()];
    if (!rec || rec.pass !== hashPassword(password)) {
      throw new Error("Invalid email or password.");
    }
    currentLocalUser = { uid: rec.uid, email: rec.email, name: rec.name };
    localStorage.setItem(LS_USER, JSON.stringify(currentLocalUser));
    notifyAuth();
    await backend.logEvent(rec.uid, { type: "device-login", title: "Device Login", body: "Successfully logged in from a new session.", tone: "blue" });
    return currentLocalUser;
  },

  async signOut() {
    if (ENGINE === "firebase") return fbSignOut(getFbAuth());
    currentLocalUser = null;
    localStorage.removeItem(LS_USER);
    notifyAuth();
  },

  async sendReset(email) {
    if (ENGINE === "firebase") return sendPasswordResetEmail(getFbAuth(), email);
    // Local engine: simulate a reset (no email service, no key required)
    await new Promise((r) => setTimeout(r, 600));
    return { simulated: true, email };
  },

  async changePassword(currentPw, newPw) {
    if (ENGINE === "firebase") {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
      const cu = getFbAuth().currentUser;
      if (!cu) throw new Error("Not signed in");
      await reauthenticateWithCredential(cu, EmailAuthProvider.credential(cu.email, currentPw));
      await updatePassword(cu, newPw);
      return { ok: true };
    }
    const users = readLocalUsers();
    const key = currentLocalUser?.email?.toLowerCase();
    if (!key || !users[key]) throw new Error("Not signed in");
    if (users[key].pass !== hashPassword(currentPw)) throw new Error("Current password is incorrect.");
    if (newPw.length < 6) throw new Error("New password must be at least 6 characters.");
    users[key].pass = hashPassword(newPw);
    writeLocalUsers(users);
    return { ok: true };
  },

  /* ---------------- USER DOC ---------------- */

  /** Full user document: { profile: {...}, citizenProfile: {...}, documents: {...}, isProfileLocked, ... } */
  async getUserDoc(uid) {
    return (await getDocument(`users/${uid}`)) || null;
  },

  async updateUserDoc(uid, patch) {
    await setDocument(`users/${uid}`, patch);
  },

  /** Loads the citizen profile, decrypting sensitive fields. */
  async loadProfile(uid) {
    const d = await getDocument(`users/${uid}`);
    if (!d?.citizenProfile) return null;
    return decryptProfile(d.citizenProfile, uid);
  },

  /** Saves the citizen profile, encrypting sensitive fields (AES-256-GCM). */
  async saveProfile(uid, profile, extraPatch = {}) {
    const encrypted = await encryptProfile(profile, uid);
    await setDocument(`users/${uid}`, { citizenProfile: { ...encrypted, savedAt: nowIso() }, ...extraPatch });
  },

  /* ---------------- APPLICATIONS ---------------- */

  async listApplications(uid) {
    const rows = await listDocuments(`users/${uid}/applications`);
    return rows.sort((a, b) => tsToMs(b.timestamp) - tsToMs(a.timestamp));
  },

  async createApplication(uid, { schemeId, schemeName, department }) {
    const count = (await listDocuments(`users/${uid}/applications`)).length + 1;
    const app = {
      appId: `APP-2026-${String(1000 + count)}`,
      schemeId,
      schemeName,
      department,
      status: "Pending",
      desc: "Application submitted, awaiting document verification.",
      currentStep: 1,
      totalSteps: 4,
      steps: [
        { label: "Submitted", done: true, at: nowIso() },
        { label: "Document Verification", done: false },
        { label: "Field Review", done: false },
        { label: "Final Approval", done: false },
      ],
      timestamp: nowIso(),
    };
    await addDocument(`users/${uid}/applications`, app);
    await backend.logEvent(uid, {
      type: "application-submitted",
      title: "Application submitted",
      body: `${schemeName} — ${app.appId}`,
      tone: "blue",
    });
    return app;
  },

  async withdrawApplication(uid, docId) {
    await deleteDocument(`users/${uid}/applications/${docId}`);
    await backend.logEvent(uid, {
      type: "application-withdrawn",
      title: "Application withdrawn",
      body: "You withdrew this application before final approval.",
      tone: "red",
    });
  },

  /* ---------------- DATA TRANSFER / CONSENT ---------------- */

  async listConsents(uid) {
    return listDocuments(`users/${uid}/consents`);
  },

  async grantConsent(uid, dept, fields) {
    const record = {
      departmentId: dept.id,
      departmentName: dept.name,
      purpose: dept.purpose,
      duration: dept.duration,
      fieldsShared: fields,
      fieldLabels: dept.fieldLabels,
      status: "Authorized",
      grantedAt: nowIso(),
    };
    const id = await addDocument(`users/${uid}/consents`, record);
    await backend.logEvent(uid, {
      type: "consent-granted",
      title: "Consent granted",
      body: `${dept.name} — ${fields.map((f) => dept.fieldLabels?.[f] || f).join(", ")}`,
      tone: "green",
      consentId: id,
    });
    return { id, ...record };
  },

  async revokeConsent(uid, consentId, deptName) {
    await setDocument(`users/${uid}/consents/${consentId}`, { status: "Revoked", revokedAt: nowIso() });
    await backend.logEvent(uid, {
      type: "consent-revoked",
      title: "Consent revoked",
      body: `${deptName} lost access to your data.`,
      tone: "red",
    });
  },

  /** Transfers a selected data snapshot to a department (the Data Transfer wizard). */
  async transferData(uid, { department, fields, snapshot }) {
    const payload = {
      departmentId: department.id,
      departmentName: department.name,
      fields,
      snapshot,
      status: "Transferred",
    };
    const id = await addDocument(`users/${uid}/transfers`, payload);
    await backend.logEvent(uid, {
      type: "data-transferred",
      title: "Data transfer completed",
      body: `${fields.length} field(s) shared with ${department.name}.`,
      tone: "blue",
    });
    return { id, ref: `DT-2026-${String(84500 + (await listDocuments(`users/${uid}/transfers`)).length)}`, ...payload };
  },

  async listTransfers(uid) {
    return listDocuments(`users/${uid}/transfers`);
  },

  /* ---------------- DOCUMENT VAULT (base64 in-DB — zero external keys) ---------------- */

  async listVaultDocuments(uid) {
    return listDocuments(`users/${uid}/documents`);
  },

  async saveVaultDocument(uid, { name, url, size }) {
    const record = { name, url, size: size || null, storage: "firestore", uploadedAt: nowIso() };
    const id = await addDocument(`users/${uid}/documents`, record);
    await backend.logEvent(uid, {
      type: "document-uploaded",
      title: "Document uploaded",
      body: `${name} was added to your secure vault.`,
      tone: "blue",
    });
    return { id, ...record };
  },

  async deleteVaultDocument(uid, docId, name) {
    await deleteDocument(`users/${uid}/documents/${docId}`);
    await backend.logEvent(uid, {
      type: "document-deleted",
      title: "Document removed",
      body: `${name} was removed from your vault.`,
      tone: "red",
    });
  },

  /* ---------------- AUDIT / NOTIFICATIONS ---------------- */

  async logEvent(uid, { type, title, body, tone = "blue" }) {
    return addDocument(`users/${uid}/dataAccessHistory`, {
      type, title, body, tone, read: false, status: "Completed", createdAt: nowIso(),
    });
  },

  async listEvents(uid) {
    const rows = await listDocuments(`users/${uid}/dataAccessHistory`);
    return rows.sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt));
  },

  subscribeEvents(uid, cb) {
    return subscribeCollection(`users/${uid}/dataAccessHistory`, (rows) =>
      cb(rows.sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt)))
    );
  },

  async markEventRead(uid, eventId, read = true) {
    await setDocument(`users/${uid}/dataAccessHistory/${eventId}`, { read });
  },

  async markAllEventsRead(uid) {
    const rows = await listDocuments(`users/${uid}/dataAccessHistory`);
    await Promise.all(rows.filter((r) => !r.read).map((r) => setDocument(`users/${uid}/dataAccessHistory/${r.id}`, { read: true })));
  },

  /* ---------------- OTP (zero-key demo delivery) ----------------
     In Firebase mode this still works: OTP is "delivered" in-app.
     No SMS/email provider keys are needed.                        */

  async sendOtp(uid, channel /* e.g. "+91 98xxx / email" */) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await backend.logEvent(uid, {
      type: "otp-sent",
      title: "OTP sent",
      body: `A 6-digit OTP was sent to ${channel} for verification.`,
      tone: "blue",
    });
    // Zero-key delivery: the OTP is returned and surfaced in the UI banner.
    return { otp, deliveredTo: channel };
  },

  /* ---------------- AI CHAT SESSIONS (Persisted to User Account) ---------------- */

  async listChatSessions(uid) {
    if (!uid) return [];
    const rows = await listDocuments(`users/${uid}/ai_chats`);
    return rows.sort((a, b) => tsToMs(b.updatedAt || b.createdAt) - tsToMs(a.updatedAt || a.createdAt));
  },

  async getChatSession(uid, sessionId) {
    if (!uid || !sessionId) return null;
    return getDocument(`users/${uid}/ai_chats/${sessionId}`);
  },

  async saveChatSession(uid, session, userEmail = "") {
    if (!uid || !session?.id) return;
    const clean = {
      id: session.id,
      userId: uid,
      userEmail: userEmail || "",
      title: session.title || "New Conversation",
      isPinned: Boolean(session.isPinned),
      createdAt: session.createdAt || nowIso(),
      updatedAt: nowIso(),
      messages: Array.isArray(session.messages)
        ? session.messages.map((m) => {
            const out = {
              id: m.id || `msg-${Date.now()}`,
              role: m.role || "user",
              text: m.text || "",
              timestamp: m.timestamp || "",
            };
            if (m.title) out.title = m.title;
            if (m.isProfileGuide) out.isProfileGuide = true;
            if (m.showInlineForm) out.showInlineForm = true;
            if (m.actionBtn) out.actionBtn = m.actionBtn;
            if (Array.isArray(m.suggestions)) out.suggestions = m.suggestions;
            if (Array.isArray(m.attachments)) {
              out.attachments = m.attachments.map((a) => ({
                id: a.id || `att-${Date.now()}`,
                name: a.name || "Attachment",
                size: a.size || "",
                type: a.type || "doc",
              }));
            }
            return out;
          })
        : [],
    };
    await setDocument(`users/${uid}/ai_chats/${session.id}`, clean);
    return clean;
  },

  async deleteChatSession(uid, sessionId) {
    if (!uid || !sessionId) return;
    await deleteDocument(`users/${uid}/ai_chats/${sessionId}`);
  },

  async clearAllChatSessions(uid) {
    if (!uid) return;
    const rows = await listDocuments(`users/${uid}/ai_chats`);
    await Promise.all(rows.map((r) => deleteDocument(`users/${uid}/ai_chats/${r.id}`)));
  },

  subscribeChatSessions(uid, cb) {
    if (!uid) {
      cb([]);
      return () => {};
    }
    return subscribeCollection(`users/${uid}/ai_chats`, (rows) => {
      const sorted = (rows || []).sort(
        (a, b) => tsToMs(b.updatedAt || b.createdAt) - tsToMs(a.updatedAt || a.createdAt)
      );
      cb(sorted);
    });
  },

  async getActiveChatSessionId(uid) {
    if (!uid) return null;
    const meta = await getDocument(`users/${uid}/ai_meta/activeSession`);
    return meta?.activeSessionId || null;
  },

  async setActiveChatSessionId(uid, sessionId) {
    if (!uid) return;
    await setDocument(`users/${uid}/ai_meta/activeSession`, {
      activeSessionId: sessionId,
      updatedAt: nowIso(),
    });
  },

  /* ---------------- DATA EXPORT / DELETE (DPDP rights) ---------------- */

  async exportMyData(uid) {
    const [doc, apps, events, consents, transfers, docs, chats] = await Promise.all([
      backend.getUserDoc(uid),
      backend.listApplications(uid),
      backend.listEvents(uid),
      backend.listConsents(uid),
      backend.listTransfers(uid),
      backend.listVaultDocuments(uid),
      backend.listChatSessions(uid),
    ]);
    const decryptedDoc = doc?.citizenProfile ? { ...doc, citizenProfile: await decryptProfile(doc.citizenProfile, uid) } : doc;
    return { exportedAt: nowIso(), engine: ENGINE, profile: decryptedDoc, applications: apps, auditEvents: events, consents, transfers, documents: docs, aiChats: chats };
  },

  async deleteMyData(uid) {
    const prefixes = ["applications", "dataAccessHistory", "consents", "transfers", "documents", "ai_chats", "ai_meta"];
    for (const p of prefixes) {
      const rows = await listDocuments(`users/${uid}/${p}`);
      await Promise.all(rows.map((r) => deleteDocument(`users/${uid}/${p}/${r.id}`)));
    }
    await deleteDocument(`users/${uid}`);
    if (ENGINE === "local") {
      // also remove the account record
      const users = readLocalUsers();
      const key = currentLocalUser?.email?.toLowerCase();
      if (key) delete users[key];
      writeLocalUsers(users);
      await backend.signOut();
    }
  },
};

export default backend;
