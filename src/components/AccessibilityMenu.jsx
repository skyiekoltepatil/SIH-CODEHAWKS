import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './AccessibilityMenu.css';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
export default function AccessibilityMenu({ isOpen, onClose }) {
  const [activeSettings, setActiveSettings] = useState(() => {
    const saved = localStorage.getItem('a11ySettings');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (!activeSettings.tts) {
      window.speechSynthesis?.cancel();
      return;
    }

    let ttsTimeout;
    let lastHoveredElement = null;

    const handleTTSHover = (e) => {
      // Ignore hovers within the accessibility menu itself
      if (e.target.closest('.a11y-menu') || e.target.closest('.a11y-overlay') || e.target.closest('.a11y-btn')) {
        return;
      }

      if (e.target === lastHoveredElement) return;
      lastHoveredElement = e.target;

      clearTimeout(ttsTimeout);
      ttsTimeout = setTimeout(() => {
        const text = e.target.innerText || e.target.textContent;
        // Don't read if it's a huge structural container or empty
        if (text && text.trim() && !['BODY', 'HTML', 'MAIN', 'NAV'].includes(e.target.tagName)) {
          window.speechSynthesis?.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text.trim());
          
          // Some browsers fail silently if no voice is explicitly set
          const voices = window.speechSynthesis?.getVoices();
          if (voices && voices.length > 0) {
            // Try to find a default English voice, or just use the first one
            utterance.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
          }

          // Fix for Chrome/Safari bug: utterance gets garbage collected before speaking
          window.ttsUtterance = utterance;
          
          utterance.onerror = (err) => console.error("TTS Error:", err);
          
          window.speechSynthesis?.speak(utterance);
        }
      }, 500); // 500ms delay
    };

    // Use capture phase to ensure it triggers early
    document.addEventListener('mouseover', handleTTSHover, true);

    return () => {
      document.removeEventListener('mouseover', handleTTSHover, true);
      clearTimeout(ttsTimeout);
      window.speechSynthesis?.cancel();
    };
  }, [activeSettings.tts]);

  // ADHD Mode cursor tracker
  useEffect(() => {
    if (!activeSettings.adhd) return;

    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.style.removeProperty('--mouse-y');
    };
  }, [activeSettings.adhd]);

  const toggleSetting = (setting) => {
    setActiveSettings((prev) => {
      const isActive = !prev[setting];
      
      // Handle global CSS classes for demo purposes
      if (isActive) {
        document.body.classList.add(`a11y-${setting}`);
        document.documentElement.classList.add(`a11y-${setting}`);
        
        // Fix for strict browsers (Safari/Chrome): Unlock speech engine during a direct user click
        if (setting === 'tts' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const unlockUtterance = new SpeechSynthesisUtterance(" ");
          unlockUtterance.volume = 0; // Silent unlock
          window.speechSynthesis.speak(unlockUtterance);
        }
      } else {
        document.body.classList.remove(`a11y-${setting}`);
        document.documentElement.classList.remove(`a11y-${setting}`);
        
        if (setting === 'tts' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
      
      const newSettings = {
        ...prev,
        [setting]: isActive,
      };
      localStorage.setItem('a11ySettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setActiveSettings({});
    localStorage.removeItem('a11ySettings');
    // Remove all a11y classes from body and html
    document.body.className = document.body.className.replace(/\ba11y-\S+/g, '').trim();
    document.documentElement.className = document.documentElement.className.replace(/\ba11y-\S+/g, '').trim();
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
