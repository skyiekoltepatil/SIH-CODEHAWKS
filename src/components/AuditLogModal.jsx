import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { metaFor, statusBadge, formatTs, TYPE_FILTERS, TYPE_META } from '../utils/auditMeta';
import './AuditLogModal.css';

/**
 * Modal that shows the user's full data access history (audit log) with
 * real-time updates. Opened from the "Audit-logged" header badge on the
 * Citizen Master Profile page.
 */
export default function AuditLogModal({ open, onClose }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!open || !user?.uid) return undefined;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'dataAccessHistory'),
      (snap) => {
        const data = [];
        snap.forEach((docSnap) => data.push({ id: docSnap.id, ...docSnap.data() }));
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        console.error('AuditLogModal listener error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [open, user]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const filtered =
    typeFilter === 'All' ? entries : entries.filter((e) => e.type === typeFilter);

  return (
    <div
      className="alm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Data Access History"
    >
      <div className="alm-modal">
        {/* Header */}
        <div className="alm-head">
          <div>
            <h3>
              <i className="fa-solid fa-clock-rotate-left"></i> Data Access History
            </h3>
            <p>
              Every consent, verification and upload — recorded with date &amp; time.{' '}
              {user?.email ? <span className="alm-user">({user.email})</span> : null}
            </p>
          </div>
          <button type="button" className="alm-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Filter chips */}
        <div className="alm-filters" role="group" aria-label="Filter by event type">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`alm-chip ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'All' ? 'All' : TYPE_META[t].label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="alm-body">
          {loading ? (
            <div className="alm-empty">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Loading audit log…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="alm-empty">
              <i className="fa-solid fa-folder-open"></i>
              <h4>{entries.length === 0 ? 'No audit events yet' : 'No matching events'}</h4>
              <p>
                {entries.length === 0
                  ? 'Grant a consent or verify your details and events will appear here.'
                  : 'Try a different filter.'}
              </p>
            </div>
          ) : (
            filtered.map((e) => {
              const meta = metaFor(e.type);
              const expanded = expandedId === e.id;
              return (
                <button
                  type="button"
                  key={e.id}
                  className={`alm-entry ${expanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedId(expanded ? null : e.id)}
                >
                  <span className={`alm-entry-dot ${meta.badge}`}>
                    <i className={`fa-solid ${meta.rowIcon}`}></i>
                  </span>
                  <span className="alm-entry-main">
                    <span className="alm-entry-top">
                      <strong>{e.department || 'System'}</strong>
                      <span className={`alm-badge ${meta.badge}`}>{meta.label}</span>
                    </span>
                    <span className="alm-entry-time">
                      <i className="fa-regular fa-clock"></i> {formatTs(e.createdAt)}
                    </span>
                    {e.purpose && <span className="alm-entry-purpose">{e.purpose}</span>}

                    {expanded && (
                      <span className="alm-entry-details">
                        {e.requested && (
                          <span className="alm-row">
                            <span className="alm-key">Data</span>
                            <span className="alm-val">{e.requested}</span>
                          </span>
                        )}
                        {e.status && (
                          <span className="alm-row">
                            <span className="alm-key">Status</span>
                            <span className={`alm-badge ${statusBadge(e.status)}`}>{e.status}</span>
                          </span>
                        )}
                        {e.duration && (
                          <span className="alm-row">
                            <span className="alm-key">Duration</span>
                            <span className="alm-val">{e.duration}</span>
                          </span>
                        )}
                        <span className="alm-row">
                          <span className="alm-key">Event ID</span>
                          <span className="alm-val alm-mono">{e.id}</span>
                        </span>
                        <span className="alm-row">
                          <span className="alm-key">Raw</span>
                          <pre className="alm-json">{JSON.stringify(e, null, 2)}</pre>
                        </span>
                      </span>
                    )}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${expanded ? 'up' : 'down'} alm-caret`}
                  ></i>
                </button>
              );
            })
          )}
        </div>

        <div className="alm-foot">
          <span>
            {entries.length} event{entries.length === 1 ? '' : 's'} · live
          </span>
          <button
            type="button"
            className="alm-viewall"
            onClick={() => {
              onClose();
              navigate('/dashboard/audit-log');
            }}
          >
            Open full page <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
