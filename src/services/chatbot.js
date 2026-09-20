import { schemesData, applicationsData } from '../data';

// ===========================================================================
// 0. HELPERS
// ===========================================================================

function trimLower(s) {
  return (s || '').trim().toLowerCase();
}

function hasAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w.toLowerCase()));
}

const SCHEME_BY_ID = Object.fromEntries(schemesData.map((s) => [s.id, s]));

// ===========================================================================
// 1. LANGUAGE DETECTION
// ===========================================================================

const SCRIPT_MAP = {
  hi: /[\u0900-\u097F]/, // Devanagari (Hindi & Marathi share this)
  mr: /[\u0900-\u097F]/,
  ta: /[\u0B80-\u0BFF]/,
  te: /[\u0C00-\u0C7F]/,
  pa: /[\u0A00-\u0A7F]/,
  gu: /[\u0A80-\u0AFF]/,
};

function detectScript(text) {
  if (!text) return null;
  for (const [lang, re] of Object.entries(SCRIPT_MAP)) {
    if (re.test(text)) return lang;
  }
  return null;
}

export function detectLanguage(msg) {
  const raw = (msg || '').trim();
  if (!raw) return 'en';

  // explicit language name mentions
  if (/हिन्दी|hindi|हिंदी/i.test(raw)) return 'hi';
  if (/मराठी|marathi|मराठी/i.test(raw)) return 'mr';
  if (/தமிழ்|tamil/i.test(raw)) return 'ta';
  if (/తెలుగు|telugu/i.test(raw)) return 'te';
  if (/ਪੰਜਾਬੀ|punjabi/i.test(raw)) return 'pa';
  if (/ગુજરાતી|gujarati/i.test(raw)) return 'gu';

  // script detection — Devanagari: guess Hindi unless Marathi markers
  const script = detectScript(raw);
  if (!script) return 'en';
  if (script === 'hi') {
    const mrMarkers = ['हे', 'मदत', 'सकतो', 'तुमच्या', 'आहे', 'नको', 'कधी', 'कुठे', 'सकشی', 'जावयला'];
    const hiMarkers = ['क्या', 'है', 'मैं', 'आप', 'मेरा', 'कहाँ', 'करना', 'करता', 'क्यों', 'क्योंकि'];
    let mr = 0,
      hi = 0;
    for (const w of mrMarkers) if (raw.includes(w)) mr += 2;
    for (const w of hiMarkers) if (raw.includes(w)) hi += 2;
    return mr > hi ? 'mr' : 'hi';
  }
  return script;
}

// ===========================================================================
// 2. TRANSLATION HELPERS
// ===========================================================================

const T = {
  greet: {
    en: "👋 Hello! I'm the SIH CODEHAWKS AI Assistant — I can help with **any problem**.",
    hi: 'नमस्ते! मैं SIH CODEHAWKS AI सहायक हूं — मैं **किसी भी समस्या** में मदद कर सकता हूं।',
    mr: 'नमस्कार! मी SIH CODEHAWKS AI सहायक आहे — मी **कुठल्याही समस्येला** मदत करू शकतो.',
    ta: 'வணக்கம்! நான் SIH CODEHAWKS AI உதவியாளர் — நான் **எந்தவொரு பிரச்சனையிலும்** உதவ முடியும்.',
    te: 'ప్రణామాలు! నేను SIH CODEHAWKS AI సహాయకుడు — నేను **ఏదైనా ఏదైనా సమస్యలో** సహాయం చేయగలను.',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ SIH CODEHAWKS AI ਮਦਦਗਾਰ ਹਾਂ — ਮੈਂ **ਕਿਸੇ ਵੀ ਸਮੱਸਿਆ** ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ.',
    gu: 'નમસ્તે! હું SIH CODEHAWKS AI સહાયક છું — હું **કોઈ પણ સમસ્યા**માં મદદ કરી શકું છું.',
  },
  thanks: {
    en: "You're welcome! Let me know if you need anything else.",
    hi: 'कोई बात नहीं! अगर और कुछ चाहिए तो बताएं।',
    mr: 'कोणतीही बाब नाही! जर आणखी काहीतरी हवे असेल तर सांगा.',
    ta: 'வாங்கள் வணக்கம்! மீண்டும் ஏதேனும் தேவைப்பட்டால் தெரிவிக்கவும்.',
    te: 'మీకు స్వాగతం! మరిన్ని అవసరమైతే తెలియజేయండి.',
    pa: 'ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਵਾਧੂ ਕਿਸੇ ਵੀ ਚੀਜ਼ ਦੀ ਲੋੜ ਹੋਵੇ ਤਾਂ ਦੱਸੋ.',
    gu: 'તમારું સ્વાગત છે! જો વધુ કંઈ જોઈતું હોય તો જણાવો.',
  },
  fallback: {
    en: "I didn't quite understand. Try asking me about: application status, schemes, documents, Aadhaar/PAN verification, login, password, or profile.",
    hi: 'मैं वो नहीं समझ पाया। मुझसे पूछ सकते हैं: ऐप्लिकेशन स्टेटस, स्कीमें, डॉक्यूमेंट्स, आधार/PAN वेरीफिकेशन, लॉगिन, पासवर्ड, या प्रोफ़ाइल।',
    mr: 'मी ते समजल नाही. विचारा: अर्ज स्थिती, योजना, कागदपत्रे, आधार/PAN सत्यापन, लॉगिन, पासवर्ड, किंवा प्रोफ़ाइल.',
    ta: 'நான் புரிந்து கொள்ள முடியவில்லை. கேட்க: அப்ப்லிகேஷன் ஸ்ட்யாட்டஸ், ஸ்கீம்கள், டாக்யுமெண்ட்கள், ஆதார்/PAN வெரிஃபிகేశన், லாகின், கடவுச்சொல், அல்லது புரோபைல்.',
    te: 'నేను అర్థం చేసుకోలేకపోయాను. అడగవచ్చు: అప్లికేషన్ స్థితి, స్కీమ్లు, డాక్యుమెంట్స్, ఆధార్/PAN ధృవీకరణ, లాగిన్, పాస్‌వర్డ్, లేదా ప్రొఫైల్.',
    pa: 'ਮੈਂ ਨਹੀਂ ਸਮਝ ਪਿਆ। ਮੈਂ ਪੁੱਛ ਸਕਦਾ ਹਾਂ: ਐਪਲੀਕੇਸ਼ਨ ਸਥਿਤੀ, ਸਕੀਮਾਂ, ਦਸਤਾਵੇਜ਼, ਆਧਾਰ/PAN ਧ੍ਰੁਵੀਕਰਨ, ਲੌਗਇਨ, ਪਾਸਵਰਡ, ਜਾਂ ਪ੍ਰੋਫਾਈਲ।',
    gu: 'હું સમજતો નથી. પૂછી શકો છો: એપ્લિકેશન સ્થિતિ, સ્કીમ્સ, દસ્તાવેજો, આધાર/PAN ધૃવીકરણ, લોગિન, પાસવર્ડ, કે પ્રોફાઇલ.',
  },
  helpIntro: {
    en: 'Pick a topic below to get started, or just type your question in your own language.',
    hi: 'शुरू करने के लिए नीचे विषय चुनें, या अपनी अपनी भाषा में सवाल लिखें।',
    mr: 'सुरू करण्यासाठी खालील विषय निवडा, किंवा स्वतःच्या भाषेत प्रश्न लिहा.',
    ta: 'தொடங்க கீழே உள்ள விஷயங்களில் இருந்து தேர்ந்தெடுக்கவும், அல்லது உங்கள் மொழியில் கேளுங்கள்.',
    te: 'ప్రారంభించడానికి క్రింద ఉన్న అంశాల్లో ఎంచుకోండి, లేదా మీ భాషలో అడగండి.',
    pa: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਸ਼ਿਆਂ ਵਿੱਚੋਂ ਚੁਣੋ, ਜਾਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ.',
    gu: 'શરૂ કરવા માટે નીચેના વિષયોમાંથી પસંદ કરો, અથવા પોતાની ભાષામાં પ્રશ્ન પૂછો.',
  },
};

function l10n(key, lang) {
  return (T[key] && T[key][lang]) || T[key]?.en || key;
}

// Base suggestion chips (same across languages, translated label)
const BASE_SUGGESTIONS = [
  { label: '🔍 Check my application status', intent: 'check_application_status' },
  { label: '📋 Show all schemes', intent: 'list_schemes' },
  { label: '💰 Tell me about PM-KISAN', intent: 'explain_scheme', schemeId: 'SCH-001' },
  { label: '🏥 Explain Ayushman Bharat', intent: 'explain_scheme', schemeId: 'SCH-002' },
  { label: '🏠 Explain PMAY', intent: 'explain_scheme', schemeId: 'SCH-003' },
  { label: '🆔 How to verify Aadhaar / PAN', intent: 'verify_identity' },
  { label: '📄 Documents needed', intent: 'documents_required' },
  { label: '🔑 Forgot my password', intent: 'password_help' },
  { label: '👤 Complete my profile', intent: 'profile_help' },
  { label: '🔐 Login / account issue', intent: 'login' },
  { label: '💾 Data not saving', intent: 'data_save' },
  { label: '⚠️ Something not working', intent: 'ui_broken' },
  { label: '🌐 Website / internet problem', intent: 'network' },
  { label: '🔢 OTP not receiving', intent: 'otp' },
  { label: '🤔 Am I eligible?', intent: 'eligibility' },
  { label: '💬 Talk to a person', intent: 'contact_person' },
  { label: '❓ I have a different problem', intent: 'open_problem' },
];

