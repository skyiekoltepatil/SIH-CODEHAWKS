import { createContext, useContext, useEffect, useState } from "react";
import Icon from "./icons.jsx";

export const Tones = {
 blue: { soft: "bg-ink-50 dark:bg-[#000000] ", text: "text-ink-700 dark:text-ink-300 ", border: "border-ink-200 dark:border-white/20 ", solid: "bg-ink-600", fill: "#e9edf5", stroke: "#33548f" },
 green: { soft: "bg-verd-50 ", text: "text-verd-700 ", border: "border-verd-100 ", solid: "bg-verd-600", fill: "#edfaf3", stroke: "#0e8a4f" },
 amber: { soft: "bg-amber-soft ", text: "text-amber-ink ", border: "border-amber-line ", solid: "bg-amber-ink", fill: "#fdf6e7", stroke: "#8a6116" },
 red: { soft: "bg-rose-soft ", text: "text-rose-ink ", border: "border-rose-line ", solid: "bg-rose-ink", fill: "#fdefef", stroke: "#a03030" },
 violet: { soft: "bg-violet-soft ", text: "text-violet-ink ", border: "border-violet-line ", solid: "bg-violet-ink", fill: "#f2f0fc", stroke: "#5246b8" },
};

export const StatusPill = ({ status, className = "" }) => {
 const map = {
 approved: ["Approved", "text-verd-700 bg-verd-50 border-verd-100 "],
 active: ["Active", "text-verd-700 bg-verd-50 border-verd-100 "],
 completed: ["Completed", "text-ink-700 dark:text-ink-300 bg-ink-50 dark:bg-[#000000] border-ink-200 dark:border-white/20 "],
 pending: ["Pending", "text-amber-ink bg-amber-soft border-amber-line "],
 rejected: ["Rejected", "text-rose-ink bg-rose-soft border-rose-line "],
 progress: ["In Progress", "text-violet-ink bg-violet-soft border-violet-line "],
 verified: ["Verified", "text-verd-700 bg-verd-50 border-verd-100 "],
 unverified: ["Not linked", "text-ink-500 dark:text-ink-400 bg-ink-50 dark:bg-[#000000] border-ink-200 dark:border-white/20 "],
 };
 const [label, cls] = map[status] || map.unverified;
 const dot = {
 approved: "bg-verd-500", active: "bg-verd-500", completed: "bg-ink-500", pending: "bg-amber-ink",
 rejected: "bg-rose-ink", progress: "bg-violet-ink", verified: "bg-verd-500", unverified: "bg-ink-400",
 }[status] || "bg-ink-400";
 return (
 <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap ${cls} ${className}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
 {label}
 </span>
 );
};

export const IconTile = ({ icon, tone = "blue", size = "md", className = "" }) => {
 const t = Tones[tone] || Tones.blue;
 const s = {
 sm: "h-8 w-8 rounded-lg [&>svg]:w-4 [&>svg]:h-4",
 md: "h-10 w-10 rounded-xl [&>svg]:w-[18px] [&>svg]:h-[18px]",
 lg: "h-12 w-12 rounded-xl [&>svg]:w-6 [&>svg]:h-6",
 }[size];
 return (
 <span className={`inline-flex shrink-0 items-center justify-center ${s} ${t.soft} ${t.text} ${className}`}>
 <Icon name={icon} />
 </span>
 );
};

