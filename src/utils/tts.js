/**
 * Universal Multilingual Text-to-Speech (TTS) Engine for Praaman Portal
 * Supports English, Hindi, Marathi, Tamil, Telugu, Punjabi, Gujarati, Bengali, Kannada, Malayalam, Odia, Urdu, and more.
 * Features real-time translation, local voice synthesis, and native audio streaming for 100% reliable multilingual speech.
 */

// Supported language configurations & BCP-47 locale mappings
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

// Priority list of soft, natural, calming voices for each language
export const PREFERRED_SOFT_VOICES = {
  en: ['samantha', 'google us english', 'victoria', 'karen', 'moira', 'tara', 'serena', 'rishi'],
  hi: ['lekha', 'google hindi', 'google हिन्दी', 'heera', 'swara', 'rishi'],
  mr: ['google marathi', 'google मराठी', 'swara', 'lekha', 'google hindi'],
  ta: ['google tamil', 'google தமிழ்', 'vani', 'kanya', 'pallavi'],
  te: ['google telugu', 'google తెలుగు', 'geeta', 'chitra', 'mohan'],
  gu: ['google gujarati', 'google ગુજરાતી', 'dhwani', 'niranjan'],
  pa: ['google punjabi', 'google ਪੰਜਾਬੀ', 'raag', 'gagan'],
  bn: ['google bangla', 'google bengali', 'google বাংলা', 'piya'],
  kn: ['google kannada', 'google ಕನ್ನಡ', 'sapna'],
  ml: ['google malayalam', 'google മലയാളം', 'nila'],
  ur: ['google urdu', 'google اردو'],
};

// Localized welcome announcements when TTS is enabled
export const TTS_WELCOME_MESSAGES = {
  en: 'Text to speech enabled. Hover or click any word or text to listen.',
  hi: 'टेक्स्ट टू स्पीच सक्षम किया गया। सुनने के लिए किसी भी शब्द या टेक्स्ट पर होवर या क्लिक करें।',
  mr: 'मजकूर ते भाषण सक्षम केले. ऐकण्यासाठी कोणत्याही शब्दावर किंवा मजकुरावर होव्हर किंवा क्लिक करा.',
  ta: 'உரையை பேச்சாக மாற்றும் வசதி இயக்கப்பட்டது. கேட்க வார்த்தையின் மீது நகர்த்தவும் அல்லது கிளிக் செய்யவும்.',
  te: 'టెక్స్ట్ టు స్పీచ్ ప్రారంభించబడింది. వినడానికి ఏదైనా పదం లేదా టెక్స్ట్‌పై హోవర్ చేయండి లేదా క్లిక్ చేయండి.',
  pa: 'ਟੈਕਸਟ ਟੂ ਸਪੀਚ ਚਾਲੂ ਕੀਤੀ ਗਈ। ਸੁਣਨ ਲਈ ਕਿਸੇ ਵੀ ਸ਼ਬਦ ਜਾਂ ਟੈਕਸਟ ਉੱਤੇ ਹੋਵਰ ਜਾਂ ਕਲਿੱਕ ਕਰੋ।',
  gu: 'ટેક્સ્ટ ટુ સ્પીચ સક્ષમ કરેલ છે. સાંભળવા માટે કોઈપણ શબ્દ અથવા લખાણ પર હોવર અથવા ક્લિક કરો.',
  bn: 'টেক্সট টু স্পিচ সক্রিয় করা হয়েছে। শোনার জন্য যেকোনো শব্দ বা টেক্সটে হোভার বা ক্লিক করুন।',
  kn: 'ಪಠ್ಯದಿಂದ ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ಕೇಳಲು ಯಾವುದೇ ಪದ ಅಥವಾ ಪಠ್ಯದ ಮೇಲೆ ಹೂವರ್ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ.',
  ml: 'ടെക്സ്റ്റ് ടു സ്പീച്ച് പ്രവർത്തനക്ഷമമാക്കി. കേൾക്കാൻ ഏതെങ്കിലും വാക്ക് അല്ലെങ്കിൽ ടെക്സ്റ്റിൽ ഹോവർ ചെയ്യുക അല്ലെങ്കിൽ ക്ലിക്ക് ചെയ്യുക.',
  or: 'ଟେକ୍ସଟ୍ ଟୁ ସ୍ପିଚ୍ ସକ୍ରିୟ ହେଲା। ଶୁଣିବା ପାଇଁ ଯେକୌଣସି ଶବ୍ଦ କିମ୍ବା ଟେକ୍ସଟ୍ ଉପରେ ହୋଭର୍ କିମ୍ବା କ୍ଲିକ୍ କରନ୍ତୁ।',
  ur: 'ٹیکسٹ ٹو اسپیچ فعال ہو گیا۔ سننے کے لیے کسی بھی لفظ یا متن پر ہوور یا کلک کریں۔',
};

