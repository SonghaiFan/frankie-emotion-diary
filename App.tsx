
import React, { useState, useEffect, useRef } from 'react';
import AuroraSphere, { EyeType, MouthType, AccessoryType } from './components/AuroraSphere';
import InputArea from './components/InputArea';
import MemoWall from './components/MemoWall';
import DebugPanel from './components/DebugPanel';
import { sendMessage } from './services/geminiService';
import { Message, Category, Emotion, TodoItem } from './types';
import { CATEGORY_THEMES } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>('default');
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [forceSmile, setForceSmile] = useState(false);
  const [savedTodos, setSavedTodos] = useState<TodoItem[]>([]);
  
  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [debugOverrides, setDebugOverrides] = useState<{
    eyes?: EyeType;
    mouth?: MouthType;
    accessory?: AccessoryType;
  }>({});
  
  // Canvas State (Infinite Pan)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Avatar Physics State
  const [avatarPos, setAvatarPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight * 0.8 });
  const [isPaused, setIsPaused] = useState(false); // Pauses physics when hovering bubble
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.8 });
  
  // Initial setup
  useEffect(() => {
    // Initial greeting bubble
    const greeting: Message = {
      id: 'init',
      role: 'model',
      text: "你好。我是你的心灵陪伴者。今天感觉怎么样？\nHello. I am Aurora. How are you feeling today?",
      timestamp: Date.now(),
      suggestions: ["深呼吸 Deep Breath", "喝杯水 Drink Water"]
    };
    setMessages([greeting]);
    setCurrentEmotion('calm');
  }, []);

  // --- Animation Loop ---
  useEffect(() => {
    let animationFrameId: number;
    let time = Math.random() * 100; // Random start time

    const animate = () => {
      if (!isPaused) {
        // Reduced speed for "Cloud-like" movement
        time += 0.0015; // Very slow time progression
        
        // Base screen center
        const cx = window.innerWidth / 2;
        
        // Constraint: Keep avatar strictly in the lower portion (above input)
        // 190px from bottom ensures it sits just above the input area
        const cy = window.innerHeight - 190; 
        
        // Wander range (Restricted to keep it near center/input)
        const rx = Math.min(window.innerWidth * 0.1, 40); 
        const ry = 10; // Very gentle vertical float

        // Perlin-ish noise using sine superposition
        const wanderX = Math.sin(time) * rx + Math.sin(time * 0.5) * (rx * 0.5);
        const wanderY = Math.cos(time * 0.8) * ry + Math.sin(time * 0.3) * (ry * 0.5);
        
        let targetX = cx + wanderX;
        let targetY = cy + wanderY;

        // If input focused, lock to center for better eye contact
        if (isInputFocused) {
          targetX = cx;
          targetY = cy;
        }

        targetPos.current.x = targetX;
        targetPos.current.y = targetY;

        // Lerp current position to target
        // Very low factor for heavy, cloud-like inertia
        const lerpFactor = 0.003; 
        
        setAvatarPos(prev => ({
          x: prev.x + (targetPos.current.x - prev.x) * lerpFactor,
          y: prev.y + (targetPos.current.y - prev.y) * lerpFactor
        }));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInputFocused, isPaused]);


  // --- Logic ---

  const parseResponse = (rawText: string): { text: string; emotion: Emotion; category: Category; suggestions: string[] } => {
    let emotion: Emotion = 'neutral';
    let category: Category = 'default';
    let cleanText = rawText;

    // Extract Emotion Tag: [HAPPY]
    const emotionMatch = cleanText.match(/\[(NEUTRAL|HAPPY|CALM|EXCITED|SAD|SURPRISED|FOCUSED|CONFUSED|TIRED|ANGRY|LOVE|GRATEFUL|HUNGRY)\]/i);
    if (emotionMatch) {
      emotion = emotionMatch[1].toLowerCase() as Emotion;
      cleanText = cleanText.replace(emotionMatch[0], '');
    }

    // Extract Category Tag: [NATURE]
    const categoryMatch = cleanText.match(/\[(DEFAULT|SENSORY|VISUAL|NATURE|CONNECTION|CREATIVE|TRANQUIL|PRESENT)\]/i);
    if (categoryMatch) {
      category = categoryMatch[1].toLowerCase() as Category;
      cleanText = cleanText.replace(categoryMatch[0], '');
    }

    // Extract Suggestions
    const suggestions: string[] = [];
    const todoRegex = /<TODO>(.*?)<\/TODO>/gi;
    let todoMatch;
    while ((todoMatch = todoRegex.exec(cleanText)) !== null) {
      suggestions.push(todoMatch[1].trim());
    }
    cleanText = cleanText.replace(todoRegex, '').trim();

    return { emotion, category, text: cleanText, suggestions };
  };

  const handleSend = async (text: string) => {
    setIsLoading(true);
    setCurrentEmotion('focused'); 

    try {
      const rawResponse = await sendMessage(text);
      const { text: cleanText, emotion, category, suggestions } = parseResponse(rawResponse);

      setCurrentCategory(category);
      setCurrentEmotion(emotion);

      const modelMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: cleanText,
        timestamp: Date.now(),
        suggestions: suggestions
      };
      
      setMessages([modelMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "The connection is a bit fuzzy...",
        timestamp: Date.now(),
      };
      setMessages([errorMsg]);
      setCurrentEmotion('sad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTodo = (text: string) => {
    if (savedTodos.some(t => t.text === text)) return;

    // --- Infinite Canvas Spawning Logic ---
    // Spawn in the VISIBLE top area, regardless of current pan offset.
    const screenX = Math.random() * (window.innerWidth - 100) + 50;
    const screenY = Math.random() * (window.innerHeight * 0.3) + 80;

    // Convert to Canvas Coordinates by subtracting current offset
    const canvasX = screenX - canvasOffset.x;
    const canvasY = screenY - canvasOffset.y;
    
    // Use consistent color from Category Theme
    const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;
    
    const newTodo: TodoItem = {
      id: Date.now().toString() + Math.random().toString(),
      text,
      completed: false,
      timestamp: Date.now(),
      x: canvasX, 
      y: canvasY, 
      rotation: (Math.random() - 0.5) * 8,
      color: theme.noteBg // Unified color
    };
    setSavedTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setSavedTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setSavedTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateTodoPosition = (id: string, x: number, y: number) => {
    setSavedTodos(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  }

  const isTodoSaved = (text: string) => savedTodos.some(t => t.text === text);
  const lastModelMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Determine if all suggestions in the current message have been saved
  const hasSuggestions = lastModelMessage?.suggestions && lastModelMessage.suggestions.length > 0;
  const allSuggestionsSaved = hasSuggestions && lastModelMessage.suggestions.every(s => isTodoSaved(s));
  
  // Hide bubble if we aren't loading AND all suggestions are done
  const shouldHideBubble = !isLoading && allSuggestionsSaved;

  // Theme for current category (used for stickers and suggestions)
  const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FDFBF7] touch-none">
      
      {/* 1. Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply transition-colors duration-1000 z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${
           currentCategory === 'nature' ? 'bg-sky-100' : 
           currentCategory === 'sensory' ? 'bg-pink-100' : 
           'bg-blue-50'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${
            currentCategory === 'creative' ? 'bg-purple-100' :
            'bg-cyan-50'
        }`} />
      </div>

      {/* 2. Memo Wall (Pannable Canvas) */}
      <MemoWall 
        todos={savedTodos} 
        onUpdateTodoPosition={updateTodoPosition}
        onDeleteTodo={deleteTodo}
        onToggleTodo={toggleTodo}
        canvasOffset={canvasOffset}
        onPanChange={setCanvasOffset}
      />

      {/* 3. Avatar Container (Floating Sprite) */}
      <div 
        className="absolute z-30 transition-none will-change-transform pointer-events-none"
        style={{ 
          transform: `translate(${avatarPos.x - 128}px, ${avatarPos.y - 128}px)`, // Anchor Center
        }}
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Sphere */}
          <div className="relative z-10 pointer-events-none">
            <AuroraSphere 
              isThinking={isLoading} 
              category={currentCategory}
              emotion={currentEmotion} 
              isInputFocused={isInputFocused}
              forceSmile={forceSmile}
              eyeOverride={debugOverrides.eyes}
              mouthOverride={debugOverrides.mouth}
              accessoryOverride={debugOverrides.accessory}
            />
          </div>

          {/* Speech Bubble: Centered Above Head */}
          {(lastModelMessage || isLoading) && (
            <div 
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-[85vw] z-20 pointer-events-auto transition-all duration-700 ease-in-out ${
                shouldHideBubble ? 'opacity-0 translate-y-4 scale-95 pointer-events-none delay-500' : 'opacity-100 translate-y-0 scale-100'
              }`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div 
                className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-xl rounded-[2rem] rounded-bl-none transition-all duration-500"
              >
                {isLoading ? (
                   <div className="flex gap-1 py-2 justify-center">
                     <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-200"></span>
                   </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {lastModelMessage?.text}
                    </p>
                    
                    {/* Suggestions Chip inside Bubble */}
                    {lastModelMessage?.suggestions && lastModelMessage.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 overflow-hidden mt-1">
                        {lastModelMessage.suggestions.map((suggestion, idx) => {
                          const saved = isTodoSaved(suggestion);
                          if (saved) return null; // Immediately remove saved items from view
                          
                          return (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); handleSaveTodo(suggestion); }}
                              style={{ 
                                backgroundColor: theme.noteBg,
                                color: '#44403C' // stone-700
                              }}
                              className="px-3 py-1.5 md:px-4 md:py-2 rounded-sm border border-transparent hover:border-black/5 text-xs font-medium flex items-center gap-1 transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md"
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
          )}
        </div>
      </div>

      {/* 4. Input Layer */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-40 flex flex-col items-center pointer-events-none">
        <InputArea 
          onSend={handleSend} 
          isLoading={isLoading} 
          onFocusChange={setIsInputFocused}
          onSmileChange={setForceSmile}
        />
      </div>

      {/* 5. Debug Panel & Toggle */}
      {showDebug && (
        <DebugPanel
          currentCategory={currentCategory}
          currentEmotion={currentEmotion}
          isThinking={isLoading}
          forceSmile={forceSmile}
          isInputFocused={isInputFocused}
          onCategoryChange={setCurrentCategory}
          onEmotionChange={setCurrentEmotion}
          onThinkingChange={setIsLoading}
          onSmileChange={setForceSmile}
          onFocusChange={setIsInputFocused}
          onOverrideChange={(eyes, mouth, accessory) => setDebugOverrides({ eyes, mouth, accessory })}
          onClose={() => setShowDebug(false)}
        />
      )}
      
      {/* Debug Toggle Button (Bottom Left, Subtle) */}
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 z-50 p-2 text-stone-300 hover:text-stone-500 hover:bg-white/50 rounded-full transition-all opacity-20 hover:opacity-100 pointer-events-auto"
        title="Open Debug Panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

    </div>
  );
};

export default App;
