export const LANGUAGE_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  pa: 'pa-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  ur: 'ur-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
};

export const hasIndicCharacters = (text) => {
  return /[\u0900-\u0D7F\u0600-\u06FF]/.test(String(text || ''));
};

export const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^[\s*#>-]+/gm, '')
    .replace(/[*_~`#]/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const getActiveSiteLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const topBarSelect = document.querySelector('.language-selector select');
    if (topBarSelect && topBarSelect.value) {
      return topBarSelect.value.toLowerCase().trim();
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem('site_language');
    if (saved && saved.trim()) return saved.toLowerCase().trim();
  } catch (e) {}
  return 'en';
};

export const detectLanguage = (text) => {
  if (!text) return getActiveSiteLanguage();
  const str = String(text);
  if (/[\u0B80-\u0BFF]/.test(str)) return 'ta-IN';
  if (/[\u0C00-\u0C7F]/.test(str)) return 'te-IN';
  if (/[\u0A80-\u0AFF]/.test(str)) return 'gu-IN';
  if (/[\u0A00-\u0A7F]/.test(str)) return 'pa-IN';
  if (/[\u0980-\u09FF]/.test(str)) return 'bn-IN';
  if (/[\u0C80-\u0CFF]/.test(str)) return 'kn-IN';
  if (/[\u0D00-\u0D7F]/.test(str)) return 'ml-IN';
  if (/[\u0B00-\u0B7F]/.test(str)) return 'or-IN';
  if (/[\u0600-\u06FF]/.test(str)) return 'ur-IN';
  if (/[\u0900-\u097F]/.test(str)) {
    const siteLang = getActiveSiteLanguage();
    if (siteLang === 'mr' || /\b(आहे|नाही|कसा|केले|झाला|आणि|मराठी|शासन|योजना|अर्ज)\b/.test(str)) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }
  const siteLang = getActiveSiteLanguage();
  if (siteLang && siteLang !== 'en') {
    return LANGUAGE_LOCALES[siteLang] || `${siteLang}-IN`;
  }
  return 'en-IN';
};

const translationCache = new Map();

export const translateText = async (text, targetLang) => {
  if (!text || !targetLang) return text;
  const baseLang = targetLang.split('-')[0].toLowerCase();
  if (baseLang === 'en') return text;

  if (hasIndicCharacters(text)) {
    const detected = detectLanguage(text);
    if (detected.startsWith(baseLang)) return text;
  }

  const clean = cleanTextForSpeech(text).slice(0, 1000);
  if (!clean) return text;

  const cacheKey = `${baseLang}:${clean}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${baseLang}&dt=t&q=${encodeURIComponent(clean)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].filter((c) => c && c[0]).map((c) => c[0]).join('');
        if (translated && translated.trim()) {
          translationCache.set(cacheKey, translated.trim());
          return translated.trim();
        }
      }
    }
  } catch (err) {}

  return text;
};

export const PREFERRED_SOFT_VOICES = {
  en: ['samantha', 'google us english', 'victoria', 'karen', 'moira', 'tara', 'serena', 'rishi'],
  hi: ['lekha', 'google hindi', 'google हिन्दी', 'heera', 'swara', 'rishi'],
  mr: ['google marathi', 'google मराठी', 'swara', 'lekha', 'google hindi'],
  ta: ['google tamil', 'google தமிழ்', 'vani', 'kanya', 'pallavi'],
  te: ['google telugu', 'google తెలుగు', 'geeta', 'chitra', 'mohan'],
  gu: ['google gujarati', 'google ગુજરાતી', 'dhwani', 'niranjan'],
  pa: ['google punjabi', 'google ਪੰਜਾਬੀ', 'raag', 'gagan'],
  bn: ['google bangla', 'google bengali', 'google বাংলা', 'piya'],
};

export const findBestVoice = (voices, targetLang) => {
  if (!voices || voices.length === 0) return null;
  const target = (targetLang || 'en-IN').replace('_', '-').toLowerCase();
  const baseCode = target.split('-')[0];
  const softPreferences = PREFERRED_SOFT_VOICES[baseCode] || [];
  for (const preferred of softPreferences) {
    const found = voices.find((v) => v.name && v.name.toLowerCase().includes(preferred.toLowerCase()));
    if (found) return found;
  }
  const exactMatch = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase() === target);
  if (exactMatch) return exactMatch;
  const baseMatch = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(baseCode));
  if (baseMatch) return baseMatch;
  return null;
};

let activeAudioStream = null;

export const playAudioTts = (text, targetLang, options = {}) => {
  stopSpeech();
  const baseLang = (targetLang || 'hi').split('-')[0].toLowerCase();
  const clean = cleanTextForSpeech(text).slice(0, 1000);
  if (!clean) {
    if (options.onEnd) options.onEnd();
    return null;
  }
  const rawSentences = clean.split(/(?<=[.?!।\n])\s+/).filter(Boolean);
  const chunks = [];
  for (const s of rawSentences) {
    if (s.length <= 180) {
      chunks.push(s);
    } else {
      const words = s.split(/\s+/);
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= 180) {
          cur = (cur + ' ' + w).trim();
        } else {
          if (cur) chunks.push(cur);
          cur = w;
        }
      }
      if (cur) chunks.push(cur);
    }
  }
  if (chunks.length === 0) chunks.push(clean.slice(0, 180));
  let currentIndex = 0;
  let isCancelled = false;

  const playNextChunk = () => {
    if (isCancelled || currentIndex >= chunks.length) {
      activeAudioStream = null;
      if (options.onEnd) options.onEnd();
      return;
    }
    const chunkText = chunks[currentIndex];
    const encoded = encodeURIComponent(chunkText);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${baseLang}&client=tw-ob&q=${encoded}`;
    const audio = new Audio(audioUrl);
    activeAudioStream = audio;
    audio.playbackRate = options.rate || 0.95;
    audio.volume = options.volume || 0.95;
    audio.onended = () => {
      currentIndex++;
      playNextChunk();
    };
    audio.onerror = () => {
      currentIndex++;
      playNextChunk();
    };
    audio.play().catch((err) => {
      activeAudioStream = null;
      if (options.onError) options.onError(err);
    });
  };
  playNextChunk();
  return {
    stop: () => {
      isCancelled = true;
      if (activeAudioStream) {
        try { activeAudioStream.pause(); activeAudioStream.currentTime = 0; } catch (e) {}
        activeAudioStream = null;
      }
    }
  };
};

export const getWordAtCoordinates = (x, y) => {
  if (typeof document === 'undefined') return '';
  let range = null;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }
  if (!range) return '';
  const node = range.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE) return '';
  const text = node.textContent || '';
  const offset = range.startOffset;
  let start = offset;
  while (start > 0 && /[\p{L}\p{M}\p{N}]/u.test(text[start - 1])) start--;
  let end = offset;
  while (end < text.length && /[\p{L}\p{M}\p{N}]/u.test(text[end])) end++;
  const rawWord = text.slice(start, end);
  return rawWord.replace(/^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu, '').trim();
};
