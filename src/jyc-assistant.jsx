import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizeSearch, rankSearchResults } from './lib/search.js';
import { hubDetails } from './v23.6-hub-details.js';

const JYC_LOGO = import.meta.env.PROD ? '/assets/jyc-logo.webp' : '/JYC%20Logo(4).png';

const published = data => ({
  clubs: (data?.clubs || []).filter(c => c?.published && c?.status !== 'archived'),
  events: (data?.events || []).filter(e => e?.published && !e?.archived),
  team: (data?.team || []).filter(m => m?.published === true),
  gallery: (data?.gallery || []).filter(g => g?.url && g?.published !== false)
});

const PROMPT_SUGGESTIONS = [
  'When is Converge 2026?',
  'How do I join CICR or OSCode?',
  'Where is the JYC Office in Sector 128?',
  'What sports competitions take place in Kshitij?',
  'Who are the JYC Faculty Coordinators?'
];

// Campus knowledge database for intelligent answers
function answerCampusQuestion(query, { clubs, events, team }) {
  const q = query.toLowerCase().trim();

  if (/converge|cultural fest|annual fest|fest date/i.test(q)) {
    return {
      text: "Converge is the annual flagship inter-college cultural and technical mega-fest of JIIT Sector 128. It hosts Battle of the Bands, Panache Runway, Hackathons, RoboWars, Street Plays, and celebrity Star Night performances.",
      badge: "ANNUAL FLAGSHIP FEST",
      action: { label: "View Converge Highlights →", path: "/events" }
    };
  }

  if (/join|recruitment|audition|apply|register for club/i.test(q)) {
    return {
      text: "Recruitments and auditions for JYC 128 societies open at the beginning of each semester during the Orientation & Freshers cycle. Technical clubs evaluate through tasks and interviews, while cultural wings (VamUnique, Fortissimo, Abhivyakti) conduct live stage auditions.",
      badge: "RECRUITMENT & AUDITIONS",
      action: { label: "Open Recruitment Hub →", path: "/join-jyc" }
    };
  }

  if (/office|room|where is jyc|location|venue|sector 128|campus/i.test(q)) {
    return {
      text: "JIIT Youth Club (JYC) operates at the JIIT Wish Town Campus in Sector 128, Noida. Society rooms, robotics labs (CICR), and rehearsal arenas are located in the student activities wing and academic complexes.",
      badge: "CAMPUS LOCATION",
      action: { label: "Campus Contact & Directions →", path: "/contact" }
    };
  }

  if (/cicr|robotics|drone|dronotics|automation/i.test(q)) {
    return {
      text: "CICR (Robotics & Automation) and Dronotics are the flagship aerial and ground robotics hubs at Sector 128. They organize national drone championships (Dron-O-War) and robotics combat arenas.",
      badge: "TECHNICAL WINGS",
      action: { label: "Explore CICR Hub →", path: "/clubs/cicr" }
    };
  }

  if (/oscode|osdc|coding|hackathon|programming|jai/i.test(q)) {
    return {
      text: "OSDC & OSCode coordinate open-source development, competitive programming, and major hackathons including the Jaypee Agentic AI Hackathon (JAI 2026) and Bitbox.",
      badge: "CODING & AI",
      action: { label: "Explore OSDC Society →", path: "/clubs/osdc" }
    };
  }

  if (/dance|music|fortissimo|vamunique|drama|theatre|panache|fashion/i.test(q)) {
    return {
      text: "JYC's cultural wing includes Fortissimo (Music & Bands), VamUnique (Dance & Choreography), Abhivyakti (Street Plays & Theatre), and Panache (Fashion & Runway). They represent JIIT at top collegiate fests.",
      badge: "CULTURAL WING",
      action: { label: "Explore Cultural Societies →", path: "/clubs" }
    };
  }

  if (/faculty|coordinator|dean|head|leadership|team/i.test(q)) {
    return {
      text: "JYC 128 is guided by the Faculty Advisory Board under the Dean of Student Affairs and led by the Apex Student Council comprising President, Vice President, Secretaries, and Hub Coordinators.",
      badge: "LEADERSHIP & GOVERNANCE",
      action: { label: "Meet the Leadership Team →", path: "/team" }
    };
  }

  if (/kshitij|sport|cricket|football|basketball|badminton/i.test(q)) {
    return {
      text: "The Jaypee Sports Association (JSA) hosts Kshitij, the annual intra-campus sports tournament covering cricket, football, basketball, volleyball, table tennis, badminton, chess, and esports.",
      badge: "SPORTS TOURNAMENT",
      action: { label: "Explore JSA Sports →", path: "/clubs/jsa" }
    };
  }

  // Fallback: search closest matching club or event
  const matchedClub = clubs.find(c => c.name.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q)));
  if (matchedClub) {
    return {
      text: `${matchedClub.name} is an official JYC ${matchedClub.category || matchedClub.type} society at JIIT Sector 128. ${matchedClub.description || matchedClub.about || 'Check their verified society profile for activities and events.'}`,
      badge: `${matchedClub.name.toUpperCase()} · ${matchedClub.category || 'COMMUNITY'}`,
      action: { label: `Explore ${matchedClub.name} →`, path: `/clubs/${matchedClub.id || matchedClub.name}` }
    };
  }

  const matchedEvent = events.find(e => e.title.toLowerCase().includes(q));
  if (matchedEvent) {
    return {
      text: `${matchedEvent.title} is an officially published JYC event. Date: ${matchedEvent.date || 'TBA'} at ${matchedEvent.venue || 'JIIT-128'}.`,
      badge: "CAMPUS EVENT",
      action: { label: "View Event Details →", path: `/events/${matchedEvent.id || matchedEvent.title}` }
    };
  }

  return {
    text: `I searched the verified JYC 128 database for "${query}". You can browse all 23+ student communities or explore upcoming festival schedules directly.`,
    badge: "JYC CAMPUS INTEL",
    action: { label: "Explore All Clubs & Hubs →", path: "/clubs" }
  };
}

