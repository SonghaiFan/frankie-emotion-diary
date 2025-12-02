
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { WAITING_MESSAGES } from '../constants';

// Typewriter Effect Component
const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const isCompleteRef = useRef(false);
  
  useEffect(() => {
    // Reset state when text prop changes
    setDisplayedText('');
    isCompleteRef.current = false;
    
    if (!text) {
        if (onComplete && !isCompleteRef.current) {
            isCompleteRef.current = true;
            onComplete();
        }
        return;
    }

    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex++;
      // Set text slice from 0 to currentIndex
      // This includes the character at index 0 immediately on the first tick (currentIndex=1)
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        if (onComplete && !isCompleteRef.current) {
            isCompleteRef.current = true;
            onComplete();
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  // Removed animate-fade-in class to prevent first letters from being invisible during fade-in
  return <span>{displayedText}</span>;
};

interface SpeechBubbleProps {
  message: Message | null;
  isLoading: boolean;
  isVisible: boolean;
  theme: {
    secondary: string;
    noteBg: string;
  };
  onTypingComplete: () => void;
  isTypingComplete: boolean;
  onSaveTodo: (text: string) => void;
  isTodoSaved: (text: string) => boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  isLoading,
  isVisible,
  theme,
  onTypingComplete,
  isTypingComplete,
  onSaveTodo,
  isTodoSaved,
  onMouseEnter,
  onMouseLeave
}) => {
  const [waitingMessage, setWaitingMessage] = useState('');

  // Randomize waiting message when loading starts
  useEffect(() => {
    if (isLoading) {
      const msg = WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)];
      setWaitingMessage(msg);
    }
  }, [isLoading]);
  
  if (!message && !isLoading) return null;

  return (
    <div 
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 sm:mb-4 w-[90vw] sm:w-80 max-w-[calc(100vw-2rem)] z-20 pointer-events-auto origin-bottom animate-slide-up-fade ${
        !isVisible ? '!opacity-0 !scale-95 !pointer-events-none transition-all duration-700 ease-in-out' : ''
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div 
        className="p-6 md:p-8 backdrop-blur-2xl transition-all duration-500 relative select-none"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '3rem',
            borderBottomLeftRadius: '1rem',
            boxShadow: `
              0 0 30px -5px rgba(255, 255, 255, 0.9),
              0 0 60px -15px ${theme.secondary}
            `,
            border: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <p className="text-stone-500 text-sm font-medium italic animate-pulse transition-opacity duration-500">
                {waitingMessage}
              </p>
              <div className="flex gap-1 justify-center opacity-50 mt-1">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-stone-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium mix-blend-multiply break-words">
              <TypewriterText 
                text={message?.text || ''} 
                onComplete={onTypingComplete} 
              />
            </p>
            
            {message?.suggestions && message.suggestions.length > 0 && isTypingComplete && (
              <div className="flex flex-wrap gap-2 overflow-hidden mt-1">
                {message.suggestions.map((suggestion, idx) => {
                  const saved = isTodoSaved(suggestion);
                  if (saved) return null; 
                  
                  return (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); onSaveTodo(suggestion); }}
                      style={{ 
                        backgroundColor: theme.noteBg, 
                        color: '#44403C',
                        animationDelay: `${idx * 0.15}s`
                      }}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-sm border border-black/5 hover:bg-white text-xs font-medium flex items-center gap-1 transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md hover:ring-1 ring-white animate-pop-in opacity-0 fill-mode-forwards"
                    >
                      <span style={{ color: theme.secondary }}>+</span> {suggestion}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechBubble;
