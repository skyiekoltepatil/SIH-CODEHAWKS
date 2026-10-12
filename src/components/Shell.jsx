import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "./icons.jsx";
import { Avatar, Emblem } from "./Header.jsx";
import { Btn, FontControls } from "./ui.jsx";
import { useAuth } from "../context/BCAuthContext.jsx";
import { isDemoMode } from "../services/bharatBackend.js";
import AccessibilityPanel from "./AccessibilityPanel.jsx";
import { AnimatedThemeToggler } from "./AnimatedThemeToggler.jsx";

const nav = [
 { to: "/dashboard", label: "Dashboard", icon: "home" },
 { to: "/dashboard/profile", label: "My Profile", icon: "user" },
 { to: "/dashboard/applications", label: "My Applications", icon: "doc" },
 { to: "/dashboard/data-transfer", label: "Data Transfer", icon: "swap" },
 { to: "/dashboard/schemes", label: "Schemes & Services", icon: "grid" },
 { to: "/dashboard/benefits", label: "My Benefits", icon: "brief" },
 { to: "/dashboard/notifications", label: "Notifications", icon: "bell", badge: true },
 { to: "/dashboard/audit-log", label: "Audit Logs", icon: "shield" },
 { to: "/dashboard/faqs", label: "Help & Support", icon: "help" },
];

