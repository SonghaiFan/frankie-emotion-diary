import React, { useState, useEffect, useRef } from "react";
import { X, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Emotion, Category, EMOTIONS, CATEGORY_THEMES } from "../constants";
import AuroraSphere from "./AuroraSphere";

interface ZenModeProps {
  onExit: () => void;
  onSave: (text: string, emotion: Emotion, category: Category) => void;
  theme: {
    bgGradient: string;
    primary: string;
    secondary: string;
  };
}

const ZenMode: React.FC<ZenModeProps> = ({ onExit, onSave, theme, initialData }) => {
  const [text, setText] = useState(initialData?.text || "");
  const [isExiting, setIsExiting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // If we have initial text, move cursor to end
      if (initialData?.text) {
        textareaRef.current.setSelectionRange(initialData.text.length, initialData.text.length);
      }
    }
  }, [initialData]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(onExit, 500); // Wait for fade out
  };

  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(initialData?.emotion || "neutral");
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialData?.category || "default");

  const handleSave = () => {
    if (!text.trim()) return;
    setIsExiting(true);
    setTimeout(() => {
      onSave(text, selectedEmotion, selectedCategory);
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

  // Memoize AuroraSphere to prevent re-renders on every keystroke
  const memoizedSphere = React.useMemo(() => (
    <AuroraSphere 
        isThinking={false}
        category={selectedCategory}
        emotion={selectedEmotion}
        isInputFocused={false}
        forceSmile={false}
        className="w-200 h-200"
     />
  ), [selectedCategory, selectedEmotion]);

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
      <div className="relative z-10 w-full max-w-3xl h-full flex flex-col p-4 pt-24 md:p-12 md:pt-48 lg:pt-48 lg:pb-16 mx-auto">

        {/* Header - Compact Single Line */}
        <div className="absolute top-0 left-0 right-0 p-2 md:p-6 flex justify-center items-center animate-fade-in z-50">
            <div className="flex items-center gap-2 md:gap-6 bg-white/40 backdrop-blur-md px-3 md:px-6 py-2 rounded-full shadow-sm border border-white/50 max-w-full overflow-x-auto hide-scrollbar">
                
                {/* Date Display - Hidden on very small screens if needed, or kept compact */}
                <div className="text-stone-500 text-[10px] md:text-xs font-bold tracking-widest uppercase whitespace-nowrap shrink-0">
                    {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>

                {/* Divider */}
                <div className="h-3 md:h-4 w-px bg-stone-300/50 shrink-0"></div>

                {/* Emotion Picker */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold hidden sm:inline-block">Mood</span>
                    <div className="flex items-center gap-1 bg-white/50 rounded-full px-1">
                        <button 
                            onClick={() => {
                                const currentIndex = EMOTIONS.indexOf(selectedEmotion);
                                const prevIndex = (currentIndex - 1 + EMOTIONS.length) % EMOTIONS.length;
                                setSelectedEmotion(EMOTIONS[prevIndex]);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-600 transition-colors hover:bg-stone-200/50 rounded-full"
                        >
                            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <div className="w-14 md:w-16 text-center">
                            <div className="text-stone-600 font-medium capitalize text-xs">{selectedEmotion}</div>
                        </div>
                        <button 
                            onClick={() => {
                                const currentIndex = EMOTIONS.indexOf(selectedEmotion);
                                const nextIndex = (currentIndex + 1) % EMOTIONS.length;
                                setSelectedEmotion(EMOTIONS[nextIndex]);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-600 transition-colors hover:bg-stone-200/50 rounded-full"
                        >
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-3 md:h-4 w-px bg-stone-300/50 shrink-0"></div>

                {/* Category Picker */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold hidden sm:inline-block">Topic</span>
                    <div className="flex items-center gap-1 bg-white/50 rounded-full px-1">
                        <button 
                            onClick={() => {
                                const categories = Object.keys(CATEGORY_THEMES) as Category[];
                                const currentIndex = categories.indexOf(selectedCategory);
                                const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
                                setSelectedCategory(categories[prevIndex]);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-600 transition-colors hover:bg-stone-200/50 rounded-full"
                        >
                            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                         <div className="w-14 md:w-16 text-center">
                            <div className="text-stone-600 font-medium capitalize text-xs">{selectedCategory}</div>
                        </div>
                        <button 
                            onClick={() => {
                                const categories = Object.keys(CATEGORY_THEMES) as Category[];
                                const currentIndex = categories.indexOf(selectedCategory);
                                const nextIndex = (currentIndex + 1) % categories.length;
                                setSelectedCategory(categories[nextIndex]);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-600 transition-colors hover:bg-stone-200/50 rounded-full"
                        >
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-3 md:h-4 w-px bg-stone-300/50 shrink-0"></div>

                {/* Close Button */}
                <button 
                    onClick={handleExit}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 shrink-0"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
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
        <div className="flex flex-col items-center gap-4 mt-6 md:mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            
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

              {/* Visual Preview */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-30 pointer-events-none scale-[5] transition-all duration-500">
             {memoizedSphere}
        </div>
    </div>
  );
};

export default ZenMode;
