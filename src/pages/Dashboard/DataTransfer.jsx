import { useEffect, useMemo, useState } from "react";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile, StatusPill } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";
import { dataOptions } from "../../data.js";
import { fmtDateTime } from "../../services/bharatBackend.js";

const steps = ["Select Data", "Choose Service", "Review & Consent", "Complete"];

const DEPARTMENTS = [
 { id: "scholarship", name: "Scholarship Department", icon: "grad", purpose: "Scholarship application processing", duration: "Max 180 days", fieldLabels: { basic: "Basic identity (name, DOB)", education: "Education information", bank: "Bank verification (status only)" } },
 { id: "education", name: "Education Department", icon: "book", purpose: "Certificate verification", duration: "Single verification (7 days)", fieldLabels: { identity: "Identity document (masked)", education: "Education certificates" } },
 { id: "health", name: "Health Department", icon: "health", purpose: "Health scheme eligibility", duration: "Max 90 days", fieldLabels: { basic: "Basic identity (name, DOB)", address: "Address information", family: "Family information" } },
 { id: "revenue", name: "Revenue / Income Department", icon: "rupee", purpose: "Income certificate issuance", duration: "Single issuance (30 days)", fieldLabels: { basic: "Basic identity", address: "Address information", bank: "Bank verification (status only)" } },
 { id: "utility", name: "Utility Services Board", icon: "bulb", purpose: "Subsidy application", duration: "Max 60 days", fieldLabels: { basic: "Basic identity", address: "Address information", bank: "Bank verification (status only)" } },
 { id: "pmkisan", name: "PM-KISAN (Agriculture Ministry)", icon: "leaf", purpose: "Farmer income support processing", duration: "Max 120 days", fieldLabels: { basic: "Basic identity", bank: "Bank details for DBT", land: "Land record data" } },
];

function Stepper({ current }) {
 return (
 <ol className="hide-scrollbar flex items-center gap-0 overflow-x-auto pb-1" aria-label="Progress">
 {steps.map((label, i) => {
 const state = i < current ? "done" : i === current ? "active" : "todo";
 return (
 <li key={label} className="flex shrink-0 items-center">
 <div className="flex items-center gap-2.5">
 <span
 className={`nums flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all ${
 state === "done"
 ? "bg-verd-600 text-white"
 : state === "active"
 ? "bg-ink-800 text-white ring-4 ring-ink-100 dark:ring-white/10 "
 : "border-2 border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] text-ink-400 dark:text-ink-500 "
 }`}
 aria-current={state === "active" ? "step" : undefined}
 >
 {state === "done" ? <Icon name="check" className="h-4 w-4" strokeWidth={2.4} /> : i + 1}
 </span>
 <span className={`whitespace-nowrap text-[13px] font-semibold ${state === "todo" ? "text-ink-400 dark:text-ink-500 " : "text-ink-900 dark:text-white "}`}>
 {label}
 </span>
 </div>
 {i < steps.length - 1 && <span className={`mx-3 h-[2px] w-10 sm:w-16 ${i < current ? "bg-verd-500" : "bg-ink-100 dark:bg-white/10 "}`} />}
 </li>
 );
 })}
 </ol>
 );
}

