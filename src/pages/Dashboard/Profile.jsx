import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, Field, IconTile, StatusPill } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";
import { uploadDocument, openDocumentUrl } from "../../utils/fileUpload.js";
import {
 validateAadhaar, validatePan, validateIfsc, validatePhone, validateEmail, fmtDateTime, maskAadhaar, maskAccount,
} from "../../services/bharatBackend.js";
import { auth } from "../../firebase.js";
import { updateProfile } from "firebase/auth";

/* Section definitions — keys shared with Dashboard completion calc */
const SECTIONS = [
 { key: "basic", label: "Personal Details", icon: "user" },
 { key: "identity", label: "Identity & Aadhaar", icon: "id" },
 { key: "address", label: "Address", icon: "home2" },
 { key: "bank", label: "Bank Details", icon: "bank" },
 { key: "family", label: "Family Members", icon: "users" },
 { key: "education", label: "Education & Employment", icon: "grad" },
 { key: "docs", label: "Document Vault", icon: "doc" },
 { key: "security", label: "Security & Privacy", icon: "shield" },
];

const initialData = {
 basic: { fullName: "", dob: "", gender: "", mobile: "", email: "" },
 identity: { docType: "Aadhaar", docNumber: "", verified: false },
 address: { line1: "", village: "", district: "", state: "", pincode: "" },
 bank: { accountHolder: "", bankName: "", accountNumber: "", ifsc: "", verified: false },
 family: { fatherName: "", motherName: "", guardianName: "" },
 education: { level: "", institution: "", passingYear: "", occupation: "" },
};

