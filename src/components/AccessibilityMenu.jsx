import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './AccessibilityMenu.css';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
export default function AccessibilityMenu({ isOpen, onClose }) {
  const [activeSettings, setActiveSettings] = useState(() => {
    const saved = localStorage.getItem('a11ySettings');
    return saved ? JSON.parse(saved) : {};
  });

  const ttsEnabledRef = useRef(activeSettings.tts || false);
  const hoverTimeoutRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    ttsEnabledRef.current = !!activeSettings.tts;
    if (!activeSettings.tts) {
      window.speechSynthesis?.cancel();
      clearTimeout(hoverTimeoutRef.current);
    }
  }, [activeSettings.tts]);

  // Attach hover listeners once, check ref inside handler
  useEffect(() => {
    const handleMouseOver = (e) => {
      if (!ttsEnabledRef.current) return;

      // Only skip the overlay backdrop click-catcher
      if (e.target.closest('.a11y-overlay')) {
        return;
      }

      const el = e.target;
      let text = '';

      // For accessibility menu buttons, read the label text
      const a11yBtn = el.closest('.a11y-btn');
      if (a11yBtn) {
        const spanEl = a11yBtn.querySelector('span');
        text = spanEl ? spanEl.textContent : a11yBtn.textContent;
      }
      // Handle SVG elements (graph numbers, labels)
      else if (el instanceof SVGElement) {
        // For SVG text/tspan elements, read textContent directly
        if (el.tagName === 'text' || el.tagName === 'tspan') {
          text = el.textContent || '';
        }
        // For other SVG elements (paths, groups), check aria-label or find parent with text
        else {
          text = el.getAttribute('aria-label') || '';
          if (!text) {
            // Look for foreignObject content inside SVG (like PieCenter)
            const foreignObj = el.closest('foreignObject') || el.querySelector('foreignObject');
            if (foreignObj) {
              text = foreignObj.innerText || foreignObj.textContent || '';
            }
          }
          if (!text) {
            // Check parent group for aria-label
            const parentG = el.closest('g[aria-label]');
            if (parentG) text = parentG.getAttribute('aria-label');
          }
        }
      }
      // Regular HTML elements
      else {
        text = el.getAttribute('aria-label') || el.title || '';

        if (!text) {
          // Prefer the direct text content of the hovered element
          const directText = Array.from(el.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent)
            .join(' ')
            .trim();

          text = directText || el.innerText || el.textContent || '';
        }
      }

      text = (text || '').trim();
      if (!text || text.length > 300) return;

      clearTimeout(hoverTimeoutRef.current);

      hoverTimeoutRef.current = setTimeout(() => {
        if (!ttsEnabledRef.current) return;
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('TTS error:', err);
        }
      }, 300);
    };

    const handleMouseOut = () => {
      clearTimeout(hoverTimeoutRef.current);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      clearTimeout(hoverTimeoutRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []); // Mount once, never re-attach

  const toggleSetting = (setting) => {
    setActiveSettings((prev) => {
      const isActive = !prev[setting];
      
      // Handle global CSS classes for demo purposes
      if (isActive) {
        document.body.classList.add(`a11y-${setting}`);
        if (setting === 'tts' && window.speechSynthesis) {
          // Unlock speech synthesis with a real user gesture + audible confirmation
          window.speechSynthesis.cancel();
          const unlock = new SpeechSynthesisUtterance('Text to speech enabled. Hover over any text to hear it.');
          unlock.lang = 'en-US';
          unlock.rate = 1;
          unlock.volume = 1;
          window.speechSynthesis.speak(unlock);
        }
      } else {
        document.body.classList.remove(`a11y-${setting}`);
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
    // Remove all a11y classes from body
    document.body.className = document.body.className.replace(/\ba11y-\S+/g, '').trim();
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