function NavItems({ onNavigate }) {
 const { user, backend } = useAuth();
 const [unread, setUnread] = useState(0);

 useEffect(() => {
 if (!user) return;
 const unsub = backend.subscribeEvents(user.uid, (rows) =>
 setUnread(rows.filter((r) => !r.read).length)
 );
 return unsub;
 }, [user, backend]);

 return (
 <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4 overflow-y-auto min-h-0" aria-label="Primary">
 {nav.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.to === "/dashboard"}
 onClick={onNavigate}
 className={({ isActive }) =>
 `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
 isActive ? "bg-ink-800 text-white shadow-sm " : "text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 hover:text-ink-900 dark:text-white "
 }`
 }
 >
 {({ isActive }) => (
 <>
 <Icon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : "text-ink-400 dark:text-ink-500 group-hover:text-ink-600 dark:text-ink-400 "}`} />
 <span className="truncate">{item.label}</span>
 {item.badge && unread > 0 && (
 <span className="nums ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-verd-600 px-1.5 text-[11px] font-bold text-white">
 {unread}
 </span>
 )}
 </>
 )}
 </NavLink>
 ))}
 </nav>
 );
}

function HelpCard() {
 const navigate = useNavigate();
 return (
 <div className="mx-3 mb-4 overflow-hidden rounded-2xl bg-gradient-to-b from-ink-800 to-ink-900 dark:from-[#000000] dark:to-[#000000] p-4 text-white ring-1 ring-inset ring-white/10 ">
 <p className="text-[13px] font-bold">Need Help?</p>
 <p className="mt-1 text-[12px] leading-relaxed text-ink-300 ">
 Talk to our support team for guidance.
 </p>
 <a href="tel:1800110000" className="nums mt-2.5 flex items-center gap-2 text-[13px] font-bold hover:text-ink-200">
 <Icon name="phone" className="h-3.5 w-3.5 text-ink-300" /> 1800-11-0000
 </a>
 <p className="mt-0.5 text-[10.5px] text-ink-400 dark:text-ink-500 ">Mon–Sat, 9:00 AM – 6:00 PM</p>
 <Btn variant="accent" className="mt-3 flex !w-full !py-2 !text-[12.5px]" icon="send" onClick={() => navigate("/dashboard/faqs")}>
 Talk to Support
 </Btn>
 </div>
 );
}

function SidebarInner({ onNavigate }) {
 const { user, backend, notify, confirmAction } = useAuth();
 const navigate = useNavigate();

 const handleLogout = async () => {
 const ok = await confirmAction("Sign out of Praaman Portal?");
 if (!ok) return;
 await backend.signOut();
 notify("Signed out. See you soon!", "blue");
 navigate("/");
 };

 const name = user?.name || "Citizen";
 const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

 return (
 <>

 <NavItems onNavigate={onNavigate} />
 <HelpCard />
 <div className="border-t border-ink-100 dark:border-white/10 px-4 py-3">
 <div className="flex items-center gap-2.5">
 <Avatar initials={initials} size={32} ring={false} />
 <div className="min-w-0 flex-1 leading-tight">
 <p className="truncate text-[12.5px] font-bold text-ink-900 dark:text-white ">{name}</p>
 <p className="truncate text-[11px] text-ink-400 dark:text-ink-500 ">{isDemoMode ? "Demo session" : user?.email}</p>
 </div>
 <button onClick={handleLogout} className="rounded-lg p-1.5 text-ink-400 dark:text-ink-500 hover:bg-ink-50 dark:hover:bg-white/10 hover:text-ink-700 dark:text-ink-300 " aria-label="Log out" title="Log out">
 <Icon name="logout" className="h-4 w-4" />
 </button>
 </div>
 </div>
 </>
 );
}

export default function Shell() {
 const [open, setOpen] = useState(false);
 const [a11yOpen, setA11yOpen] = useState(false);
 const location = useLocation();
 const { backend, user, notify, confirmAction } = useAuth();
 const [unread, setUnread] = useState(0);

 useEffect(() => {
 setOpen(false);
 window.scrollTo({ top: 0 });
 }, [location.pathname]);

 useEffect(() => {
 if (!user) return;
 const unsub = backend.subscribeEvents(user.uid, (rows) =>
 setUnread(rows.filter((r) => !r.read).length)
 );
 return unsub;
 }, [user, backend]);

 const markAllRead = async () => {
 if (!user || unread === 0) return;
 await backend.markAllEventsRead(user.uid);
 notify("All notifications marked as read.", "blue");
 };

 const name = user?.name || "Citizen";
 const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

 return (
 <div className="flex flex-row w-full min-h-screen bg-ink-50 dark:bg-[#000000] ">
 {/* Desktop sidebar */}
 <aside className="sticky top-[80px] h-[calc(100vh-80px)] z-40 hidden w-[248px] shrink-0 flex-col border-r border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] lg:flex">
 <SidebarInner />
 </aside>

 {/* Mobile top bar */}
 <div className="sticky top-[80px] z-40 flex h-14 items-center gap-3 border-b border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] px-4 backdrop-blur-md lg:hidden">
 <button
 onClick={() => setOpen(true)}
 className="rounded-lg border border-ink-200 dark:border-white/20 p-2 text-ink-700 dark:text-ink-300 "
 aria-label="Open menu"
 >
 <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
 <path d="M4 7h16M4 12h16M4 17h16" />
 </svg>
 </button>
 <div className="flex items-center gap-2">
 <Emblem size={28} />
 <span className="text-[13.5px] font-extrabold text-ink-900 dark:text-white ">Praaman Portal</span>
 </div>
 <div className="ml-auto flex items-center gap-2">
 <AnimatedThemeToggler className="rounded-lg p-2 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 flex items-center justify-center" title="Toggle Theme">
 {(isDark) => isDark ? (
 <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="5" />
 <line x1="12" y1="1" x2="12" y2="3" />
 <line x1="12" y1="21" x2="12" y2="23" />
 <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
 <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
 <line x1="1" y1="12" x2="3" y2="12" />
 <line x1="21" y1="12" x2="23" y2="12" />
 <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
 <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
 </svg>
 ) : (
 <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
 </svg>
 )}
 </AnimatedThemeToggler>
 <button className="rounded-lg p-2 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 " aria-label="Accessibility" title="Accessibility" onClick={() => setA11yOpen(true)}>
 <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="10" />
 <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
 <path d="M8 11h8M10 11v7M14 11v7" />
 </svg>
 </button>
 <button className="relative rounded-lg p-2 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-white/10 " aria-label="Notifications" onClick={() => (window.location.hash = "#/notifications")}>
 <Icon name="bell" className="h-5 w-5" />
 {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-verd-600" />}
 </button>
 <Avatar initials={initials} size={30} ring={false} />
 </div>
 </div>

 {/* Mobile drawer */}
 {open && (
 <div className="fixed inset-0 z-50 lg:hidden">
 <div className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
 <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white dark:bg-[#000000] shadow-2xl animate-fade">
 <button
 onClick={() => setOpen(false)}
 className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-400 dark:text-ink-500 hover:bg-ink-50 dark:hover:bg-white/10 "
 aria-label="Close menu"
 >
 <Icon name="x" className="h-5 w-5" />
 </button>
 <SidebarInner onNavigate={() => setOpen(false)} />
 </aside>
 </div>
 )}

 {/* Main */}
 <main className="flex-1 min-w-0">
 {/* Desktop utility topbar removed as per request */}
 <Outlet />
 </main>

 {/* Accessibility Panel */}
 <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />
 </div>
 );
}
