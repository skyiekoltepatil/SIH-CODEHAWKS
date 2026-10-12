import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import backend from "../services/bharatBackend.js";

/**
 * BCAuthContext — integration bridge between the PRAAMAN-PORTAL auth system
 * (Firebase via AuthContext) and the Bharat Connect UI layer (Dashboard).
 *
 * It re-uses the logged-in user from the main AuthContext and adds the
 * notification toast + confirm-dialog API (notify / confirmAction) and the
 * unified `backend` service that the integrated Dashboard depends on.
 * Authentication itself stays owned by the main AuthContext — no parallel
 * session or conflicting auth state is created.
 */
const BCAuthCtx = createContext(null);

export function BCAuthProvider({ children }) {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const [toast, setToast] = useState(null); // { text, tone }
  const [confirmState, setConfirmState] = useState(null); // { message, onYes, onNo }

  const notify = useCallback((text, tone = "green") => {
    setToast({ text, tone, id: Date.now() });
  }, []);

  const confirmAction = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        onYes: () => {
          setConfirmState(null);
          resolve(true);
        },
        onNo: () => {
          setConfirmState(null);
          resolve(false);
        },
      });
    });
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <BCAuthCtx.Provider value={{ user, loading: false, backend, notify, confirmAction }}>
      {children}
      {/* ---------- Toast ---------- */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 animate-rise" role="status" aria-live="polite">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-[0_18px_40px_-12px_rgba(16,31,60,0.45)] ring-1 ${
              toast.tone === "red"
                ? "bg-rose-ink text-white ring-rose-line"
                : toast.tone === "blue"
                ? "bg-ink-800 text-white ring-ink-700"
                : "bg-verd-700 text-white ring-verd-600"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {toast.tone === "red" ? (
                <><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16.5h.01" /></>
              ) : toast.tone === "blue" ? (
                <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5h.01" /></>
              ) : (
                <><circle cx="12" cy="12" r="9" /><path d="m8.2 12.3 2.6 2.6 5-5.3" /></>
              )}
            </svg>
            <span className="text-[13.5px] font-semibold">{toast.text}</span>
          </div>
        </div>
      )}

      {/* ---------- Confirm dialog ---------- */}
      {confirmState && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label="Confirm action">
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={confirmState.onNo} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-rise">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 16.5h.01" /><path d="M10.3 4.1 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z" /></svg>
              </span>
              <div>
                <h3 className="text-[16px] font-bold text-ink-900">Please confirm</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{confirmState.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button onClick={confirmState.onNo} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Cancel
              </button>
              <button onClick={confirmState.onYes} className="rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700">
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </BCAuthCtx.Provider>
  );
}

export const useBCAuth = () => useContext(BCAuthCtx);

/* Alias so pages copied from Bharat Connect keep their original import. */
export const useAuth = useBCAuth;