export default function DataTransfer() {
 const { user, backend, notify, confirmAction } = useAuth();
 const [step, setStep] = useState(0);
 const [selected, setSelected] = useState(["personal"]);
 const [dept, setDept] = useState("health");
 const [ack, setAck] = useState(false);
 const [query, setQuery] = useState("");
 const [result, setResult] = useState(null);
 const [consents, setConsents] = useState([]);
 const [busy, setBusy] = useState(false);

 useEffect(() => {
 if (!user) return;
 backend.listConsents(user.uid).then(setConsents);
 }, [user, backend]);

 const toggle = (k) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

 const filteredDepts = useMemo(
 () => DEPARTMENTS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase())),
 [query]
 );
 const chosenDept = DEPARTMENTS.find((d) => d.id === dept);
 const chosenData = dataOptions.filter((d) => selected.includes(d.key));

 const submit = async () => {
 setBusy(true);
 try {
 const snapshot = Object.fromEntries(chosenData.map((d) => [d.key, d.label]));
 const res = await backend.transferData(user.uid, {
 department: chosenDept,
 fields: chosenData.map((d) => d.key),
 snapshot,
 });
 // Also create a formal consent record
 await backend.grantConsent(user.uid, chosenDept, chosenData.map((d) => d.key));
 setResult(res);
 setStep(3);
 setConsents(await backend.listConsents(user.uid));
 notify(`Data shared with ${chosenDept.name} — Ref ${res.ref}.`);
 } catch (e) {
 notify("Transfer failed. Please try again.", "red");
 } finally {
 setBusy(false);
 }
 };

 const revoke = async (c) => {
 const ok = await confirmAction(`Revoke ${c.departmentName}'s access? They lose access immediately.`);
 if (!ok) return;
 await backend.revokeConsent(user.uid, c.id, c.departmentName);
 setConsents(await backend.listConsents(user.uid));
 notify("Consent revoked.", "red");
 };

 const reset = () => {
 setStep(0); setSelected(["personal"]); setDept("health"); setAck(false); setResult(null); setQuery("");
 };

 return (
 <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="Data Transfer"
 title="Government Data Transfer"
 sub="Securely share your verified government data with other services."
 />

 <Card className="p-6 sm:p-8">
 <Stepper current={step} />

 {/* STEP 1 */}
 {step === 0 && (
 <div className="mt-7 grid animate-fade gap-5 lg:grid-cols-2">
 <div>
 <p className="text-[14px] font-bold text-ink-900 dark:text-white ">Select the data you want to share</p>
 <p className="mt-0.5 text-[12.5px] text-ink-400 dark:text-ink-500 ">Only verified fields can be shared. Unverified items need verification first.</p>
 <div className="mt-4 grid max-h-[420px] gap-2.5 overflow-y-auto pr-1">
 {dataOptions.map((d) => {
 const on = selected.includes(d.key);
 return (
 <button
 key={d.key}
 onClick={() => toggle(d.key)}
 aria-pressed={on}
 className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all ${
 on ? "border-ink-700 bg-ink-50 dark:bg-[#000000] ring-1 ring-ink-700" : "border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] hover:border-ink-300"
 }`}
 >
 <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${on ? "border-ink-800 bg-ink-800 text-white" : "border-ink-300 bg-white dark:bg-[#000000] "}`}>
 {on && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
 </span>
 <IconTile icon={d.icon} tone={d.verified ? "blue" : "violet"} size="sm" />
 <span className="min-w-0 flex-1">
 <span className="block truncate text-[13.5px] font-semibold text-ink-900 dark:text-white ">{d.label}</span>
 <span className="block truncate text-[12px] text-ink-400 dark:text-ink-500 ">{d.sub}</span>
 </span>
 {d.verified ? (
 <span className="flex items-center gap-1 rounded-full bg-verd-50 px-2 py-0.5 text-[11px] font-bold text-verd-700">
 <Icon name="check" className="h-3 w-3" strokeWidth={2.5} /> Verified
 </span>
 ) : (
 <span className="rounded-full bg-ink-50 dark:bg-[#000000] px-2 py-0.5 text-[11px] font-bold text-ink-400 dark:text-ink-500 ">Not verified</span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 <div className="lg:pl-2">
 <p className="text-[14px] font-bold text-ink-900 dark:text-white ">Select Service / Department</p>
 <p className="mt-0.5 text-[12.5px] text-ink-400 dark:text-ink-500 ">Choose where your data should be sent.</p>
 <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3.5 py-2.5 text-ink-400 dark:text-ink-500 focus-within:border-ink-400 dark:focus-within:border-white/40 :border-white/40 ">
 <Icon name="search" className="h-4 w-4 shrink-0" />
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search department..."
 className="w-full bg-transparent text-[13.5px] text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:text-ink-500 "
 aria-label="Search departments"
 />
 </div>
 <div className="mt-3 grid max-h-[380px] gap-2.5 overflow-y-auto pr-1">
 {filteredDepts.map((d) => {
 const on = dept === d.id;
 return (
 <button
 key={d.id}
 onClick={() => setDept(d.id)}
 aria-pressed={on}
 className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all ${
 on ? "border-ink-700 bg-ink-50 dark:bg-[#000000] ring-1 ring-ink-700" : "border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] hover:border-ink-300"
 }`}
 >
 <IconTile icon={d.icon} tone="blue" size="sm" />
 <span className="min-w-0 flex-1">
 <span className="block truncate text-[13.5px] font-semibold text-ink-900 dark:text-white ">{d.name}</span>
 <span className="block truncate text-[12px] text-ink-400 dark:text-ink-500 ">{d.purpose} · {d.duration}</span>
 </span>
 <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${on ? "border-ink-800 bg-ink-800" : "border-ink-300"}`}>
 {on && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#000000] " />}
 </span>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {/* STEP 2 — review */}
 {step === 1 && (
 <div className="mt-7 animate-fade">
 <div className="grid gap-4 lg:grid-cols-2">
 <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-ink-50/40 dark:bg-white/5 p-5">
 <p className="text-[13px] font-bold uppercase tracking-wide text-ink-400 dark:text-ink-500 ">Sharing with</p>
 <div className="mt-3 flex items-center gap-3.5">
 <IconTile icon={chosenDept.icon} tone="blue" size="lg" />
 <div>
 <p className="text-[15px] font-bold text-ink-900 dark:text-white ">{chosenDept.name}</p>
 <p className="text-[12.5px] text-ink-400 dark:text-ink-500 ">{chosenDept.purpose} · {chosenDept.duration}</p>
 </div>
 </div>
 <p className="mt-4 text-[12.5px] leading-relaxed text-ink-500 dark:text-ink-400 ">
 The department will use this data only for the stated purpose. Sharing is audit-logged and can be revoked below at any time.
 </p>
 </div>
 <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-ink-50/40 dark:bg-white/5 p-5">
 <p className="text-[13px] font-bold uppercase tracking-wide text-ink-400 dark:text-ink-500 ">Fields selected ({chosenData.length})</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {chosenData.map((d) => (
 <span key={d.key} className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3 py-1.5 text-[12.5px] font-semibold text-ink-700 dark:text-ink-300 ">
 <Icon name={d.icon} className="h-3.5 w-3.5 text-ink-400 dark:text-ink-500 " />
 {d.label}
 </span>
 ))}
 {chosenData.length === 0 && <p className="text-[13px] text-ink-400 dark:text-ink-500 ">No fields selected yet.</p>}
 </div>
 </div>
 </div>

 <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-line bg-amber-soft/60 p-5">
 <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-ink-800" />
 <span className="text-[13px] leading-relaxed text-ink-800 dark:text-ink-200 ">
 I hereby give my explicit consent to share the selected data with{" "}
 <span className="font-bold">{chosenDept.name}</span> for <span className="font-bold">{chosenDept.purpose}</span>. I
 understand this consent is audit-logged and revocable at any time.
 </span>
 </label>
 </div>
 )}

 {/* STEP 3 — complete */}
 {step === 2 && <p className="mt-6 text-[13px] text-ink-400 dark:text-ink-500 ">Loading…</p>}

 {step === 3 && result && (
 <div className="mt-7 animate-fade">
 <div className="flex flex-col items-center rounded-2xl border border-verd-100 bg-gradient-to-b from-verd-50 to-white dark:from-verd-900/20 dark:to-[#000000] px-6 py-10 text-center">
 <span className="flex h-16 w-16 items-center justify-center rounded-full bg-verd-600 text-white shadow-[0_10px_30px_-8px_rgba(14,138,79,0.6)]">
 <Icon name="check" className="h-8 w-8" strokeWidth={2.4} />
 </span>
 <h2 className="mt-4 text-[20px] font-bold text-ink-900 dark:text-white ">Request submitted</h2>
 <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-400 ">
 Your data was shared with <span className="font-semibold text-ink-800 dark:text-ink-200 ">{result.departmentName}</span>. Reference ID{" "}
 <span className="nums font-bold text-ink-800 dark:text-ink-200 ">{result.ref}</span>. This transfer is recorded in your audit trail.
 </p>
 <div className="mt-5 flex flex-wrap justify-center gap-2">
 {chosenData.map((d) => (
 <span key={d.key} className="rounded-full bg-white dark:bg-[#000000] px-3 py-1.5 text-[12px] font-semibold text-ink-700 dark:text-ink-300 ring-1 ring-verd-100">
 {d.label} shared
 </span>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Footer controls */}
 <div className="mt-8 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-5">
 <Btn
 variant="ghost"
 icon="chevron"
 className={`!pl-2 ${step === 0 ? "invisible" : ""}`}
 onClick={() => (step === 3 ? reset() : setStep((s) => Math.max(0, s - 1)))}
 >
 {step === 3 ? "Start new request" : "Back"}
 </Btn>
 <div className="flex items-center gap-3">
 {step === 1 && !ack && <p className="hidden text-[12px] font-medium text-amber-ink sm:block">Please accept the consent to continue</p>}
 <Btn
 onClick={() => (step === 0 ? setStep(1) : step === 1 ? submit() : step === 3 ? reset() : setStep(2))}
 disabled={(step === 0 && selected.length === 0) || (step === 1 && !ack) || busy}
 iconRight="arrow"
 >
 {step === 0 && "Continue"}
 {step === 1 && (busy ? "Transferring…" : "Give Consent & Transfer")}
 {step === 3 && "Done"}
 </Btn>
 </div>
 </div>
 </Card>

 {/* Active consents ledger */}
 <section className="mt-8">
 <div className="flex items-end justify-between gap-4">
 <div>
 <h2 className="text-[17px] font-bold tracking-tight text-ink-900 dark:text-white ">Active Consents</h2>
 <p className="mt-0.5 text-[13px] text-ink-400 dark:text-ink-500 ">Every department you have granted data access to. Revoke anytime.</p>
 </div>
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 {consents.length === 0 && (
 <Card className="p-6 sm:col-span-2">
 <p className="text-center text-[13px] text-ink-400 dark:text-ink-500 ">No consents granted yet. Complete a transfer above to create one.</p>
 </Card>
 )}
 {consents.map((c) => (
 <Card key={c.id} className="p-5">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3">
 <IconTile icon="shield" tone={c.status === "Authorized" ? "green" : "red"} />
 <div>
 <p className="text-[14px] font-bold text-ink-900 dark:text-white ">{c.departmentName}</p>
 <p className="text-[12px] text-ink-400 dark:text-ink-500 ">{c.purpose}</p>
 </div>
 </div>
 <StatusPill status={c.status === "Authorized" ? "approved" : "rejected"} />
 </div>
 <div className="mt-3 flex flex-wrap gap-1.5">
 {(c.fieldsShared || []).map((f) => (
 <span key={f} className="rounded-full bg-ink-50 dark:bg-[#000000] px-2.5 py-1 text-[11px] font-semibold text-ink-600 dark:text-ink-400 ring-1 ring-ink-100 dark:ring-white/10 ">
 {c.fieldLabels?.[f] || f}
 </span>
 ))}
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-3.5">
 <p className="nums text-[11.5px] text-ink-400 dark:text-ink-500 ">Granted {fmtDateTime(c.grantedAt)}</p>
 {c.status === "Authorized" && (
 <button onClick={() => revoke(c)} className="text-[12.5px] font-bold text-rose-ink hover:underline">Revoke</button>
 )}
 </div>
 </Card>
 ))}
 </div>
 </section>
 </div>
 );
}