export const Btn = ({ children, variant = "primary", icon, iconRight, className = "", ...rest }) => {
 const styles = {
 primary: "bg-ink-800 text-white hover:bg-ink-700 shadow-sm",
 accent: "bg-verd-600 text-white hover:bg-verd-700 shadow-sm",
 outline: "border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] text-ink-800 dark:text-ink-200 hover:border-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 ",
 ghost: "text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 ",
 soft: "bg-ink-50 dark:bg-[#000000] text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-white/20 border border-transparent ",
 danger: "border border-rose-line bg-white dark:bg-[#000000] text-rose-ink hover:bg-rose-soft ",
 }[variant];
 return (
 <button
 className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${styles} ${className}`}
 {...rest}
 >
 {icon && <Icon name={icon} className="w-4 h-4" />}
 {children}
 {iconRight && <Icon name={iconRight} className="w-4 h-4" />}
 </button>
 );
};

export const Card = ({ children, className = "", hover = false, ...rest }) => (
 <div
 className={`rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] shadow-[0_1px_2px_rgba(16,31,60,0.04)] ${
 hover ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-14px_rgba(16,31,60,0.25)] hover:border-ink-200 dark:border-white/20 " : ""
 } ${className}`}
 {...rest}
 >
 {children}
 </div>
);

export const SectionHead = ({ title, sub, action, className = "" }) => (
 <div className={`flex items-end justify-between gap-4 ${className}`}>
 <div>
 <h2 className="text-[17px] font-bold tracking-tight text-ink-900 dark:text-white ">{title}</h2>
 {sub && <p className="mt-0.5 text-[13px] text-ink-400 dark:text-ink-500 ">{sub}</p>}
 </div>
 {action}
 </div>
);

export const LinkMore = ({ to = "#", children = "View All" }) => (
 <a href={to} className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-800 dark:text-ink-200 transition-colors group ">
 {children}
 <Icon name="chevron" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
 </a>
);

export const ProgressRing = ({ value, size = 120, stroke = 10, tone = "#1f3d73" }) => {
 const r = (size - stroke) / 2;
 const c = 2 * Math.PI * r;
 const [v, setV] = useState(0);
 useEffect(() => {
 const t = setTimeout(() => setV(value), 250);
 return () => clearTimeout(t);
 }, [value]);
 return (
 <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
 <svg width={size} height={size} className="-rotate-90">
 <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9edf5" strokeWidth={stroke} />
 <circle
 cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round"
 strokeDasharray={c} strokeDashoffset={c - (c * v) / 100}
 style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="nums text-[26px] font-bold leading-none text-ink-900 dark:text-white ">{value}%</span>
 <span className="mt-1 text-[11px] font-medium text-ink-400 dark:text-ink-500 ">complete</span>
 </div>
 </div>
 );
};

export const Field = ({ label, value, icon, className = "" }) => (
 <div className={`rounded-xl border border-ink-100 dark:border-white/10 bg-ink-50/50 dark:bg-white/5 px-4 py-3 ${className}`}>
 <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink-400 dark:text-ink-500 ">
 {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
 {label}
 </div>
 <div className="mt-1 truncate text-[14px] font-semibold text-ink-900 dark:text-white ">{value}</div>
 </div>
);

/* ---------- Accessibility: font scale ---------- */
const FontCtx = createContext(null);
export const FontProvider = ({ children }) => {
 const [scale, setScale] = useState(() => {
 const s = localStorage.getItem("bc-font-scale");
 return s ? Number(s) : 1;
 });
 useEffect(() => {
 document.documentElement.style.setProperty("--user-font-scale", `${Math.round(scale * 100)}%`);
 localStorage.setItem("bc-font-scale", String(scale));
 }, [scale]);
 return <FontCtx.Provider value={{ scale, setScale }}>{children}</FontCtx.Provider>;
};
export const useFontScale = () => useContext(FontCtx);

export const FontControls = () => {
 const { scale, setScale } = useFontScale();
 const steps = [0.875, 1, 1.125];
 const idx = steps.findIndex((s) => Math.abs(s - scale) < 0.01);
 const set = (i) => setScale(steps[Math.max(0, Math.min(steps.length - 1, i))]);
 return (
 <div className="flex items-center rounded-lg border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] p-0.5" role="group" aria-label="Text size">
 {[
 { i: 0, label: "A-", title: "Smaller text" },
 { i: 1, label: "A", title: "Normal text" },
 { i: 2, label: "A+", title: "Larger text" },
 ].map(({ i, label, title }) => (
 <button
 key={label}
 title={title}
 aria-label={title}
 aria-pressed={idx === i}
 onClick={() => set(i)}
 className={`h-7 min-w-7 rounded-md px-1 text-[12px] font-semibold transition-colors ${
 idx === i ? "bg-ink-800 text-white" : "text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 "
 } ${i === 2 ? "text-[14px]" : ""}`}
 >
 {label}
 </button>
 ))}
 </div>
 );
};
