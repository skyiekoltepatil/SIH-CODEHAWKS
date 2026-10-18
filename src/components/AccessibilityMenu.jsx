import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './AccessibilityMenu.css';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import {
  speakMultilingual,
  stopSpeech,
  getWordAtCoordinates,
  getActiveSiteLanguage,
  TTS_WELCOME_MESSAGES,
  LANGUAGE_LOCALES,
} from '../utils/tts.js';

export default function AccessibilityMenu({ isOpen, onClose }) {
  const [activeSettings, setActiveSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('a11ySettings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Ensure active classes are applied on mount
  useEffect(() => {
    Object.entries(activeSettings).forEach(([setting, isActive]) => {
      if (isActive) {
        document.body.classList.add(`a11y-${setting}`);
        document.documentElement.classList.add(`a11y-${setting}`);
      }
    });
  }, []);

  // Text To Speech (TTS) handler with full multilingual support
  useEffect(() => {
    if (!activeSettings.tts) {
      document.body.classList.remove('a11y-tts');
      document.documentElement.classList.remove('a11y-tts');
      stopSpeech();
      return;
    }

    document.body.classList.add('a11y-tts');
    document.documentElement.classList.add('a11y-tts');

    let ttsTimeout;
    let lastHoveredElement = null;

    const handleTTSHover = (e) => {
      if (
        e.target.closest('.a11y-menu') ||
        e.target.closest('.a11y-overlay') ||
        e.target.closest('.a11y-btn') ||
        e.target.closest('.a11y-panel') ||
        e.target.closest('button[title*="Listen"]') ||
        e.target.closest('button[title*="listening"]') ||
        e.target.closest('button[title*="Copy"]') ||
        e.target.closest('.chat-toolbar')
      ) return;
      if (e.target === lastHoveredElement) return;
      lastHoveredElement = e.target;
      clearTimeout(ttsTimeout);
      ttsTimeout = setTimeout(() => {
        const targetEl = e.target.closest('button, a, [role="button"], h1, h2, h3, h4, h5, h6, p, li, label, td, th, span') || e.target;
        if (!targetEl || ['BODY', 'HTML', 'MAIN', 'NAV', 'HEADER', 'FOOTER', 'SECTION', 'ARTICLE', 'ASIDE'].includes(targetEl.tagName)) {
          return;
        }
        const text = targetEl.getAttribute('aria-label') || targetEl.getAttribute('title') || targetEl.innerText || targetEl.textContent;
        if (text && text.trim()) {
          const siteLang = getActiveSiteLanguage();
          speakMultilingual(text.trim(), { lang: LANGUAGE_LOCALES[siteLang] || `${siteLang}-IN` });
        }
      }, 250);
    };

    const handleTTSClick = (e) => {
      if (
        e.target.closest('.a11y-menu') ||
        e.target.closest('.a11y-overlay') ||
        e.target.closest('.a11y-btn') ||
        e.target.closest('.a11y-panel') ||
        e.target.closest('button[title*="Listen"]') ||
        e.target.closest('button[title*="listening"]') ||
        e.target.closest('button[title*="Copy"]') ||
        e.target.closest('.chat-toolbar')
      ) return;

      const siteLang = getActiveSiteLanguage();
      const targetLang = LANGUAGE_LOCALES[siteLang] || `${siteLang}-IN`;

      // 1. Text highlighted or selected by user
      const selected = window.getSelection()?.toString()?.trim();
      if (selected) {
        speakMultilingual(selected, { lang: targetLang });
        return;
      }

      // 2. Interactive element (button, link, tab)
      const interactiveEl = e.target.closest('button, a, [role="button"]');
      if (interactiveEl) {
        const btnText = interactiveEl.getAttribute('aria-label') || interactiveEl.getAttribute('title') || interactiveEl.innerText || interactiveEl.textContent;
        if (btnText && btnText.trim()) {
          speakMultilingual(btnText.trim(), { lang: targetLang });
          return;
        }
      }

      // 3. Specific word clicked across ANY language / script (Tamil, Hindi, Marathi, Telugu, Punjabi, Gujarati, etc.)
      const clickedWord = getWordAtCoordinates(e.clientX, e.clientY);
      if (clickedWord && clickedWord.length > 0) {
        speakMultilingual(clickedWord, { lang: targetLang });
        return;
      }

      // 4. Element text fallback (headings, paragraphs, labels, spans)
      const targetEl = e.target.closest('h1, h2, h3, h4, h5, h6, p, li, label, td, th, span') || e.target;
      if (targetEl && !['BODY', 'HTML', 'MAIN', 'NAV', 'HEADER', 'FOOTER'].includes(targetEl.tagName)) {
        const text = targetEl.getAttribute('aria-label') || targetEl.getAttribute('title') || targetEl.innerText || targetEl.textContent;
        if (text && text.trim()) {
          speakMultilingual(text.trim(), { lang: targetLang });
        }
      }
    };

    document.addEventListener('mouseover', handleTTSHover, true);
    document.addEventListener('click', handleTTSClick, true);

    return () => {
      document.removeEventListener('mouseover', handleTTSHover, true);
      document.removeEventListener('click', handleTTSClick, true);
      clearTimeout(ttsTimeout);
    };
  }, [activeSettings.tts]);

  // Global cursor tracker to always know cursor Y
  useEffect(() => {
    const trackCursor = (e) => {
      window._lastMouseY = e.clientY;
    };
    window.addEventListener('mousemove', trackCursor, { passive: true });
    return () => window.removeEventListener('mousemove', trackCursor);
  }, []);

  // ADHD Mode cursor, touch, and scroll tracker (smoothly updates reading guide across entire screen)
  useEffect(() => {
    if (!activeSettings.adhd) {
      document.body.classList.remove('a11y-adhd');
      document.documentElement.classList.remove('a11y-adhd');
      document.documentElement.style.removeProperty('--mouse-y');
      return;
    }

    document.body.classList.add('a11y-adhd');
    document.documentElement.classList.add('a11y-adhd');
    
    const initialY = window._lastMouseY || (window.innerHeight / 2);
    document.documentElement.style.setProperty('--mouse-y', `${initialY}px`);

    let lastY = initialY;
    let rafId = null;

    const setPosition = (y) => {
      lastY = y;
      window._lastMouseY = y;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--mouse-y', `${lastY}px`);
          rafId = null;
        });
      }
    };

    const handleMouseMove = (e) => {
      setPosition(e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setPosition(e.touches[0].clientY);
      }
    };

    const handleScroll = () => {
      setPosition(lastY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeSettings.adhd]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleSetting = (setting) => {
    setActiveSettings((prev) => {
      const isActive = !prev[setting];
      
      if (isActive) {
        document.body.classList.add(`a11y-${setting}`);
        document.documentElement.classList.add(`a11y-${setting}`);
        
        if (setting === 'tts') {
          const siteLang = getActiveSiteLanguage();
          const welcomeMsg = TTS_WELCOME_MESSAGES[siteLang] || TTS_WELCOME_MESSAGES.en;
          speakMultilingual(welcomeMsg, { lang: LANGUAGE_LOCALES[siteLang] || 'en-IN' });
        }
        if (setting === 'adhd') {
          const currentY = window._lastMouseY || (window.innerHeight / 2);
          document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);
        }
      } else {
        document.body.classList.remove(`a11y-${setting}`);
        document.documentElement.classList.remove(`a11y-${setting}`);
        
        if (setting === 'tts') {
          stopSpeech();
        }
        if (setting === 'adhd') {
          document.documentElement.style.removeProperty('--mouse-y');
        }
      }
      
      const newSettings = {
        ...prev,
        [setting]: isActive,
      };
      localStorage.setItem('a11ySettings', JSON.stringify(newSettings));
      localStorage.setItem('bc-a11ySettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setActiveSettings({});
    localStorage.removeItem('a11ySettings');
    localStorage.removeItem('bc-a11ySettings');
    document.body.className = document.body.className.replace(/\ba11y-\S+/g, '').trim();
    document.documentElement.className = document.documentElement.className.replace(/\ba11y-\S+/g, '').trim();
    document.documentElement.style.removeProperty('--mouse-y');
    stopSpeech();
  };

  if (!isOpen) return null;

  const buttons = [
    { id: 'bigger-text', icon: 'fa-solid fa-t', icon2: 'fa-solid fa-t', size2: '0.7em', label: 'Bigger Text' },
    { id: 'smaller-text', icon: 'fa-solid fa-t', icon2: 'fa-solid fa-t', size2: '0.7em', color: '#ccc', label: 'Smaller Text' },
    { id: 'text-spacing', icon: 'fa-solid fa-arrows-left-right', label: 'Text Spacing' },
    { id: 'line-height', icon: 'fa-solid fa-arrows-up-down', label: 'Line Height' },
    { id: 'dyslexia', icon: 'fa-solid fa-d', label: 'Dyslexia Friendly' },
    { id: 'adhd', icon: 'fa-solid fa-bolt', label: 'ADHD Mode' },
    { id: 'saturation', icon: 'fa-solid fa-droplet', label: 'Saturation' },
    { id: 'light-dark', icon: 'fa-solid fa-moon', label: 'Light-Dark' },
    { id: 'invert', icon: 'fa-solid fa-circle-half-stroke', label: 'Invert Colors' },
    { id: 'links', icon: 'fa-solid fa-link', label: 'Highlight Links' },
    { id: 'tts', icon: 'fa-solid fa-wave-square', label: 'Text To Speech' },
    { id: 'cursor', icon: 'fa-solid fa-arrow-pointer', label: 'Cursor' },
    { id: 'pause', icon: 'fa-solid fa-circle-pause', label: 'Pause Animation' },
    { id: 'hide-images', icon: 'fa-solid fa-image-slash', label: 'Hide Images' },
  ];

  return createPortal(
    <>
      <div className="a11y-overlay" onClick={onClose}></div>
      <div className="a11y-menu">
        <div className="a11y-header">
          <div className="a11y-title-group">
            <h3>Accessibility options</h3>
          </div>
          <button className="a11y-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="a11y-content">
          <div className="a11y-grid">
            {buttons.map((btn) => {
              if (btn.id === 'light-dark') {
                return (
                  <AnimatedThemeToggler
                    key={btn.id}
                    className={`a11y-btn ${activeSettings[btn.id] ? 'active' : ''}`}
                    onClick={() => toggleSetting(btn.id)}
                    variant="circle"
                  >
                    {(isDark) => (
                      <>
                        <div className="a11y-icon-wrapper" style={{ color: btn.color || 'inherit' }}>
                          <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                        </div>
                        <span>{btn.label}</span>
                      </>
                    )}
                  </AnimatedThemeToggler>
                )
              }
              return (
                <button 
                  key={btn.id} 
                  className={`a11y-btn ${activeSettings[btn.id] ? 'active' : ''}`}
                  onClick={() => toggleSetting(btn.id)}
                >
                  <div className="a11y-icon-wrapper" style={{ color: btn.color || 'inherit' }}>
                    {btn.icon2 ? (
                      <>
                        <i className={btn.icon}></i>
                        <i className={btn.icon2} style={{ fontSize: btn.size2, marginLeft: '2px' }}></i>
                      </>
                    ) : (
                      <i className={btn.icon}></i>
                    )}
                  </div>
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="a11y-footer">
          <button className="a11y-reset-btn" onClick={resetSettings}>
            <i className="fa-solid fa-rotate-right"></i> Reset All Settings
          </button>

        </div>
      </div>
    </>,
    document.body
  );
}