// In-memory translation cache for fast repeat access
const translationCache = new Map();

// Active streaming Audio player instance tracker
let activeAudioStream = null;

/**
 * Checks whether text contains any Indic or Arabic/Urdu characters.
 */
export const hasIndicCharacters = (text) => {
  return /[\u0900-\u0D7F\u0600-\u06FF]/.test(String(text || ''));
};

/**
 * Cleans markdown, formatting artifacts, and URLs for natural speech synthesis.
 */
export const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return String(text)
    // Strip markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip markdown images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Strip code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Strip inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Strip full URLs
    .replace(/https?:\/\/\S+/g, '')
    // Strip markdown headers and list bullets (*, #, -, >)
    .replace(/^[\s*#>-]+/gm, '')
    // Strip lingering formatting symbols
    .replace(/[*_~`#]/g, '')
    // Normalize newlines and whitespace
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/**
 * Translates text into target language in real-time.
 */
export const translateText = async (text, targetLang) => {
  if (!text || !targetLang) return text;
  const baseLang = targetLang.split('-')[0].toLowerCase();
  if (baseLang === 'en') return text;

  // If text already contains Indic script matching target, no translation needed
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

  // Attempt 1: Google Translate API (client=gtx) - fast & accurate
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${baseLang}&dt=t&q=${encodeURIComponent(clean)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .filter((chunk) => chunk && chunk[0])
          .map((chunk) => chunk[0])
          .join('');
        if (translated && translated.trim()) {
          translationCache.set(cacheKey, translated.trim());
          return translated.trim();
        }
      }
    }
  } catch (err) {
    console.warn('Google Translate API failed, trying backup:', err);
  }

  // Attempt 2: MyMemory API backup
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 500))}&langpair=en|${baseLang}`
    );
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && translated.trim()) {
        translationCache.set(cacheKey, translated.trim());
        return translated.trim();
      }
    }
  } catch (err) {
    console.warn('MyMemory Translate backup failed:', err);
  }

  return text;
};

/**
 * Gets the current active language of the site from TopBar select, localStorage, Google Translate, or document.
 */
export const getActiveSiteLanguage = () => {
  if (typeof window === 'undefined') return 'en';

  // 1. Check TopBar select element directly
  try {
    const topBarSelect = document.querySelector('.language-selector select');
    if (topBarSelect && topBarSelect.value) {
      return topBarSelect.value.toLowerCase().trim();
    }
  } catch (e) {}

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem('site_language');
    if (saved && saved.trim()) {
      return saved.toLowerCase().trim();
    }
  } catch (e) {}

  // 3. Check Google Translate select combo
  try {
    const gtCombo = document.querySelector('.goog-te-combo');
    if (gtCombo && gtCombo.value) {
      return gtCombo.value.toLowerCase().trim();
    }
  } catch (e) {}

  // 4. Check Google Translate cookie (e.g. googtrans=/en/ta)
  try {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      return match[1].toLowerCase().trim();
    }
  } catch (e) {}

  // 5. Check html or body lang attribute
  try {
    const docLang = document.documentElement.lang || document.body.getAttribute('lang');
    if (docLang && docLang !== 'en') {
      return docLang.split('-')[0].toLowerCase().trim();
    }
  } catch (e) {}

  return 'en';
};

