import React, { useEffect, useState } from 'react';
import './TopBar.css';
import AccessibilityMenu from './AccessibilityMenu';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
export default function TopBar() {
  const [lang, setLang] = useState(() => localStorage.getItem('site_language') || 'en');
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  useEffect(() => {
    // Check if script is already added to prevent duplicates during HMR
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,hi,ta,te,pa,gu,mr', autoDisplay: false },
          'google_translate_element'
        );
        
        // Restore language on reload after initialization by polling until the select element is ready
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          const select = document.querySelector('.goog-te-combo');
          if (select) {
            clearInterval(interval);
            const savedLang = localStorage.getItem('site_language');
            if (savedLang && savedLang !== 'en') {
              const optionExists = Array.from(select.options).some(opt => opt.value === savedLang);
              select.value = optionExists ? savedLang : (savedLang === 'en' ? 'en' : '');
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          if (attempts > 20) { // Stop trying after 10 seconds
            clearInterval(interval);
          }
        }, 500);
      };
    }
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem('site_language', selectedLang);
    
    // Trigger the hidden Google Translate dropdown safely
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      // Google Translate sometimes uses '' to revert to original language if 'en' is not present
      const optionExists = Array.from(select.options).some(opt => opt.value === selectedLang);
      select.value = optionExists ? selectedLang : (selectedLang === 'en' ? 'en' : '');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Secondary fallback trigger just in case
      setTimeout(() => {
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, 100);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-item">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="emblem-logo" />
          <div className="gov-text">
            <span>Ministry of Electronics and</span>
            <span>Information Technology</span>
          </div>
        </div>

      </div>
      
      <div className="topbar-right">
        <button className="topbar-icon-btn" title="Accessibility" onClick={() => setIsA11yOpen(true)}>
          <i className="fa-solid fa-universal-access"></i>
        </button>
        <AnimatedThemeToggler className="topbar-icon-btn" title="Dark Mode" variant="circle">
          {(isDark) => <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>}
        </AnimatedThemeToggler>
        <button className="isl-chatbot-btn">
          <span className="isl-text">ISL Chatbot</span>
          <span className="isl-icon">
            <i className="fa-solid fa-hands-asl-interpreting"></i>
          </span>
        </button>
        <div className="language-selector notranslate">
          <select value={lang} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
            <option value="gu">ગુજરાતી</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>
      {/* Hidden element for Google Translate to mount its select box */}
      <div id="google_translate_element" style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute', opacity: 0 }}></div>
      <style>{`
        /* Aggressive Google Translate UI Hiding */
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate > iframe.goog-te-banner-frame { display: none !important; }
        .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { display: none !important; }
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO { display: none !important; }
        body { top: 0 !important; position: static !important; margin-top: 0 !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `}</style>
      
      <AccessibilityMenu isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
    </div>
  );
}