/* Editable text field bound to a path like "basic.fullName" */
function EField({ label, path, value, onChange, type = "text", error, maxLength, placeholder, icon }) {
 return (
 <div className={`rounded-xl border bg-white dark:bg-[#000000] px-4 py-3 transition-colors focus-within:border-ink-400 dark:focus-within:border-white/40 :border-white/40 ${error ? "border-rose-line" : "border-ink-100 dark:border-white/10 "}`}>
 <label className="flex items-center gap-1.5 text-[12px] font-medium text-ink-400 dark:text-ink-500 ">
 {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
 {label}
 </label>
 <input
 type={type}
 value={value ?? ""}
 maxLength={maxLength}
 placeholder={placeholder}
 onChange={(e) => onChange(path, e.target.value)}
 className="mt-1 w-full bg-transparent text-[14px] font-semibold text-ink-900 dark:text-white outline-none placeholder:font-normal placeholder:text-ink-300"
 />
 {error && <p className="mt-1 text-[11.5px] font-medium text-rose-ink">{error}</p>}
 </div>
 );
}

/* OTP verification box (zero-key: OTP surfaced in a banner + toast) */
function OtpVerify({ title, verified, otpState, onStart, onConfirm, onChange, onResend }) {
 const { notify } = useAuth();
 return (
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-ink-50/50 dark:bg-white/5 p-4">
 <div className="flex items-center justify-between">
 <p className="text-[13px] font-bold text-ink-800 dark:text-ink-200 ">{title}</p>
 {verified ? (
 <StatusPill status="verified" />
 ) : (
 <StatusPill status="unverified" />
 )}
 </div>
 {!verified && (
 <div className="mt-3">
 {!otpState.sent ? (
 <Btn variant="outline" className="!py-2 !text-[12.5px]" icon="send" onClick={onStart} disabled={otpState.busy}>
 {otpState.busy ? "Sending…" : "Send OTP"}
 </Btn>
 ) : (
 <div className="flex flex-wrap items-center gap-2">
 <input
 inputMode="numeric"
 maxLength={6}
 value={otpState.value}
 onChange={(e) => onChange(e.target.value)}
 placeholder="6-digit OTP"
 className="nums w-36 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3.5 py-2 text-[14px] font-bold tracking-[0.3em] text-ink-900 dark:text-white outline-none focus:border-ink-400 dark:focus:border-white/40 :border-white/40 "
 />
 <Btn className="!py-2 !text-[12.5px]" onClick={onConfirm}>Verify</Btn>
 <button onClick={onResend} className="text-[12px] font-semibold text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:text-ink-200 ">Resend</button>
 </div>
 )}
 {otpState.sent && otpState.otp && (
 <p className="nums mt-2.5 rounded-lg bg-amber-soft px-3 py-1.5 text-[12px] font-bold text-amber-ink" role="status">
 Demo OTP: {otpState.otp} (no SMS/email key needed)
 </p>
 )}
 </div>
 )}
 </div>
 );
}

export default function Profile() {
 const { user, backend, notify, confirmAction } = useAuth();
 const location = useLocation();

 const [tab, setTab] = useState("basic");
 const [data, setData] = useState(initialData);
 const [loaded, setLoaded] = useState(false);
 const [dirty, setDirty] = useState(false);
 const [saving, setSaving] = useState(false);
 const [errors, setErrors] = useState({});
 const sectionRefs = useRef({});
 const photoInputRef = useRef(null);
 const [uploadingPhoto, setUploadingPhoto] = useState(false);

 const getInitials = (name) => {
   if (!name) return 'BK';
   const parts = name.trim().split(/\s+/);
   if (parts.length >= 2) {
     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
   }
   return name.length > 1 ? (name[0] + name[name.length - 1]).toUpperCase() : name.toUpperCase();
 };

 const [mobileOtp, setMobileOtp] = useState({ sent: false, value: "", otp: "", busy: false });
 const [emailOtp, setEmailOtp] = useState({ sent: false, value: "", otp: "", busy: false });
 const [idOtp, setIdOtp] = useState({ sent: false, value: "", otp: "", busy: false });
 const [bankOtp, setBankOtp] = useState({ sent: false, value: "", otp: "", busy: false });

 const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
 const [pwBusy, setPwBusy] = useState(false);

 /* Document vault (base64 in-DB — no cloud keys) */
 const [vault, setVault] = useState([]);
 const [vaultBusy, setVaultBusy] = useState(false);
 const [showExport, setShowExport] = useState(false);
 const [exportData, setExportData] = useState(null);

 const handlePhotoUpload = async (e) => {
   const file = e.target.files?.[0];
   e.target.value = "";
   if (!file) return;
   if (file.size > 5 * 1024 * 1024) {
     notify("File too large — max 5 MB.", "red");
     return;
   }
   setUploadingPhoto(true);
   try {
     const { url } = await uploadDocument(file);
     if (auth.currentUser) {
       await updateProfile(auth.currentUser, { photoURL: url });
     }
     setPath("basic.photoURL", url);
     notify("Profile photo updated successfully!");
   } catch (ex) {
     notify("Failed to upload photo.", "red");
   } finally {
     setUploadingPhoto(false);
   }
 };

 /* ---------- load ---------- */
 useEffect(() => {
 if (!user) return;
 (async () => {
 const cp = await backend.loadProfile(user.uid);
 if (cp) {
   const normalized = {
     ...initialData,
     ...cp,
     basic: {
       ...initialData.basic,
       fullName: cp.basic?.fullName || cp.basic?.nameAsPerId || user?.displayName || user?.name || "",
       dob: cp.basic?.dob || "",
       gender: cp.basic?.gender || "",
       mobile: cp.basic?.mobile || user?.phoneNumber || "",
       email: cp.basic?.email || user?.email || "",
       photoURL: cp.basic?.photoURL || user?.photoURL || "",
       ...(cp.basic || {}),
     },
     identity: {
       ...initialData.identity,
       ...(cp.identity || {}),
     },
     address: {
       ...initialData.address,
       line1: cp.address?.line1 || cp.address?.current?.line1 || "",
       village: cp.address?.village || cp.address?.current?.village || "",
       district: cp.address?.district || cp.address?.current?.district || "",
       state: cp.address?.state || cp.address?.current?.state || "",
       pincode: cp.address?.pincode || cp.address?.current?.pincode || "",
       ...(cp.address || {}),
     },
     bank: {
       ...initialData.bank,
       ...(cp.bank || {}),
     },
     family: {
       ...initialData.family,
       fatherName: cp.family?.fatherName || cp.family?.father?.name || "",
       motherName: cp.family?.motherName || cp.family?.mother?.name || "",
       guardianName: cp.family?.guardianName || cp.family?.guardian?.name || "",
       ...(cp.family || {}),
     },
     education: {
       ...initialData.education,
       level: cp.education?.level || cp.education?.entries?.[0]?.level || "",
       institution: cp.education?.institution || cp.education?.entries?.[0]?.institution || "",
       passingYear: cp.education?.passingYear || cp.education?.entries?.[0]?.passingYear || "",
       occupation: cp.education?.occupation || cp.employment?.jobRole || cp.employment?.organization || "",
       ...(cp.education || {}),
     },
   };
   setData(normalized);
 }
 setVault(await backend.listVaultDocuments(user.uid));
 setLoaded(true);
 })();
 }, [user, backend, location.key]);

 /* ---------- "Complete Profile" deep-link: highlight first pending section ---------- */
 useEffect(() => {
 const target = location.state?.highlightSection;
 if (target && loaded) {
 setTab(target);
 window.setTimeout(() => {
 const el = sectionRefs.current[target];
 el?.scrollIntoView({ behavior: "smooth", block: "center" });
 el?.classList.add("animate-flash");
 window.setTimeout(() => el?.classList.remove("animate-flash"), 3500);
 }, 120);
 window.history.replaceState({}, "");
 }
 }, [location.state, loaded]);

 /* ---------- edit helpers ---------- */
 const setPath = (path, value) => {
 setDirty(true);
 setErrors((e) => ({ ...e, [path]: undefined }));
 setData((prev) => {
 const next = structuredClone(prev);
 const [section, key] = path.split(".");
 next[section][key] = value;
 return next;
 });
 };
 const get = (section, key) => data[section]?.[key] ?? "";

 const verifySection = (key) => {
 const errs = {};
 if (key === "basic") {
 if (!get("basic", "fullName").trim()) errs["basic.fullName"] = "Full name is required";
 if (!get("basic", "dob")) errs["basic.dob"] = "Date of birth is required";
 if (!get("basic", "gender")) errs["basic.gender"] = "Select gender";
 if (!validatePhone(get("basic", "mobile"))) errs["basic.mobile"] = "Enter valid 10-digit mobile";
 if (!validateEmail(get("basic", "email"))) errs["basic.email"] = "Enter a valid email";
 }
 if (key === "identity") {
 if (!get("identity", "docNumber")) errs["identity.docNumber"] = "Aadhaar number is required";
 else if (!validateAadhaar(get("identity", "docNumber"))) errs["identity.docNumber"] = "Invalid Aadhaar (checksum failed)";
 }
 if (key === "address") {
 ["line1", "village", "district", "state", "pincode"].forEach((f) => {
 if (!String(get("address", f)).trim()) errs[`address.${f}`] = "Required";
 });
 if (get("address", "pincode") && !validatePin(get("address", "pincode")))
 errs["address.pincode"] = "PIN must be 6 digits";
 }
 if (key === "bank") {
 if (!get("bank", "accountHolder").trim()) errs["bank.accountHolder"] = "Required";
 if (!get("bank", "bankName").trim()) errs["bank.bankName"] = "Required";
 if (!get("bank", "accountNumber")) errs["bank.accountNumber"] = "Required";
 if (get("bank", "ifsc") && !validateIfsc(get("bank", "ifsc"))) errs["bank.ifsc"] = "Invalid IFSC (e.g. SBIN0001234)";
 }
 return errs;
 };

 /* ---------- save ---------- */
 const save = async (sectionKey) => {
 const errs = verifySection(sectionKey);
 setErrors(errs);
 if (Object.keys(errs).length > 0) {
 notify("Please fix the highlighted fields.", "red");
 return false;
 }
 setSaving(true);
 try {
 await backend.saveProfile(user.uid, data, { profileSavedAt: Date.now() });
 await backend.logEvent(user.uid, {
 type: "profile-saved",
 title: "Profile updated",
 body: `${SECTIONS.find((s) => s.key === sectionKey)?.label} saved securely (AES-256 encrypted).`,
 tone: "blue",
 });
 setDirty(false);
 notify("Saved securely to your profile.");
 return true;
 } catch (e) {
 notify(e.message || "Failed to save. Try again.", "red");
 return false;
 } finally {
 setSaving(false);
 }
 };

 /* ---------- OTP flows (zero-key) ---------- */
 const startOtp = async (which, channel) => {
 const setter = { mobile: setMobileOtp, email: setEmailOtp, id: setIdOtp, bank: setBankOtp }[which];
 setter((p) => ({ ...p, busy: true }));
 const { otp } = await backend.sendOtp(user.uid, channel);
 setter((p) => ({ ...p, busy: false, sent: true, otp }));
 notify(`OTP sent to ${channel}.`, "blue");
 };
 const confirmOtp = async (which, flagPath, sectionData) => {
 const state = { mobile: mobileOtp, email: emailOtp, id: idOtp, bank: bankOtp }[which];
 if (state.value !== state.otp) {
 notify("Invalid OTP. Please try again.", "red");
 return;
 }
 const [section, key] = flagPath.split(".");
 setData((prev) => {
 const next = structuredClone(prev);
 next[section][key] = true;
 return next;
 });
 { which === "mobile" ? setMobileOtp({ sent: false, value: "", otp: "", busy: false }) : null; }
 { which === "email" ? setEmailOtp({ sent: false, value: "", otp: "", busy: false }) : null; }
 { which === "id" ? setIdOtp({ sent: false, value: "", otp: "", busy: false }) : null; }
 { which === "bank" ? setBankOtp({ sent: false, value: "", otp: "", busy: false }) : null; }
 await backend.saveProfile(user.uid, { ...data, [section]: { ...data[section], [key]: true } });
 await backend.logEvent(user.uid, {
 type: "otp-verified",
 title: "Verification complete",
 body: `${title_for(which)} verified via OTP.`,
 tone: "green",
 });
 notify("Verified successfully!");
 };
 const title_for = (w) => ({ mobile: "Mobile number", email: "Email address", id: "Identity document", bank: "Bank account" })[w];

 /* ---------- password change ---------- */
 const changePw = async (e) => {
 e.preventDefault();
 if (pwForm.next !== pwForm.confirm) {
 notify("New passwords do not match.", "red");
 return;
 }
 setPwBusy(true);
 try {
 await backend.changePassword(pwForm.current, pwForm.next);
 setPwForm({ current: "", next: "", confirm: "" });
 notify("Password updated successfully!");
 } catch (ex) {
 notify(ex.message || "Failed to update password.", "red");
 } finally {
 setPwBusy(false);
 }
 };

 /* ---------- document vault ---------- */
 const handleVaultUpload = async (e) => {
 const file = e.target.files?.[0];
 e.target.value = ""; // allow re-selecting the same file
 if (!file) return;
 if (file.size > 5 * 1024 * 1024) {
 notify("File too large — vault accepts up to 5 MB per document.", "red");
 return;
 }
 setVaultBusy(true);
 try {
 const { name, url, size } = await uploadDocument(file);
 await backend.saveVaultDocument(user.uid, { name, url, size });
 setVault(await backend.listVaultDocuments(user.uid));
 notify(`${name} added to your secure vault.`);
 } catch (ex) {
 notify(ex?.message?.includes("quota")
 ? "Storage quota exceeded — remove a document and try again."
 : "Upload failed. Please try again.", "red");
 } finally {
 setVaultBusy(false);
 }
 };

 const handleVaultDelete = async (d) => {
 const ok = await confirmAction(`Remove "${d.name}" from your vault? This cannot be undone.`);
 if (!ok) return;
 await backend.deleteVaultDocument(user.uid, d.id, d.name);
 setVault(await backend.listVaultDocuments(user.uid));
 notify("Document removed.", "red");
 };

 /* ---------- export / delete (DPDP) ---------- */
 const doExport = async () => {
 const d = await backend.exportMyData(user.uid);
 setExportData(d);
 setShowExport(true);
 const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
 const a = document.createElement("a");
 a.href = URL.createObjectURL(blob);
 a.download = `bharat-connect-data-${user.uid}.json`;
 a.click();
 notify("Your data export has been downloaded.", "blue");
 };
 const doDelete = async () => {
 const ok = await confirmAction("Permanently delete ALL your data and account? This cannot be undone.");
 if (!ok) return;
 await backend.deleteMyData(user.uid);
 notify("All data deleted. You have been signed out.", "red");
 window.location.hash = "#/";
 };

 /* ---------- identity verification list ---------- */
 const verification = useMemo(
 () => [
 { key: "aadhaar", label: "Aadhaar", icon: "id", status: get("identity", "docNumber") && get("identity", "verified") ? "verified" : get("identity", "docNumber") ? "pending" : "none" },
 { key: "mobile", label: "Mobile Number", icon: "phone", status: data.basic?.mobileVerified ? "verified" : get("basic", "mobile") ? "pending" : "none" },
 { key: "bank", label: "Bank Account", icon: "bank", status: data.bank?.verified ? "verified" : get("bank", "accountNumber") ? "pending" : "none" },
 { key: "pan", label: "PAN Card", icon: "card", status: data.identity?.panVerified ? "verified" : "none" },
 { key: "digi", label: "DigiLocker", icon: "doc", status: "pending" },
 { key: "dl", label: "Driving Licence", icon: "car", status: "none" },
 ],
 [data]
 );

 const tabs = SECTIONS;

 return (
 <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="My Profile"
 title="My Profile"
 sub="Your personal information linked with government records."
 right={
 <div className="text-right">
 <p className="text-[11.5px] font-semibold text-ink-400 dark:text-ink-500 ">Last updated</p>
 <p className="nums text-[12.5px] font-semibold text-ink-600 dark:text-ink-400 ">
 {data.savedAt ? fmtDateTime(data.savedAt) : "—"}
 </p>
 </div>
 }
 />

 <Card className="grid gap-0 overflow-hidden p-0 lg:grid-cols-[260px_1fr]">
 {/* Sub navigation */}
 <aside className="border-b border-ink-100 dark:border-white/10 bg-ink-50/40 dark:bg-white/5 p-4 lg:border-b-0 lg:border-r">
 <div className="hide-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
 {tabs.map((t) => (
 <button
 key={t.key}
 ref={(el) => (sectionRefs.current[t.key] = el)}
 onClick={() => setTab(t.key)}
 className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors ${
 tab === t.key ? "bg-white dark:bg-[#000000] text-ink-900 dark:text-white shadow-sm ring-1 ring-ink-100 dark:ring-white/10 " : "text-ink-500 dark:text-ink-400 hover:bg-white dark:bg-[#000000] hover:text-ink-800 dark:text-ink-200 "
 }`}
 >
 <Icon name={t.icon} className={`h-4 w-4 ${tab === t.key ? "text-ink-700 dark:text-ink-300 " : "text-ink-400 dark:text-ink-500 "}`} />
 <span className="whitespace-nowrap lg:whitespace-normal">{t.label}</span>
 </button>
 ))}
 </div>
 </aside>

 {/* Content */}
 <div className="p-6 sm:p-8">
 {/* ---------------- BASIC ---------------- */}
 {tab === "basic" && (
 <Section title="Personal Details" desc="Establishes your identity across all government services.">
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-ink-50/50 dark:bg-white/5 px-4 py-3 sm:col-span-2">
 <div className="flex items-center gap-4">
 <button
   onClick={() => photoInputRef.current?.click()}
   disabled={uploadingPhoto}
   className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-white/10 text-[20px] font-bold text-ink-700 dark:text-ink-300 transition-opacity hover:opacity-80"
   title="Change photo"
 >
   {get("basic", "photoURL") || user?.photoURL ? (
     <img src={get("basic", "photoURL") || user?.photoURL} alt="User" className="h-full w-full rounded-full object-cover" />
   ) : (
     getInitials(get("basic", "fullName") || user?.name)
   )}
 <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-white ring-2 ring-white">
 <Icon name={uploadingPhoto ? "clock" : "user"} className="h-3.5 w-3.5" />
 </span>
 </button>
 <input type="file" className="hidden" accept="image/*" ref={photoInputRef} onChange={handlePhotoUpload} />
 <div className="min-w-0">
 <p className="text-[12px] font-medium text-ink-400 dark:text-ink-500 ">Full Name</p>
 <p className="truncate text-[15px] font-bold text-ink-900 dark:text-white ">{get("basic", "fullName") || user?.name}</p>
 </div>
 </div>
 </div>
 <EField label="Full Name" icon="user" path="basic.fullName" value={get("basic", "fullName")} onChange={setPath} error={errors["basic.fullName"]} placeholder="e.g. Bhushan Kolte" />
 <EField label="Date of Birth" icon="clock" type="date" path="basic.dob" value={get("basic", "dob")} onChange={setPath} error={errors["basic.dob"]} />
 <EField label="Gender" icon="user" path="basic.gender" value={get("basic", "gender")} onChange={setPath} error={errors["basic.gender"]} placeholder="Male / Female / Other" />
 <EField label="Mobile Number" icon="phone" maxLength={10} path="basic.mobile" value={get("basic", "mobile")} onChange={setPath} error={errors["basic.mobile"]} placeholder="10-digit mobile" />
 <EField label="Email ID" icon="doc" type="email" path="basic.email" value={get("basic", "email")} onChange={setPath} error={errors["basic.email"]} placeholder="you@example.com" />
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <OtpVerify
 title="Mobile verification (OTP)"
 verified={!!data.basic?.mobileVerified}
 otpState={mobileOtp}
 onStart={() => startOtp("mobile", get("basic", "mobile") || "your mobile")}
 onConfirm={() => confirmOtp("mobile", "basic.mobileVerified")}
 onChange={(v) => setMobileOtp((p) => ({ ...p, value: v }))}
 />
 <OtpVerify
 title="Email verification (OTP)"
 verified={!!data.basic?.emailVerified}
 otpState={emailOtp}
 onStart={() => startOtp("email", get("basic", "email") || "your email")}
 onConfirm={() => confirmOtp("email", "basic.emailVerified")}
 onChange={(v) => setEmailOtp((p) => ({ ...p, value: v }))}
 />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("basic")} />
 </Section>
 )}

 {/* ---------------- IDENTITY ---------------- */}
 {tab === "identity" && (
 <Section title="Identity & Aadhaar e-KYC" desc="Sensitive numbers are always encrypted (AES-256-GCM) before storage and masked on screen.">
 <div className="grid gap-3 sm:grid-cols-2">
 <EField label="Aadhaar Number" icon="id" maxLength={12} path="identity.docNumber" value={get("identity", "docNumber")} onChange={setPath} error={errors["identity.docNumber"]} placeholder="12-digit Aadhaar"
 hint={get("identity", "docNumber") ? `Displayed as ${maskAadhaar(get("identity", "docNumber"))}` : undefined} />
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] px-4 py-3">
 <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-400 dark:text-ink-500 "><Icon name="card" className="h-3.5 w-3.5" /> PAN Number</p>
 <input
 value={data.identity?.panNumber ?? ""}
 maxLength={10}
 onChange={(e) => setPath("identity.panNumber", e.target.value.toUpperCase())}
 placeholder="ABCDE1234F"
 className="nums mt-1 w-full bg-transparent text-[14px] font-semibold uppercase text-ink-900 dark:text-white outline-none placeholder:font-normal placeholder:text-ink-300"
 />
 {errors["identity.panNumber"] && <p className="mt-1 text-[11.5px] font-medium text-rose-ink">{errors["identity.panNumber"]}</p>}
 </div>
 </div>
 <div className="mt-4">
 <OtpVerify
 title="Aadhaar e-KYC verification (OTP)"
 verified={!!data.identity?.verified}
 otpState={idOtp}
 onStart={() => {
 const errs = verifySection("identity");
 setErrors(errs);
 if (errs["identity.docNumber"]) {
 notify("Enter a valid Aadhaar number first.", "red");
 return;
 }
 startOtp("id", "your registered email");
 }}
 onConfirm={() => confirmOtp("id", "identity.verified")}
 onChange={(v) => setIdOtp((p) => ({ ...p, value: v }))}
 />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("identity")} />
 </Section>
 )}

 {/* ---------------- ADDRESS ---------------- */}
 {tab === "address" && (
 <Section title="Address" desc="Used for scheme eligibility (domicile) and delivery of benefits.">
 <div className="grid gap-3 sm:grid-cols-2">
 <EField label="House / Flat, Street" icon="home2" path="address.line1" value={get("address", "line1")} onChange={setPath} error={errors["address.line1"]} />
 <EField label="Village / Town / City" icon="city" path="address.village" value={get("address", "village")} onChange={setPath} error={errors["address.village"]} />
 <EField label="District" icon="city" path="address.district" value={get("address", "district")} onChange={setPath} error={errors["address.district"]} />
 <EField label="State" icon="city" path="address.state" value={get("address", "state")} onChange={setPath} error={errors["address.state"]} />
 <EField label="PIN Code" icon="doc" maxLength={6} path="address.pincode" value={get("address", "pincode")} onChange={setPath} error={errors["address.pincode"]} />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("address")} />
 </Section>
 )}

 {/* ---------------- BANK ---------------- */}
 {tab === "bank" && (
 <Section title="Bank Details" desc="Account numbers are encrypted at rest. DBT benefits are credited to this account.">
 <div className="grid gap-3 sm:grid-cols-2">
 <EField label="Account Holder" icon="user" path="bank.accountHolder" value={get("bank", "accountHolder")} onChange={setPath} error={errors["bank.accountHolder"]} />
 <EField label="Bank Name" icon="bank" path="bank.bankName" value={get("bank", "bankName")} onChange={setPath} error={errors["bank.bankName"]} />
 <EField label="Account Number" icon="bank" path="bank.accountNumber" value={get("bank", "accountNumber")} onChange={setPath} error={errors["bank.accountNumber"]}
 hint={get("bank", "accountNumber") ? `Displayed as ${maskAccount(get("bank", "accountNumber"))}` : undefined} />
 <EField label="IFSC Code" icon="bank" maxLength={11} path="bank.ifsc" value={get("bank", "ifsc")} onChange={(p, v) => setPath(p, v.toUpperCase())} error={errors["bank.ifsc"]} placeholder="SBIN0001234" />
 </div>
 <div className="mt-4">
 <OtpVerify
 title="Bank account verification (OTP)"
 verified={!!data.bank?.verified}
 otpState={bankOtp}
 onStart={() => {
 if (!get("bank", "accountNumber")) {
 notify("Enter account details first.", "red");
 return;
 }
 startOtp("bank", "your registered email");
 }}
 onConfirm={() => confirmOtp("bank", "bank.verified")}
 onChange={(v) => setBankOtp((p) => ({ ...p, value: v }))}
 />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("bank")} />
 </Section>
 )}

 {/* ---------------- FAMILY ---------------- */}
 {tab === "family" && (
 <Section title="Family Members" desc="Required for income-linked schemes and family benefit cards.">
 <div className="grid gap-3 sm:grid-cols-2">
 <EField label="Father's Name" icon="user" path="family.fatherName" value={get("family", "fatherName")} onChange={setPath} />
 <EField label="Mother's Name" icon="user" path="family.motherName" value={get("family", "motherName")} onChange={setPath} />
 <EField label="Guardian (if applicable)" icon="users" path="family.guardianName" value={get("family", "guardianName")} onChange={setPath} />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("family")} />
 </Section>
 )}

 {/* ---------------- EDUCATION ---------------- */}
 {tab === "education" && (
 <Section title="Education & Employment" desc="Used for scholarships, skill programmes and employment schemes.">
 <div className="grid gap-3 sm:grid-cols-2">
 <EField label="Highest Qualification" icon="grad" path="education.level" value={get("education", "level")} onChange={setPath} placeholder="e.g. Bachelor of Engineering" />
 <EField label="Institution" icon="building" path="education.institution" value={get("education", "institution")} onChange={setPath} />
 <EField label="Passing Year" icon="clock" maxLength={4} path="education.passingYear" value={get("education", "passingYear")} onChange={setPath} placeholder="e.g. 2026" />
 <EField label="Occupation" icon="brief" path="education.occupation" value={get("education", "occupation")} onChange={setPath} placeholder="e.g. Software Engineer" />
 </div>
 <SaveRow dirty={dirty} saving={saving} onSave={() => save("education")} />
 </Section>
 )}

 {/* ---------------- DOCUMENT VAULT ---------------- */}
 {tab === "docs" && (
 <Section title="Document Vault" desc="Encrypted-at-rest storage for your certificates and IDs — no external cloud keys needed.">
 <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-ink-700 ${vaultBusy ? "pointer-events-none opacity-50" : ""}`}>
 <Icon name="plus" className="h-4 w-4" />
 {vaultBusy ? "Uploading…" : "Upload document"}
 <input type="file" className="hidden" accept="image/*,.pdf" disabled={vaultBusy} onChange={handleVaultUpload} />
 </label>

 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 {vault.length === 0 && (
 <div className="rounded-2xl border border-dashed border-ink-200 dark:border-white/20 bg-ink-50/40 dark:bg-white/5 p-8 text-center sm:col-span-2">
 <p className="text-[13.5px] font-semibold text-ink-500 dark:text-ink-400 ">No documents yet</p>
 <p className="mt-1 text-[12.5px] text-ink-400 dark:text-ink-500 ">Upload Aadhaar, PAN, certificates — images and PDFs up to 5 MB.</p>
 </div>
 )}
 {vault.map((d) => (
 <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] p-4">
 <IconTile icon="doc" tone="blue" />
 <div className="min-w-0 flex-1">
 <p className="truncate text-[13.5px] font-bold text-ink-900 dark:text-white ">{d.name}</p>
 <p className="text-[11.5px] text-ink-400 dark:text-ink-500 ">{d.size ? `${(d.size / 1024).toFixed(0)} KB · ` : ""}Stored encrypted · {fmtDateTime(d.uploadedAt)}</p>
 </div>
 <button
 onClick={() => openDocumentUrl(d.url, d.name)}
 className="rounded-lg p-2 text-ink-400 dark:text-ink-500 transition-colors hover:bg-ink-50 dark:hover:bg-white/10 hover:text-ink-700 dark:text-ink-300 "
 aria-label={`Open ${d.name}`}
 title="Open"
 >
 <Icon name="arrow" className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleVaultDelete(d)}
 className="rounded-lg p-2 text-rose-ink transition-colors hover:bg-rose-soft"
 aria-label={`Delete ${d.name}`}
 title="Delete"
 >
 <Icon name="x" className="h-4 w-4" />
 </button>
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* ---------------- SECURITY ---------------- */}
 {tab === "security" && (
 <Section title="Security & Privacy" desc="Manage your password, data export and account deletion (DPDP Act rights).">
 {/* Password change */}
 <form onSubmit={changePw} className="grid gap-3 sm:grid-cols-3">
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] px-4 py-3">
 <label className="text-[12px] font-medium text-ink-400 dark:text-ink-500 ">Current password</label>
 <input type="password" required value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
 className="mt-1 w-full bg-transparent text-[14px] font-semibold text-ink-900 dark:text-white outline-none" />
 </div>
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] px-4 py-3">
 <label className="text-[12px] font-medium text-ink-400 dark:text-ink-500 ">New password</label>
 <input type="password" required minLength={6} value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
 className="mt-1 w-full bg-transparent text-[14px] font-semibold text-ink-900 dark:text-white outline-none" />
 </div>
 <div className="rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] px-4 py-3">
 <label className="text-[12px] font-medium text-ink-400 dark:text-ink-500 ">Confirm new password</label>
 <input type="password" required value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
 className="mt-1 w-full bg-transparent text-[14px] font-semibold text-ink-900 dark:text-white outline-none" />
 </div>
 <div className="sm:col-span-3">
 <Btn type="submit" disabled={pwBusy} icon="shield">{pwBusy ? "Updating…" : "Update password"}</Btn>
 </div>
 </form>

 {/* DPDP rights */}
 <div className="mt-6 grid gap-3 sm:grid-cols-2">
 <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-ink-50/50 dark:bg-white/5 p-5">
 <IconTile icon="doc" tone="blue" />
 <p className="mt-3 text-[14px] font-bold text-ink-900 dark:text-white ">Download my data</p>
 <p className="mt-1 text-[12.5px] text-ink-500 dark:text-ink-400 ">Get a machine-readable copy of everything we store about you.</p>
 <Btn variant="outline" className="mt-3 !py-2 !text-[13px]" icon="arrow" onClick={doExport}>Export data</Btn>
 </div>
 <div className="rounded-2xl border border-rose-line bg-rose-soft/50 p-5">
 <IconTile icon="alert" tone="red" />
 <p className="mt-3 text-[14px] font-bold text-ink-900 dark:text-white ">Delete my account</p>
 <p className="mt-1 text-[12.5px] text-ink-500 dark:text-ink-400 ">Permanently erases your profile, applications, consents and audit trail.</p>
 <Btn variant="danger" className="mt-3 !py-2 !text-[13px]" icon="x" onClick={doDelete}>Delete everything</Btn>
 </div>
 </div>
 </Section>
 )}
 </div>
 </Card>

 {/* Export viewer */}
 {showExport && exportData && (
 <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
 <div className="absolute inset-0 bg-ink-900/50" onClick={() => setShowExport(false)} />
 <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#000000] shadow-2xl">
 <div className="flex items-center justify-between border-b border-ink-100 dark:border-white/10 px-5 py-4">
 <h3 className="text-[15px] font-bold text-ink-900 dark:text-white ">Your data export</h3>
 <button onClick={() => setShowExport(false)} aria-label="Close" className="rounded-lg p-1.5 text-ink-400 dark:text-ink-500 hover:bg-ink-50 dark:hover:bg-white/10 "><Icon name="x" className="h-5 w-5" /></button>
 </div>
 <pre className="nums max-h-[60vh] overflow-auto bg-ink-50/60 dark:bg-white/5 p-5 text-[11px] leading-relaxed text-ink-700 dark:text-ink-300 ">
 {JSON.stringify(exportData, null, 2)}
 </pre>
 </div>
 </div>
 )}
 </div>
 );
}

function Section({ title, desc, children }) {
 return (
 <div className="animate-fade">
 <h2 className="text-[17px] font-bold text-ink-900 dark:text-white ">{title}</h2>
 <p className="mt-0.5 text-[13px] text-ink-400 dark:text-ink-500 ">{desc}</p>
 <div className="mt-5">{children}</div>
 </div>
 );
}

function SaveRow({ dirty, saving, onSave }) {
 return (
 <div className="mt-6 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-5">
 <p className="text-[12px] text-ink-400 dark:text-ink-500 ">
 {dirty ? "You have unsaved changes." : "All changes are saved and encrypted."}
 </p>
 <Btn onClick={onSave} disabled={saving || !dirty} icon="check">
 {saving ? "Saving…" : "Save changes"}
 </Btn>
 </div>
 );
}
