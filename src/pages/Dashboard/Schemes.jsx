import { useMemo, useState } from "react";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile } from "../../components/ui.jsx";
import { schemeTabs, schemes } from "../../data.js";
import { useAuth } from "../../context/BCAuthContext.jsx";

const allSchemes = Object.entries(schemes).flatMap(([cat, list]) =>
 list.map((s) => ({ ...s, cat: schemeTabs.find((t) => t.key === cat)?.label || cat }))
);

export default function Schemes() {
 const { user, backend, notify, confirmAction } = useAuth();
 const [q, setQ] = useState("");
 const [cat, setCat] = useState("all");
 const [applying, setApplying] = useState(null);

 const cats = [
 { key: "all", label: "All categories" },
 ...schemeTabs.map((t) => ({ key: t.key, label: t.label })),
 ];

 const DEPT_FALLBACK = {
 green: "Ministry of Health and Family Welfare",
 blue: "Ministry of Electronics & IT",
 amber: "Ministry of Finance",
 violet: "Ministry of Social Justice and Empowerment",
 };

 const apply = async (s) => {
 const ok = await confirmAction(
 `Apply for "${s.title}"? Your verified profile data will be attached to this application.`
 );
 if (!ok) return;
 setApplying(s.key);
 try {
 const app = await backend.createApplication(user.uid, {
 schemeId: s.key,
 schemeName: s.title,
 department: DEPT_FALLBACK[s.tint] || "Ministry of Electronics & IT",
 });
 notify(`Application submitted — ID ${app.appId}.`);
 } catch {
 notify("Could not submit application. Please try again.", "red");
 } finally {
 setApplying(null);
 }
 };

 const list = useMemo(() => {
 let l = cat === "all" ? allSchemes : allSchemes.filter((s) => schemeTabs.find((t) => t.key === cat)?.label === s.cat);
 if (q.trim()) {
 const s = q.toLowerCase();
 l = l.filter((x) => x.title.toLowerCase().includes(s) || x.desc.toLowerCase().includes(s));
 }
 return l;
 }, [q, cat]);

 return (
 <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="Schemes & Services"
 title="Schemes & Services"
 sub="Browse every central government scheme you can apply for with your verified profile."
 right={<Btn variant="outline" icon="filter">Filter</Btn>}
 />

 <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3.5 py-3 text-ink-400 dark:text-ink-500 focus-within:border-ink-400 dark:focus-within:border-white/40 :border-white/40 ">
 <Icon name="search" className="h-4 w-4 shrink-0" />
 <input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Search by scheme name, ministry or keyword..."
 className="w-full bg-transparent text-[13.5px] text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:text-ink-500 "
 aria-label="Search schemes"
 />
 {q && (
 <button onClick={() => setQ("")} aria-label="Clear" className="text-ink-300 hover:text-ink-600 dark:text-ink-400 ">
 <Icon name="x" className="h-4 w-4" />
 </button>
 )}
 </div>

 <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
 {cats.map((c) => {
 const active = cat === c.key;
 return (
 <button
 key={c.key}
 onClick={() => setCat(c.key)}
 aria-pressed={active}
 className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
 active ? "border-ink-800 bg-ink-800 text-white" : "border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 "
 }`}
 >
 {c.label}
 </button>
 );
 })}
 </div>

 <p className="nums mt-5 text-[12.5px] text-ink-400 dark:text-ink-500 ">
 Showing {list.length} scheme{list.length === 1 ? "" : "s"}
 </p>

 <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {list.map((s) => (
 <Card key={s.key + s.cat} hover className="group flex flex-col p-5">
 <div className="flex items-start justify-between">
 <IconTile icon={s.icon} tone={s.tint} size="lg" />
 <span className="rounded-full bg-ink-50 dark:bg-[#000000] px-2.5 py-1 text-[10.5px] font-bold text-ink-500 dark:text-ink-400 ring-1 ring-ink-100 dark:ring-white/10 ">
 {s.cat}
 </span>
 </div>
 <h3 className="mt-4 text-[15px] font-bold leading-snug text-ink-900 dark:text-white ">{s.title}</h3>
 <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400 ">{s.desc}</p>
 <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-3.5">
 <Btn
 variant={s.cta === "Apply Now" ? "primary" : "outline"}
 className="!py-2 !text-[12.5px]"
 disabled={applying === s.key}
 onClick={() => (s.cta === "Apply Now" ? apply(s) : notify(`"${s.title}" details will open in the scheme portal.`, "blue"))}
 >
 {applying === s.key ? "Applying…" : s.cta}
 </Btn>
 <button
 onClick={() => notify(`"${s.title}" saved to your bookmarks.`, "blue")}
 className="rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-ink-50 dark:hover:bg-white/10 hover:text-ink-600 dark:text-ink-400 "
 aria-label={`Bookmark ${s.title}`}
 >
 <Icon name="up" className="h-4 w-4" />
 </button>
 </div>
 </Card>
 ))}
 </div>

 {list.length === 0 && (
 <Card className="mt-3 flex flex-col items-center px-6 py-14 text-center">
 <IconTile icon="search" tone="blue" size="lg" />
 <p className="mt-3 text-[14px] font-bold text-ink-900 dark:text-white ">No schemes found</p>
 <p className="mt-1 text-[13px] text-ink-400 dark:text-ink-500 ">Try a different keyword or category.</p>
 </Card>
 )}
 </div>
 );
}
