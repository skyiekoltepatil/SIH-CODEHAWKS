import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  TYPE_FILTERS,
  metaFor,
  statusBadge,
  formatTs,
  eventTimeMs,
} from '../../utils/auditMeta';
import './AuditLog.css';

export default function AuditLog() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [recentIds, setRecentIds] = useState(() => new Set());
  const firstLoadDoneRef = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener: the timeline updates instantly when a consent is
    // granted/revoked or the profile is submitted — even from another tab.
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'dataAccessHistory'),
      (snap) => {
        setError(null);
        const data = [];
        snap.forEach((docSnap) => data.push({ id: docSnap.id, ...docSnap.data() }));
        // Order client-side (avoids a composite index requirement on server sort)
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
        setEntries(data);

        // Flash-highlight entries that arrive after the initial load
        if (firstLoadDoneRef.current) {
          const added = [];
          snap.docChanges().forEach((change) => {
            if (change.type === 'added') added.push(change.doc.id);
          });
          if (added.length > 0) {
            setRecentIds((prev) => new Set([...prev, ...added]));
            setTimeout(() => {
              setRecentIds((prev) => {
                const next = new Set(prev);
                added.forEach((id) => next.delete(id));
                return next;
              });
            }, 4000);
          }
        }
        firstLoadDoneRef.current = true;
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load data access history:', err);
        setError('Could not load your audit log. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const typeCounts = entries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const filtered = entries.filter((e) => {
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = [e.department, e.purpose, e.requested, e.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (fromDate || toDate) {
      const t = eventTimeMs(e);
      // Events without a timestamp cannot be placed in a date range
      if (t == null) return false;
      if (fromDate && t < new Date(`${fromDate}T00:00:00`).getTime()) return false;
      if (toDate && t > new Date(`${toDate}T23:59:59.999`).getTime()) return false;
    }
    return true;
  });

  const datesActive = Boolean(fromDate || toDate);

  const clearDateRange = () => {
    setFromDate('');
    setToDate('');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    const range = datesActive ? `${fromDate || 'start'}_to_${toDate || today}` : today;
    a.download = `data-access-history-${range}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="al-root">
      <div className="al-header">
        <div>
          <h1>
            <i className="fa-solid fa-clock-rotate-left"></i> Data Access History
          </h1>
          <p>
            A complete, immutable record of every consent you granted or revoked, every
            verification, upload and draft save — with date &amp; time.
          </p>
        </div>
        <div className="al-header-actions">
          <span className="al-live-badge" title="Updates in real time">
            <span className="al-live-dot"></span> Live
          </span>
          <button
            type="button"
            className="al-btn al-btn-outline"
            onClick={() => navigate('/dashboard/citizen-profile')}
          >
            <i className="fa-solid fa-id-badge"></i> Citizen Profile
          </button>
          <button
            type="button"
            className="al-btn al-btn-primary"
            onClick={exportJson}
            disabled={filtered.length === 0}
          >
            <i className="fa-solid fa-download"></i> Export JSON
          </button>
        </div>
      </div>

      {loading ? (
        <div className="al-card al-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Loading your audit log…</span>
        </div>
      ) : error ? (
        <div className="al-card al-error">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="al-stats">
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-blue">
                <i className="fa-solid fa-list-ul"></i>
              </div>
              <div>
                <div className="al-stat-value">{entries.length}</div>
                <div className="al-stat-label">Total Events</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-green">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['consent-granted'] || 0}</div>
                <div className="al-stat-label">Consents Granted</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-red">
                <i className="fa-solid fa-ban"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['consent-revoked'] || 0}</div>
                <div className="al-stat-label">Consents Revoked</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-amber">
                <i className="fa-solid fa-id-badge"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['profile-submitted'] || 0}</div>
                <div className="al-stat-label">Profile Submissions</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-teal">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['otp-verified'] || 0}</div>
                <div className="al-stat-label">OTP Verifications</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-violet">
                <i className="fa-solid fa-file-arrow-up"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['document-uploaded'] || 0}</div>
                <div className="al-stat-label">Documents Uploaded</div>
              </div>
            </div>
            <div className="al-stat-card">
              <div className="al-stat-icon al-ic-gray">
                <i className="fa-solid fa-floppy-disk"></i>
              </div>
              <div>
                <div className="al-stat-value">{typeCounts['draft-saved'] || 0}</div>
                <div className="al-stat-label">Drafts Saved</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="al-card al-toolbar">
            <div className="al-filter-group" role="group" aria-label="Filter by event type">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`al-chip ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t === 'All' ? 'All Events' : metaFor(t).label}
                  <span className="al-chip-count">
                    {t === 'All' ? entries.length : typeCounts[t] || 0}
                  </span>
                </button>
              ))}
            </div>
            <div className="al-daterange" role="group" aria-label="Filter by date range">
              <i className="fa-regular fa-calendar" aria-hidden="true"></i>
              <label className="al-date-field">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <span className="al-date-sep" aria-hidden="true">–</span>
              <label className="al-date-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
              {datesActive && (
                <button
                  type="button"
                  className="al-clear-dates"
                  onClick={clearDateRange}
                  title="Clear date range"
                  aria-label="Clear date range"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
            <div className="al-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search department, purpose…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="al-card">
            {filtered.length === 0 ? (
              <div className="al-empty">
                <i className="fa-solid fa-folder-open"></i>
                <h3>{entries.length === 0 ? 'No audit events yet' : 'No matching events'}</h3>
                <p>
                  {entries.length === 0
                    ? 'Grant or revoke a consent in your Citizen Profile and it will appear here instantly.'
                    : datesActive
                      ? 'Try a different filter, or clear the date range.'
                      : 'Try a different filter or search term.'}
                </p>
                {entries.length === 0 && (
                  <button
                    type="button"
                    className="al-btn al-btn-primary"
                    onClick={() => navigate('/dashboard/citizen-profile')}
                  >
                    Go to Citizen Profile
                  </button>
                )}
              </div>
            ) : (
              <div className="al-timeline">
                {filtered.map((e) => {
                  const meta = metaFor(e.type);
                  const expanded = expandedId === e.id;
                  return (
                    <div
                      key={e.id}
                      className={`al-entry ${recentIds.has(e.id) ? 'al-entry-new' : ''}`}
                    >
                      <div className="al-entry-rail">
                        <span className={`al-entry-dot ${meta.badge}`}>
                          <i className={`fa-solid ${meta.rowIcon}`}></i>
                        </span>
                      </div>
                      <div className="al-entry-card">
                        <div className="al-entry-head">
                          <div className="al-entry-title">
                            <span className={`al-badge ${meta.badge}`}>{meta.label}</span>
                            <strong>{e.department || 'System'}</strong>
                          </div>
                          <span className="al-entry-time">
                            <i className="fa-regular fa-clock"></i> {formatTs(e.createdAt)}
                          </span>
                        </div>
                        <div className="al-entry-summary">
                          {e.purpose && (
                            <div className="al-entry-field">
                              <span className="al-key">Purpose</span>
                              <span className="al-val">{e.purpose}</span>
                            </div>
                          )}
                          {e.requested && (
                            <div className="al-entry-field">
                              <span className="al-key">Data</span>
                              <span className="al-val">{e.requested}</span>
                            </div>
                          )}
                          {e.status && (
                            <div className="al-entry-field">
                              <span className="al-key">Status</span>
                              <span className={`al-badge ${statusBadge(e.status)}`}>{e.status}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="al-expand-btn"
                          onClick={() => setExpandedId(expanded ? null : e.id)}
                        >
                          {expanded ? 'Hide details' : 'View details'}
                          <i className={`fa-solid fa-chevron-${expanded ? 'up' : 'down'}`}></i>
                        </button>
                        {expanded && (
                          <pre className="al-json">{JSON.stringify(e, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