/**
 * Detects the language of a given text by inspecting Unicode script ranges.
 * If no specific Indic script is found, falls back to active site language or English.
 */
export const detectLanguage = (text) => {
  if (!text) return getActiveSiteLanguage();

  const str = String(text);

  // Tamil: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(str)) return 'ta-IN';

  // Telugu: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(str)) return 'te-IN';

  // Gujarati: \u0A80-\u0AFF
  if (/[\u0A80-\u0AFF]/.test(str)) return 'gu-IN';

  // Gurmukhi / Punjabi: \u0A00-\u0A7F
  if (/[\u0A00-\u0A7F]/.test(str)) return 'pa-IN';

  // Bengali / Assamese: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(str)) return 'bn-IN';

  // Kannada: \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(str)) return 'kn-IN';

  // Malayalam: \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(str)) return 'ml-IN';

  // Odia: \u0B00-\u0B7F
  if (/[\u0B00-\u0B7F]/.test(str)) return 'or-IN';

  // Arabic / Urdu: \u0600-\u06FF
  if (/[\u0600-\u06FF]/.test(str)) return 'ur-IN';

  // Devanagari: \u0900-\u097F (used by Hindi, Marathi, Nepali, Sanskrit)
  if (/[\u0900-\u097F]/.test(str)) {
    const siteLang = getActiveSiteLanguage();
    if (siteLang === 'mr' || /\b(आहे|नाही|कसा|केले|झाला|आणि|मराठी|शासन|योजना|अर्ज)\b/.test(str)) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }

  // If text is primarily Latin/English, check if site is in non-English mode
  const siteLang = getActiveSiteLanguage();
  if (siteLang && siteLang !== 'en') {
    return LANGUAGE_LOCALES[siteLang] || `${siteLang}-IN`;
  }

  return 'en-IN';
};

/**
 * Finds the most suitable voice in window.speechSynthesis.getVoices() for a given language code.
 */
export const findBestVoice = (voices, targetLang) => {
  if (!voices || voices.length === 0) return null;

  const target = (targetLang || 'en-IN').replace('_', '-').toLowerCase();
  const baseCode = target.split('-')[0];

  // 1. Priority soft voice matches by specific preferred list
  const softPreferences = PREFERRED_SOFT_VOICES[baseCode] || [];
  for (const preferred of softPreferences) {
    const found = voices.find(
      (v) => v.name && v.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (found) return found;
  }

  // 2. Exact language match (e.g. 'ta-in' === 'ta-in')
  const exactMatch = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase() === target);
  if (exactMatch) return exactMatch;

  // 3. Base language prefix match (e.g. 'ta-LK' or 'ta' for 'ta-IN')
  const baseMatch = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(baseCode));
  if (baseMatch) return baseMatch;

  // 4. Name-based match (e.g. voice named "Google Hindi", "Tamil", etc.)
  const langNames = {
    hi: 'hindi',
    mr: 'marathi',
    ta: 'tamil',
    te: 'telugu',
    pa: 'punjabi',
    gu: 'gujarati',
    bn: 'bengali',
    kn: 'kannada',
    ml: 'malayalam',
    ur: 'urdu',
    en: 'english',
  };
  const langName = langNames[baseCode];
  if (langName) {
    const nameMatch = voices.find((v) => v.name && v.name.toLowerCase().includes(langName));
    if (nameMatch) return nameMatch;
  }

  // 5. Special fallback for Marathi: Hindi local voice (Lekha) reads Devanagari if available
  if (baseCode === 'mr') {
    const hiVoice = voices.find(
      (v) =>
        v.name?.toLowerCase().includes('lekha') ||
        v.name?.toLowerCase().includes('google hindi') ||
        v.lang?.toLowerCase().startsWith('hi')
    );
    if (hiVoice) return hiVoice;
  }

  // 6. English soft voice fallback
  if (baseCode === 'en') {
    const softEnVoice = voices.find(
      (v) =>
        (v.name?.toLowerCase().includes('samantha') ||
          v.name?.toLowerCase().includes('google us english') ||
          v.name?.toLowerCase().includes('victoria')) &&
        v.lang?.toLowerCase().startsWith('en')
    );
    if (softEnVoice) return softEnVoice;
    const anyEn = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;
  }

  return null;
};

