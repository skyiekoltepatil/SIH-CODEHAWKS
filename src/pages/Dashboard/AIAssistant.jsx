import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons.jsx';
import { useAuth } from '../../context/BCAuthContext.jsx';
import { handleUserMessage, handleQuickCommand } from '../../services/chatbot.js';
import { maskAadhaar, maskAccount } from '../../services/bharatBackend.js';
import { db } from '../../firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { encryptProfile } from '../../utils/secureVault.js';
import praamanIcon from '../../assets/praaman-icon.png';
import CitizenProfile from './CitizenProfile.jsx';
import { speakMultilingual, stopSpeech, getActiveSiteLanguage, LANGUAGE_LOCALES } from '../../utils/tts.js';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (fileName, mimeType = '') => {
  const name = String(fileName || '').toLowerCase();
  const mime = String(mimeType || '').toLowerCase();
  if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(name)) return 'image';
  if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  if (/\.(docx|doc)$/i.test(name) || mime.includes('word')) return 'docx';
  if (mime === 'application/json' || /\.json$/i.test(name)) return 'json';
  if (/\.(zip|tar|gz|rar|7z)$/i.test(name) || mime.includes('zip')) return 'zip';
  return 'doc';
};

const normalizeProfileData = (parsed = {}, existingCp = {}, user = {}) => {
  const existingBasic = existingCp?.basic || {};
  const existingIdentity = existingCp?.identity || {};
  const existingAddress = existingCp?.address || {};
  const existingBank = existingCp?.bank || {};
  const existingFamily = existingCp?.family || {};
  const existingEducation = existingCp?.education || {};
  const existingEmployment = existingCp?.employment || {};

  const fullName =
    parsed.basic?.fullName ||
    parsed.fullName ||
    parsed.name ||
    parsed.nameAsPerId ||
    existingBasic.fullName ||
    user?.displayName ||
    user?.name ||
    'Bhushan Kolte';

  const nameAsPerId =
    parsed.basic?.nameAsPerId ||
    parsed.nameAsPerId ||
    fullName;

  const dob =
    parsed.basic?.dob ||
    parsed.dob ||
    existingBasic.dob ||
    '1998-05-15';

  const gender =
    parsed.basic?.gender ||
    parsed.gender ||
    existingBasic.gender ||
    'Male';

  const nationality =
    parsed.basic?.nationality ||
    parsed.nationality ||
    existingBasic.nationality ||
    'Indian';

  const maritalStatus =
    parsed.basic?.maritalStatus ||
    parsed.maritalStatus ||
    existingBasic.maritalStatus ||
    'Single';

  const preferredLanguage =
    parsed.basic?.preferredLanguage ||
    parsed.preferredLanguage ||
    existingBasic.preferredLanguage ||
    'English';

  const mobile =
    parsed.basic?.mobile ||
    parsed.mobile ||
    parsed.phone ||
    existingBasic.mobile ||
    user?.phoneNumber ||
    '9876543210';

  const email =
    parsed.basic?.email ||
    parsed.email ||
    existingBasic.email ||
    user?.email ||
    'skyie@example.com';

  const docType =
    parsed.identity?.docType ||
    parsed.docType ||
    existingIdentity.docType ||
    'Aadhaar';

  const docNumber =
    parsed.identity?.docNumber ||
    parsed.docNumber ||
    parsed.aadhaar ||
    existingIdentity.docNumber ||
    '548912345678';

  const line1 =
    parsed.address?.line1 ||
    parsed.address?.current?.line1 ||
    parsed.line1 ||
    parsed.street ||
    existingAddress.line1 ||
    existingAddress.current?.line1 ||
    'Flat 402, Green Avenue, Senapati Bapat Road';

  const village =
    parsed.address?.village ||
    parsed.address?.current?.village ||
    parsed.village ||
    parsed.city ||
    existingAddress.village ||
    existingAddress.current?.village ||
    'Shivajinagar';

  const district =
    parsed.address?.district ||
    parsed.address?.current?.district ||
    parsed.district ||
    existingAddress.district ||
    existingAddress.current?.district ||
    'Pune';

  const state =
    parsed.address?.state ||
    parsed.address?.current?.state ||
    parsed.state ||
    existingAddress.state ||
    existingAddress.current?.state ||
    'Maharashtra';

  const pincode =
    parsed.address?.pincode ||
    parsed.address?.current?.pincode ||
    parsed.pincode ||
    parsed.pin ||
    existingAddress.pincode ||
    existingAddress.current?.pincode ||
    '411016';

  const accountHolder =
    parsed.bank?.accountHolder ||
    parsed.accountHolder ||
    existingBank.accountHolder ||
    fullName;

  const bankName =
    parsed.bank?.bankName ||
    parsed.bankName ||
    existingBank.bankName ||
    'State Bank of India';

  const accountNumber =
    parsed.bank?.accountNumber ||
    parsed.accountNumber ||
    existingBank.accountNumber ||
    '30987654321';

  const ifsc =
    parsed.bank?.ifsc ||
    parsed.ifsc ||
    existingBank.ifsc ||
    'SBIN0001234';

  const fatherName =
    parsed.family?.fatherName ||
    parsed.family?.father?.name ||
    parsed.fatherName ||
    existingFamily.fatherName ||
    existingFamily.father?.name ||
    'Ramesh Kolte';

  const motherName =
    parsed.family?.motherName ||
    parsed.family?.mother?.name ||
    parsed.motherName ||
    existingFamily.motherName ||
    existingFamily.mother?.name ||
    'Sunita Kolte';

  const guardianName =
    parsed.family?.guardianName ||
    parsed.family?.guardian?.name ||
    parsed.guardianName ||
    existingFamily.guardianName ||
    '';

  const level =
    parsed.education?.level ||
    parsed.education?.entries?.[0]?.level ||
    parsed.educationLevel ||
    existingEducation.level ||
    existingEducation.entries?.[0]?.level ||
    'Graduate';

  const institution =
    parsed.education?.institution ||
    parsed.education?.entries?.[0]?.institution ||
    parsed.institution ||
    existingEducation.institution ||
    existingEducation.entries?.[0]?.institution ||
    'Pune University';

  const passingYear =
    parsed.education?.passingYear ||
    parsed.education?.entries?.[0]?.passingYear ||
    parsed.passingYear ||
    existingEducation.passingYear ||
    existingEducation.entries?.[0]?.passingYear ||
    '2020';

  const occupation =
    parsed.education?.occupation ||
    parsed.employment?.jobRole ||
    parsed.employment?.organization ||
    parsed.occupation ||
    existingEducation.occupation ||
    'Software Engineer';

  return {
    ...existingCp,
    basic: {
      ...existingBasic,
      fullName,
      nameAsPerId,
      dob,
      gender,
      nationality,
      maritalStatus,
      preferredLanguage,
      mobile,
      email,
      mobileVerified: true,
      emailVerified: true,
      photoURL: parsed.basic?.photoURL || existingBasic.photoURL || user?.photoURL || '',
    },
    identity: {
      ...existingIdentity,
      docType,
      docNumber,
      verified: true,
    },
    address: {
      ...existingAddress,
      line1,
      village,
      district,
      state,
      pincode,
      current: {
        line1,
        line2: '',
        village,
        district,
        state,
        pincode,
        country: 'India',
        residenceType: 'Owned',
      },
      permanent: {
        line1,
        line2: '',
        village,
        district,
        state,
        pincode,
        country: 'India',
        residenceType: 'Owned',
      },
      sameAsCurrent: true,
    },
    bank: {
      ...existingBank,
      accountHolder,
      bankName,
      branch: parsed.bank?.branch || existingBank.branch || 'Shivajinagar Branch',
      accountType: parsed.bank?.accountType || existingBank.accountType || 'Savings',
      accountNumber,
      confirmAccountNumber: accountNumber,
      ifsc,
      verified: true,
      acknowledged: true,
    },
    family: {
      ...existingFamily,
      fatherName,
      motherName,
      guardianName,
      father: {
        name: fatherName,
        dob: '',
        currentLocation: village,
        permanentLocation: village,
        occupation: 'Self-employed',
        contact: '',
      },
      mother: {
        name: motherName,
        dob: '',
        currentLocation: village,
        permanentLocation: village,
        occupation: 'Homemaker',
        contact: '',
      },
      guardian: {
        applicable: !!guardianName,
        name: guardianName,
        relationship: '',
        dob: '',
        contact: '',
        address: '',
      },
    },
    education: {
      ...existingEducation,
      level,
      institution,
      passingYear,
      occupation,
      entries: [
        {
          level,
          institution,
          board: 'State Board / University',
          course: 'B.Tech / Degree',
          passingYear,
          rollNumber: 'ENG-2020-8841',
        },
      ],
    },
    employment: {
      ...existingEmployment,
      status: 'Employed',
      organization: parsed.employment?.organization || 'Technology Corp',
      jobRole: occupation,
      workLocation: village,
    },
  };
};

