import { useState, useRef, useEffect, useCallback } from 'react';
import { handleUserMessage, handleQuickCommand } from '../services/chatbot';

// ---------------------------------------------------------------------------
// Reusable chatbot UI — used by both the AIAssistant page and the floating widget
// ---------------------------------------------------------------------------

const WELCOME =
  "Hello! I am your SIH CODEHAWKS AI Assistant. How can I help you check your application status or find new schemes?";

export default function ChatBot({ context }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    addMessage('user', text);
    setLoading(true);

    // Give the UI a breath before the reply
    setTimeout(() => {
      try {
        const reply = handleQuickCommand(text);
        const response =
          reply || handleUserMessage(text, context || { user: null, applications: [] });

        addMessage(
          'ai',
          response.text || "I'm not sure how to help with that. Try asking something else."
        );
      } catch (err) {
        addMessage(
          'ai',
          "Sorry, something went wrong on my end. Please try again."
        );
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
    ({ role, text }) => {
      // Split out markdown-style bold markers for a cleaner look
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div
          className={`message ${role === 'ai' ? 'ai-message' : 'user-message'}`}
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

  return (
    <div className="chat-container">
      <div className="chat-messages" id="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx}>{renderMessage(msg)}</div>
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