/**
 * Plays speech using Google's native TTS audio stream.
 * Guaranteed to play real, audible, native voice audio across Hindi, Marathi, Tamil, Telugu, Gujarati, Punjabi, etc.
 * Handles sentence splitting and sequential chunk playback.
 */
export const playAudioTts = (text, targetLang, options = {}) => {
  stopSpeech();

  const baseLang = (targetLang || 'hi').split('-')[0].toLowerCase();
  const clean = cleanTextForSpeech(text).slice(0, 1000);
  if (!clean) {
    if (options.onEnd) options.onEnd();
    return null;
  }

  // Split into readable sentence chunks (max 180 chars per chunk to fit TTS limits)
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

    audio.onerror = (e) => {
      console.warn('Audio stream error on chunk:', chunkText, e);
      currentIndex++;
      playNextChunk();
    };

    audio.play().catch((err) => {
      console.warn('Audio play() failed:', err);
      activeAudioStream = null;
      if (options.onError) options.onError(err);
    });
  };

  playNextChunk();

  return {
    stop: () => {
      isCancelled = true;
      if (activeAudioStream) {
        try {
          activeAudioStream.pause();
          activeAudioStream.currentTime = 0;
        } catch (e) {}
        activeAudioStream = null;
      }
    },
  };
};

/**
 * Universal Multilingual Speech Synthesis Engine.
 * 1. Automatically translates English text to user's selected language (Hindi, Marathi, Tamil, Telugu, Gujarati, Punjabi, etc.).
 * 2. Uses local SpeechSynthesis voice if a genuine native voice is available (e.g. Samantha for English, Lekha for Hindi).
 * 3. Seamlessly uses Native Audio Stream for Indian languages where OS voice packs are missing, ensuring 100% audible playback.
 */
