/* Shared metadata + helpers for audit (data access history) events.
   Used by the AuditLog page, the AuditLogModal and the AuditToast. */

export const TYPE_META = {
  'consent-granted': {
    label: 'Consent Granted',
    icon: 'fa-circle-check',
    badge: 'al-badge-green',
    rowIcon: 'fa-user-shield',
  },
  'consent-revoked': {
    label: 'Consent Revoked',
    icon: 'fa-ban',
    badge: 'al-badge-red',
    rowIcon: 'fa-user-slash',
  },
  'profile-submitted': {
    label: 'Profile Submitted',
    icon: 'fa-id-badge',
    badge: 'al-badge-blue',
    rowIcon: 'fa-id-card',
  },
  'otp-verified': {
    label: 'OTP Verified',
    icon: 'fa-shield-halved',
    badge: 'al-badge-teal',
    rowIcon: 'fa-shield-halved',
  },
  'document-uploaded': {
    label: 'Document Uploaded',
    icon: 'fa-file-arrow-up',
    badge: 'al-badge-violet',
    rowIcon: 'fa-file-arrow-up',
  },
  'draft-saved': {
    label: 'Draft Saved',
    icon: 'fa-floppy-disk',
    badge: 'al-badge-amber',
    rowIcon: 'fa-floppy-disk',
  },
  default: {
    label: 'Activity',
    icon: 'fa-clock-rotate-left',
    badge: 'al-badge-gray',
    rowIcon: 'fa-clock-rotate-left',
  },
};

export const TYPE_FILTERS = [
  'All',
  'consent-granted',
  'consent-revoked',
  'profile-submitted',
  'otp-verified',
  'document-uploaded',
  'draft-saved',
];

export const STATUS_META = {
  Authorized: 'al-badge-green',
  Revoked: 'al-badge-red',
  Completed: 'al-badge-blue',
  Verified: 'al-badge-teal',
  Uploaded: 'al-badge-violet',
};

export const metaFor = (type) => TYPE_META[type] || TYPE_META.default;
export const statusBadge = (status) => STATUS_META[status] || 'al-badge-gray';

export const formatTs = (ts) => {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const eventTimeMs = (e) => {
  const ts = e?.createdAt;
  if (!ts) return null;
  return ts.toMillis ? ts.toMillis() : new Date(ts).getTime();
};
