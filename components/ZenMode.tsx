import React, { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";

interface ZenModeProps {
  onExit: () => void;
  onSave: (text: string) => void;
  theme: {
    bgGradient: string;
    primary: string;
    secondary: string;
  };
}

const ZenMode: React.FC<ZenModeProps> = ({ onExit, onSave, theme }) => {
  const [text, setText] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(onExit, 500); // Wait for fade out
  };

  const handleSave = () => {
    if (!text.trim()) return;
    setIsExiting(true);
    setTimeout(() => {
      onSave(text);
      onExit();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow Shift+Enter for new lines, but maybe Ctrl+Enter to save?
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          handleSave();
      }
      
      if (e.key === 'Escape') {
          handleExit();
      }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 ${
        isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      style={{
        background: theme.bgGradient, // Use the same gradient but maybe with a blur overlay if we wanted, but solid gradient is cleaner for "Zen"
      }}
    >
      {/* Ambient Overlay to soften it further */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-3xl h-full flex flex-col p-6 md:p-12 lg:py-16 mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 md:mb-12 animate-fade-in w-full">
            <div className="text-stone-400 text-xs md:text-sm font-medium tracking-widest uppercase">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <button 
                onClick={handleExit}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-100/50"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Writing Area */}
        <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?..."
            className="flex-1 w-full bg-transparent border-none resize-none outline-none text-lg md:text-2xl leading-relaxed md:leading-loose text-stone-700 placeholder-stone-300 font-serif text-left animate-slide-up-normal"
            style={{ 
                fontFamily: '"Zen Maru Gothic", sans-serif',
                caretColor: theme.secondary 
            }}
        />

        {/* Footer Actions */}
        <div className="flex justify-center mt-6 md:mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
                onClick={handleSave}
                disabled={!text.trim()}
                className={`
                    group relative px-8 py-3 rounded-full flex items-center gap-3 transition-all duration-500
                    ${!text.trim() 
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50' 
                        : 'bg-white text-stone-600 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    }
                `}
            >
                <span className="text-sm font-medium tracking-wide">Save to Diary</span>
                <Check className={`w-4 h-4 ${text.trim() ? 'text-green-500' : ''}`} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default ZenMode;