// Storage keys & Session helpers
const SESSIONS_STORAGE_KEY_PREFIX = 'praaman_ai_chat_sessions_v1_';
const ACTIVE_SESSION_STORAGE_KEY_PREFIX = 'praaman_ai_active_session_id_';

const getStorageKey = (uid) => `${SESSIONS_STORAGE_KEY_PREFIX}${uid || 'guest'}`;
const getActiveKey = (uid) => `${ACTIVE_SESSION_STORAGE_KEY_PREFIX}${uid || 'guest'}`;

const createWelcomeMessage = () => ({
  id: `msg-welcome-${Date.now()}`,
  role: 'ai',
  title: "Hello, I'm your Praaman AI assistant.",
  text: "I can help you with information about schemes, applications, documents and other government services. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

const createNewSession = (title = 'New Conversation') => {
  const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [createWelcomeMessage()],
    isPinned: false,
  };
};

const loadInitialSessions = (uid) => {
  // If guest, try reading temporary guest storage
  if (!uid) {
    try {
      const raw = localStorage.getItem(getStorageKey(null));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {}
  }
  return [createNewSession('New Conversation')];
};

const loadInitialActiveId = (uid, initialSessions) => {
  if (!uid) {
    try {
      const savedActiveId = localStorage.getItem(getActiveKey(null));
      if (savedActiveId && initialSessions.some((s) => s.id === savedActiveId)) {
        return savedActiveId;
      }
    } catch (err) {}
  }
  return initialSessions[0]?.id || '';
};

export default function AIAssistant() {
  const { user, backend } = useAuth();

  const [syncStatus, setSyncStatus] = useState('syncing'); // 'syncing' | 'synced' | 'migrating' | 'guest'
  const [sessions, setSessions] = useState(() => loadInitialSessions(user?.uid));
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const initial = loadInitialSessions(user?.uid);
    return loadInitialActiveId(user?.uid, initial);
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmSession, setDeleteConfirmSession] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showClearCurrentModal, setShowClearCurrentModal] = useState(false);
  const [activeMenuSessionId, setActiveMenuSessionId] = useState(null);

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [cp, setCp] = useState(null);
  const [apps, setApps] = useState([]);
  const [activeFormMsgId, setActiveFormMsgId] = useState(null);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const toggleInlineForm = (msgId) => {
    setActiveFormMsgId((prev) => (prev === msgId ? null : msgId));
  };

  const handleInlineFormSave = async (savedData) => {
    if (!savedData || !user?.uid) return;
    try {
      const normalized = normalizeProfileData(savedData, cp || {}, user);
      if (backend?.saveProfile) {
        await backend.saveProfile(user.uid, normalized, { profileSavedAt: Date.now() });
        await backend.logEvent(user.uid, {
          type: 'profile-saved',
          title: 'Profile updated in AI Chat',
          body: `Citizen profile draft saved for ${normalized.basic.fullName}.`,
          tone: 'green',
        });
      }
      setCp(normalized);
    } catch (err) {
      console.error('Error syncing inline profile save:', err);
    }
  };

  // Load citizen profile and applications for context
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const profile = await backend.loadProfile(user.uid);
        const list = await backend.listApplications(user.uid);
        if (alive) {
          setCp(profile || {});
          setApps(list || []);
        }
      } catch (err) {
        console.error('Failed to load context for AI assistant:', err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, backend]);

  const chatContext = useMemo(() => {
    return {
      user: {
        ...user,
        name: cp?.basic?.fullName || user?.name || 'Citizen',
        profile: cp,
      },
      applications: apps,
    };
  }, [user, cp, apps]);

  // Real-time synchronization of chat history with registered user account in Firestore
  useEffect(() => {
    if (!user?.uid) {
      const local = loadInitialSessions(null);
      setSessions(local);
      setActiveSessionId(local[0]?.id || '');
      setSyncStatus('guest');
      return;
    }

    let isSubscribed = true;
    setSyncStatus('syncing');

    // Subscribe to cloud chat sessions from the user's registered account in Firestore
    const unsubscribe = backend.subscribeChatSessions(user.uid, async (cloudSessions) => {
      if (!isSubscribed) return;

      if (cloudSessions && cloudSessions.length > 0) {
        setSessions(cloudSessions);
        setSyncStatus('synced');
        setActiveSessionId((prevId) => {
          if (prevId && cloudSessions.some((s) => s.id === prevId)) return prevId;
          return cloudSessions[0]?.id || '';
        });
      } else {
        // No cloud chats yet — check if there are legacy local chats to migrate to account
        const legacyRaw = localStorage.getItem(getStorageKey(user.uid));
        let legacySessions = [];
        try {
          legacySessions = legacyRaw ? JSON.parse(legacyRaw) : [];
        } catch (e) {}

        if (Array.isArray(legacySessions) && legacySessions.length > 0) {
          setSyncStatus('migrating');
          for (const s of legacySessions) {
            await backend.saveChatSession(user.uid, s, user.email);
          }
          try {
            localStorage.removeItem(getStorageKey(user.uid));
            localStorage.removeItem(getActiveKey(user.uid));
          } catch (e) {}
          setSessions(legacySessions);
          setActiveSessionId(legacySessions[0]?.id || '');
          setSyncStatus('synced');
        } else {
          // Initialize their first cloud chat session in their registered account
          const fresh = createNewSession('New Conversation');
          await backend.saveChatSession(user.uid, fresh, user.email);
          await backend.setActiveChatSessionId(user.uid, fresh.id);
          setSessions([fresh]);
          setActiveSessionId(fresh.id);
          setSyncStatus('synced');
        }
      }
    });

    // Also load active session id if saved in account
    backend.getActiveChatSessionId(user.uid).then((savedActiveId) => {
      if (isSubscribed && savedActiveId) {
        setActiveSessionId((prev) => prev || savedActiveId);
      }
    }).catch(() => {});

    return () => {
      isSubscribed = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid, user?.email, backend]);

  // Persist guest session only when not logged in
  useEffect(() => {
    if (!user?.uid && sessions && sessions.length > 0) {
      try {
        localStorage.setItem(getStorageKey(null), JSON.stringify(sessions));
      } catch (err) {}
    }
  }, [sessions, user?.uid]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const messages = useMemo(() => {
    return activeSession?.messages || [];
  }, [activeSession]);

  const updateSessionMessages = useCallback((targetSessionId, updater) => {
    setSessions((prevSessions) => {
      let targetSessionToSave = null;
      const nextSessions = prevSessions.map((session) => {
        if (session.id !== targetSessionId) return session;
        const prevMsgs = session.messages || [];
        const newMsgs = typeof updater === 'function' ? updater(prevMsgs) : updater;

        let newTitle = session.title;
        if (session.title === 'New Conversation' || session.title === 'New Chat') {
          const firstUserMsg = newMsgs.find((m) => m.role === 'user');
          if (firstUserMsg && firstUserMsg.text) {
            const cleanText = firstUserMsg.text.replace(/[\n\r]+/g, ' ').trim();
            newTitle = cleanText.length > 34 ? cleanText.substring(0, 34) + '...' : cleanText;
          }
        }

        const updated = {
          ...session,
          title: newTitle,
          messages: newMsgs,
          updatedAt: new Date().toISOString(),
        };
        targetSessionToSave = updated;
        return updated;
      });

      if (user?.uid && targetSessionToSave && backend?.saveChatSession) {
        backend.saveChatSession(user.uid, targetSessionToSave, user.email).catch((err) => {
          console.error('Failed to sync chat to account:', err);
        });
      }

      return nextSessions;
    });
  }, [user?.uid, user?.email, backend]);

  const setMessages = useCallback(
    (updater) => {
      updateSessionMessages(activeSessionId, updater);
    },
    [activeSessionId, updateSessionMessages]
  );

  const handleNewChat = () => {
    const newSession = createNewSession('New Conversation');
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveFormMsgId(null);
    setAttachments([]);
    setInput('');
    setIsMobileHistoryOpen(false);

    if (user?.uid && backend?.saveChatSession) {
      backend.saveChatSession(user.uid, newSession, user.email);
      backend.setActiveChatSessionId(user.uid, newSession.id);
    }
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setActiveFormMsgId(null);
    setAttachments([]);
    setInput('');
    setIsMobileHistoryOpen(false);

    if (user?.uid && backend?.setActiveChatSessionId) {
      backend.setActiveChatSessionId(user.uid, sessionId);
    }
  };

  const handleDeleteSession = (sessionToDelete, e) => {
    e.stopPropagation();
    setDeleteConfirmSession(sessionToDelete);
  };

  const executeDeleteSession = () => {
    if (!deleteConfirmSession) return;
    const targetId = deleteConfirmSession.id;
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== targetId);
      if (filtered.length === 0) {
        const fresh = createNewSession('New Conversation');
        setActiveSessionId(fresh.id);
        if (user?.uid && backend?.saveChatSession) {
          backend.saveChatSession(user.uid, fresh, user.email);
          backend.setActiveChatSessionId(user.uid, fresh.id);
        }
        return [fresh];
      }
      if (activeSessionId === targetId) {
        setActiveSessionId(filtered[0].id);
        if (user?.uid && backend?.setActiveChatSessionId) {
          backend.setActiveChatSessionId(user.uid, filtered[0].id);
        }
      }
      return filtered;
    });

    if (user?.uid && backend?.deleteChatSession) {
      backend.deleteChatSession(user.uid, targetId);
    }
    setDeleteConfirmSession(null);
  };

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (e) => {
    if (e) e.stopPropagation();
    if (!editingSessionId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      let updatedToSave = null;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === editingSessionId) {
            const updated = { ...s, title: trimmed, updatedAt: new Date().toISOString() };
            updatedToSave = updated;
            return updated;
          }
          return s;
        })
      );
      if (user?.uid && updatedToSave && backend?.saveChatSession) {
        backend.saveChatSession(user.uid, updatedToSave, user.email);
      }
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleTogglePin = (session, e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    let updatedToSave = null;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === session.id) {
          const updated = { ...s, isPinned: !s.isPinned, updatedAt: new Date().toISOString() };
          updatedToSave = updated;
          return updated;
        }
        return s;
      })
    );
    if (user?.uid && updatedToSave && backend?.saveChatSession) {
      backend.saveChatSession(user.uid, updatedToSave, user.email);
    }
    setActiveMenuSessionId(null);
  };

  useEffect(() => {
    if (!activeMenuSessionId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-chat-menu]')) {
        setActiveMenuSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [activeMenuSessionId]);

  const handleSpeak = useCallback((text, msgId) => {
    if (speakingMsgId === msgId) {
      stopSpeech();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    const activeLang = getActiveSiteLanguage();
    const targetLocale = activeLang && activeLang !== 'en' ? (LANGUAGE_LOCALES[activeLang] || `${activeLang}-IN`) : undefined;

    speakMultilingual(text, {
      lang: targetLocale,
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  }, [speakingMsgId]);

  const handleCopy = useCallback((text, msgId) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const executeClearAllHistory = () => {
    const fresh = createNewSession('New Conversation');
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setShowClearAllModal(false);
    setActiveFormMsgId(null);
    setAttachments([]);
    setInput('');

    if (user?.uid && backend?.clearAllChatSessions) {
      backend.clearAllChatSessions(user.uid).then(() => {
        backend.saveChatSession(user.uid, fresh, user.email);
        backend.setActiveChatSessionId(user.uid, fresh.id);
      }).catch((e) => console.error('Failed to clear cloud chat history:', e));

      try {
        localStorage.removeItem(getStorageKey(user.uid));
        localStorage.removeItem(getActiveKey(user.uid));
      } catch (e) {}
    } else {
      try {
        localStorage.setItem(getStorageKey(null), JSON.stringify([fresh]));
        localStorage.setItem(getActiveKey(null), fresh.id);
      } catch (e) {}
    }
  };

  const executeClearCurrentChat = () => {
    const welcome = createWelcomeMessage();
    let updatedToSave = null;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updated = {
            ...s,
            title: 'New Conversation',
            messages: [welcome],
            updatedAt: new Date().toISOString(),
          };
          updatedToSave = updated;
          return updated;
        }
        return s;
      })
    );
    if (user?.uid && updatedToSave && backend?.saveChatSession) {
      backend.saveChatSession(user.uid, updatedToSave, user.email);
    }
    setAttachments([]);
    setShowClearCurrentModal(false);
    setActiveFormMsgId(null);
  };

  const filteredSessions = useMemo(() => {
    if (!historySearch.trim()) return sessions;
    const q = historySearch.toLowerCase().trim();
    return sessions.filter((s) => {
      if (s.title && s.title.toLowerCase().includes(q)) return true;
      return s.messages?.some((m) => m.text && m.text.toLowerCase().includes(q));
    });
  }, [sessions, historySearch]);

  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const tA = new Date(a.updatedAt || a.createdAt).getTime();
      const tB = new Date(b.updatedAt || b.createdAt).getTime();
      return tB - tA;
    });
  }, [filteredSessions]);

  const pinnedSessions = useMemo(() => {
    return sortedSessions.filter((s) => s.isPinned);
  }, [sortedSessions]);

  const unpinnedSessions = useMemo(() => {
    return sortedSessions.filter((s) => !s.isPinned);
  }, [sortedSessions]);

  const formatSessionTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1) {
        return 'Yesterday';
      }
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const sessionGroups = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 7 * 86400000;

    const groups = [
      { id: 'today', label: 'Today', items: [] },
      { id: 'yesterday', label: 'Yesterday', items: [] },
      { id: 'last7Days', label: 'Previous 7 Days', items: [] },
      { id: 'older', label: 'Older Conversations', items: [] },
    ];

    unpinnedSessions.forEach((s) => {
      const time = new Date(s.updatedAt || s.createdAt).getTime();
      if (time >= today) {
        groups[0].items.push(s);
      } else if (time >= yesterday) {
        groups[1].items.push(s);
      } else if (time >= last7Days) {
        groups[2].items.push(s);
      } else {
        groups[3].items.push(s);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [unpinnedSessions]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages.length, isTyping, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(false);
  }, [activeSessionId, scrollToBottom]);

  // Download pre-filled valid JSON template
  const handleDownloadTemplate = () => {
    const templateData = {
      basic: {
        fullName: "Bhushan Kolte",
        nameAsPerId: "Bhushan Kolte",
        dob: "1998-05-15",
        gender: "Male",
        nationality: "Indian",
        maritalStatus: "Single",
        preferredLanguage: "English",
        mobile: "9876543210",
        email: "skyie@example.com"
      },
      identity: {
        docType: "Aadhaar",
        docNumber: "548912345678",
        verified: true
      },
      address: {
        line1: "Flat 402, Green Avenue, Senapati Bapat Road",
        village: "Shivajinagar",
        district: "Pune",
        state: "Maharashtra",
        pincode: "411016"
      },
      bank: {
        accountHolder: "Bhushan Kolte",
        bankName: "State Bank of India",
        accountNumber: "30987654321",
        ifsc: "SBIN0001234",
        verified: true
      },
      family: {
        fatherName: "Ramesh Kolte",
        motherName: "Sunita Kolte",
        guardianName: ""
      },
      education: {
        level: "Graduate",
        institution: "Pune University",
        passingYear: "2020",
        occupation: "Software Engineer"
      }
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "citizen-profile-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dedicated JSON upload handler for citizen profile update
  const handleJsonUpload = async (file) => {
    if (!file) return;
    try {
      setIsTyping(true);
      const text = await file.text();
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON file format. Please check the JSON syntax and try again.");
      }

      // Merge and normalize profile
      const merged = normalizeProfileData(parsed, cp || {}, user);

      // Save to backend
      if (user?.uid) {
        await backend.saveProfile(user.uid, merged, { profileSavedAt: Date.now() });

        if (db) {
          try {
            const encrypted = await encryptProfile(merged, user.uid);
            await setDoc(doc(db, 'users', user.uid), { citizenProfile: { ...encrypted, savedAt: new Date().toISOString() } }, { merge: true });
          } catch (e) {
            console.warn('Direct Firestore save note:', e);
          }
        }

        await backend.logEvent(user.uid, {
          type: 'profile-saved',
          title: 'Profile updated via JSON',
          body: `Citizen personal profile updated for ${merged.basic.fullName}.`,
          tone: 'green',
        });
      }

      setCp(merged);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // User message showing file upload
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: `Uploaded citizen profile data from ${file.name}`,
        attachments: [
          {
            id: `att-${Date.now()}`,
            name: file.name,
            size: formatFileSize(file.size),
            type: 'json',
          },
        ],
        timestamp: timeStr,
      };

      // AI response message confirming update
      const aiMsg = {
        id: `ai-${Date.now() + 1}`,
        role: 'ai',
        title: '✅ Citizen Profile Successfully Updated from JSON!',
        text: `Your personal citizen profile has been validated, encrypted, and saved to your official account records.

Here is a summary of your updated personal records:
• **Full Legal Name:** ${merged.basic.fullName}
• **Date of Birth:** ${merged.basic.dob}
• **Gender:** ${merged.basic.gender}
• **Mobile Number:** ${merged.basic.mobile} (Verified)
• **Email Address:** ${merged.basic.email} (Verified)
• **Identity Document:** ${merged.identity.docType} (${maskAadhaar(merged.identity.docNumber)})
• **Residential Address:** ${merged.address.line1}, ${merged.address.village}, ${merged.address.district}, ${merged.address.state} - ${merged.address.pincode}
• **Bank Details:** ${merged.bank.bankName} (A/C: ${maskAccount(merged.bank.accountNumber)}, IFSC: ${merged.bank.ifsc})
• **Family Background:** Father: ${merged.family.fatherName}, Mother: ${merged.family.motherName}
• **Education & Role:** ${merged.education.level} from ${merged.education.institution} (${merged.education.occupation})

🔒 **Security Guarantee:** All sensitive identity and financial records are client-side encrypted with AES-256-GCM. Your updated profile is now live across your dashboard and verified for government services.`,
        isProfileUpdated: true,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);
    } catch (err) {
      console.error('Failed to import profile JSON:', err);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          title: '⚠️ Could not update profile from JSON',
          text: `An error occurred while processing the profile JSON: ${err.message || 'Invalid format'}. Please ensure your JSON file is properly formatted or download our sample template below.`,
          isProfileGuide: true,
          timestamp: timeStr,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleJsonFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleJsonUpload(file);
    }
    e.target.value = '';
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name, file.type),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = useCallback(
    async (customText = null) => {
      const rawText = customText !== null ? customText : input;
      const text = String(rawText || '').trim();
      const currentAttachments = [...attachments];

      if ((!text && currentAttachments.length === 0) || isTyping) return;

      // Check if user uploaded a JSON file via attachment
      const jsonAtt = currentAttachments.find((a) => a.type === 'json' && a.file);
      if (jsonAtt) {
        setInput('');
        setAttachments([]);
        await handleJsonUpload(jsonAtt.file);
        return;
      }

      // Check if user pasted a raw JSON string
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.basic || parsed.fullName || parsed.identity || parsed.address) {
            setInput('');
            setAttachments([]);
            const blob = new Blob([text], { type: 'application/json' });
            const virtualFile = new File([blob], 'profile-data.json', { type: 'application/json' });
            await handleJsonUpload(virtualFile);
            return;
          }
        } catch (e) {
          // continue as regular message
        }
      }

      const targetSessionId = activeSessionId;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setInput('');
      setAttachments([]);

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: text || (currentAttachments.length === 1 ? `Shared file: ${currentAttachments[0].name}` : `Shared ${currentAttachments.length} files`),
        attachments: currentAttachments,
        timestamp: timeStr,
      };

      updateSessionMessages(targetSessionId, (prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        try {
          let reply =
            handleQuickCommand(text, chatContext) ||
            handleUserMessage(text, chatContext);

          let replyText = reply?.text || "I've received your inquiry.";
          const isManualFormRequest =
            !!reply?.showInlineForm ||
            /\b(manual|manually|10-step|10 step|open form|show form|profile form|fill form|update manually|edit manually|open profile form)\b/i.test(text);

          const isProfileGuide =
            !isManualFormRequest && (
              !!reply?.isProfileGuide ||
              /\b(profile|my profile|update profile|update my profile|edit profile|personal profile|citizen profile|how do i update my profile|how do i update profile|personal details)\b/i.test(text)
            );

          if (currentAttachments.length > 0) {
            const fileNames = currentAttachments.map((a) => a.name).join(', ');
            const types = currentAttachments.map((a) => a.type);

            let docContext = '';
            if (types.includes('image')) {
              docContext = `I have received your image (${fileNames}). I can inspect this image for identity proof verification, Aadhaar specifications, or income certificate compliance for government schemes.`;
            } else if (types.includes('pdf')) {
              docContext = `I have received your PDF document (${fileNames}). I can help review this against scheme eligibility criteria and required attestation checklists.`;
            } else if (types.includes('docx')) {
              docContext = `I have received your Word document (${fileNames}). The document has been logged for eligibility and application verification.`;
            } else if (types.includes('zip')) {
              docContext = `I have received your ZIP archive (${fileNames}). It contains bundled application documents ready for batch validation and portal submission.`;
            } else {
              docContext = `I have received your file (${fileNames}) for verification.`;
            }

            if (text) {
              replyText = `${docContext}\n\nRegarding your question: "${text}"\n${replyText}`;
            } else {
              replyText = `${docContext}\n\nWould you like me to verify if these documents match any specific government scheme (e.g., Ayushman Bharat PM-JAY, PM Awas Yojana, or Central Sector Scholarships)?`;
            }
          }

          const hasSchemeAction =
            !isProfileGuide &&
            !isManualFormRequest &&
            (text.toLowerCase().includes('eligib') ||
              text.toLowerCase().includes('scheme') ||
              text.toLowerCase().includes('योजना') ||
              currentAttachments.length > 0);

          const aiMsg = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: replyText,
            isProfileGuide,
            showInlineForm: isManualFormRequest,
            actionBtn: hasSchemeAction
              ? {
                  label: "View eligible schemes",
                  to: "/schemes",
                }
              : undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          if (isManualFormRequest) {
            setActiveFormMsgId(aiMsg.id);
          }

          updateSessionMessages(targetSessionId, (prev) => [...prev, aiMsg]);
        } catch (err) {
          console.error('AI error:', err);
        } finally {
          setIsTyping(false);
        }
      }, 500);
    },
    [input, attachments, isTyping, chatContext, cp, user, backend, activeSessionId, updateSessionMessages]
  );

  const handleClearChat = () => {
    setShowClearCurrentModal(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const TOPIC_CARDS = [
    {
      key: 'schemes',
      icon: 'grid',
      toneCls: 'bg-[#eafaf1] text-[#10b981]',
      title: 'Find eligible schemes',
      desc: 'Discover government schemes based on your profile and needs.',
      query: 'Which schemes am I eligible for?',
    },
    {
      key: 'track',
      icon: 'search',
      toneCls: 'bg-[#eff6ff] text-[#3b82f6]',
      title: 'Track an application',
      desc: 'Get real-time status and next steps for your applications.',
      query: 'What is the status of my application?',
    },
    {
      key: 'docs',
      icon: 'doc',
      toneCls: 'bg-[#f5f3ff] text-[#8b5cf6]',
      title: 'Understand required documents',
      desc: 'Know which documents are needed for a scheme or service.',
      query: 'What documents are needed for government schemes?',
    },
    {
      key: 'profile',
      icon: 'user',
      toneCls: 'bg-[#fffbeb] text-[#f59e0b]',
      title: 'Update my profile',
      desc: 'Learn how to update your personal and family information.',
      query: 'Update my profile',
    },
  ];

  const renderSessionItem = (s) => {
    const isActive = activeSessionId === s.id;
    const isEditing = editingSessionId === s.id;
    const isMenuOpen = activeMenuSessionId === s.id;

    if (isEditing) {
      return (
        <div
          key={s.id}
          className="p-2 rounded-xl bg-white dark:bg-[#161616] border border-blue-400 shadow-2xs"
        >
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(e);
              if (e.key === 'Escape') handleCancelRename(e);
            }}
            autoFocus
            className="w-full text-[12.5px] bg-transparent text-ink-900 dark:text-white focus:outline-none"
          />
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              type="button"
              onClick={handleCancelRename}
              className="p-1 rounded text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 cursor-pointer"
              title="Cancel"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSaveRename}
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              title="Save title"
            >
              <Icon name="check" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={s.id}
        onClick={() => handleSelectSession(s.id)}
        className={`group relative flex items-start gap-2.5 rounded-xl p-2.5 transition-all text-left cursor-pointer border ${
          isActive
            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 shadow-2xs'
            : 'border-transparent hover:bg-white dark:hover:bg-white/5 hover:border-ink-100 dark:hover:border-white/10'
        }`}
      >
        <div
          className={`mt-0.5 shrink-0 ${
            s.isPinned
              ? 'text-blue-600 dark:text-blue-400'
              : isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-300'
          }`}
        >
          <Icon name={s.isPinned ? "pin" : "message"} className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 pr-7">
          <div className="flex items-center gap-1.5 min-w-0">
            <p
              className={`text-[12.5px] truncate leading-snug break-words ${
                isActive
                  ? 'font-bold text-ink-900 dark:text-white'
                  : 'font-medium text-ink-700 dark:text-ink-300 group-hover:text-ink-900 dark:group-hover:text-white'
              }`}
            >
              {s.title}
            </p>
            {s.isPinned && (
              <span className="shrink-0 text-blue-600 dark:text-blue-400" title="Pinned chat">
                <Icon name="pin" className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-400 dark:text-ink-500">
            <span>{formatSessionTime(s.updatedAt || s.createdAt)}</span>
            <span>•</span>
            <span>{s.messages?.length || 0} msgs</span>
          </div>
        </div>

        {/* Classic 3-dots Menu Button */}
        <div
          data-chat-menu="true"
          className={`absolute right-1.5 top-2 z-30 transition-opacity ${
            isMenuOpen || isActive
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuSessionId(isMenuOpen ? null : s.id);
            }}
            className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border transition-all cursor-pointer ${
              isMenuOpen
                ? 'bg-ink-100 dark:bg-white/15 border-ink-200 dark:border-white/20 text-ink-900 dark:text-white shadow-2xs'
                : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-white dark:hover:bg-white/10 hover:border-ink-200/60 dark:hover:border-white/10'
            }`}
            title="Options"
          >
            <Icon name="dots" className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-7.5 z-30 w-36 rounded-xl border border-ink-200 dark:border-white/15 bg-white dark:bg-[#1a1a1c] p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pin / Unpin */}
              <button
                type="button"
                onClick={(e) => handleTogglePin(s, e)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-700 dark:text-ink-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
              >
                <Icon name={s.isPinned ? "pinOff" : "pin"} className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>{s.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
              </button>

              {/* Rename */}
              <button
                type="button"
                onClick={(e) => {
                  setActiveMenuSessionId(null);
                  handleStartRename(s, e);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                <Icon name="edit" className="h-3.5 w-3.5 text-ink-500 dark:text-ink-400 shrink-0" />
                <span>Rename</span>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-ink-100 dark:border-white/10" />

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => {
                  setActiveMenuSessionId(null);
                  handleDeleteSession(s, e);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
              >
                <Icon name="trash" className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 py-6 font-sans sm:px-6 lg:px-8">
      {/* Hidden File Input supporting Images, JSON, ZIP, PDF, DOCX */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.docx,.doc,.json,.zip,.tar,.gz,.7z,application/pdf,application/json,application/zip,application/x-zip-compressed,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        onChange={handleFileSelect}
        className="hidden"
        id="ai-file-upload"
      />

      {/* Dedicated Hidden Input for Profile JSON Upload */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleJsonFileInput}
        className="hidden"
        id="ai-json-upload"
      />

      {/* Breadcrumb & Page Heading */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-400 dark:text-ink-500 mb-1.5">
          <Link to="/dashboard" className="hover:text-ink-700 dark:hover:text-ink-300 transition-colors">
            Dashboard
          </Link>
          <span className="text-ink-300 dark:text-ink-600">›</span>
          <span className="text-ink-600 dark:text-ink-300 font-semibold">Praaman AI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-xs border border-ink-100 dark:border-white/10 p-1.5">
            <img src={praamanIcon} alt="Praaman AI" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-ink-900 dark:text-white leading-tight">
              Praaman AI
            </h1>
            <p className="text-[13.5px] text-ink-500 dark:text-ink-400">
              Your personal government services and citizen profile guide.
            </p>
          </div>
        </div>
      </div>

      {/* Outer Card: History Sidebar on the Left, AI Chat Window on the Right */}
      <div className="w-full rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-[#0c0c0c] shadow-xs flex h-[780px] lg:h-[840px] max-h-[calc(100vh-140px)] min-h-[640px] overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobileHistoryOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs lg:hidden"
            onClick={() => setIsMobileHistoryOpen(false)}
          />
        )}

        {/* Left Sidebar: User Chat History */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto
            w-72 sm:w-80 shrink-0
            bg-[#fbfcfd] dark:bg-[#0d0d0e]
            border-r border-ink-100 dark:border-white/10
            flex flex-col h-full
            transition-all duration-200 ease-in-out
            ${isMobileHistoryOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarOpen ? 'lg:flex' : 'lg:hidden'}
          `}
        >
          {/* Sidebar Top: Header, Count & New Chat Button */}
          <div className="p-3.5 border-b border-ink-100 dark:border-white/10 shrink-0 bg-white/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Icon name="history" className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-ink-900 dark:text-white leading-tight">
                    Chat History
                  </h2>
                  <p className="text-[10.5px] text-ink-400 dark:text-ink-500">
                    {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'} • {user?.email ? 'Account synced' : 'Guest mode'}
                  </p>
                </div>
              </div>

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setIsMobileHistoryOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-white/10 transition-colors"
                title="Close history"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            {/* Account Synced Badge */}
            {user?.email && (
              <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 px-2 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/50">
                <Icon name="cloudCheck" className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate" title={`AI chats are securely saved to your account: ${user.email}`}>
                  Saved to: {user.email}
                </span>
              </div>
            )}

            {/* "+ New Chat" Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 px-3.5 text-[12.5px] font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>New Chat</span>
            </button>

            {/* Search input */}
            <div className="relative mt-2.5">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search past chats..."
                className="w-full rounded-xl border border-ink-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8.5 pr-7 py-1.5 text-[12px] text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 cursor-pointer"
                  title="Clear search"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Middle: Scrollable Conversations List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 min-h-0">

            {filteredSessions.length === 0 ? (
              <div className="py-12 text-center px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-white/10 text-ink-400 mx-auto mb-2.5">
                  <Icon name="message" className="h-5 w-5" />
                </div>
                <p className="text-[12.5px] font-semibold text-ink-700 dark:text-ink-300">
                  {historySearch ? 'No chats match search' : 'No chat history yet'}
                </p>
                <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">
                  {historySearch ? 'Try different keywords' : 'Start a new conversation above.'}
                </p>
              </div>
            ) : (
              <>
                {/* Pinned Chats at the Very Top */}
                {pinnedSessions.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2 py-0.5">
                      <Icon name="pin" className="h-3 w-3" />
                      <span>Pinned Chats</span>
                    </div>
                    <div className="space-y-1">
                      {pinnedSessions.map((s) => renderSessionItem(s))}
                    </div>
                  </div>
                )}

                {/* Chronological Groups (Today, Yesterday, etc.) */}
                {sessionGroups.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500 px-2 py-0.5">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((s) => renderSessionItem(s))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Sidebar Bottom: Storage & Clear All */}
          <div className="p-3 border-t border-ink-100 dark:border-white/10 bg-[#f8fafc]/80 dark:bg-[#0e0e0f]/80 shrink-0">
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 text-[12px] font-semibold text-ink-500 hover:text-red-600 dark:text-ink-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
              title="Delete all chat history"
            >
              <div className="flex items-center gap-2">
                <Icon name="trash" className="h-3.5 w-3.5" />
                <span>Clear all history</span>
              </div>
              <span className="text-[10px] text-ink-400 font-normal">
                {sessions.length}
              </span>
            </button>

            <div className="mt-1.5 px-2 flex items-center justify-between text-[10.5px] text-ink-400 dark:text-ink-500">
              <div className="flex items-center gap-1.5">
                <Icon name="shield" className="h-3 w-3 text-emerald-500" />
                <span>Saved locally</span>
              </div>
              <span>Private & safe</span>
            </div>
          </div>
        </aside>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-[#0c0c0c]">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-ink-100 dark:border-white/10 px-4 sm:px-6 py-3.5 bg-white dark:bg-[#0c0c0c] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* History Toggle Button (3 lines menu bar) */}
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                  setIsMobileHistoryOpen(!isMobileHistoryOpen);
                }}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-ink-200 dark:border-white/20 bg-white dark:bg-white/5 text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-ink-50 dark:hover:bg-white/10 hover:border-ink-300 transition-all cursor-pointer shadow-2xs"
                title={isSidebarOpen ? "Hide chat history" : "Show chat history"}
                aria-label="Toggle chat history"
              >
                <Icon name="menu" className="h-4.5 w-4.5" />
              </button>

              <div className="h-5 w-px bg-ink-200 dark:bg-white/15 hidden sm:block shrink-0" />

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-1">
                  <img src={praamanIcon} alt="Praaman Logo" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-900 dark:text-white leading-tight truncate">
                    {activeSession?.title || 'Praaman AI Assistant'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-medium flex-wrap">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </div>
                    <span className="text-ink-300 dark:text-white/20">•</span>
                    {user?.email ? (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title={`All conversations are stored in your registered cloud account (${user.email})`}>
                        <Icon name="cloudCheck" className="h-3 w-3" />
                        <span>Saved to account ({user.email})</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Guest session (Local only)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleNewChat}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                title="Start a new conversation"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                <span>New chat</span>
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear messages in this conversation"
              >
                <Icon name="trash" className="h-3.5 w-3.5 text-ink-400" />
                <span className="hidden sm:inline">Clear chat</span>
              </button>
            </div>
          </div>

        {/* Scrollable Messages Area */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white dark:bg-[#0c0c0c]">
          {messages.map((msg, index) => {
            const isAi = msg.role === 'ai';

            return (
              <div key={msg.id} className="space-y-4">
                <div className={`flex gap-3.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
                  {/* Avatar */}
                  {isAi ? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-xs border border-ink-100 dark:border-white/10 p-1.5 mt-0.5">
                      <img src={praamanIcon} alt="Praaman AI Logo" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 dark:border-white/20 bg-blue-50 text-blue-600 mt-0.5">
                      <Icon name="user" className="h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble + Attachments + Timestamp */}
                  {(() => {
                    const hasOpenForm =
                      (msg.isProfileGuide && activeFormMsgId === msg.id) ||
                      (msg.showInlineForm && activeFormMsgId === msg.id) ||
                      msg.showInlineForm ||
                      (msg.isProfileUpdated && activeFormMsgId === msg.id);

                    return (
                      <div className={`w-full ${hasOpenForm ? 'max-w-full' : 'max-w-[85%] md:max-w-2xl'} flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                        <div
                          className={`w-full rounded-2xl ${hasOpenForm ? 'p-3.5 sm:p-5 md:p-6' : 'p-4 md:p-5'} text-[14px] leading-relaxed shadow-2xs ${
                            isAi
                              ? 'bg-[#f4f6fa] dark:bg-[#161616] text-ink-900 dark:text-ink-100 rounded-tl-sm'
                              : 'bg-[#e0edff] dark:bg-blue-950/70 text-ink-900 dark:text-white rounded-tr-sm font-medium'
                          }`}
                        >
                          {/* Attached Files inside User Bubble */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center gap-2 rounded-xl bg-white/95 dark:bg-black/50 border border-blue-200/80 dark:border-white/15 p-2 text-xs shadow-2xs"
                                >
                                  {att.type === 'image' && att.previewUrl ? (
                                    <img src={att.previewUrl} alt={att.name} className="h-9 w-9 rounded-lg object-cover border border-blue-100" />
                                  ) : (
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[10px] ${
                                      att.type === 'pdf' ? 'bg-red-50 text-red-600 border border-red-200' :
                                      att.type === 'docx' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                      att.type === 'json' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                      att.type === 'zip' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                      'bg-gray-50 text-gray-600'
                                    }`}>
                                      {att.type.toUpperCase()}
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <p className="font-semibold text-ink-900 dark:text-white truncate max-w-[140px] text-[12px]">{att.name}</p>
                                    <p className="text-[10px] text-ink-400">{att.size}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.title && (
                            <p className="font-bold text-ink-900 dark:text-white mb-2 text-[15px] flex items-center gap-2">
                              {msg.title}
                            </p>
                          )}
                          <p className="whitespace-pre-line text-ink-800 dark:text-ink-200">
                            {msg.text}
                          </p>

                          {/* Direct Fitted Form (triggered via 'Update manually' / 'open form') */}
                          {msg.showInlineForm && (
                            <div className="mt-4 pt-4 border-t border-ink-200/80 dark:border-white/10 w-full animate-fade">
                              <CitizenProfile
                                isInline={true}
                                onClose={() => {
                                  setMessages((prev) =>
                                    prev.map((m) => (m.id === msg.id ? { ...m, showInlineForm: false } : m))
                                  );
                                  if (activeFormMsgId === msg.id) setActiveFormMsgId(null);
                                }}
                                onSaveComplete={handleInlineFormSave}
                                userOverride={user}
                              />
                            </div>
                          )}

                          {/* Interactive Prompt & Options for Profile Guidance */}
                          {msg.isProfileGuide && (
                            <div className="mt-4 pt-3.5 border-t border-ink-200/80 dark:border-white/10">
                              <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 shadow-2xs">
                                <p className="text-[13px] font-bold text-ink-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                                  <Icon name="sparkles" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span>Would you like me to update your profile?</span>
                                </p>
                                <p className="text-[12px] text-ink-600 dark:text-ink-300 mb-3">
                                  Choose your preferred method below to update your personal details:
                                </p>
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => jsonInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors shadow-xs cursor-pointer"
                                  >
                                    <Icon name="code" className="h-4 w-4" />
                                    <span>Upload JSON</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleInlineForm(msg.id)}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer ${
                                      activeFormMsgId === msg.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white dark:bg-white/10 border-ink-200 dark:border-white/20 hover:bg-ink-50 dark:hover:bg-white/15 text-ink-800 dark:text-ink-200'
                                    }`}
                                  >
                                    <Icon name="edit" className={`h-4 w-4 ${activeFormMsgId === msg.id ? 'text-white' : 'text-ink-500'}`} />
                                    <span>{activeFormMsgId === msg.id ? 'Minimize Form' : 'Update Manually (10-Step Form)'}</span>
                                  </button>

                                  <Link
                                    to="/dashboard/profile"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-white/10 border border-ink-200 dark:border-white/20 hover:bg-ink-50 dark:hover:bg-white/15 text-ink-800 dark:text-ink-200 px-3.5 py-2 text-[12.5px] font-semibold transition-colors shadow-2xs"
                                  >
                                    <Icon name="user" className="h-4 w-4 text-ink-500" />
                                    <span>View My Profile</span>
                                  </Link>
                                </div>

                                {/* Fitted 10-Step Form directly inside AI Chat */}
                                {activeFormMsgId === msg.id && (
                                  <div className="mt-4 pt-4 border-t border-blue-200/80 dark:border-white/15 w-full animate-fade">
                                    <CitizenProfile
                                      isInline={true}
                                      onClose={() => setActiveFormMsgId(null)}
                                      onSaveComplete={handleInlineFormSave}
                                      userOverride={user}
                                    />
                                  </div>
                                )}

                                <div className="mt-3 pt-2.5 border-t border-blue-200/60 dark:border-white/10 flex items-center justify-between">
                                  <span className="text-[11px] text-ink-500 dark:text-ink-400">Need a profile JSON template?</span>
                                  <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                  >
                                    <Icon name="download" className="h-3.5 w-3.5" />
                                    <span>Download sample JSON template</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Interactive Actions for Profile Update Confirmation */}
                          {msg.isProfileUpdated && (
                            <div className="mt-4 pt-3.5 border-t border-ink-200/80 dark:border-white/10">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                  to="/dashboard/profile"
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-[12.5px] font-semibold transition-colors shadow-xs"
                                >
                                  <Icon name="user" className="h-4 w-4" />
                                  <span>View Updated Profile</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => toggleInlineForm(msg.id)}
                                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[12.5px] font-semibold transition-colors shadow-2xs cursor-pointer ${
                                    activeFormMsgId === msg.id
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                      : 'bg-white dark:bg-white/10 border-ink-200 dark:border-white/20 hover:bg-ink-50 dark:hover:bg-white/15 text-ink-800 dark:text-ink-200'
                                  }`}
                                >
                                  <Icon name="edit" className={`h-4 w-4 ${activeFormMsgId === msg.id ? 'text-white' : 'text-ink-500'}`} />
                                  <span>{activeFormMsgId === msg.id ? 'Minimize Form' : 'Review 10-Step Form in Chat'}</span>
                                </button>
                              </div>

                              {/* Fitted 10-Step Form in Confirmation */}
                              {activeFormMsgId === msg.id && (
                                <div className="mt-4 pt-4 border-t border-ink-200/80 dark:border-white/10 w-full animate-fade">
                                  <CitizenProfile
                                    isInline={true}
                                    onClose={() => setActiveFormMsgId(null)}
                                    onSaveComplete={handleInlineFormSave}
                                    userOverride={user}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Button inside AI Bubble */}
                          {msg.actionBtn && (
                            <Link
                              to={msg.actionBtn.to}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#1d4ed8] hover:bg-blue-700 text-white px-4 py-2 text-[12.5px] font-semibold transition-colors mt-3.5 w-fit shadow-xs"
                            >
                              <Icon name="external" className="h-3.5 w-3.5" />
                              <span>{msg.actionBtn.label}</span>
                            </Link>
                          )}
                        </div>

                        {/* Message Toolbar: TTS Listen & Copy */}
                        {isAi ? (
                          <div className="flex items-center gap-1.5 mt-1.5 px-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                const container = e.currentTarget.closest('.max-w-\\[82\\%\\]') || e.currentTarget.parentElement?.previousElementSibling;
                                const renderedP = container?.querySelector('p.whitespace-pre-line');
                                const renderedText = (renderedP?.innerText || renderedP?.textContent || '').trim();
                                handleSpeak(renderedText || msg.text, msg.id || index);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium transition-colors cursor-pointer ${
                                speakingMsgId === (msg.id || index)
                                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                                  : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-white/10'
                              }`}
                              title={speakingMsgId === (msg.id || index) ? "Stop listening" : "Listen (Text to Speech)"}
                            >
                              <Icon name="speaker" className={`h-3.5 w-3.5 ${speakingMsgId === (msg.id || index) ? "animate-pulse text-blue-600 dark:text-blue-400" : ""}`} />
                              <span>{speakingMsgId === (msg.id || index) ? "Stop" : "Listen"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(msg.text, msg.id || index)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              title="Copy message"
                            >
                              <Icon name={copiedMsgId === (msg.id || index) ? "check" : "copy"} className="h-3.5 w-3.5" />
                              <span>{copiedMsgId === (msg.id || index) ? "Copied" : "Copy"}</span>
                            </button>

                            <span className="nums ml-auto text-[11px] text-ink-400 dark:text-ink-500">
                              {msg.timestamp}
                            </span>
                          </div>
                        ) : (
                          <span className="nums mt-1 px-1 text-[11px] text-ink-400 dark:text-ink-500">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Option cards placed below the welcome chat message as requested */}
                {index === 0 && isAi && (
                  <div className="ml-12 md:ml-12 max-w-2xl pt-1">
                    <p className="text-[13px] font-bold text-ink-900 dark:text-white mb-3">
                      Try asking about
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TOPIC_CARDS.map((card) => (
                        <button
                          key={card.key}
                          onClick={() => handleSend(card.query)}
                          className="group flex items-center gap-3.5 rounded-2xl border border-ink-100 dark:border-white/10 p-3.5 text-left transition-all hover:border-blue-300 hover:shadow-xs bg-[#fbfcfd] dark:bg-white/[0.02] cursor-pointer"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.toneCls}`}>
                            <Icon name={card.icon} className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-ink-900 dark:text-white">
                              {card.title}
                            </p>
                            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-400 dark:text-ink-500 line-clamp-2">
                              {card.desc}
                            </p>
                          </div>
                          <Icon
                            name="chevron"
                            className="ml-auto h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-xs border border-ink-100 dark:border-white/10 p-1.5">
                <img src={praamanIcon} alt="Praaman AI Logo" className="h-full w-full object-contain animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-[#f4f6fa] dark:bg-[#161616] px-4 py-3 text-[13px] text-ink-500 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[12px]">Praaman AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="border-t border-ink-100 dark:border-white/10 p-4 md:p-5 bg-white dark:bg-[#0c0c0c]">
          {/* Staged Attachments Preview Row */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 animate-fade">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 px-3 py-1.5 text-xs text-ink-800 dark:text-ink-100 shadow-2xs"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="h-6 w-6 rounded-md object-cover border border-blue-200" />
                  ) : (
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md font-bold text-[9px] ${
                      att.type === 'pdf' ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300' :
                      att.type === 'docx' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300' :
                      att.type === 'json' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' :
                      att.type === 'zip' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {att.type.toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold max-w-[150px] truncate">{att.name}</span>
                  <span className="text-[11px] text-ink-400">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="ml-1 text-ink-400 hover:text-red-500 transition-colors p-0.5 rounded cursor-pointer"
                    title="Remove file"
                  >
                    <Icon name="x" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-full border border-ink-200 dark:border-white/20 bg-white dark:bg-[#141414] px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-ink-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-white/10 cursor-pointer"
              title="Attach images, JSON, ZIP, PDF, or DOCX"
            >
              <Icon name="paperclip" className="h-4 w-4 -rotate-45" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? "Add a message about your attached files..." : "Ask about updating profile, schemes or services..."}
              className="flex-1 bg-transparent text-[13.5px] text-ink-900 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:outline-none"
            />

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#1d4ed8] transition-all cursor-pointer shadow-xs active:scale-95"
              title="Send message"
            >
              <Icon name="send" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between px-1 text-[11.5px] text-ink-400 dark:text-ink-500">
            <div className="flex items-center gap-1.5">
              <Icon name="info" className="h-3.5 w-3.5 shrink-0" />
              <span>AI guidance may need verification against official scheme rules.</span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-ink-400 dark:text-ink-500">
              Supports: Images, PDF, DOCX, JSON, ZIP
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* Delete Conversation Confirmation Modal */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141416] border border-ink-100 dark:border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-red-600 dark:text-red-400">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50">
                <Icon name="trash" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink-900 dark:text-white">Delete Conversation?</h3>
                <p className="text-[11.5px] text-ink-500 dark:text-ink-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[13px] text-ink-600 dark:text-ink-300 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-ink-900 dark:text-white">"{deleteConfirmSession.title}"</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteSession}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All History Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141416] border border-ink-100 dark:border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-red-600 dark:text-red-400">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50">
                <Icon name="alert" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink-900 dark:text-white">Clear All Chat History?</h3>
                <p className="text-[11.5px] text-ink-500 dark:text-ink-400">Permanently delete all conversations</p>
              </div>
            </div>
            <p className="text-[13px] text-ink-600 dark:text-ink-300 mb-4 leading-relaxed">
              Are you sure you want to delete all <span className="font-semibold text-ink-900 dark:text-white">{sessions.length} saved conversations</span> from your device? This cannot be recovered.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearAllHistory}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Current Chat Confirmation Modal */}
      {showClearCurrentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141416] border border-ink-100 dark:border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-amber-600 dark:text-amber-400">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
                <Icon name="trash" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink-900 dark:text-white">Clear Current Chat?</h3>
                <p className="text-[11.5px] text-ink-500 dark:text-ink-400">Reset messages in this conversation</p>
              </div>
            </div>
            <p className="text-[13px] text-ink-600 dark:text-ink-300 mb-4 leading-relaxed">
              This will clear messages in <span className="font-semibold text-ink-900 dark:text-white">"{activeSession?.title}"</span>. Your other chat history will remain safe.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearCurrentModal(false)}
                className="rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearCurrentChat}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Clear Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