function translateChip(label, lang) {
  // simple translation map
  const map = {
    en: label,
    hi: {
      '🔍 Check my application status': '🔍 अपना ऐप्लिकेशन स्टेटस चेक करें',
      '📋 Show all schemes': '📋 सभी स्कीम दिखाएं',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN के बारे में बताएं',
      '🏥 Explain Ayushman Bharat': '🏥 आयुष्मान भारत समझाएं',
      '🏠 Explain PMAY': '🏠 पीएमआवास समझाएं',
      '🆔 How to verify Aadhaar / PAN': '🆔 आधार / PAN कैसे वेरीफाई करें',
      '📄 Documents needed': '📄 आवश्यक दस्तावेज़',
      '🔑 Forgot my password': '🔑 पासवर्ड भूल गए',
      '👤 Complete my profile': '👤 अपनी प्रोफ़ाइल पूरी करें',
      '🔐 Login / account issue': '🔐 लॉगिन / अकाउंट समस्या',
      '💾 Data not saving': '💾 डाटा सेव नहीं हो रहा',
      '⚠️ Something not working': '⚠️ कुछ काम नहीं कर रहा',
      '🌐 Website / internet problem': '🌐 वेबसाइट / इंटरनेट समस्या',
      '🔢 OTP not receiving': '🔢 OTP नहीं मिल रहा',
      '🤔 Am I eligible?': '🤔 क्या मैं योग्य हूँ?',
      '💬 Talk to a person': '💬 इंसान से बात करें',
      '❓ I have a different problem': '❓ कोई और समस्या',
    },
    mr: {
      '🔍 Check my application status': '🔍 तुमचा अर्ज स्थिती तपासा',
      '📋 Show all schemes': '📋 सर्व योजना दाखवा',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN बद्दल सांगा',
      '🏥 Explain Ayushman Bharat': '🏥 आयुष्मान भारत स्पष्ट करा',
      '🏠 Explain PMAY': '🏠 पीएमआवास स्पष्ट करा',
      '🆔 How to verify Aadhaar / PAN': '🆔 आधार / PAN कसे वेरीफाई करावे',
      '📄 Documents needed': '📄 आवश्यक कागदपत्रे',
      '🔑 Forgot my password': '🔑 पासवर्ड विसरलात',
      '👤 Complete my profile': '👤 तुमची प्रोफ़ाइल पूर्ण करा',
      '🔐 Login / account issue': '🔐 लॉगिन / खाते समस्या',
      '💾 Data not saving': '💾 डेटा जतन होत नाही',
      '⚠️ Something not working': '⚠️ काहीतरी काम करत नाही',
      '🌐 Website / internet problem': '🌐 वेबसाइट / इंटरनेट समस्या',
      '🔢 OTP not receiving': '🔢 OTP मिळत नाही',
      '🤔 Am I eligible?': '🤔 मी योग्य आहे का?',
      '💬 Talk to a person': '💬 व्यक्तीशी बोलूया',
      '❓ I have a different problem': '❓ इतर समस्या',
    },
    ta: {
      '🔍 Check my application status': '🔍 எனது அப்ப்லிகேஷன் ஸ்ட்யாட்டஸ் செக் செய்யவும்',
      '📋 Show all schemes': '📋 அனைத்து ஸ்கீம்களையும் காண்க',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN பற்றி சொல்லுங்கள்',
      '🏥 Explain Ayushman Bharat': '🏥 ஆயுஷ்மான் பாரத் விளக்குங்கள்',
      '🏠 Explain PMAY': '🏠 PMAY விளக்குங்கள்',
      '🆔 How to verify Aadhaar / PAN': '🆔 ஆதார் / PAN எப்படி வெரிஃபை செய்வது',
      '📄 Documents needed': '📄 தேவையான ஆவணங்கள்',
      '🔑 Forgot my password': '🔑 கடவுச்சொல் மறந்துவிட்டீர்களா',
      '👤 Complete my profile': '👤 என் புரோபைலை பூர்த்தி செய்யவும்',
      '🔐 Login / account issue': '🔐 லாகின் / கணக்கு பிரச்சனை',
      '💾 Data not saving': '💾 தரவு சேமிக்கப்படவில்லை',
      '⚠️ Something not working': '⚠️ ஏதேனும் வேலை செய்யவில்லை',
      '🌐 Website / internet problem': '🌐 வலையமைப்பு / இணைய பிரச்சனை',
      '🔢 OTP not receiving': '🔢 OTP கிடைக்கவில்லை',
      '🤔 Am I eligible?': '🤔 நான் ஏற்றவா?',
      '💬 Talk to a person': '💬 ஒருவருடன் பேசுங்கள்',
      '❓ I have a different problem': '❓ வேறு ஏதேனும் பிரச்சனை',
    },
    te: {
      '🔍 Check my application status': '🔍 ఎన్నుట అప్లికేషన్ స్టాటస్ చెక్ చేయండి',
      '📋 Show all schemes': '📋 అన్ని స్కీమ్లను చూడండి',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN గురించి చెప్పండి',
      '🏥 Explain Ayushman Bharat': '🏥 ఆయుష్మాన్ భారత్ వివరించండి',
      '🏠 Explain PMAY': '🏠 PMAY వివరించండి',
      '🆔 How to verify Aadhaar / PAN': '🆔 ఆధార్ / PAN ఎలా ధృవీకరించాలి',
      '📄 Documents needed': '📄 అవసరమైన పత్రాలు',
      '🔑 Forgot my password': '🔑 పాస్‌వర్డ్ మరచిపోయారా',
      '👤 Complete my profile': '👤 మా ప్రొఫైల్ పూర్తి చేయండి',
      '🔐 Login / account issue': '🔐 లాగిన్ / ఖాతా సమస్య',
      '💾 Data not saving': '💾 డేటా సేవ్ అవ్వడం లేదు',
      '⚠️ Something not working': '⚠️ ఏదో పని చేయడం లేదు',
      '🌐 Website / internet problem': '🌐 వెబ్‌సైట్ / ఇంటర్నెట్ సమస్య',
      '🔢 OTP not receiving': '🔢 OTP అందుకోలేకపోతున్నాను',
      '🤔 Am I eligible?': '🤔 నేను అర్హుడా?',
      '💬 Talk to a person': '💬 ఒక వ్యక్తితో మాట్లాడండి',
      '❓ I have a different problem': '❓ మరో సమస్య',
    },
    pa: {
      '🔍 Check my application status': '🔍 ਮੇਰੇ ਐਪਲੀਕੇਸ਼ਨ ਸਥਿਤੀ ਜਾਂਚੀਏ',
      '📋 Show all schemes': '📋 ਸਾਰੀਆਂ ਸਕੀਮਾਂ ਦਿਖਾਓ',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN ਬਾਰੇ ਦੱਸੋ',
      '🏥 Explain Ayushman Bharat': '🏥 ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਸਮਝਾਓ',
      '🏠 Explain PMAY': '🏠 PMAY ਸਮਝਾਓ',
      '🆔 How to verify Aadhaar / PAN': '🆔 ਆਧਾਰ / PAN ਕਿਵੇਂ ਵੈਰੀਫਾਈ ਕਰੀਏ',
      '📄 Documents needed': '📄 ਲੋੜੀਏ ਦਸਤਾਵੇਜ਼',
      '🔑 Forgot my password': '🔑 ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ',
      '👤 Complete my profile': '👤 ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ',
      '🔐 Login / account issue': '🔐 ਲੌਗਇਨ / ਐਕਾਉਂਟ ਸਮੱਸਿਆ',
      '💾 Data not saving': '💾 ਡੇਟਾ ਸੇਵ ਨਹੀਂ ਹੋ ਰਿਹਾ',
      '⚠️ Something not working': '⚠️ ਕੁਝ ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ',
      '🌐 Website / internet problem': '🌐 ਵੈਬਸਾਈਟ / ਇੰਟਰਨੈਟ ਸਮੱਸਿਆ',
      '🔢 OTP not receiving': '🔢 OTP ਨਹੀਂ ਮਿਲ ਰਿਹਾ',
      '🤔 Am I eligible?': '🤔 ਕਾਹਮ ਯੋਗ ਹਾਂ?',
      '💬 Talk to a person': '💬 ਇੱਕ ਸ਼ਖ਼ਸ ਨਾਲ ਗੱਲ ਕਰੋ',
      '❓ I have a different problem': '❓ ਕੋਈ ਹੋਰ ਸਮੱਸਿਆ',
    },
    gu: {
      '🔍 Check my application status': '🔍 મારું એપ્લિકેશન સ્થિતિ તપાસો',
      '📋 Show all schemes': '📋 બધી સ્કીમ દર્શાવો',
      '💰 Tell me about PM-KISAN': '💰 PM-KISAN વિશે જણાવો',
      '🏥 Explain Ayushman Bharat': '🏥 આયુષ્માન ભારત સમજાવો',
      '🏠 Explain PMAY': '🏠 PMAY સમજાવો',
      '🆔 How to verify Aadhaar / PAN': '🆔 આધાર / PAN કેવી રીતે વેરિફાઈ કરવું',
      '📄 Documents needed': '📄 જરૂરી દસ્તાવેજો',
      '🔑 Forgot my password': '🔑 પાસવર્ડ ભૂલી ગયા',
      '👤 Complete my profile': '👤 પોતાની પ્રોફાઇલ પૂર્ણ કરો',
      '🔐 Login / account issue': '🔐 લોગિન / એકાઉન્ટ સમસ્યા',
      '💾 Data not saving': '💾 ડેટા સેવ થતો નથી',
      '⚠️ Something not working': '⚠️ કંઈ કામ કરતું નથી',
      '🌐 Website / internet problem': '🌐 વેબસાઇટ / ઇન્ટરનેટ સમસ્યા',
      '🔢 OTP not receiving': '🔢 OTP મળતું નથી',
      '🤔 Am I eligible?': '🤔 શું હું લાયક છું?',
      '💬 Talk to a person': '💬 વ્યક્તિ સાથે વાત કરો',
      '❓ I have a different problem': '❓ બીજી સમસ્યા',
    },
  };
  return (map[lang] && map[lang][label]) || label;
}

