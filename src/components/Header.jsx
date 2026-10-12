import { Link } from "react-router-dom";
import Icon from "./icons.jsx";
import { FontControls } from "./ui.jsx";
import userPhoto from "../assets/user.jpg";

import praamanIcon from "../assets/Praamanprotallogo.svg";
import logoTextLight from "../assets/logo-text-light.png";
import logoTextDark from "../assets/logo-text-dark.png";

export function Emblem({ size = 40 }) {
  return (
    <img
      src={praamanIcon}
      alt="Praaman Portal Emblem"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className="shrink-0"
    />
  );
}

export function Wordmark({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Praaman Portal home">
      <Emblem size={compact ? 36 : 42} />
      <div className="flex items-center">
        <img src={logoTextLight} alt="PRAAMAN PORTAL" className="h-[28px] w-auto object-contain dark:hidden" />
        <img src={logoTextDark} alt="PRAAMAN PORTAL" className="h-[28px] w-auto object-contain hidden dark:block" />
      </div>
    </Link>
  );
}

export function TricolorBar({ className = "" }) {
 return (
 <span className={`h-[3px] w-full ${className}`} aria-hidden="true">
 <span className="block h-full w-full" style={{ background: "linear-gradient(to right, #FF9933 33%, #ffffff 33% 66%, #138808 66%)" }} />
 </span>
 );
}

export function Avatar({ src, initials = "BK", size = 36, ring = true }) {
  if (src) {
    return (
      <img
        src={src}
        alt="User Avatar"
        className={`flex shrink-0 object-cover rounded-full ${ring ? "ring-2 ring-white shadow-sm" : ""}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-ink-800 font-bold text-white ${ring ? "ring-2 ring-white shadow-sm" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function Header() {
 return (
 <header className="sticky top-0 z-40 border-b border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] backdrop-blur-md">
 <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-6 lg:px-10">
 <Wordmark />
 <div className="ml-auto hidden min-w-0 flex-1 max-w-xl items-center gap-2.5 rounded-xl border border-ink-200 dark:border-white/20 bg-ink-50/60 dark:bg-white/5 px-3.5 py-2.5 text-ink-400 dark:text-ink-500 transition-colors focus-within:border-ink-400 dark:focus-within:border-white/40 :border-white/40 focus-within:bg-white dark:bg-[#000000] md:flex">
 <Icon name="search" className="h-4 w-4 shrink-0" />
 <input
 className="w-full bg-transparent text-[13.5px] text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:text-ink-500 "
 placeholder="Search schemes, services or information..."
 aria-label="Search"
 />
 <kbd className="hidden rounded-md border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-400 dark:text-ink-500 lg:block">⌘K</kbd>
 </div>
        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          <div className="hidden sm:block">
            <FontControls />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3 py-2 text-[13px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 " aria-label="Change language">
            <Icon name="globe" className="h-4 w-4 text-ink-400 dark:text-ink-500 " />
            English
            <Icon name="down" className="h-3.5 w-3.5 text-ink-400 dark:text-ink-500 " />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 rounded-[14px] border border-[#d2dceb] dark:border-white/20 bg-white dark:bg-[#000000] py-1.5 pl-1.5 pr-3 hover:bg-ink-50 dark:hover:bg-white/10 shadow-sm" aria-label="Open dashboard">
            <Avatar src={userPhoto} size={36} ring={false} />
            <span className="text-[14px] font-semibold text-[#1f3d73] dark:text-ink-200 pr-1">Bhushan K.</span>
          </Link>
        </div>
 </div>
 <TricolorBar />
 </header>
 );
}
