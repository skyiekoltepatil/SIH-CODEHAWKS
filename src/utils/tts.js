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
