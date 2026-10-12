import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "./icons.jsx";

/* ─── Accessibility button definitions (SVG-based, no Font Awesome) ─── */
const BUTTONS = [
 { id: "bigger-text", label: "Bigger Text", icon: "bigT" },
 { id: "smaller-text", label: "Smaller Text", icon: "smallT" },
 { id: "text-spacing", label: "Text Spacing", icon: "spacing" },
 { id: "line-height", label: "Line Height", icon: "lineH" },
 { id: "dyslexia", label: "Dyslexia Friendly", icon: "dyslexia" },
 { id: "adhd", label: "ADHD Focus", icon: "adhd" },
 { id: "saturation", label: "Saturation", icon: "saturation" },
 { id: "invert", label: "Invert Colors", icon: "invert" },
 { id: "links", label: "Highlight Links", icon: "links" },
 { id: "tts", label: "Text To Speech", icon: "tts" },
 { id: "cursor", label: "Big Cursor", icon: "cursor" },
 { id: "pause", label: "Pause Animations", icon: "pause" },
 { id: "hide-images", label: "Hide Images", icon: "hideImg" },
];

/* ─── Mini icon set for the panel ─── */
function A11yIcon({ name, className = "w-6 h-6" }) {
 const icons = {
 bigT: (
 <svg viewBox="0 0 24 24" fill="none" className={className}>
 <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor">A</text>
 <text x="14" y="18" fontSize="11" fontWeight="bold" fill="currentColor">+</text>
 </svg>
 ),
 smallT: (
 <svg viewBox="0 0 24 24" fill="none" className={className}>
 <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor">A</text>
 <text x="14" y="18" fontSize="11" fontWeight="bold" fill="currentColor">−</text>
 </svg>
 ),
 spacing: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
 <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" />
 </svg>
 ),
 lineH: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
 <path d="M12 4v16M12 4l-3 3M12 4l3 3M12 20l-3-3M12 20l3-3" />
 </svg>
 ),
 dyslexia: (
 <svg viewBox="0 0 24 24" fill="none" className={className}>
 <text x="6" y="18" fontSize="18" fontWeight="bold" fontFamily="serif" fill="currentColor">Dy</text>
 </svg>
 ),
 adhd: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
 <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
 </svg>
 ),
 saturation: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
 <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
 </svg>
 ),
 invert: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
 <circle cx="12" cy="12" r="9" />
 <path d="M12 3v18" />
 <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" />
 </svg>
 ),
 links: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
 <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
 <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
 </svg>
 ),
 tts: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
 <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
 <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
 <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
 </svg>
 ),
 cursor: (
 <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
 <path d="M6 3L6 19L10 15L14 21L16 20L12 14L18 14Z" />
 </svg>
 ),
 pause: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
 <circle cx="12" cy="12" r="9" />
 <line x1="10" y1="8" x2="10" y2="16" />
 <line x1="14" y1="8" x2="14" y2="16" />
 </svg>
 ),
 hideImg: (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
 <rect x="3" y="3" width="18" height="18" rx="2" />
 <circle cx="8.5" cy="8.5" r="1.5" />
 <path d="M21 15l-5-5L5 21" />
 <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2.5" />
 </svg>
 ),
 };
 return icons[name] || <Icon name="settings" className={className} />;
}

