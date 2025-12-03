import React, { useState, useRef, useEffect } from "react";

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onFocusChange: (isFocused: boolean) => void;
  onSmileChange: (isSmiling: boolean) => void;
  onTypingStart: () => void;
  onIdle: () => void;
}

const HAPPY_KEYWORDS = [
  "lol",
  "haha",
  "happy",
  "smile",
  "fun",
  "good",
  "love",
  "like",
  "great",
  "wow",
  "嘻嘻",
  "哈哈",
  "开心",
  "笑",
  "棒",
  "赞",
  "😊",
  "😂",
  "🥰",
  "^_^",
  ":)",
  ":-)",
];

const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading,
  onFocusChange,
  onSmileChange,
  onTypingStart,
  onIdle,
  onEnterZenMode,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const hasStartedTypingRef = useRef(false);

  const checkSentiment = (text: string) => {
    const lower = text.toLowerCase();
    const isSmiling = HAPPY_KEYWORDS.some((k) => lower.includes(k));
    onSmileChange(isSmiling);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    checkSentiment(val);

    // Typing Logic
    if (val.trim().length > 0) {
      if (!hasStartedTypingRef.current) {
        onTypingStart();
        hasStartedTypingRef.current = true;
      }

      // Reset idle timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        onIdle();
        hasStartedTypingRef.current = false;
      }, 3000); // 3 seconds idle
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    onSmileChange(false);
    hasStartedTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg relative mx-auto pointer-events-auto flex items-end gap-2"
    >
       {/* Zen Mode Button */}
       <button
        type="button"
        onClick={onEnterZenMode}
        className="w-11 h-11 rounded-[20px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-white hover:scale-105 transition-all duration-300 mb-2"
        title="Zen Writing Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
            <line x1="16" y1="8" x2="2" y2="22"></line>
            <line x1="17.5" y1="15" x2="9" y2="15"></line>
        </svg>
      </button>

      <div
        className={`flex-1 relative flex items-end gap-2 backdrop-blur-xl rounded-[28px] p-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border transition-all duration-500 ${
          isLoading
            ? "bg-stone-50/50 border-stone-100"
            : "bg-white/80 border-white/50 focus-within:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] focus-within:bg-white/95 focus-within:scale-[1.01]"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          placeholder="Tell me how you feel..."
          className="w-full bg-transparent border-none focus:ring-0 text-stone-600 placeholder-stone-400 resize-none py-3 px-5 max-h-[120px] text-base leading-relaxed overflow-y-auto hide-scrollbar outline-none font-medium"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`flex-shrink-0 w-11 h-11 rounded-[20px] mb-0.5 mr-0.5 flex items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            input.trim() && !isLoading
              ? "bg-stone-800 text-stone-50 shadow-md translate-y-0 opacity-100 scale-100 rotate-0 hover:bg-stone-700 hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-transparent text-stone-300 translate-y-4 opacity-0 scale-50 pointer-events-none absolute right-2 rotate-45"
          }`}
        >
          {isLoading ? (
            <div className="w-2.5 h-2.5 bg-stone-300 rounded-full animate-ping"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              fill="none"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputArea;
