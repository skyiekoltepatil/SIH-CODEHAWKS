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
