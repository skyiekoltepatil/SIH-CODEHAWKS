import { useEffect, useState } from "react";
import PageHead from "../../components/PageHead.jsx";
import { Card } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";
import { fmtDateTime } from "../../services/bharatBackend.js";

const TYPE_META = {
 "device-login": { label: "Device Login", tone: "blue" },
 "otp-sent": { label: "OTP Sent", tone: "blue" },
 "otp-verified": { label: "Phone Verification", tone: "green" },
 "document-uploaded": { label: "Document Verification", tone: "violet" },
 "profile-saved": { label: "User Profile Updates", tone: "green" },
 "profile-submitted": { label: "User Profile Updates", tone: "green" },
 "data-transferred": { label: "Data Fetch", tone: "blue" },
 "application-submitted": { label: "Application Submitted", tone: "blue" },
 "application-withdrawn": { label: "Application Withdrawn", tone: "red" },
 "consent-granted": { label: "Consent Granted", tone: "green" },
 "consent-revoked": { label: "Consent Revoked", tone: "red" },
};

/* ── Filter definitions ── */
const FILTERS = [
 {
 id: "all",
 label: "All Logs",
 icon: (
 <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
 <path d="M3 5h14M5 10h10M7 15h6" />
 </svg>
 ),
 match: () => true,
 },
 {
 id: "device",
 label: "Log in Device",
 icon: (
 <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
 <rect x="4" y="3" width="12" height="14" rx="1.5" />
 <path d="M8 14h4" />
 </svg>
 ),
 match: (ev) => ["device-login", "otp-sent", "otp-verified"].includes(ev.type),
 },
 {
 id: "data",
 label: "Data Fetched",
 icon: (
 <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
 <path d="M4 8h9l-3-3" />
 <path d="M16 12H7l3 3" />
 </svg>
 ),
 match: (ev) => ["data-transferred", "consent-granted", "consent-revoked", "document-uploaded"].includes(ev.type),
 },
 {
 id: "profile",
 label: "Profile Update",
 icon: (
 <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="10" cy="7" r="3" />
 <path d="M4 17c1-3 3.4-4.6 6-4.6s5 1.6 6 4.6" />
 </svg>
 ),
 match: (ev) => ["profile-saved", "profile-submitted"].includes(ev.type),
 },
];

export default function AuditLogs() {
 const { user, backend } = useAuth();
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [activeFilter, setActiveFilter] = useState("all");

 useEffect(() => {
 if (!user) return;
 const unsub = backend.subscribeEvents(user.uid, (rows) => {
 setEvents(rows);
 setLoading(false);
 });
 return unsub;
 }, [user, backend]);

 const currentFilter = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0];
 const filtered = events.filter(currentFilter.match);

 return (
 <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="Audit Logs"
 title="Audit Logs"
 sub="Monitor your account activity, verifications, and data accesses."
 />

 {/* ── Filter Tabs ── */}
 <div className="mt-4 flex flex-wrap gap-2">
 {FILTERS.map((f) => {
 const isActive = activeFilter === f.id;
 const count = f.id === "all" ? events.length : events.filter(f.match).length;
 return (
 <button
 key={f.id}
 onClick={() => setActiveFilter(f.id)}
 className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
 isActive
 ? "bg-ink-800 text-white shadow-md shadow-ink-800/20 "
 : "border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] text-ink-600 dark:text-ink-400 hover:border-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 hover:text-ink-800 dark:text-ink-200 "
 }`}
 aria-pressed={isActive}
 >
 <span className={isActive ? "text-white " : "text-ink-400 dark:text-ink-500 group-hover:text-ink-600 dark:text-ink-400 "}>{f.icon}</span>
 {f.label}
 <span
 className={`ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold ${
 isActive
 ? "bg-white dark:bg-[#000000] text-ink-800 dark:text-white "
 : "bg-ink-100 dark:bg-white/10 text-ink-500 dark:text-ink-400 "
 }`}
 >
 {count}
 </span>
 </button>
 );
 })}
 </div>

 {/* ── Table ── */}
 <div className="mt-4">
 <Card className="overflow-hidden">
 {loading ? (
 <div className="p-10 text-center text-[13px] text-ink-400 dark:text-ink-500 ">Loading audit logs…</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-[13px]">
 <thead className="border-b border-ink-100 dark:border-white/10 bg-ink-50/50 dark:bg-white/5 text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 ">
 <tr>
 <th className="px-5 py-3 font-semibold">Date & Time</th>
 <th className="px-5 py-3 font-semibold">Action</th>
 <th className="px-5 py-3 font-semibold">Details</th>
 <th className="px-5 py-3 font-semibold">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-ink-100 dark:divide-white/10 ">
 {filtered.map((ev) => {
 const m = TYPE_META[ev.type] || { label: ev.title, tone: "gray" };
 return (
 <tr key={ev.id} className="hover:bg-ink-50/50 dark:bg-white/5 transition-colors">
 <td className="whitespace-nowrap px-5 py-3.5 text-ink-600 dark:text-ink-400 ">{fmtDateTime(ev.createdAt)}</td>
 <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-white ">{m.label}</td>
 <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400 ">{ev.body}</td>
 <td className="px-5 py-3.5">
 <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ring-inset ${
 m.tone === "green" ? "bg-verd-50 text-verd-700 ring-verd-200 " :
 m.tone === "red" ? "bg-red-50 text-red-700 ring-red-200 " :
 m.tone === "violet" ? "bg-violet-50 text-violet-700 ring-violet-200 " :
 "bg-blue-50 text-blue-700 ring-blue-200 "
 }`}>
 {ev.status || "Completed"}
 </span>
 </td>
 </tr>
 );
 })}
 {filtered.length === 0 && (
 <tr>
 <td colSpan="4" className="px-5 py-10 text-center text-ink-400 dark:text-ink-500 ">
 {events.length === 0
 ? "No activity logged yet."
 : `No ${currentFilter.label.toLowerCase()} found.`}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}
 </Card>
 </div>
 </div>
 );
}
