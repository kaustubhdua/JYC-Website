import React, { Children, useRef, useState } from 'react';
import './FlipCard.css';

/**
 * React Bits 3D FlipCard Component
 * Ref: https://reactbits.dev/components/flip-card
 * Provides smooth 3D flip animation between front and back faces with full keyboard & accessibility support.
 */
export default function FlipCard({ front, back, children, className = '', label = 'Flip card' }) {
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const focusFace = next => requestAnimationFrame(() => (next ? backRef.current : frontRef.current)?.focus({ preventScroll: true }));
  const faces = Children.toArray(children);
  const frontContent = front ?? faces[0] ?? null;
  const backContent = back ?? faces[1] ?? null;

  const handleCardClick = (e) => {
    // If clicking an interactive child (e.g. LinkedIn link, button, input), do not flip
    if (e.target.closest('a, button, input, textarea, select, [data-flip-ignore]')) {
      return;
    }
    setFlipped(prev => { const next = !prev; focusFace(next); return next; });
  };

  const handleFlipBack = (e) => {
    e.stopPropagation();
    setFlipped(false);
    requestAnimationFrame(() => frontRef.current?.focus({ preventScroll: true }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Don't intercept if target is a link or inner button
      if (e.target.closest('a, button, input')) return;
      e.preventDefault();
      setFlipped(prev => { const next = !prev; focusFace(next); return next; });
    }
    if (e.key === 'Escape' && flipped) {
      e.preventDefault();
      setFlipped(false);
      requestAnimationFrame(() => frontRef.current?.focus({ preventScroll: true }));
    }
  };

  return (
    <div
      className={`flip-card ${flipped ? 'is-flipped' : ''} ${className}`.trim()}
      role="region"
      aria-label={label}
      aria-expanded={flipped}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flip-card__inner">
        {/* Front Face */}
        <div
          ref={frontRef}
          tabIndex={-1}
          className="flip-card__face flip-card__front"
          aria-hidden={flipped}
          inert={flipped}
        >
          {frontContent}
        </div>

        {/* Back Face */}
        <div
          ref={backRef}
          tabIndex={-1}
          className="flip-card__face flip-card__back"
          aria-hidden={!flipped}
          inert={!flipped}
        >
          {backContent}
          <button
            type="button"
            className="flip-card__back-trigger"
            aria-label={`Return to photo for ${label}`}
            onClick={handleFlipBack}
          >
            ← Back to photo
          </button>
        </div>
      </div>
      <span className="flip-card__sr-only" aria-live="polite">
        {flipped ? 'Profile details shown.' : 'Photo shown.'}
      </span>
    </div>
  );
}