export default function AccessibilityPanel({ isOpen, onClose }) {
 const [settings, setSettings] = useState(() => {
 try {
 const saved = localStorage.getItem("bc-a11ySettings");
 return saved ? JSON.parse(saved) : {};
 } catch {
 return {};
 }
 });

 /* ─── Apply saved settings on mount ─── */
 useEffect(() => {
 Object.entries(settings).forEach(([key, active]) => {
 if (active) {
 document.body.classList.add(`a11y-${key}`);
 document.documentElement.classList.add(`a11y-${key}`);
 }
 });
 }, []);

 /* ─── TTS: hover-to-read ─── */
 useEffect(() => {
 if (!settings.tts) {
 window.speechSynthesis?.cancel();
 return;
 }
 let ttsTimeout;
 let lastEl = null;
 const handler = (e) => {
 if (e.target.closest(".a11y-panel") || e.target.closest(".a11y-overlay")) return;
 if (e.target === lastEl) return;
 lastEl = e.target;
 clearTimeout(ttsTimeout);
 ttsTimeout = setTimeout(() => {
 const text = e.target.innerText || e.target.textContent;
 if (text?.trim() && !["BODY", "HTML", "MAIN", "NAV"].includes(e.target.tagName)) {
 window.speechSynthesis?.cancel();
 const u = new SpeechSynthesisUtterance(text.trim());
 const voices = window.speechSynthesis?.getVoices();
 if (voices?.length) u.voice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
 window._ttsU = u;
 u.onerror = (err) => console.error("TTS Error:", err);
 window.speechSynthesis?.speak(u);
 }
 }, 500);
 };
 document.addEventListener("mouseover", handler, true);
 return () => {
 document.removeEventListener("mouseover", handler, true);
 clearTimeout(ttsTimeout);
 window.speechSynthesis?.cancel();
 };
 }, [settings.tts]);

 /* ─── ADHD focus band ─── */
 useEffect(() => {
 if (!settings.adhd) return;
 const handler = (e) => document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
 document.addEventListener("mousemove", handler);
 return () => {
 document.removeEventListener("mousemove", handler);
 document.documentElement.style.removeProperty("--mouse-y");
 };
 }, [settings.adhd]);

 const toggle = (id) => {
 setSettings((prev) => {
 const isActive = !prev[id];
 if (isActive) {
 document.body.classList.add(`a11y-${id}`);
 document.documentElement.classList.add(`a11y-${id}`);
 if (id === "tts" && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 const unlock = new SpeechSynthesisUtterance(" ");
 unlock.volume = 0;
 window.speechSynthesis.speak(unlock);
 }
 } else {
 document.body.classList.remove(`a11y-${id}`);
 document.documentElement.classList.remove(`a11y-${id}`);
 if (id === "tts") window.speechSynthesis?.cancel();
 }
 const next = { ...prev, [id]: isActive };
 localStorage.setItem("bc-a11ySettings", JSON.stringify(next));
 return next;
 });
 };

 const resetAll = () => {
 setSettings({});
 localStorage.removeItem("bc-a11ySettings");
 document.body.className = document.body.className.replace(/\ba11y-\S+/g, "").trim();
 document.documentElement.className = document.documentElement.className.replace(/\ba11y-\S+/g, "").trim();
 window.speechSynthesis?.cancel();
 };

 return (
 <>
 {/* Inline critical CSS (always rendered to keep a11y classes active) */}
 <style>{`
 .a11y-overlay {
 position: fixed; inset: 0;
 background: rgba(16, 31, 60, 0.35);
 backdrop-filter: blur(2px);
 z-index: 1000;
 animation: a11y-fadeIn 0.2s ease;
 }
 .a11y-panel {
 position: fixed; top: 0; right: 0; bottom: 0;
 width: 380px; max-width: 100vw;
 background: #fff;
 z-index: 1001;
 display: flex; flex-direction: column;
 box-shadow: -6px 0 24px rgba(16, 31, 60, 0.15);
 animation: a11y-slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
 }
 @keyframes a11y-slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
 @keyframes a11y-fadeIn { from { opacity: 0; } to { opacity: 1; } }

 .a11y-panel-header {
 background: linear-gradient(135deg, #5b2dbf, #7c3aed);
 color: white;
 padding: 16px 20px;
 display: flex; justify-content: space-between; align-items: center;
 flex-shrink: 0;
 }
 .a11y-panel-body {
 flex: 1; overflow-y: auto; padding: 20px;
 }
 .a11y-grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 12px;
 }
 .a11y-tile {
 background: #f5f7fb; border: 2px solid transparent; border-radius: 14px;
 padding: 16px 8px;
 display: flex; flex-direction: column; align-items: center; justify-content: center;
 gap: 10px; cursor: pointer;
 transition: all 0.2s; color: #1f3d73;
 font-size: 11.5px; font-weight: 600; text-align: center; line-height: 1.25;
 }
 .a11y-tile:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,31,60,0.1); background: #e9edf5; }
 .a11y-tile-active { border-color: #7c3aed; background: #f2f0fc; color: #5b2dbf; }
 .a11y-tile-active:hover { background: #e8e4f8; }

 .a11y-panel-footer {
 padding: 14px 20px; border-top: 1px solid #e9edf5; flex-shrink: 0;
 }
 .a11y-reset {
 background: #f5f7fb; border: none; border-radius: 10px;
 padding: 10px 16px; font-size: 13px; font-weight: 600;
 color: #33548f; cursor: pointer;
 display: flex; align-items: center; gap: 8px; transition: background 0.2s;
 }
 .a11y-reset:hover { background: #e9edf5; }

 /* ── Accessibility CSS classes ── */
 html.a11y-bigger-text { font-size: 115% !important; }
 html.a11y-smaller-text { font-size: 85% !important; }
 body.a11y-text-spacing { letter-spacing: 1px !important; word-spacing: 2px !important; }
 body.a11y-line-height { line-height: 1.8 !important; }
 body.a11y-dyslexia * { font-family: "OpenDyslexic", "Comic Sans MS", sans-serif !important; }
 .dark .a11y-overlay { background: rgba(0, 0, 0, 0.6); }
 .dark .a11y-panel { background: #000000; box-shadow: -6px 0 24px rgba(0, 0, 0, 0.5); }
 .dark .a11y-panel-header { background: linear-gradient(135deg, #4c1d95, #6d28d9); }
 .dark .a11y-tile { background: rgba(255, 255, 255, 0.05); color: #cbd5e1; border-color: transparent; }
 .dark .a11y-tile:hover { background: rgba(255, 255, 255, 0.1); }
 .dark .a11y-tile-active { border-color: #7c3aed; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; }
 .dark .a11y-panel-footer { border-color: rgba(255,255,255,0.1); background: #000000; }
 .dark .a11y-reset { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
 .dark .a11y-reset:hover { background: rgba(255, 255, 255, 0.1); color: #f8fafc; }
 body.a11y-invert #root { filter: invert(1) hue-rotate(180deg); }
 body.a11y-invert img { filter: invert(1) hue-rotate(180deg); }
 body.a11y-saturation #root { filter: saturate(200%); }
 body.a11y-links a, body.a11y-links button { background-color: #ff0 !important; color: #000 !important; text-decoration: underline !important; font-weight: bold !important; }
 body.a11y-tts *:hover { outline: 2px solid #7c3aed !important; outline-offset: 2px; cursor: crosshair !important; }
 body.a11y-cursor, body.a11y-cursor * {
 cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 32 32'%3E%3Cpath d='M6 3 L6 27 L13 20 L18 29 L21 27 L16 18 L25 18 Z' fill='black' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 9 5, auto !important;
 }
 body.a11y-pause * { animation-duration: 0s !important; animation-play-state: paused !important; transition-duration: 0s !important; }
 body.a11y-pause .a11y-panel, body.a11y-pause .a11y-panel * { animation-duration: initial !important; transition-duration: initial !important; }
 body.a11y-hide-images img { visibility: hidden !important; }

 /* ADHD focus reading mask */
 body.a11y-adhd::before {
 content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
 pointer-events: none; z-index: 9999;
 background:
 linear-gradient(
 rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) calc(var(--mouse-y, 50vh) - 50px),
 transparent calc(var(--mouse-y, 50vh) - 50px), transparent calc(var(--mouse-y, 50vh) + 50px),
 rgba(0,0,0,0.5) calc(var(--mouse-y, 50vh) + 50px), rgba(0,0,0,0.5) 100%
 );
 }

 @media (max-width: 420px) {
 .a11y-panel { width: 100vw; }
 .a11y-grid { grid-template-columns: repeat(2, 1fr); }
 }

 @media (prefers-reduced-motion: reduce) {
 .a11y-panel, .a11y-overlay { animation: none; }
 }
 `}</style>
 
 {isOpen && createPortal(
 <>
 {/* Overlay */}
 <div className="a11y-overlay" onClick={onClose} />

 {/* Slide-in panel */}
 <div className="a11y-panel" role="dialog" aria-modal="true" aria-label="Accessibility Options">
 {/* Header */}
 <div className="a11y-panel-header">
 <div className="flex items-center gap-2.5">
 <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="10" />
 <circle cx="12" cy="7" r="1.5" fill="white" stroke="none" />
 <path d="M8 11h8M10 11v7M14 11v7" />
 </svg>
 <h3 className="text-[15px] font-bold">Accessibility Options</h3>
 </div>
 <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white dark:bg-[#000000] hover:text-white" aria-label="Close accessibility panel">
 <Icon name="x" className="h-5 w-5" />
 </button>
 </div>

 {/* Grid of buttons */}
 <div className="a11y-panel-body">
 <div className="a11y-grid">
 {BUTTONS.map((btn) => (
 <button
 key={btn.id}
 className={`a11y-tile ${settings[btn.id] ? "a11y-tile-active" : ""}`}
 onClick={() => toggle(btn.id)}
 aria-pressed={!!settings[btn.id]}
 aria-label={btn.label}
 >
 <A11yIcon name={btn.icon} className="h-6 w-6" />
 <span>{btn.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Footer */}
 <div className="a11y-panel-footer">
 <button className="a11y-reset" onClick={resetAll}>
 <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="1 4 1 10 7 10" />
 <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
 </svg>
 Reset All Settings
 </button>
 </div>
 </div>
 </>,
 document.body
 )}
 </>
 );
}