export function JYCAssistant({ data, onClose }) {
  const nav = useNavigate();
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'search'
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I'm your JYC 128 AI Campus Guide. Ask me anything about fests like Converge, club recruitments, hackathons, or campus life at Sector 128.",
      badge: "ONLINE · CAMPUS INTEL V4",
      action: { label: "Explore Upcoming Events →", path: "/events" }
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const { clubs, events, team, gallery } = useMemo(() => published(data), [data]);

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleSendQuery = textToSend => {
    const q = (textToSend || query).trim();
    if (!q) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = answerCampusQuestion(q, { clubs, events, team });
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: answer.text,
        badge: answer.badge,
        action: answer.action
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  // Search Mode Data
  const rawSearch = useMemo(() => {
    return [
      ...clubs.map(c => ({ key: `c-${c.id}`, title: c.name, meta: `${c.family || c.category || 'Society'} · Sector 128`, type: 'CLUB', go: () => { onClose?.(); nav(`/clubs/${c.id || c.name}`); } })),
      ...events.map(e => ({ key: `e-${e.id}`, title: e.title, meta: `${e.date || 'Upcoming'} · ${e.venue || 'JIIT-128'}`, type: 'EVENT', go: () => { onClose?.(); nav(`/events/${e.id || e.title}`); } })),
      ...team.map(m => ({ key: `t-${m.id}`, title: m.name, meta: m.role || 'JYC Leadership', type: 'TEAM', go: () => { onClose?.(); nav('/team'); } }))
    ];
  }, [clubs, events, team, nav, onClose]);

  const searchResults = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return [];
    return rankSearchResults(rawSearch, term).slice(0, 8);
  }, [rawSearch, query]);

  return (
    <div className="jyc-assistant-overlay" role="dialog" aria-modal="true" onMouseDown={e => e.target === e.currentTarget && onClose?.()}>
      <section ref={dialogRef} className="jyc-assistant-panel">
        {/* Holographic Header */}
        <div className="jyc-assistant-head">
          <div className="jyc-assistant-brand">
            <span className="jyc-assistant-mark">
              <img src={JYC_LOGO} alt="" onError={e => { e.currentTarget.src = "/assets/jyc-logo.avif"; }} />
            </span>
            <div>
              <div className="jyc-assistant-status-tag">
                <span className="assistant-dot" />
                <span>JYC INTEL 2.0 · VERIFIED CAMPUS AI</span>
              </div>
              <h2>Ask JYC. Instant Campus Knowledge.</h2>
            </div>
          </div>
          <button type="button" className="jyc-assistant-close" onClick={onClose} aria-label="Close Assistant">×</button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="jyc-assistant-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat with JYC AI
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Fast Directory Search
          </button>
        </div>

        {activeTab === 'chat' ? (
          <div className="jyc-chat-container">
            {/* Message Thread */}
            <div className="jyc-chat-thread">
              {messages.map(m => (
                <div key={m.id} className={`chat-bubble-wrap ${m.sender}`}>
                  {m.sender === 'bot' && (
                    <div className="bot-avatar">
                      <img src={JYC_LOGO} alt="" />
                    </div>
                  )}
                  <div className="chat-bubble">
                    {m.badge && <span className="bubble-badge">{m.badge}</span>}
                    <p>{m.text}</p>
                    {m.action && (
                      <button
                        type="button"
                        className="bubble-action-btn"
                        onClick={() => {
                          onClose?.();
                          nav(m.action.path);
                        }}
                      >
                        {m.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-wrap bot">
                  <div className="bot-avatar"><img src={JYC_LOGO} alt="" /></div>
                  <div className="chat-bubble typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="jyc-prompt-chips">
              <span className="prompt-label">Ask quick questions:</span>
              <div className="prompt-list">
                {PROMPT_SUGGESTIONS.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    className="prompt-chip"
                    onClick={() => handleSendQuery(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Row */}
            <div className="jyc-chat-input-row">
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Converge, robotics, auditions, sports..."
                aria-label="Ask JYC AI a question"
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={() => handleSendQuery()}
                disabled={!query.trim()}
              >
                Send ↗
              </button>
            </div>
          </div>
        ) : (
          <div className="jyc-search-mode-container">
            <div className="search-bar-wrap">
              <span>⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search societies, events, or people..."
                autoFocus
              />
              {query && <button type="button" onClick={() => setQuery('')}>×</button>}
            </div>

            <div className="search-results-list">
              {searchResults.length > 0 ? (
                searchResults.map(r => (
                  <button key={r.key} type="button" className="search-result-item" onClick={r.go}>
                    <div>
                      <span className="res-type">{r.type}</span>
                      <strong>{r.title}</strong>
                      <small>{r.meta}</small>
                    </div>
                    <b>↗</b>
                  </button>
                ))
              ) : query ? (
                <div className="no-res">No results for "{query}". Try a club name or event.</div>
              ) : (
                <div className="search-preset-hints">
                  <span>Popular searches:</span>
                  <div className="preset-buttons">
                    <button type="button" onClick={() => { onClose?.(); nav('/clubs'); }}>All Clubs ↗</button>
                    <button type="button" onClick={() => { onClose?.(); nav('/events'); }}>All Events ↗</button>
                    <button type="button" onClick={() => { onClose?.(); nav('/team'); }}>Leadership Team ↗</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .jyc-assistant-overlay {
          position: fixed;
          inset: 0;
          z-index: 12000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(8, 11, 20, 0.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          animation: jycFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .jyc-assistant-panel {
          width: min(720px, calc(100vw - 28px));
          max-height: min(780px, calc(100dvh - 28px));
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 28px;
          background: #0d121f;
          color: #f8fafc;
          box-shadow: 0 36px 100px rgba(0, 0, 0, 0.7), 0 0 50px rgba(212, 175, 55, 0.12);
          padding: 24px;
          overflow: hidden;
        }

        html[data-theme="light"] .jyc-assistant-panel {
          background: #fffcf7;
          color: #1e1915;
          border-color: rgba(191, 156, 111, 0.5);
          box-shadow: 0 30px 90px rgba(184, 134, 11, 0.18);
        }

        .jyc-assistant-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .jyc-assistant-brand {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .jyc-assistant-mark {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #141a29;
          border: 1px solid rgba(212, 175, 55, 0.4);
          display: grid;
          place-items: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        html[data-theme="light"] .jyc-assistant-mark {
          background: #fdfbf7;
          border-color: rgba(191, 156, 111, 0.5);
        }

        .jyc-assistant-mark img {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }

        .jyc-assistant-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .assistant-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .jyc-assistant-head h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 4px 0 0;
        }

        .jyc-assistant-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: transparent;
          color: inherit;
          font-size: 22px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .jyc-assistant-close:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #d4af37;
          transform: rotate(90deg);
        }

        .jyc-assistant-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
        }

        html[data-theme="light"] .jyc-assistant-tabs {
          border-color: rgba(0, 0, 0, 0.08);
        }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          background: transparent;
          border: 1px solid transparent;
          color: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
        }

        /* Chat Layout */
        .jyc-chat-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .jyc-chat-thread {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-right: 6px;
          margin-bottom: 14px;
          max-height: 380px;
        }

        .chat-bubble-wrap {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .chat-bubble-wrap.user {
          justify-content: flex-end;
        }

        .bot-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #141a29;
          border: 1px solid rgba(212, 175, 55, 0.3);
          display: grid;
          place-items: center;
          flex: 0 0 32px;
        }

        .bot-avatar img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .chat-bubble {
          max-width: 82%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 13.5px;
          line-height: 1.55;
        }

        .chat-bubble-wrap.bot .chat-bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top-left-radius: 4px;
        }

        html[data-theme="light"] .chat-bubble-wrap.bot .chat-bubble {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(180, 130, 60, 0.2);
        }

        .chat-bubble-wrap.user .chat-bubble {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #07090e;
          font-weight: 600;
          border-top-right-radius: 4px;
        }

        .bubble-badge {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #d4af37;
          margin-bottom: 6px;
        }

        .bubble-action-btn {
          margin-top: 10px;
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.45);
          color: inherit;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bubble-action-btn:hover {
          background: #d4af37;
          color: #07090e;
          transform: translateY(-2px);
        }

        .chat-bubble.typing {
          display: flex;
          gap: 6px;
          padding: 12px 18px;
        }

        .chat-bubble.typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d4af37;
          animation: typingDot 1.4s infinite ease-in-out;
        }

        .chat-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Prompt suggestions */
        .jyc-prompt-chips {
          margin-bottom: 12px;
        }

        .prompt-label {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.7;
          margin-bottom: 6px;
          display: block;
        }

        .prompt-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .prompt-chip {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prompt-chip:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: #d4af37;
          color: #d4af37;
        }

        /* Input Row */
        .jyc-chat-input-row {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 8px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        html[data-theme="light"] .jyc-chat-input-row {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(180, 130, 60, 0.35);
        }

        .jyc-chat-input-row input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
        }

        .chat-send-btn {
          padding: 8px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffd700, #d4af37);
          color: #07090e;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chat-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
        }

        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Search Mode Layout */
        .jyc-search-mode-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .search-bar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .search-bar-wrap input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-size: 14px;
        }

        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 380px;
          overflow-y: auto;
        }

        .search-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-result-item:hover {
          background: rgba(212, 175, 55, 0.08);
          border-color: #d4af37;
          transform: translateY(-2px);
        }

        .res-type {
          display: block;
          font-size: 9.5px;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.08em;
        }

        .search-result-item strong {
          display: block;
          font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
        }

        .search-result-item small {
          font-size: 12px;
          opacity: 0.75;
        }

        .no-res {
          text-align: center;
          padding: 24px;
          opacity: 0.75;
        }

        .search-preset-hints {
          padding: 16px 0;
        }

        .preset-buttons {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .preset-buttons button {
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          cursor: pointer;
          font-size: 12px;
        }

        @keyframes jycFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
