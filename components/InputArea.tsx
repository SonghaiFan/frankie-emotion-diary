
import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onFocusChange: (isFocused: boolean) => void;
  onSmileChange: (isSmiling: boolean) => void;
}

const HAPPY_KEYWORDS = ['lol', 'haha', 'happy', 'smile', 'fun', 'good', 'love', 'like', 'great', 'wow', '嘻嘻', '哈哈', '开心', '笑', '棒', '赞', '😊', '😂', '🥰', '^_^', ':)', ':-)'];

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, onFocusChange, onSmileChange }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkSentiment = (text: string) => {
    const lower = text.toLowerCase();
    const isSmiling = HAPPY_KEYWORDS.some(k => lower.includes(k));
    onSmileChange(isSmiling);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    checkSentiment(val);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    onSmileChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg relative mx-auto pointer-events-auto">
      <div className={`relative flex items-end gap-2 backdrop-blur-md rounded-3xl p-2 shadow-sm border transition-all duration-500 ${
        isLoading ? 'bg-stone-50/50 border-stone-100' : 'bg-white/60 border-stone-200 focus-within:shadow-md focus-within:bg-white/90 focus-within:scale-[1.02]'
      }`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          placeholder="Tell me how you feel..."
          className="w-full bg-transparent border-none focus:ring-0 text-stone-600 placeholder-stone-400 resize-none py-3 px-4 max-h-[120px] text-base leading-relaxed overflow-y-auto hide-scrollbar outline-none"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`flex-shrink-0 p-3 rounded-full mb-1 transition-all duration-500 ease-out ${
            input.trim() && !isLoading
              ? 'bg-gradient-to-tr from-cyan-400 to-blue-400 text-white shadow-lg translate-y-0 opacity-100 rotate-0'
              : 'bg-stone-100 text-stone-300 translate-y-2 opacity-0 -rotate-12 pointer-events-none absolute right-2'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-90">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputArea;
