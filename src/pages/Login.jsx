import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import Icon from '../components/icons';
import { Btn } from '../components/ui';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErr("");
    setResetMessage("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setResetMessage("");
    setBusy(true);

    try {
      if (mode === "signup") {
        const userCredential = await register(form.email.trim().toLowerCase(), form.password);
        await updateProfile(userCredential.user, {
          displayName: form.name.trim(),
        });

        // Force a context refresh so the UI sees the new name immediately
        await auth.currentUser.reload();
        window.location.href = '/';
      } else {
        await login(form.email.trim().toLowerCase(), form.password);
        navigate('/');
      }
    } catch (ex) {
      if (
        ex.code === 'auth/invalid-credential' ||
        ex.code === 'auth/wrong-password' ||
        ex.code === 'auth/user-not-found'
      ) {
        setErr('Email or password is incorrect. Check the complete email address, or use Forgot Password.');
      } else if (ex.code === 'auth/firebase-app-check-token-is-invalid') {
        setErr('Security configuration is not valid yet. Refresh once, then ask the project owner to verify Firebase App Check.');
      } else {
        setErr(ex.message.replace('Firebase: ', ''));
      }
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!form.email.trim()) {
      setErr("Enter your email above first, then click reset.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, form.email.trim().toLowerCase());
      setResetMessage(`Password reset link sent to ${form.email.trim()}. Check your inbox.`);
      setErr("");
    } catch (ex) {
      setErr(ex.message.replace("Firebase: ", ""));
      setResetMessage("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-slate-900 dark:bg-white/10 lg:block">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="600" height="900" fill="#0f172a" />
          <circle cx="480" cy="140" r="110" fill="#1e293b" />
          <circle cx="480" cy="140" r="70" fill="#334155" />
          {[...Array(7)].map((_, i) => (
            <line key={i} x1={-50 + i * 110} y1="900" x2={160 + i * 110} y2="300" stroke="#1e293b" strokeWidth="1.5" />
          ))}
          <g opacity="0.6">
            <rect x="80" y="560" width="150" height="340" rx="4" fill="#1e293b" />
            <rect x="115" y="620" width="34" height="280" fill="#334155" />
            <rect x="172" y="620" width="34" height="280" fill="#334155" />
            <path d="M80 560h150v26H80z" fill="#334155" />
            <path d="M80 560a75 40 0 0 1 150 0z" fill="#475569" />
          </g>
          <rect x="0" y="884" width="600" height="4" fill="#FF9933" />
          <rect x="0" y="888" width="600" height="4" fill="#ffffff" opacity="0.9" />
          <rect x="0" y="892" width="600" height="4" fill="#138808" />
        </svg>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3" aria-label="Back to home">
            <span className="text-[15px] font-extrabold text-white">PRAAMAN PORTAL</span>
          </Link>
          <div>
            <h1 className="max-w-md font-display text-[38px] font-bold leading-tight text-white">
              One identity.<br />Every government service.
            </h1>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-slate-300">
              Sign in to apply for schemes, track applications and share verified data — with your consent, always.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Aadhaar e-KYC", "DPDP compliant", "AES-256 encrypted"].map((t) => (
                <span key={t} className="rounded-full bg-white dark:bg-[#000000] px-3 py-1.5 text-[12px] font-semibold text-slate-900 ring-1 ring-white/15">{t}</span>
              ))}
            </div>
          </div>
          <p className="text-[11.5px] text-slate-400 dark:text-slate-500 ">© 2026 PRAAMAN PORTAL · Government of India</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-[#000000] px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden">
            <Link to="/" className="mb-8 flex items-center gap-2.5">
              <span className="text-[15px] font-extrabold text-slate-900 dark:text-white ">PRAAMAN PORTAL</span>
            </Link>
          </div>

          <h2 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-white ">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-slate-500 dark:text-slate-400 ">
            {mode === "signin" ? "Sign in to access your dashboard." : "Register with your email to get started."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="bc-name" className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300 ">Full name</label>
                <input id="bc-name" value={form.name} onChange={set("name")} required placeholder="e.g. Bhushan Kolte"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/5 px-4 py-3 text-[14px] text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-white/40 focus:bg-white dark:bg-[#000000] " />
              </div>
            )}
            <div>
              <label htmlFor="bc-email" className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300 ">Email address</label>
              <input id="bc-email" type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/5 px-4 py-3 text-[14px] text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-white/40 focus:bg-white dark:bg-[#000000] " />
            </div>
            <div>
              <label htmlFor="bc-pass" className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300 ">Password</label>
              <div className="relative">
                <input id="bc-pass" type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} required minLength={6} placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/5 px-4 py-3 pr-11 text-[14px] text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-white/40 focus:bg-white dark:bg-[#000000] " />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 ">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {showPw ? (
                      <><path d="M3 3l7 7" /><path d="M10.6 5.1A9.8 9.8 0 0 1 21 12a15.4 15.4 0 0 1-2.7 3.4" /><path d="M6.6 6.6A15 15 0 0 0 3 12a9.8 9.8 0 0 0 12.4 5.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="m3 3 18 18" /></>
                    ) : (
                      <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {err && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700" role="alert">{err}</p>
            )}
            
            {resetMessage && (
              <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800" role="alert">{resetMessage}</p>
            )}

            <Btn type="submit" className="w-full !py-3" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Btn>
          </form>

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); setResetMessage(""); }} className="font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white ">
              {mode === "signin" ? "New here? Create account" : "Already registered? Sign in"}
            </button>
            {mode === "signin" && (
              <button onClick={forgot} className="font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 ">Forgot password?</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
