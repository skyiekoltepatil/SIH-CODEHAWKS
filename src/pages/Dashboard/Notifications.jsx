import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";
import { fmtDateTime } from "../../services/bharatBackend.js";

const TYPE_META = {
 "application-submitted": { icon: "doc", tone: "blue", label: "Application" },
 "application-withdrawn": { icon: "x", tone: "red", label: "Withdrawn" },
 "consent-granted": { icon: "shield", tone: "green", label: "Consent" },
 "consent-revoked": { icon: "alert", tone: "red", label: "Revoked" },
 "data-transferred": { icon: "swap", tone: "blue", label: "Transfer" },
 "otp-verified": { icon: "check", tone: "green", label: "Verified" },
 "otp-sent": { icon: "bell", tone: "blue", label: "OTP" },
 "profile-saved": { icon: "user", tone: "blue", label: "Profile" },
 "profile-submitted": { icon: "check", tone: "green", label: "Profile" },
 "document-uploaded": { icon: "doc", tone: "violet", label: "Document" },
};

const FILTERS = [
 { key: "all", label: "All" },
 { key: "unread", label: "Unread" },
 { key: "application", label: "Applications" },
 { key: "consent", label: "Consents" },
 { key: "verification", label: "Verifications" },
];

const FILTER_MATCH = {
 application: ["application-submitted", "application-withdrawn"],
 consent: ["consent-granted", "consent-revoked", "data-transferred"],
 verification: ["otp-verified", "otp-sent", "profile-saved", "profile-submitted"],
};

export default function Notifications() {
 const { user, backend, notify } = useAuth();
 const [events, setEvents] = useState([]);
 const [filter, setFilter] = useState("all");
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!user) return;
 const unsub = backend.subscribeEvents(user.uid, (rows) => {
 setEvents(rows);
 setLoading(false);
 });
 return unsub;
 }, [user, backend]);

 const filtered = useMemo(() => {
 if (filter === "all") return events;
 if (filter === "unread") return events.filter((e) => !e.read);
 return events.filter((e) => FILTER_MATCH[filter]?.includes(e.type));
 }, [events, filter]);

 const unreadCount = events.filter((e) => !e.read).length;

 const markAll = async () => {
 await backend.markAllEventsRead(user.uid);
 notify("All notifications marked as read.", "blue");
 };
 const markOne = async (ev) => {
 await backend.markEventRead(user.uid, ev.id, true);
 };

 const countFor = (key) => {
 if (key === "all") return events.length;
 if (key === "unread") return unreadCount;
 return events.filter((e) => FILTER_MATCH[key]?.includes(e.type)).length;
 };

 return (
 <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="Notifications"
 title="Notifications"
 sub="Updates about your applications, consents, verifications and account security."
 right={
 <Btn variant="outline" icon="check" onClick={markAll} disabled={unreadCount === 0}>
 Mark all as read
 </Btn>
 }
 />

 <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
 {FILTERS.map((f) => {
 const active = filter === f.key;
 return (
 <button
 key={f.key}
 onClick={() => setFilter(f.key)}
 aria-pressed={active}
 className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
 active ? "border-ink-800 bg-ink-800 text-white" : "border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 "
 }`}
 >
 {f.label} <span className={`nums ${active ? "text-ink-300" : "text-ink-400 dark:text-ink-500 "}`}>({countFor(f.key)})</span>
 </button>
 );
 })}
 </div>

 <div className="mt-4 space-y-3">
 {loading && <Card className="p-10 text-center text-[13px] text-ink-400 dark:text-ink-500 ">Loading notifications…</Card>}

 {!loading && filtered.map((ev) => {
 const m = TYPE_META[ev.type] || { icon: "info", tone: "blue", label: "Activity" };
 return (
 <Card key={ev.id} hover className={`relative flex gap-4 p-5 ${ev.read ? "" : "border-ink-200 dark:border-white/20 "}`}>
 {!ev.read && <span className="absolute left-0 top-5 h-8 w-1 rounded-r-full bg-verd-600" aria-hidden="true" />}
 <IconTile icon={m.icon} tone={m.tone} size="lg" />
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-[14.5px] font-bold text-ink-900 dark:text-white ">{ev.title || ev.department || "System Activity"}</p>
 <span className="rounded-full bg-ink-50 dark:bg-[#000000] px-2 py-0.5 text-[10.5px] font-bold text-ink-500 dark:text-ink-400 ring-1 ring-ink-100 dark:ring-white/10 ">{m.label}</span>
 {!ev.read && <span className="rounded-full bg-verd-50 px-2 py-0.5 text-[10.5px] font-bold text-verd-700">NEW</span>}
 </div>
 <p className="mt-1 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400 ">{ev.body || ev.purpose || ev.requested || "No details provided"}</p>
 <p className="nums mt-2.5 text-[12px] text-ink-400 dark:text-ink-500 ">{fmtDateTime(ev.createdAt)}</p>
 </div>
 {!ev.read && (
 <button onClick={() => markOne(ev)} className="self-start rounded-lg border border-ink-200 dark:border-white/20 px-2.5 py-1.5 text-[11.5px] font-bold text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 ">
 Mark read
 </button>
 )}
 </Card>
 );
 })}

 {!loading && filtered.length === 0 && (
 <Card className="flex flex-col items-center px-6 py-14 text-center">
 <IconTile icon="bell" tone="blue" size="lg" />
 <p className="mt-3 text-[14px] font-bold text-ink-900 dark:text-white ">You're all caught up</p>
 <p className="mt-1 text-[13px] text-ink-400 dark:text-ink-500 ">
 {events.length === 0 ? "Apply for a scheme or update your profile — activity will appear here." : "No notifications in this view."}
 </p>
 <Link to="/schemes" className="mt-4"><Btn>Browse Schemes</Btn></Link>
 </Card>
 )}
 </div>
 </div>
 );
}
