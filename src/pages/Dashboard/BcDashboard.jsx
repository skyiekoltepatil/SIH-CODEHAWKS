import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile, LinkMore, ProgressRing, SectionHead, StatusPill } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";
import { fmtDateTime } from "../../services/bharatBackend.js";
import bannerImg from "../../assets/india_gov_banner.jpg";
/* Mirror of Profile's completion calculation so dashboard & profile agree */
const PROFILE_SECTIONS = [
 { key: "basic", label: "Contact Information", fields: ["fullName", "dob", "gender", "mobile", "email"] },
 { key: "identity", label: "Aadhaar / Identity", fields: ["docType", "docNumber", "verified"] },
 { key: "address", label: "Address", fields: ["line1", "village", "district", "state", "pincode"] },
 { key: "bank", label: "Bank Details", fields: ["accountHolder", "bankName", "accountNumber", "ifsc", "verified"] },
 { key: "family", label: "Family Members", fields: ["fatherName", "motherName"] },
 { key: "education", label: "Education & Employment", fields: ["level", "institution", "passingYear"] },
];

function computeCompletion(cp) {
 let done = 0;
 let total = 0;
 const perSection = {};
 PROFILE_SECTIONS.forEach((s) => {
 let sd = 0;
 s.fields.forEach((f) => {
 total++;
 const v = cp?.[s.key]?.[f];
 const ok = f === "verified" ? v === true : v != null && String(v).trim() !== "";
 if (ok) {
 done++;
 sd++;
 }
 });
 perSection[s.key] = { done: sd, total: s.fields.length };
 });
 return { pct: total ? Math.round((done / total) * 100) : 0, perSection };
}

const EVENT_ICON = {
 "application-submitted": ["doc", "blue"],
 "application-withdrawn": ["x", "red"],
 "consent-granted": ["shield", "green"],
 "consent-revoked": ["alert", "red"],
 "data-transferred": ["swap", "blue"],
 "otp-verified": ["check", "green"],
 "otp-sent": ["bell", "blue"],
 "profile-saved": ["user", "blue"],
 "profile-submitted": ["check", "green"],
 "document-uploaded": ["doc", "violet"],
};