function chiplistForIntent(intent, lang) {
  const n = BASE_SUGGESTIONS.length;
  switch (intent) {
    case 'greet':
      return BASE_SUGGESTIONS.slice(0, 5).map((c) => ({ label: translateChip(c.label, lang), intent: c.intent, schemeId: c.schemeId }));
    case 'open_problem':
      // return a curated subset for "different problem"
      return [
        { label: translateChip('🔐 Login / account issue', lang), intent: 'login' },
        { label: translateChip('💾 Data not saving', lang), intent: 'data_save' },
        { label: translateChip('⚠️ Something not working', lang), intent: 'ui_broken' },
        { label: translateChip('🌐 Website / internet problem', lang), intent: 'network' },
        { label: translateChip('🔢 OTP not receiving', lang), intent: 'otp' },
        { label: translateChip('🤔 Am I eligible?', lang), intent: 'eligibility' },
        { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
        { label: translateChip('📄 Can\'t upload documents', lang), intent: 'documents_required' },
      ];
    case 'contact_person':
      return [
        { label: translateChip('📞 Call me', lang), intent: 'contact_call' },
        { label: translateChip('📧 Email me', lang), intent: 'contact_email' },
        { label: translateChip('💬 Chat now', lang), intent: 'contact_chat' },
        { label: translateChip('🔙 Back to AI', lang), intent: 'back_to_ai' },
      ];
    case 'contact_call':
      return [
        { label: translateChip('📞 Call me NOW', lang), intent: 'contact_call' },
        { label: translateChip('📧 Email me', lang), intent: 'contact_email' },
        { label: translateChip('💬 Chat now', lang), intent: 'contact_chat' },
      ];
    case 'contact_email':
      return [
        { label: translateChip('📧 Email me NOW', lang), intent: 'contact_email' },
        { label: translateChip('📞 Call me', lang), intent: 'contact_call' },
        { label: translateChip('💬 Chat now', lang), intent: 'contact_chat' },
      ];
    case 'contact_chat':
      return [
        { label: translateChip('💬 Chat now', lang), intent: 'contact_chat' },
        { label: translateChip('📞 Call me', lang), intent: 'contact_call' },
        { label: translateChip('📧 Email me', lang), intent: 'contact_email' },
      ];
    default:
      return BASE_SUGGESTIONS.slice(0, 4).map((c) => ({ label: translateChip(c.label, lang), intent: c.intent, schemeId: c.schemeId }));
  }
}

// ===========================================================================
// 3. HANDLERS — each returns { text, lang, suggestions }
// ===========================================================================

function respondGreet(lang) {
  return {
    text: l10n('greet', lang),
    lang,
    suggestions: chiplistForIntent('greet', lang),
  };
}

function respondThanks(lang) {
  return {
    text: l10n('thanks', lang),
    lang,
    suggestions: chiplistForIntent('greet', lang),
  };
}

function respondHelp(lang) {
  const options = [
    { label: translateChip('🔍 Check my application status', lang), intent: 'check_application_status' },
    { label: translateChip('📋 Show all schemes', lang), intent: 'list_schemes' },
    { label: translateChip('🆔 Aadhaar / PAN verification', lang), intent: 'verify_identity' },
    { label: translateChip('📄 Documents needed', lang), intent: 'documents_required' },
    { label: translateChip('🔑 Forgot my password', lang), intent: 'password_help' },
    { label: translateChip('🔐 Login issue', lang), intent: 'login' },
    { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
  ];
  return {
    text: l10n('helpIntro', lang),
    lang,
    suggestions: options,
  };
}

function respondOpenProblem(lang) {
  return {
    text: l10n('fallback', lang),
    lang,
    suggestions: chiplistForIntent('open_problem', lang),
  };
}

function respondFallback(lang) {
  return {
    text: l10n('fallback', lang),
    lang,
    suggestions: chiplistForIntent('greet', lang),
  };
}

function respondContactIntro(lang) {
  return {
    text: l10n('contactIntro', lang),
    lang,
    suggestions: chiplistForIntent('contact_person', lang),
  };
}

function respondContactCall(lang) {
  return {
    text: l10n('contactCall', lang),
    lang,
    suggestions: chiplistForIntent('contact_call', lang),
  };
}

function respondContactEmail(lang) {
  return {
    text: l10n('contactEmail', lang),
    lang,
    suggestions: chiplistForIntent('contact_email', lang),
  };
}

function respondContactChat(lang) {
  return {
    text: l10n('contactChat', lang),
    lang,
    suggestions: chiplistForIntent('contact_chat', lang),
  };
}

function respondBackToAI(lang) {
  return respondGreet(lang);
}

// Scheme explanation
function respondScheme(schemeId, lang) {
  const s = SCHEME_BY_ID[schemeId];
  if (!s) return respondFallback(lang);
  return {
    text: `📌 **${s.name}** — ${s.description}\n\n🏛️ ${s.department.name} | ${s.subcategory.name}\n📋 ${s.tags.join(', ')}\n\n👉 Apply from your dashboard or view details on /dashboard/apply/${schemeId}`,
    lang,
    suggestions: [
      { label: translateChip('📋 Show all schemes', lang), intent: 'list_schemes' },
      { label: translateChip('🔍 Check my application status', lang), intent: 'check_application_status' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

// Application status
function respondStatus(applications, lang) {
  if (!applications || applications.length === 0) {
    const msg = {
      en: "You don't have any applications yet. Visit Schemes to start applying!",
      hi: 'अभी आपके पास कोई ऐप्लिकेशन नहीं है। Schemes पर जाकर लागू करें!',
      mr: 'तुमच्याकडे अजून कोणताही अर्ज नाही. Schemes भेटून अर्ज करा.',
      ta: 'உங்களிடம் இன்னும் எந்த அப்ப்லிகேஷனும் இல்லை. Schemes பக்கத்திற்குச் செல்ல விண்ணப்பிக்கவும்.',
      te: 'మీ వద్ద ఇంకా ఏదేనంటే అప్లికేషన్లు లేవు. Schemes కు వెళ్లి అప్లై చేసుకోండి.',
      pa: 'ਤੁਹਾਡੇ ਕੋਲ ਅਜ਼ੀ ਕੋਈ ਐਪਲੀਕੇਸ਼ਨ ਨਹੀਂ ਹੈ। Schemes ਤੇ ਜਾ ਕੇ ਲਾਗੂ ਕਰੋ!',
      gu: 'તમારી પાસે હજુ સુધી કોઈ એપ્લિકેશન નથી. Schemes પર જઈને લાગુ કરો!',
    };
    return { text: msg[lang] || msg.en, lang, suggestions: chiplistForIntent('list_schemes', lang) };
  }
  const lines = applications.map((a) => {
    const icon = a.status === 'Approved' ? '✅' : a.status === 'Pending' ? '⏳' : a.status === 'Rejected' ? '❌' : '📄';
    return `${icon} **${a.schemeName || a.name}** — ${a.status}`;
  });
  return {
    text: `📋 **Your Application Status**:\n\n${lines.join('\n')}`,
    lang,
    suggestions: [
      { label: translateChip('📋 Show all schemes', lang), intent: 'list_schemes' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

// Identity verification (Aadhaar / PAN)
function respondVerifyIdentity(lang) {
  return {
    text: {
      en: `🆔 **Aadhaar / PAN Verification (e-KYC)**\n\n**Aadhaar Verification:**\n1. Go to your Profile page\n2. Under "Identity", enter your Aadhaar number\n3. Click "Verify via OTP"\n4. Enter the OTP sent to your registered mobile\n5. Once verified, your Aadhaar details auto-fill\n\n**PAN Verification:**\n1. Go to your Profile page\n2. Under "Identity", enter your PAN number\n3. Click "Verify"\n4. PAN details are fetched from NSDL/UTIITSL\n\n💡 If OTP is not received, check: mobile number on profile, network, and spam folder.`,
      hi: `🆔 **आधार / PAN सत्यापन (ई-केओसी)**\n\n**आधार सत्यापन:**\n1. अपनी प्रोफ़ाइल पेज पर जाएं\n2. "पहचान" में अपना आधार नंबर डालें\n3. "ओटीटी से सत्यापित करें" दबाएं\n4. अपने रजिस्टर्ड मोबाइल पर आए ओटीटी डालें\n5. सत्यापित होने पर आधार विवरण अपने आप भर जाएगा\n\n**PAN सत्यापन:**\n1. अपनी प्रोफ़ाइल पेज पर जाएं\n2. "पहचान" में PAN नंबर डालें\n3. "सत्यापित करें" दबाएं\n4. PAN विवरण NSDL/UTIITSL से लाए जाते हैं\n\n💡 अगर ओटीटी नहीं आ रहा, तो जांचें: प्रोफ़ाइल पर मोबाइल नंबर, नेटवर्क, और स्पैम फ़ोल्डर।`,
      mr: `🆔 **आधार / PAN सत्यापन (ई-केओसी)**\n\n**आधार सत्यापन:**\n1. तुमच्या प्रोफ़ाइल पृष्ठावर जा\n2. "पहचान" अंतर्गत आधार क्रमांखला टाका\n3. "OTP द्वारे सत्यापित करा" टिकला\n4. तुमच्या पंगत मोबाईलवर आलेला OTP टाका\n5. सत्यापित झाल्यावर आधार तपशील स्वतः भरत निघतील\n\n**PAN सत्यापन:**\n1. तुमच्या प्रोफ़ाइल पृष्ठावर जा\n2. "पहचान" अंतर्गत PAN क्रमांखला टाका\n3. "सत्यापित करा" टिकला\n4. PAN तपशील NSDL/UTIITSL कडून आणले जातात\n\n💡 जर OTP मिळत नाही, तर तपासा: प्रोफ़ाइलवरील मोबाईल क्रमांक, नेटवर्क, आणि स्पॅम फोल्डर।`,
      ta: `🆔 **ஆதார் / PAN சரிபார்ப்பு (e-KYC)**\n\n**ஆதார் சரிபார்ப்பு:**\n1. உங்கள் புரோபைல் பக்கத்திற்குச் செல்லுங்கள்\n2. "அடையாளம்" என்பதில் உங்கள் ஆதார் எண்ணை உள்ளிடவும்\n3. "OTP மூலம் சரிபார்" என்பதை கிளிக் செய்யவும்\n4. உங்கள் பதிவு செய்யப்பட்ட மொபைலில் வரும் OTP உள்ளிடவும்\n5. சரிபார்ப்பு ஆகும்போது ஆதார் விவரங்கள் தானாகவே நிரப்பப்படும்\n\n**PAN சரிபார்ப்பு:**\n1. உங்கள் புரோபைல் பக்கத்திற்குச் செல்லுங்கள்\n2. "அடையாளம்" என்பதில் உங்கள் PAN எண்ணை உள்ளிடவும்\n3. "சரிபார்" என்பதை கிளிக் செய்யவும்\n4. PAN விவரங்கள் NSDL/UTIITSL இலிருந்து பெறப்படும்\n\n💡 OTP கிடைக்காவிட்டால் சோதிக்கவும்: புரோபைலில் மொபைல் எண், பிணையம், மற்றும் ஸ்பாம் கூட்டில்.`,
      te: `🆔 **ఆధార్ / PAN ధృవీకరణ (e-KYC)**\n\n**ఆధార్ ధృవీకరణ:**\n1. మీ ప్రొఫైల్ పేజి కు వెళ్ళండి\n2. "గుర్తింపు" లో మీ ఆధార్ నంబర్ ను ప్రవేశపెట్టండి\n3. "OTP ద్వారా ధృవీకరించు" క్లిక్ చేయండి\n4. మీ రిజిస్టర్ చేసిన మొబైల్ కు వచ్చే OTP ను ప్రవేశపెట్టండి\n5. ధృవీకరించబడిన తర్వాత ఆధార్ వివరాలు స్వయంచాలకంగా పూరించబడతాయి\n\n**PAN ధృవీకరణ:**\n1. మీ ప్రొఫైల్ పేజి కు వెళ్ళండి\n2. "గుర్తింపు" లో మీ PAN నంబర్ ను ప్రవేశపెట్టండి\n3. "ధృవీకరించు" క్లిక్ చేయండి\n4. PAN వివరాలు NSDL/UTIITSL నుండి తీసుకోబడతాయి\n\n💡 OTP రాకపోతే తనిఖీ చేయండి: ప్రొఫైల్ లో మొబైల్ నంబర్, నెట్‌వర్క్, మరియు స్పామ్ ఫోల్డర్.`,
      pa: `🆔 **ਆਧਾਰ / PAN ਧ੍ਰੁਵੀਕਰਨ (e-KYC)**\n\n**ਆਧਾਰ ਧ੍ਰੁਵੀਕਰਨ:**\n1. ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੇਜ 'ਤੇ ਜਾਓ\n2. "ਪਛਾਣ" ਹੇਠ ਆਪਣੀ ਆਧਾਰ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ\n3. "OTP ਰਾਹੀਂ ਵੈਰੀਫਾਈ ਕਰੋ" 'ਤੇ ਕਲਿੱਕ ਕਰੋ\n4. ਆਪਣੇ ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ 'ਤੇ ਆਏ OTP ਨੂੰ ਦਾਖਲ ਕਰੋ\n5. ਜਦੋਂ ਵੈਰੀਫਾਈ ਹੋ ਜਾਵੇ ਤਾਂ ਆਧਾਰ ਵਿਸਥਾਰ ਸਿਰਫ਼ ਭਰ ਦਿੱਤਾ ਜਾਵੇਗਾ\n\n**PAN ਧ੍ਰੁਵੀਕਰਨ:**\n1. ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੇਜ 'ਤੇ ਜਾਓ\n2. "ਪਛਾਣ" ਹੇਠ ਆਪਣੀ PAN ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ\n3. "ਵੈਰੀਫਾਈ ਕਰੋ" 'ਤੇ ਕਲਿੱਕ ਕਰੋ\n4. PAN ਵਿਸਥਾਰ NSDL/UTIITSL ਤੋਂ ਲਏ ਜਾਂਦੇ ਹਨ\n\n💡 ਜੇ OTP ਨਹੀਂ ਆਉਂਦਾ, ਤਾਂ ਜਾਂਚੋ: ਪ੍ਰੋਫਾਈਲ 'ਤੇ ਮੋਬਾਈਲ ਨੰਬਰ, ਨੈਟਵਰਕ, ਅਤੇ ਸਪੈਮ ਫੋਲਡਰ।`,
      gu: `🆔 **આધાર / PAN ધૃવીકરણ (e-KYC)**\n\n**આધાર ધૃવીકરણ:**\n1. તમારી પ્રોફાઇલ પેજ પર જઈ જાઓ\n2. "ઓળખ" હેઠળ તમારી આધાર ક્રમાંક દાખલ કરો\n3. "OTP દ્વારા ધૃવીકરણ કરો" પર ક્લિક કરો\n4. તમારા રજિસ્ટર્ડ મોબાઈલ પર આવતો OTP દાખલ કરો\n5. ધૃવીકરણ થતાં આધાર વિગતો આપમેળે ભરાઈ જશે\n\n**PAN ધૃવીકરણ:**\n1. તમારી પ્રોફાઇલ પેજ પર જઈ જાઓ\n2. "ઓળખ" હેઠળ તમારી PAN ક્રમાંક દાખલ કરો\n3. "ધૃવીકરણ કરો" પર ક્લિક કરો\n4. PAN વિગતો NSDL/UTIITSL માંથી મેળવાય છે\n\n💡 OTP મળતો ન હોય તો તપાસો: પ્રોફાઇલ પર મોબાઈલ નંબર, નેટવર્ક, અને સ્પામ ફોલ્ડર.`,
    }[lang] || {
      en: `🆔 **Aadhaar / PAN Verification (e-KYC)**: Go to Profile > Identity, enter your Aadhaar/PAN number, click "Verify via OTP" or "Verify". OTP may not arrive if your mobile number is wrong or network is down.`,
    },
    lang,
    suggestions: [
      { label: translateChip('🔢 OTP not receiving', lang), intent: 'otp' },
      { label: translateChip('👤 Complete my profile', lang), intent: 'profile_help' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

// Documents required
function respondDocuments(schemeId, lang) {
  if (schemeId) {
    const s = SCHEME_BY_ID[schemeId];
    if (!s) return respondFallback(lang);
    return {
      text: `📄 **Required Documents for ${s.name}**:\n\n${s.documents || '• Identity proof (Aadhaar / PAN)\n• Residence proof\n• Bank account details\n• Passport-size photo\n• Application form\n• Any additional documents as notified'}\n\nAll documents can be uploaded from your Profile > Documents section.`,
      lang,
      suggestions: [
        { label: translateChip('🆔 Aadhaar / PAN verification', lang), intent: 'verify_identity' },
        { label: translateChip('📝 Apply now', lang), intent: 'apply_scheme', schemeId },
        { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
      ],
    };
  }
  return {
    text: `📄 **Standard Documents Needed for Most Schemes**:\n\n• Aadhaar card (linked with mobile)\n• PAN card\n• Bank passbook / cancelled cheque (for DBT)\n• Passport-size photo\n• Residence proof (electricity bill / rent agreement / voter ID)\n• Income certificate (if required by scheme)\n• Caste certificate (if applicable)\n• Any scheme-specific documents\n\nUpload all documents from **Profile > Documents** section.`,
    lang,
    suggestions: [
      { label: translateChip('🆔 Aadhaar / PAN verification', lang), intent: 'verify_identity' },
      { label: translateChip('📋 Show all schemes', lang), intent: 'list_schemes' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

// Password / login
function respondPassword(lang) {
  return {
    text: {
      en: `🔑 **Forgot / Reset Password**\n\n1. Go to the Login page\n2. Click "Forgot Password"\n3. Enter your registered email or phone\n4. OTP / reset link will be sent\n5. Set a new password\n\n🔒 **To change password from Dashboard:**\nProfile > Account > Change Password\n\n⚠️ If you're locked out, contact support — we can help reset.`,
      hi: `🔑 **पासवर्ड भूले / रीसेट करें**\n\n1. लॉगिन पेज पर जाएं\n2. "पासवर्ड भूल गए" पर क्लिक करें\n3. अपना रजिस्टर्ड ईमेल या फोन डालें\n4. OTP / रीसेट लिंक भेजा जाएगा\n5. नया पासवर्ड सेट करें\n\n🔒 **डैशबोर्ड से पासवर्ड बदलें:**\nप्रोफ़ाइल > अकाउंट > पासवर्ड बदलें\n\n⚠️ अगर लॉक हो गए हैं, तो सपोर्ट से संपर्क करें — हम रीसेट में मदद करेंगे।`,
      mr: `🔑 **पासवर्ड विसरणे / रीसेट करा**\n\n1. लॉगिन पृष्ठावर जा\n2. "पासवर्ड विसरलात" क्लिक करा\n3. तुमचा रजिस्टर्ड ईमेल किंवा फोन टाका\n4. OTP / रीसेट लिंक पाठवला जाईल\n5. नवीन पासवर्ड सेट करा\n\n🔒 **डैशबोर्डवरून पासवर्ड बदला:**\nप्रोफ़ाइल > अकाउंट > पासवर्ड बदला\n\n⚠️ जर तुम्ही लॉक झालात, तर सपोर्टशी संपर्क साधा — आम्ही रीसेटमध्ये मदत करू शकतो.`,
      ta: `🔑 **கடவுச்சொல் மறந்துவிட்டீர்களா / மீட்பு**\n\n1. லாகின் பக்கத்திற்குச் செல்லுங்கள்\n2. "கடவுச்சொல் மறந்துவிட்டீர்களா" என்பதைக் கிளிக் செய்யவும்\n3. உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் அல்லது தொலைபேசி எண்ணை உள்ளிடவும்\n4. OTP / மீட்பு இணைப்பு அனுப்பப்படும்\n5. புதிய கடவுச்சொல்லை அமைக்கவும்\n\n🔒 **டாஷ்போர்டில் கடவுச்சொல் மாற்ற:**\nபுரோபைல் > கணக்கு > கடவுச்சொல் மாற்றவும்\n\n⚠️ கணக்கு லாக్ ஆகிவிட்டால், ஆதரவு அமர்வருடன் தொடர்பு கொள்ளுங்கள் — நாங்கள் மீட்பில் உதவுவோம்.`,
      te: `🔑 **పాస్‌వర్డ్ మరచిపోయాారా / రీసెట్**\n\n1. లాగిన్ పేజికి వెళ్ళండి\n2. "పాస్‌వర్డ్ మరచిపోయారా" క్లిక్ చేయండి\n3. మీ రిజిస్టర్ చేసిన ఇమెయిల్ లేదా ఫోన్ నంబర్ ను ప్రవేశపెట్టండి\n4. OTP / రీసెట్ లింక్ పంపబడుతుంది\n5. కొత్త పాస్‌వర్డ్ సెట్ చేయండి\n\n🔒 **డ్యాష్‌బోర్డ్ నుండి పాస్‌వర్డ్ మార్చు:**\nప్రొఫైల్ > ఖాతా > పాస్‌వర్డ్ మార్చు\n\n⚠️ లాక్ అయిపోయి ఉంటే, సపోర్ట్ కు సంప్రదించండి — మీము రీసెట్లో సహాయం చేయగలము.`,
      pa: `🔑 **ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ / ਰੀਸੈੱਟ ਕਰੋ**\n\n1. ਲੌਗਇਨ ਪੇਜ 'ਤੇ ਜਾਓ\n2. "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ" 'ਤੇ ਕਲਿੱਕ ਕਰੋ\n3. ਆਪਣਾ ਰਜਿਸਟਰਡ ਈਮੇਲ ਜਾਂ ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ\n4. OTP / ਰੀਸੈੱਟ ਲਿੰਕ ਭੇਜਿਆ ਜਾਵੇਗਾ\n5. ਨਵਾਂ ਪਾਸਵਰਡ ਸੈੱਟ ਕਰੋ\n\n🔒 **ਡੈਸ਼ਬੋਰਡ 'ਤੋਂ ਪਾਸਵਰਡ ਬਦਲੋ:**\nਪ੍ਰੋਫਾਈਲ > ਐਕਾਉਂਟ > ਪਾਸਵਰਡ ਬਦਲੋ\n\n⚠️ ਜੇ ਤੁਸੀਂ ਲੌਕ ਹੋ ਗਏ ਹੋ, ਤਾਂ ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ — ਅਸੀਂ ਰੀਸੈੱਟ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ।`,
      gu: `🔑 **પાસવર્ડ ભૂલી ગયા / રીસેટ કરો**\n\n1. લોગિન પેજ પર જઓ\n2. "પાસવર્ડ ભૂલી ગયા" પર ક્લિક કરો\n3. તમારો રજિસ્ટર્ડ ઇમેલ અથવા ફોન નંબર દાખલ કરો\n4. OTP / રીસેટ લિંક મોકલવામાં આવશે\n5. નવો પાસવર્ડ સેટ કરો\n\n🔒 **ડેશબોર્ડમાંથી પાસવર્ડ બદલો:**\nપ્રોફાઇલ > એકાઉન્ટ > પાસવર્ડ બદલો\n\n⚠️ જો તમે લૉક થઈ ગયા છો, તો સપોર્ટ સાથે સંપર્ક કરો — અમે રીસેટમાં મદદ કરી શકીએ છીએ.`,
    }[lang] || {
      en: `🔑 **Password help**: Click "Forgot Password" on the login page, enter your registered email/phone, and follow the OTP/reset link. Or change password from Profile > Account > Change Password. If locked out, contact support.`,
    },
    lang,
    suggestions: [
      { label: translateChip('🔐 Login issue', lang), intent: 'login' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

function respondLogin(lang) {
  return {
    text: `🔐 **Login / Account Issue**\n\nHere's what you can try:\n1. Check you're entering the correct email or phone number\n2. Check your password (case-sensitive)\n3. If password is forgotten, use "Forgot Password" on login page\n4. Make sure your account is verified (email/phone OTP)\n5. Try logging out and logging back in\n6. Clear browser cache / refresh the page\n\nIf none of these work, tell me more details — or use "Talk to a person" below.`,
    lang,
    suggestions: [
      { label: translateChip('🔑 Forgot my password', lang), intent: 'password_help' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
      { label: translateChip('❓ I have a different problem', lang), intent: 'open_problem' },
    ],
  };
}

function respondDataSave(lang) {
  return {
    text: `💾 **Data Not Saving**\n\nHere's what to check:\n1. Make sure you're logged in — some saves need authentication\n2. Check your internet connection — slow network can cause save failures\n3. Don't close the tab while saving — wait for the success message\n4. Try clicking "Save" again after a few seconds\n5. Check if you filled all required (*) fields\n\nIf still not saving, tell me what page/data you're trying to save — or use "Talk to a person".`,
    lang,
    suggestions: [
      { label: translateChip('🌐 Website / internet problem', lang), intent: 'network' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
      { label: translateChip('❓ I have a different problem', lang), intent: 'open_problem' },
    ],
  };
}

function respondUIBroken(lang) {
  return {
    text: `⚠️ **Something Not Working / UI Broken**\n\nHere's what to try:\n1. Refresh the page (F5 or pull-to-refresh on mobile)\n2. Check if you're on the latest page version — log out and back in\n3. Try a different browser (Chrome, Firefox, Safari)\n4. Clear browser cache & cookies\n5. Check your internet connection\n6. Check if other pages work — if only one page is broken, it may be that page\n\nTell me which button/feature is not working, and I'll help more — or use "Talk to a person".`,
    lang,
    suggestions: [
      { label: translateChip('🌐 Website / internet problem', lang), intent: 'network' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
      { label: translateChip('❓ I have a different problem', lang), intent: 'open_problem' },
    ],
  };
}

function respondNetwork(lang) {
  return {
    text: `🌐 **Website / Internet Problem**\n\nHere's what to try:\n1. Check your internet connection (try loading another website)\n2. Refresh the page\n3. Try again in a few seconds — the server may be busy\n4. Switch between Wi-Fi and mobile data\n5. If on mobile, try desktop mode or a different browser\n6. If all websites are down, the problem is your network/ISP\n\nIf the issue is only on our website, tell me what's happening — or use "Talk to a person".`,
    lang,
    suggestions: [
      { label: translateChip('⚠️ Something not working', lang), intent: 'ui_broken' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

function respondOTP(lang) {
  return {
    text: `🔢 **OTP Not Receiving**\n\nHere's what to check:\n1. Make sure you entered the correct mobile number / email\n2. Check your network signal — OTP needs a live connection\n3. Wait up to 2 minutes — sometimes OTP is delayed\n4. Check your SMS spam folder (or email spam folder for email OTP)\n5. Don't request too many OTPs — it can trigger a cooldown\n6. Try a different mobile number if the registered one has changed\n\nIf still not receiving, use "Talk to a person" — support can help manually.`,
    lang,
    suggestions: [
      { label: translateChip('🆔 Aadhaar / PAN verification', lang), intent: 'verify_identity' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
    ],
  };
}

function respondEligibility(lang) {
  return {
    text: `🤔 **Am I Eligible for a Scheme?**\n\nEligibility depends on each scheme's rules. Here's how to check:\n\n1. Go to **Schemes** page — each scheme shows who's eligible\n2. Fill your **Profile** completely — eligibility depends on your info (income, caste, land, etc.)\n3. Click "Check Eligibility" on any scheme to see if you qualify\n\n💡 Common eligibility types:\n• **Income-based** (e.g., PM-KISAN, Pension)\n• **Caste/tribe-based** (SC/ST/OBC certificates)\n• **Land/property-based** (e.g., PMAY)\n• **Age/family-based** (e.g., Sukanya Samriddhi for girl children)\n\nIf you want, tell me which scheme you're interested in and I'll check the eligibility criteria for you.`,
    lang,
    suggestions: [
      { label: translateChip('📋 Show all schemes', lang), intent: 'list_schemes' },
      { label: translateChip('💬 Talk to a person', lang), intent: 'contact_person' },
      { label: translateChip('❓ I have a different problem', lang), intent: 'open_problem' },
    ],
  };
}

// "Talk to a person" contact card
function respondContactPerson(lang) {
  const card = {
    en: `😐 **Need to talk to a real person?**\n\nHere's how you can reach our support team:\n\n📞 **Phone:** [Support Phone Number — e.g. 1800-XXXX-XXXX]\n   • Available Mon–Sat, 10 AM – 6 PM IST\n   • Say "SIH CODEHAWKS support" to the operator\n\n💬 **Live Chat:**\n   • You're already chatting — keep messaging here and a support agent will join\n   • Or go to Dashboard > Contact Support\n\n📧 **Email:** [support@sih-codehawks.example]\n   • For non-urgent issues\n   • Response within 24 hours\n\n👉 *Just tell me what you need and I'll connect you.* You can keep using this chat in your own language — we understand Hindi, Marathi, Tamil, Telugu, Punjabi, and Gujarati.`,
    hi: `😐 **किसी असली इंसान से बात करनी है?**\n\nहमारी सपोर्ट टीम से कैसे जुड़ें:\n\n📞 **फ़ोन:** [सपोर्ट फ़ोन नंबर — जैसे 1800-XXXX-XXXX]\n   • सोम-सशनि, सुबह 10 – शाम 6 बजे (IST)\n   • ऑपरेटर को "SIH CODEHAWKS सपोर्ट" कहें\n\n💬 **लाइव चैट:**\n   • आप अभी चैट कर रहे हैं — यहाँ 계속할ો और एक सपोर्ट एजेंट जुड़ेगा\n   • या डैशबोर्ड > कॉन्टैक्ट सपोर्ट पर जाएं\n\n📧 **ईमेल:** [support@sih-codehawks.example]\n   • त्वरित न होने वाली समस्याओं के लिए\n   • 24 घंटों के भीतर जवाब\n\n👉 *बस बताएं क्या चाहिए, मैं जोड़ दूंगा।* आप अपनी अपनी भाषा में यहाँ चैट करते रह सकते हैं — हम हिंदी, मराठी, तमिल, तेलुगु, पंजाबी, और गुजराती समझते हैं।`,
    mr: `😐 **कोणत्या खर्या व्यक्तीने बोलूया?**\n\nआमच्या सपोर्ट संघाशी कसे जोडल 정밀하게:\n\n📞 **फोन:** [सपोर्ट क्रमांक — उदा. 1800-XXXX-XXXX]\n   • सोम-शनि, सकाळी 10 – सायंकाळी 6 वाजता (IST)\n   • ऑपरेटरला "SIH CODEHAWKS सपोर्ट" सांगा\n\n💬 **लைव चат 벵калೆ ನುು\n   • तुम्ही आता चैट करत आहास — येथे संदेश सुरू ठेवा आणि एक सपोर्ट एजंट जोडल जाईल\n   • किंवा डैशबोर्ड > कॉन्टॅक्ट सपोर्ट भेटा\n\n📧 **ईमेल:** [support@sih-codehawks.example]\n   • नव Bharat त्वरित समस्यांसाठी\n   • 24 तासांनीपर्यंत उत्तर\n\n👉 *फक्त सांगा काय हवें आहे, मी जोडून देईन.* तुम्ही तुमच्या स्वतःच्या भाषेत येथे चैट सुरू ठेवू शकता — आम्ही हिंदी, मराठी, तमில, తెలుगు, ਪੰਜਾਬੀ, आणि ગુજરાતી समजतो.`,
    ta: `😐 **உண்மையான ஒருவருடன் பேச விரும்புகிறீர்களா?**\n\nஎங்கள் ஆதரவு குழுவினரை எப்படி இணையலாம்:\n\n📞 **போன்:** [ஆதரவு போன் எண் — எடுத்துக்காட்டாக 1800-XXXX-XXXX]\n   • திங்கள்–சனி, காலை 10 – மாலை 6 (IST)\n   • ஆபரேட்டருக்கு "SIH CODEHAWKS ஆதரவு" என சொல்லுங்கள்\n\n💬 **லைவ் சேட்:**\n   • நீங்கள் ஏற்கனவே சேட் செய்து கொண்டிருக்கிறீர்கள் — இங்கே செய்தி தொடரவும், ஒரு ஆதரவு அமர்வர் இணையும்\n   • அல்லது டாஷ்போர்ட் > ஆதரவு தொடர்பில் செல்லுங்கள்\n\n📧 **மின்னஞ்சல்:** [support@sih-codehawks.example]\n   • அவசரமில்லாத பிரச்சனைகளுக்கு\n   • 24 மணிநேரத்திற்குள் பதில்\n\n👉 *என்ன தேவை என்று சொல்லுங்கள், நான் இணைப்பேன்.* உங்கள் சொந்த மொழியில் இந்த சேட்டில் தொடர்ந்து பயன்படுத்தலாம் — நாங்கள் ஹிந்தி, மராத்தி, தமிழ், తెలుగు, பஞ்சாபி, மற்றும் குஜராதி புரிந்து கொள்வோம்.`,
    te: `😐 **నిజమైన వ్యక్తితో మాట్లాడాలనుకుంటున్నారా?**\n\nమన సపోర్ట్ బృందానికి ఎలా చేరుకోవాలి:\n\n📞 **ఫోన్:** [సపోర్ట్ ఫోన్ నంబర్ — ఉదా 1800-XXXX-XXXX]\n   • సోమ-శని, ఉదయం 10 – సాయంత్రం 6 (IST)\n   • ఆపరేటర్ కు "SIH CODEHAWKS సపోర్ట్" అని చెప్పండి\n\n💬 **లైవ్ చాట్:**\n   • మీరు ఇప్పటికే చాట్ చేస్తున్నారు — ఇక్కడ సందేశాలు కొనసాగించండి, ఒక సపోర్ట్ ఏజెంట్ చేరుకుంటారు\n   • లేదా డ్యాష్‌బోర్డ్ > కాన్టాక్ట్ సపోర్ట్ కు వెళ్ళండి\n\n📧 **ఇమెయిల్:** [support@sih-codehawks.example]\n   • అలసి లేని సమస్యల కోసం\n   • 24 గంటల్లోపు సమాధానం\n\n👉 *కేవలం ఏమి కావాలో చెప్పండి, నేను కలిపేస్తాను.* మీ స్వంత భాషలో ఇక్కడ చాట్ కొనసాగించవచ్చు — మేము హిందీ, మరాఠి, తమిళం, తెలుగు, పంజాబీ, మరియు ગુજરાતી అర్థం చేసుకుంటాము.`,
    pa: `😐 **ਕਿਸੇ ਅਸਲ ਵਿਅਕਤੀ ਨਾਲ ਗੱਲ ਕਰਨੀ ਹੈ?**\n\nਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਨਾਲ ਕਿਵੇਂ ਜੁੜੇ:\n\n📞 **ਫੋਨ:** [ਸਪੋਰਟ ਫੋਨ ਨੰਬਰ — ਉਦਾਹਰਣ 1800-XXXX-XXXX]\n   • ਸੋਮ-ਸ਼ਨਿਵਾਰ, ਸਵੇਰੇ 10 – ਸ਼ਾਮ 6 (IST)\n   • ਆਪਰੇਟਰ ਨੂੰ "SIH CODEHAWKS ਸਪੋਰਟ" ਕਹੋ\n\n💬 **ਲਾਈਵ ਚੈੱਟ:**\n   • ਤੁਸੀਂ ਹੀ ਚੈੱਟ ਕਰ ਰਹੇ ਹੋ — ਇੱਥੇ ਸੁਨੇਹੇ ਜਾਰੀ ਰੱਖੋ ਅਤੇ ਇੱਕ ਸਪੋਰਟ ਐਜੰਟ ਜੁੜੇਗਾ\n   • ਜਾਂ ਡੈਸ਼ਬੋਰਡ > ਕੋਨਟੈਕਟ ਸਪੋਰਟ 'ਤੇ ਜਾਓ\n\n📧 **ਈਮੇਲ:** [support@sih-codehawks.example]\n   • ਤੇਜ਼ ਨਾ ਹੋਣ ਵਾਲੀਆਂ ਸਮੱਸਿਆਵਾਂ ਲਈ\n   • 24 ਘੰਟਿਆਂ ਦੇ ਭੀਤਰ ਜਵਾਬ\n\n👉 *ਸਿਰਫ਼ ਦੱਸੋ ਕੀ ਚਾਹੀਦਾ ਹੈ, ਮੈਂ ਜੋੜ ਦੇਵਾਂਗਾ।* ਤੁਸੀਂ ਆਪਣੀ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਇੱਥੇ ਚੈੱਟ ਕਰਦੇ ਰਹਿ ਸਕਦੇ ਹੋ — ਅਸੀਂ ਹਿੰਦੀ, ਮਰਾਠੀ, ਤਾਮਿல, ਪੰਜਾਬੀ, ਅਤੇ ગુજરਾતી ਸਮਝਦੇ ਹਾਂ।`,
    gu: `😐 **કોઈ વાસ્તવિક વ્યક્તિ સાથે વાત કરવી છે?**\n\nઅમારી સપોર્ટ ટીમ સાથે કેવી રીતે જોડાવશો:\n\n📞 **ફોન:** [સપોર્ટ ફોન નંબર — ઉદાહરણ 1800-XXXX-XXXX]\n   • સોમ-શનિવાર, સવારે 10 – સાંજે 6 (IST)\n   • ઓપરેટરને "SIH CODEHAWKS સપોર્ટ" કહો\n\n💬 **લાઈવ ચેટ:**\n   • તમે પહેલેથી ચેટ કરી રહ્યા છો — અહીં સંદેશ જારી રાખો અને એક સપોર્ટ એજન્ટ જોડાશે\n   • અથવા ડેશબોર્ડ > કન્ટેક્ટ સપોર્ટ પર જાઓ\n\n📧 **ઇમેલ:** [support@sih-codehawks.example]\n   • અતિવેગિત નથી તેવી સમસ્યાઓ માટે\n   • 24 કલાકની અંદર જવાબ\n\n👉 *ફક્ત કહો કે શું જોઈએ છે, હું જોડશું. તમે પોતાની પોતાની ભાષામાં અહીં ચેટ જારી રાખી શકો છો — અમે હિંદી, મરાઠી, તમિલ, ગુજરાતી સમજીએ છીએ.`,
  };

  return {
    text: card[lang] || card.en,
    lang,
    suggestions: chiplistForIntent('contact_person', lang),
  };
}

// ===========================================================================
// 4. INTENT ROUTER
// ===========================================================================

function matchIntent(msg) {
  const lower = trimLower(msg);

  if (lower === 'help' || lower.startsWith('help ') || lower === 'helpme' || lower === 'help me')
    return 'help';

  // greetings
  if (/\b(hi|hello|hey|greetings|namaste|namaskar|vanakkam|sat sri akal|namaste|namasfte)\b/i.test(msg))
    return 'greet';

  // thanks
  if (/\b(thanks|thank you|thank|dhanyavad|nandri|dhannvad|dhanyava|dhanyavad|sugnkar|dhanyed|dhanyavaad)\b/i.test(msg))
    return 'thanks';

  // contact person
  if (/\b(contact me|talk to me|talk with me|talk to a person|get me a person|human|support person|contact support|speak to someone|talk to human|real person|agent|live agent|call me support|person help|human help|talk to agent|need a person)\b/i.test(msg))
    return 'contact_person';

  if (/\b(call me|phone me|ring me|call me back|i want a call|can you call me|phone support|call support)\b/i.test(msg))
    return 'contact_call';

  if (/\b(email me|mail me|email support|write to me|send email|email me please|email help)\b/i.test(msg))
    return 'contact_email';

  if (/\b(chat with me|chat now|live chat|continue chat|keep chatting|chat support)\b/i.test(msg))
    return 'contact_chat';

  if (/\b(back to talk|back to chat|back to ai|back to assistant|go back)\b/i.test(msg))
    return 'back_to_ai';

  // application status
  if (/\b(application status|my application|status of my|apply status|track my|track application|application track|check status|application check|app status|my app status|current status|application current)\b/i.test(msg))
    return 'check_application_status';

  // schemes
  if (/\b(scheme|schemes|all schemes|list schemes|show schemes|available schemes|scheme list|mudra|pension|sukanya|ayushman|pm kisan|pm-kisan|pmay|pmaay|p-may|prime minister|prime minister scheme|govt scheme|government scheme|central scheme|state scheme)\b/i.test(msg))
    return 'list_schemes';

  if (/\b(pm kisan|pm-kisan|prime minister kisan|samman nidhi|kisan|samman)\b/i.test(msg))
    return 'explain_scheme';

  if (/\b(ayushman|ayushman bharat|pm-jay|pm jay|jay scheme|health scheme|health cover|health insurance)\b/i.test(msg))
    return 'explain_scheme';

  if (/\b(pmay|p-may|prime minister avas|pm awas|affordable housing|housing scheme|home scheme|house scheme|pradhan mantri awas|pradhan mantri avas)\b/i.test(msg))
    return 'explain_scheme';

  if (/\b(mudra|standup india|standup|stand-up india|stand up india|startup india|startup|sidbi|mudra loan)\b/i.test(msg))
    return 'explain_scheme';

  if (/\b(pension|old age pension|widow pension|disability pension|pension scheme|senior citizen|senior citizen scheme)\b/i.test(msg))
    return 'explain_scheme';

  if (/\b(sukanya|sukanya samriddhi|girl child|girl child scheme|beti|dhan|beti bachao|beti padhao)\b/i.test(msg))
    return 'explain_scheme';

  // identity verification
  if (/\b(aadhaar|adhar|aadhaar verify|adhar verify|pan verify|pan card|pan number|verify pan|pancard|pan verification|kyc|ekyc|e-kyc|know your customer|identity|verify identity|identity verification)\b/i.test(msg))
    return 'verify_identity';

  // documents
  if (/\b(document|documents|required docs|doc requirement|docs needed|what documents|upload document|upload docs|document upload|attach document|document list|file upload|pdf|scan document|document missing|document not|upload failed|upload fail|document issue|missing document)\b/i.test(msg))
    return 'documents_required';

  // password
  if (/\b(password|forgot password|reset password|change password|password forgot|password reset|password change|forgot my password|recover password|password recovery|new password|set password)\b/i.test(msg))
    return 'password_help';

  // login
  if (/\b(login|log in|sign in|logging in|unable to login|cannot login|login issue|login problem|cannot log in|login not|login fail|login failed|login error|login page|login help|account locked|account lock|locked out|logged out|logout|sign in issue|signin|sign in problem)\b/i.test(msg))
    return 'login';

  // data save
  if (/\b(data not saving|data not saved|save not working|save issue|save failed|save error|not saving|not saved|data doesn't save|data not saving|data save fail|data save issue|save not|save issue|save fail|save error|saving problem|saving error|data not save|data not be saved|error while saving|error in saving|problem in saving|while saving|saving issue)\b/i.test(msg))
    return 'data_save';

  // UI broken
  if (/\b(something not working|something broken|not working|ui broken|broken ui|ui issue|user interface|interface issue|button not|button doesn't|button not responding|button not working|button issue|feature not working|feature broken|screen broken|page broken|display broken|show broken|not displaying|not showing|not visible|blank page|white screen|white blank|blank white|empty page|nothing showing|page empty|screen empty|app not working|app broken|crash|crashes|crash issue|crashing|freezing|frozen|freeze|hangs|hanging|unresponsive|not loading|load not|loading issue|loading problem|load fail|not load|load error|load slow|slow load|loading slow|page load|page not load|page loading|website not working|website broken|site issue|site problem|website issue|website problem|site down)\b/i.test(msg))
    return 'ui_broken';

  // network
  if (/\b(offline|no internet|internet not|internet down|network|network issue|network problem|network error|wifi not|wifi down|wifi issue|data connection|connection issue|connection error|no connection|disconnected|connection slow|slow internet|slow network|connectivity|connectivity issue|connectivity problem|connection not|no signal|signal issue|signal problem|server error|server down|server issue|service down|unavailable|timeout|request timeout|fetch error|fetch failed|fetch issue|data fetch|fetch data|fetching|fetch not|not fetching|fetched|data loading|loading data|not loading|load not|not loaded|loaded|loading slow)\b/i.test(msg))
    return 'network';

  // OTP
  if (/\b(otp|one time password|one-time password|otp not|otp not receive|otp not received|otp not getting|not getting otp|otp not come|otp not arrive|otp not sending|otp not send|otp not sent|otp not working|otp issue|otp problem|otp error|otp fail|otp failed|otp delivery|otp not deliver|otp not receiving|otp not%|not otp|without otp|no otp|missing otp|otp code|otp sms|otp message|otp mail|otp email)\b/i.test(msg))
    return 'otp';

  // eligibility
  if (/\b(eligib|eligible|eligibity|eligibility|eligible for|eligibility criteria|criteria|who eligible|who is eligible|qualify|qualification|qualify for|am i eligible|eligible for scheme|which scheme i eligible|scheme eligible|scheme eligib|eligib for scheme|scheme i can apply|which scheme i|scheme for me|scheme for my|can i apply|can apply|can i get|can i receive|can i get scheme|can i get benefit|can i get money|can i get help|can i get support)\b/i.test(msg))
    return 'eligibility';

  // general problem router
  if (/\b(problem|issue|help me|i have a problem|i have issue|trouble|not working|can't|cannot|not able|unable|issue with|problem with|difficulty|troubled|stuck|stuck on|error|exception|failed|failure|fault|defect|not right|not correct|not good|not proper|not working|not functioning|not operating|not responding|not opening|not opening|not opening up|not open|not open up|not open up|not open up|page not|page not load|page not open)\b/i.test(msg))
    return 'open_problem';

  return null;
}

function handleIntent(intent, msg, ctx) {
  const lang = detectLanguage(msg);
  switch (intent) {
    case 'greet':
      return respondGreet(lang);
    case 'thanks':
      return respondThanks(lang);
    case 'help':
      return respondHelp(lang);
    case 'contact_person':
      return respondContactPerson(lang);
    case 'contact_call':
      return respondContactCall(lang);
    case 'contact_email':
      return respondContactEmail(lang);
    case 'contact_chat':
      return respondContactChat(lang);
    case 'back_to_ai':
      return respondBackToAI(lang);
    case 'check_application_status': {
      const apps = ctx.applications || applicationsData;
      return respondStatus(apps, lang);
    }
    case 'list_schemes': {
      const ids = Object.keys(SCHEME_BY_ID);
      return {
        text: `📋 **Government Schemes Available**:\n\n${ids.map((id) => `• ${SCHEME_BY_ID[id].name} — ${SCHEME_BY_ID[id].description.substring(0, 80)}...`).join('\n')}\n\nAsk me "tell me about [scheme name]" for details, or "check my application status" to track.`,
        lang,
        suggestions: chiplistForIntent('list_schemes', lang),
      };
    }
    case 'explain_scheme': {
      // pick the best matching scheme
      const lower = trimLower(msg);
      for (const s of schemesData) {
        const keywords = [...s.name.toLowerCase().split(' '), s.id.toLowerCase(), ...s.tags.map((t) => t.toLowerCase())];
        if (keywords.some((k) => lower.includes(k))) {
          return respondScheme(s.id, lang);
        }
      }
      // fallback — list schemes
      return {
        text: `I found some schemes. Try asking about one by name — e.g., "tell me about PM-KISAN" or "explain Ayushman Bharat".`,
        lang,
        suggestions: chiplistForIntent('list_schemes', lang),
      };
    }
    case 'verify_identity':
      return respondVerifyIdentity(lang);
    case 'documents_required': {
      // if a scheme is mentioned, filter to that scheme
      const lower = trimLower(msg);
      for (const s of schemesData) {
        if (lower.includes(s.id.toLowerCase()) || lower.includes(s.name.toLowerCase())) {
          return respondDocuments(s.id, lang);
        }
      }
      return respondDocuments(null, lang);
    }
    case 'password_help':
      return respondPassword(lang);
    case 'login':
      return respondLogin(lang);
    case 'data_save':
      return respondDataSave(lang);
    case 'ui_broken':
      return respondUIBroken(lang);
    case 'network':
      return respondNetwork(lang);
    case 'otp':
      return respondOTP(lang);
    case 'eligibility':
      return respondEligibility(lang);
    case 'open_problem':
      return respondOpenProblem(lang);
    default:
      return respondFallback(lang);
  }
}

// ===========================================================================
// 5. EXPORTED FUNCTIONS
// ===========================================================================

/**
 * Main entry point: receive user message + context (user + applications),
 * return a response object { text, lang, suggestions }.
 */
export function handleUserMessage(msg, ctx = {}) {
  if (!msg || !String(msg).trim()) {
    const lang = detectLanguage('') || 'en';
    return respondGreet(lang);
  }

  const intent = matchIntent(msg);
  if (intent) {
    return handleIntent(intent, msg, ctx);
  }

  // Fallback: try language-based response
  const lang = detectLanguage(msg);
  return respondFallback(lang);
}

/**
 * Quick command handler: used by suggestion chips.
 * Returns response object or null.
 */
export function handleQuickCommand(cmd, ctx = {}) {
  if (!cmd || typeof cmd !== 'string') return null;
  const trimmed = cmd.trim().toLowerCase();

  // map quick-command labels to intents (without needing full message)
  const quickMap = {
    'check_application_status': 'check_application_status',
    'list_schemes': 'list_schemes',
    'explain_scheme': 'explain_scheme',
    'verify_identity': 'verify_identity',
    'documents_required': 'documents_required',
    'password_help': 'password_help',
    'login': 'login',
    'data_save': 'data_save',
    'ui_broken': 'ui_broken',
    'network': 'network',
    'otp': 'otp',
    'eligibility': 'eligibility',
    'contact_person': 'contact_person',
    'contact_call': 'contact_call',
    'contact_email': 'contact_email',
    'contact_chat': 'contact_chat',
    'back_to_ai': 'back_to_ai',
    'open_problem': 'open_problem',
    'help': 'help',
    'greet': 'greet',
    'thanks': 'thanks',
  };

  const intent = quickMap[trimmed];
  if (!intent) return null;

  // For explain_scheme chips, we need a schemeId — passed via ctx
  const schemeId = ctx.schemeId || null;

  // Build fake message for language detection (use 'en' as default)
  const fakeMsg = intent === 'explain_scheme' && schemeId
    ? `tell me about ${SCHEME_BY_ID[schemeId]?.name || schemeId}`
    : trimmed;

  const lang = detectLanguage(fakeMsg) || 'en';

  // Build context for handleIntent
  const intentCtx = { ...ctx };
  if (intent === 'explain_scheme' && schemeId) {
    intentCtx.schemeId = schemeId;
  }

  return handleIntent(intent, fakeMsg, intentCtx);
}