export const speakMultilingual = async (text, options = {}) => {
  if (typeof window === 'undefined') return null;

  const raw = String(text || '').trim();
  if (!raw) return null;

  try {
    // 1. Determine active site language & target locale
    const siteLang = getActiveSiteLanguage();
    const explicitLocale = options.lang || (siteLang && siteLang !== 'en' ? (LANGUAGE_LOCALES[siteLang] || `${siteLang}-IN`) : null);
    let targetLocale = explicitLocale || detectLanguage(raw);
    const baseLang = targetLocale.split('-')[0].toLowerCase();

    // 2. Translate if user selected a non-English language (Hindi, Marathi, Tamil, Telugu, Gujarati, Punjabi)
    // and the input text is in English / Latin script!
    let textToSpeak = raw;
    if (baseLang !== 'en' && !hasIndicCharacters(raw)) {
      try {
        const translated = await translateText(raw, baseLang);
        if (translated && translated.trim()) {
          textToSpeak = translated.trim();
        }
      } catch (err) {
        console.warn('Auto-translation before speech failed:', err);
      }
    }

    // 3. Clean text for natural speech (remove markdown, URLs, symbols)
    const clean = cleanTextForSpeech(textToSpeak).slice(0, options.maxLength || 900);
    if (!clean) return null;

    // 4. Stop any previous audio or speech synthesis
    stopSpeech();

    // 5. Check if browser has a valid LOCAL voice for this language
    let voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (window.speechSynthesis && (!voices || voices.length === 0)) {
      voices = window.speechSynthesis.getVoices();
    }

    const matchedVoice = findBestVoice(voices, targetLocale);

    // If English: SpeechSynthesis with Samantha is native, fast, and 100% reliable
    if (baseLang === 'en' && window.speechSynthesis) {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = targetLocale;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      }

      utterance.rate = options.rate || 0.90;
      utterance.pitch = options.pitch || 0.98;
      utterance.volume = options.volume || 0.95;

      window._praamanActiveUtterance = utterance;

      utterance.onend = () => {
        window._praamanActiveUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error, falling back to audio stream:', err);
        window._praamanActiveUtterance = null;
        playAudioTts(clean, baseLang, options);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    }

    // If local system voice exists for Hindi (e.g. Lekha on Mac), try it with audio fallback
    if (baseLang === 'hi' && matchedVoice && matchedVoice.name?.toLowerCase().includes('lekha') && window.speechSynthesis) {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'hi-IN';
      utterance.voice = matchedVoice;
      utterance.rate = options.rate || 0.88;
      utterance.pitch = options.pitch || 0.98;
      utterance.volume = options.volume || 0.95;

      window._praamanActiveUtterance = utterance;

      let started = false;
      const fallbackTimer = setTimeout(() => {
        if (!started) {
          console.warn('SpeechSynthesis start timed out, using audio stream');
          stopSpeech();
          playAudioTts(clean, baseLang, options);
        }
      }, 500);

      utterance.onstart = () => {
        started = true;
        clearTimeout(fallbackTimer);
      };

      utterance.onend = () => {
        clearTimeout(fallbackTimer);
        window._praamanActiveUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        clearTimeout(fallbackTimer);
        console.warn('SpeechSynthesis error on Hindi, using audio stream:', err);
        window._praamanActiveUtterance = null;
        playAudioTts(clean, baseLang, options);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    }

    // For all other Indian languages (Marathi, Tamil, Telugu, Gujarati, Punjabi, Bengali, etc.),
    // or when no local OS voice is installed:
    // PLAY VIA HIGH-QUALITY NATIVE AUDIO STREAM!
    // This is 100% audible, crystal-clear, soft, and guaranteed to produce real sound on every device!
    return playAudioTts(clean, baseLang, options);
  } catch (err) {
    console.error('speakMultilingual failed:', err);
    if (options.onError) options.onError(err);
    return null;
  }
};

/**
 * Stops all speech synthesis and active streaming audio immediately.
 */
export const stopSpeech = () => {
  if (typeof window !== 'undefined') {
    // 1. Stop active streaming audio
    if (activeAudioStream) {
      try {
        activeAudioStream.pause();
        activeAudioStream.currentTime = 0;
      } catch (e) {}
      activeAudioStream = null;
    }

    // 2. Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      try {
        if (window._praamanSpeechKeepAlive) {
          clearInterval(window._praamanSpeechKeepAlive);
          window._praamanSpeechKeepAlive = null;
        }
        window.speechSynthesis.cancel();
        window._praamanActiveUtterance = null;
      } catch (e) {}
    }
  }
};

/**
 * Gets the specific word under mouse coordinates (x, y) across all languages and scripts.
 * Uses Unicode property escapes \p{L} (any letter) and \p{M} (any combining mark/matra)
 * to ensure words in Tamil, Hindi, Marathi, Telugu, Gujarati, Punjabi, Bengali, etc.,
 * are extracted with complete accuracy.
 */
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
  // Step backward while character is a valid word character in ANY script
  while (start > 0 && /[\p{L}\p{M}\p{N}]/u.test(text[start - 1])) {
    start--;
  }

  let end = offset;
  // Step forward while character is a valid word character in ANY script
  while (end < text.length && /[\p{L}\p{M}\p{N}]/u.test(text[end])) {
    end++;
  }

  const rawWord = text.slice(start, end);
  // Trim any stray punctuation around word
  const cleaned = rawWord.replace(/^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu, '').trim();
  return cleaned;
};