export default function Dashboard() {
 const { user, backend, notify, confirmAction } = useAuth();
 const navigate = useNavigate();

 const [cp, setCp] = useState(null);
 const [apps, setApps] = useState([]);
 const [events, setEvents] = useState([]);

 useEffect(() => {
 if (!user) return;
 let alive = true;
 (async () => {
 const profile = await backend.loadProfile(user.uid);
 const list = await backend.listApplications(user.uid);
 if (alive) {
 setCp(profile || {});
 setApps(list);
 }
 })();
 const unsub = backend.subscribeEvents(user.uid, (rows) => alive && setEvents(rows.slice(0, 6)));
 return () => {
 alive = false;
 if (unsub) unsub();
 };
 }, [user, backend]);

 const completion = useMemo(() => computeCompletion(cp), [cp]);
 const lastSaved = cp?.savedAt ? fmtDateTime(cp.savedAt) : null;

 const handleCompleteProfile = () => {
 // Find first incomplete section and highlight it on the Profile page
 const firstIncomplete = PROFILE_SECTIONS.find((s) => {
 const st = completion.perSection[s.key];
 return st.done < st.total;
 });    navigate("/dashboard/profile", {
      state: { highlightSection: firstIncomplete?.key || null, from: "complete-profile" },
    });
 };

 const withdraw = async (app) => {
 const ok = await confirmAction(
 `Withdraw your application ${app.appId} for "${app.schemeName}"? This cannot be undone.`
 );
 if (!ok) return;
 await backend.withdrawApplication(user.uid, app.id);
 setApps(await backend.listApplications(user.uid));
 notify("Application withdrawn.", "red");
 };

 const toneMap = { blue: "blue", green: "green", red: "red", amber: "amber", violet: "violet" };

 return (
 <div className="mx-auto max-w-[1240px] px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="Dashboard"
 title="Dashboard"
 sub="Your personal government services overview."
 />

 {/* Hero */}
 <div className="relative overflow-hidden rounded-2xl border border-ink-100 dark:border-white/10 bg-[#eef2f9] dark:bg-[#000000] p-7 sm:p-9">
  <div className="absolute inset-0 z-0">
  <img src={bannerImg} alt="Government Banner" className="w-full h-full object-cover opacity-80 mix-blend-multiply dark:opacity-80 dark:mix-blend-lighten" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f9] via-[#eef2f9]/95 via-[50%] to-transparent dark:from-[#000000] dark:via-[#000000]/80 dark:via-[40%] dark:to-transparent" />
  </div>
 <div className="relative">
 <p className="text-[13px] font-semibold text-ink-500 dark:text-ink-400 ">Welcome back,</p>
 <h1 className="mt-1 text-[30px] font-bold tracking-tight capitalize text-ink-900 dark:text-white ">{cp?.basic?.fullName || user?.name || 'Citizen'}</h1>
 <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-400 ">
 Access and manage your government data, schemes and services in one place.
 </p>
 <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-ink-700 dark:text-ink-300 ">
 {["Digital India", "Empowered Citizens", "Stronger Bharat"].map((t) => (
 <span key={t} className="rounded-full bg-white dark:bg-[#000000] px-3 py-1 shadow-sm ring-1 ring-ink-100 dark:ring-white/10 ">{t}</span>
 ))}
 </div>
 </div>
 </div>

 {/* Profile completion — LIVE from backend */}
 <Card className="mt-6 p-6 sm:p-7">
 <div className="grid items-center gap-7 lg:grid-cols-[auto_1fr_auto]">
 <ProgressRing value={completion.pct} />
 <div>
 <h2 className="text-[18px] font-bold text-ink-900 dark:text-white ">Profile Completion</h2>
 <p className="mt-1 max-w-sm text-[13px] text-ink-500 dark:text-ink-400 ">
 {completion.pct === 100
 ? "Your master profile is complete. All services unlocked."
 : "Complete your profile to access all services and faster approvals."}
 </p>
 {lastSaved && (
 <p className="nums mt-1 text-[12px] text-ink-400 dark:text-ink-500 ">Last saved {lastSaved}</p>
 )}
 <Btn variant="soft" className="mt-4 !py-2 !text-[13px]" iconRight="arrow" onClick={handleCompleteProfile}>
 {completion.pct === 100 ? "Review Profile" : "Complete Profile"}
 </Btn>
 </div>
 <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
 {PROFILE_SECTIONS.map((s) => {
 const st = completion.perSection[s.key];
 const full = st.done === st.total;
 const some = st.done > 0;
 const icon = full ? "check" : some ? "clock" : "plus";
 const cls = full ? "text-verd-600 " : some ? "text-amber-ink " : "text-ink-300 ";
 return (
 <div key={s.key} className="flex items-center gap-2.5 text-[13px]">
 <Icon name={icon} className={`h-4 w-4 shrink-0 ${cls}`} strokeWidth={2} />
 <span className="font-medium text-ink-700 dark:text-ink-300 ">{s.label}</span>
 <span className={`nums ml-auto text-[12px] font-semibold ${cls}`}>
 {st.done}/{st.total}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </Card>

 {/* Quick access */}
 <section className="mt-8">
 <SectionHead title="Quick Access" sub="Most used actions, one tap away" />
 <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {[
 { key: "apply", label: "Apply for a Scheme", sub: "Browse eligibility", icon: "doc", to: "/schemes" },
 { key: "track", label: "Track Application", sub: "Check status", icon: "search", to: "/dashboard/applications" },
 { key: "share", label: "Data Transfer", sub: "Share verified data", icon: "swap", to: "/dashboard/audit-log" },
 { key: "profile", label: "Update Profile", sub: "Keep information current", icon: "user", to: "/dashboard/profile" },
 ].map((q) => (
 <Link key={q.key} to={q.to}>
 <Card hover className="group h-full p-4.5">
 <div className="flex items-center gap-3.5">
 <IconTile icon={q.icon} tone="blue" />
 <div className="min-w-0">
 <p className="truncate text-[14px] font-bold text-ink-900 dark:text-white ">{q.label}</p>
 <p className="truncate text-[12px] text-ink-400 dark:text-ink-500 ">{q.sub}</p>
 </div>
 <Icon name="chevron" className="ml-auto h-4 w-4 shrink-0 text-ink-200 transition-all group-hover:translate-x-0.5 group-hover:text-ink-500 dark:text-ink-400 " />
 </div>
 </Card>
 </Link>
 ))}
 </div>
 </section>

 {/* Activities + Applications */}
 <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
 <Card className="p-6">
 <SectionHead title="Recent Activities" action={<LinkMore to="/dashboard/audit-log" />} />
 <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10 ">
 {events.length === 0 && (
 <li className="py-8 text-center text-[13px] text-ink-400 dark:text-ink-500 ">
 No activity yet — apply for a scheme or update your profile.
 </li>
 )}
 {events.map((ev) => {
 const [icon, tone] = EVENT_ICON[ev.type] || ["info", "blue"];
 return (
 <li key={ev.id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
 <IconTile icon={icon} tone={toneMap[tone] || "blue"} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-[14px] font-semibold text-ink-900 dark:text-white ">{ev.title || ev.department || "System Activity"}</p>
 <p className="mt-0.5 truncate text-[12.5px] text-ink-500 dark:text-ink-400 ">{ev.body || ev.purpose || ev.requested || "No details provided"}</p>
 </div>
 <p className="nums shrink-0 text-right text-[11.5px] text-ink-400 dark:text-ink-500 ">{fmtDateTime(ev.createdAt)}</p>
 </li>
 );
 })}
 </ul>
 </Card>

 <Card className="p-6">
 <SectionHead title="My Applications" action={<LinkMore to="/dashboard/applications" />} />
 <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10 ">
 {apps.length === 0 && (
 <li className="py-8 text-center text-[13px] text-ink-400 dark:text-ink-500 ">
 No applications yet.{" "}
 <Link to="/schemes" className="font-semibold text-ink-700 dark:text-ink-300 underline underline-offset-2">Browse schemes</Link>
 </li>
 )}
 {apps.slice(0, 4).map((a) => (
 <li key={a.id} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
 <IconTile icon="doc" tone={a.status === "Approved" ? "green" : a.status === "Rejected" ? "red" : "amber"} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-[14px] font-semibold text-ink-900 dark:text-white ">{a.schemeName}</p>
 <p className="nums mt-0.5 truncate text-[11.5px] text-ink-400 dark:text-ink-500 ">{a.appId}</p>
 </div>
 <div className="flex shrink-0 flex-col items-end gap-1">
 <StatusPill status={a.status === "Approved" ? "approved" : a.status === "Rejected" ? "rejected" : "pending"} />
 {a.status === "Pending" && (
 <button onClick={() => withdraw(a)} className="text-[11px] font-semibold text-rose-ink hover:underline">
 Withdraw
 </button>
 )}
 </div>
 </li>
 ))}
 </ul>
 </Card>
 </div>

 {/* Data safety */}
 <Card className="mt-8 flex flex-col items-start gap-4 border-ink-100 dark:border-white/10 bg-gradient-to-r from-ink-50 to-white dark:from-[#000000] dark:to-[#000000] p-6 sm:flex-row sm:items-center">
 <IconTile icon="shield" tone="blue" size="lg" />
 <div className="flex-1">
 <p className="text-[14.5px] font-bold text-ink-900 dark:text-white ">Your data is protected by consent</p>
 <p className="mt-0.5 text-[13px] text-ink-500 dark:text-ink-400 ">
 Every data transfer requires your approval. Review and revoke access anytime from Data Transfer.
 </p>
 </div>
 <Link to="/dashboard/audit-log">
 <Btn variant="outline" iconRight="arrow">Manage Data</Btn>
 </Link>
 </Card>
 </div>
 );
}
