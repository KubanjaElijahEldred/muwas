import React, { useMemo, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { assistantSuggestions, getAssistantResponse } from '../data/siteKnowledge';

const SiteAssistant = ({ siteProducts = [] }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'I am the MUWAS website guide. Ask me about products, the story page, tours, payments, contact details, or where to find something on the site.',
      links: [
        { label: 'Products', path: '/products' },
        { label: 'Story', path: '/story' },
        { label: 'Contact', path: '/contact' },
      ],
    },
  ]);

  const promptSuggestions = useMemo(() => assistantSuggestions, []);
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const saved = window.localStorage.getItem('muwas-assistant-position');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const dragStartRef = useRef(null);

  const sendMessage = (question) => {
    const query = question.trim();
    if (!query) {
      return;
    }

    const reply = getAssistantResponse(query, siteProducts, location.pathname);

    setMessages((current) => [
      ...current,
      { id: `user-${current.length + 1}`, role: 'user', text: query, links: [] },
      {
        id: `assistant-${current.length + 2}`,
        role: 'assistant',
        text: reply.text,
        links: reply.links || [],
      },
    ]);
    setInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleDragStart = (event) => {
    if (event.target.closest('button')) {
      return;
    }

    dragStartRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      baseX: position?.x ?? (window.innerWidth - 360),
      baseY: position?.y ?? (window.innerHeight - 120),
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDragMove = (event) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== event.pointerId) {
      return;
    }

    const nextX = dragStartRef.current.baseX + (event.clientX - dragStartRef.current.originX);
    const nextY = dragStartRef.current.baseY + (event.clientY - dragStartRef.current.originY);
    const boundedX = Math.max(8, Math.min(nextX, window.innerWidth - 72));
    const boundedY = Math.max(8, Math.min(nextY, window.innerHeight - 72));
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    if (!position) {
      dragStartRef.current = null;
      return;
    }

    try {
      window.localStorage.setItem('muwas-assistant-position', JSON.stringify(position));
    } catch {
      // Ignore persistence issues.
    }

    dragStartRef.current = null;
  };

  return (
    <div
      className={`muwas-assistant ${isOpen ? 'is-open' : ''}`}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
    >
      {isOpen && (
        <section className="muwas-assistant__panel" aria-label="Website assistant">
          <header
            className="muwas-assistant__header muwas-assistant__drag-handle"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            <div className="muwas-assistant__title">
              <span className="muwas-assistant__badge">
                <Sparkles size={15} strokeWidth={1.9} />
              </span>
              <div>
                <strong>Muwas AI Guide</strong>
                <small>Website help, products, tours, story, payments</small>
              </div>
            </div>

            <button
              type="button"
              className="muwas-assistant__close"
              onClick={() => setIsOpen(false)}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              aria-label="Close assistant"
            >
              <X size={18} strokeWidth={1.9} />
            </button>
          </header>

          <div className="muwas-assistant__messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`muwas-assistant__message muwas-assistant__message--${message.role}`}
              >
                <p>{message.text}</p>

                {message.links?.length > 0 && (
                  <div className="muwas-assistant__links">
                    {message.links.map((link) => (
                      <Link
                        key={`${message.id}-${link.path}`}
                        to={link.path}
                        className="muwas-assistant__link"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="muwas-assistant__prompts">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="muwas-assistant__prompt"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="muwas-assistant__composer" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the site..."
              className="muwas-assistant__input"
            />
            <button type="submit" className="muwas-assistant__send" aria-label="Send message">
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="muwas-assistant__toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Open MUWAS AI assistant"
        title="Open MUWAS AI assistant"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <Bot size={19} strokeWidth={1.9} />
      </button>
    </div>
  );
};

export default SiteAssistant;
