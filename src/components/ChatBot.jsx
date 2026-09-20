import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { handleUserMessage, handleQuickCommand } from '../services/chatbot';

// ---------------------------------------------------------------------------
// Reusable chatbot UI — used by both the AIAssistant page and the floating widget
// ---------------------------------------------------------------------------

export default function ChatBot({ context }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const user = context?.user;
  const languageFromContext = (user && user.language) || (typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : 'en') || 'en';

  const welcomeResponse = useMemo(() => {
    return handleUserMessage('hello', { user, applications: context?.applications || [] });
  }, [user, context]);

  useEffect(() => {
    // Prime the chat with the welcome message on first render
    if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: welcomeResponse.text, 
        lang: welcomeResponse.lang, 
        suggestions: welcomeResponse.suggestions 
      }]);
    }
  }, [messages.length, welcomeResponse]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((msgBlock) => {
    setMessages((prev) => [...prev, msgBlock]);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    addMessage({ role: 'user', text });
    setLoading(true);

    // Give the UI a breath before the reply
    setTimeout(() => {
      try {
        const reply =
          handleQuickCommand(text, context) ||
          handleUserMessage(text, context || { user: null, applications: [] });

        addMessage({
          role: 'ai',
          text: reply.text || "I'm not sure how to help with that. Try asking something else.",
          lang: reply.lang,
          suggestions: (reply.suggestions && reply.suggestions.length > 0) ? reply.suggestions : undefined,
        });
      } catch (err) {
        addMessage({
          role: 'ai',
          text: "Sorry, something went wrong on my end. Please try again.",
        });
        console.error('Chatbot error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [input, addMessage, context]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const renderMessage = useCallback(
    (text) => {
      if (!text) return null;
      // Split out markdown-style bold markers for a cleaner look
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div
          className="message-content"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </div>
      );
    },
    []
  );

  const renderSuggestionChips = useCallback((chips) => {
    if (!chips || chips.length === 0) return null;
    return (
      <div className="suggestion-chips">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => {
              setInput(chip.label);
              // Auto-send a small delay after setting input
              setTimeout(() => handleSend(), 80);
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    );
  }, [handleSend]);

  return (
    <div className="chat-container">
      {/* Suggestion chips after AI messages? We'll render them inline below AI messages */}
      <div className="chat-messages" id="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === 'ai' ? 'ai-message' : 'user-message'}`}>
            {renderMessage(msg.text)}
            {msg.role === 'ai' && msg.suggestions && (
              <div className="suggestion-chips-inline">
                {renderSuggestionChips(msg.suggestions)}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          id="send-msg-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          title="Send message"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
        </button>
      </div>
    </div>
  );
}
