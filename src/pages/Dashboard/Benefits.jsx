import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile, StatusPill } from "../../components/ui.jsx";
import { benefits } from "../../data.js";

export default function Benefits() {
 return (
 <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <PageHead
 crumb="My Benefits"
 title="My Benefits"
 sub="Everything you are entitled to, active and upcoming, in one view."
 right={<Btn variant="outline" icon="doc">Download Summary</Btn>}
 />

 <div className="grid gap-4 sm:grid-cols-3">
 {[
 { v: "4", l: "Active benefits", i: "check", t: "green" },
 { v: "₹5,06,000", l: "Annual entitlement value", i: "rupee", t: "blue" },
 { v: "₹8,500", l: "Saved this year on fees", i: "piggy", t: "violet" },
 ].map((s) => (
 <Card key={s.l} className="flex items-center gap-4 p-5">
 <IconTile icon={s.i} tone={s.t} size="lg" />
 <div>
 <p className="nums text-[22px] font-bold leading-none text-ink-900 dark:text-white ">{s.v}</p>
 <p className="mt-1.5 text-[12.5px] text-ink-400 dark:text-ink-500 ">{s.l}</p>
 </div>
 </Card>
 ))}
 </div>

 <Card className="mt-6 p-6">
 <div className="flex items-center justify-between">
 <h2 className="text-[16px] font-bold text-ink-900 dark:text-white ">Active Benefits</h2>
 <span className="nums rounded-full bg-verd-50 px-3 py-1 text-[12px] font-bold text-verd-700">{benefits.length} active</span>
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 {benefits.map((b) => (
 <div key={b.key} className="group rounded-2xl border border-ink-100 dark:border-white/10 p-5 transition-all hover:border-ink-200 dark:border-white/20 hover:shadow-[0_10px_28px_-14px_rgba(16,31,60,0.25)]">
 <div className="flex items-start gap-4">
 <IconTile icon={b.icon} tone={b.tint} size="lg" />
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-[14.5px] font-bold text-ink-900 dark:text-white ">{b.title}</p>
 <StatusPill status="approved" />
 </div>
 <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400 ">{b.sub}</p>
 <p className="nums mt-2 flex items-center gap-1.5 text-[12px] text-ink-400 dark:text-ink-500 ">
 <Icon name="clock" className="h-3.5 w-3.5" /> {b.valid}
 </p>
 </div>
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-3.5">
 <span className="rounded-full bg-ink-50 dark:bg-[#000000] px-2.5 py-1 text-[11px] font-bold text-ink-500 dark:text-ink-400 ring-1 ring-ink-100 dark:ring-white/10 ">{b.scheme}</span>
 <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:text-white ">
 View details <Icon name="chevron" className="h-3.5 w-3.5" />
 </a>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}
