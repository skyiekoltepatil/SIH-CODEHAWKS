import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const EVENT_META = {
  'consent-granted': {
    label: 'Consent Granted',
    icon: 'fa-circle-check',
    variant: 'audit-toast-green',
  },
  'consent-revoked': {
    label: 'Consent Revoked',
    icon: 'fa-ban',
    variant: 'audit-toast-red',
  },
  'profile-submitted': {
    label: 'Profile Submitted',
    icon: 'fa-id-badge',
    variant: 'audit-toast-blue',
  },
  'otp-verified': {
    label: 'OTP Verified',
    icon: 'fa-shield-halved',
    variant: 'audit-toast-teal',
  },
  'document-uploaded': {
    label: 'Document Uploaded',
    icon: 'fa-file-arrow-up',
    variant: 'audit-toast-violet',
  },
  'draft-saved': {
    label: 'Draft Saved',
    icon: 'fa-floppy-disk',
    variant: 'audit-toast-amber',
  },
};

const TOAST_LIFETIME_MS = 6000;

const metaFor = (type) => EVENT_META[type] || {
  label: 'Data Access Event',
  icon: 'fa-clock-rotate-left',
  variant: 'audit-toast-gray',
};

/**
 * Global listener that shows a toast whenever a new audit event is written to
 * the user's dataAccessHistory (e.g. a consent granted or revoked) — even while
 * the user is on a different page. Toasts are suppressed on the audit log page
 * itself, where the timeline highlights new entries inline.
 */
export default function AuditToast() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const initialLoadDoneRef = useRef(false);
  const timersRef = useRef(new Set());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      initialLoadDoneRef.current = false;
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'dataAccessHistory'),
      (snap) => {
        // The first snapshot replays the entire history — never toast those.
        if (!initialLoadDoneRef.current) {
          initialLoadDoneRef.current = true;
          return;
        }

        const added = [];
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') added.push(change.doc.id);
        });
        if (added.length === 0) return;

        setToasts((prev) => {
          const next = [...prev];
          added.forEach((id) => {
            if (next.some((t) => t.id === id)) return;
            next.push({ id, type: 'pending', department: '', status: '' });
          });
          return next;
        });

        // Hydrate the toast payloads from the snapshot
        const payloadFor = (id) => {
          const d = snap.docs.find((docSnap) => docSnap.id === id);
          return d
            ? {
                id: d.id,
                type: d.data().type,
                department: d.data().department || 'System',
                status: d.data().status || '',
              }
            : null;
        };

        added.forEach((id) => {
          const payload = payloadFor(id);
          if (!payload) return;
          setToasts((prev) => prev.map((t) => (t.id === id ? payload : t)));
          const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            dismiss(id);
          }, TOAST_LIFETIME_MS);
          timersRef.current.add(timer);
        });
      },
      (err) => console.error('AuditToast listener error:', err)
    );

    // Capture the timer set for cleanup (the ref itself is only mutated, never reassigned)
    const timers = timersRef.current;
    return () => {
      unsubscribe();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [user, dismiss]);

  // No toasts while logged out or while viewing the audit log page itself
  if (!user || location.pathname === '/dashboard/audit-log') return null;

  return (
    <div className="audit-toast-container" aria-live="polite">
      {toasts.map((t) => {
        const meta = metaFor(t.type);
        return (
          <button
            key={t.id}
            type="button"
            className={`audit-toast ${meta.variant}`}
            onClick={() => {
              dismiss(t.id);
              navigate('/dashboard/audit-log');
            }}
            title="View Data Access History"
          >
            <span className="audit-toast-icon">
              <i className={`fa-solid ${meta.icon}`}></i>
            </span>
            <span className="audit-toast-body">
              <strong>{meta.label}</strong>
              <span className="audit-toast-dept">
                {t.department}
                {t.status ? ` · ${t.status}` : ''}
              </span>
            </span>
            <span
              className="audit-toast-close"
              role="button"
              tabIndex={-1}
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </span>
          </button>
        );
      })}
    </div>
  );
}
