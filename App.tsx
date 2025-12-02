
import React, { useState, useEffect, useRef } from 'react';
import AuroraSphere, { EyeType, MouthType, AccessoryType } from './components/AuroraSphere';
import InputArea from './components/InputArea';
import MemoWall from './components/MemoWall';
import DebugPanel from './components/DebugPanel';
import SpeechBubble from './components/SpeechBubble';
import { sendMessage } from './services/geminiService';
import { Message, Category, Emotion, TodoItem } from './types';
import { CATEGORY_THEMES, AVATAR_REACTIONS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>('default');
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [forceSmile, setForceSmile] = useState(false);
  const [savedTodos, setSavedTodos] = useState<TodoItem[]>([]);
  
  // Visibility State for Bubble (Managed separately to allow transitions)
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  
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
  const [isPaused, setIsPaused] = useState(false);
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.8 });
  
  // Text Reveal State
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Helper for safe comparison
  const isTodoSaved = (text: string) => savedTodos.some(t => t.text.trim() === text.trim());

  // Initial setup
  useEffect(() => {
    const greeting: Message = {
      id: 'init',
      role: 'model',
      text: "你好啊。我是阿朵拉。今天感觉怎么样？\nHello. I am Aurora. How are you feeling today?",
      timestamp: Date.now(),
      suggestions: ["深呼吸 Deep Breath", "喝杯水 Drink Water"]
    };
    setMessages([greeting]);
    setIsBubbleVisible(true);
    setCurrentEmotion('calm');
  }, []);

  const lastModelMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Reset typing state when message changes
  useEffect(() => {
    setIsTypingComplete(false);
  }, [lastModelMessage?.id]);

  // --- Logic: Bubble Visibility Management ---
  useEffect(() => {
    // Priority 1: Always visible if waiting for a response
    if (isLoading) {
      setIsBubbleVisible(true);
      return;
    }

    if (!lastModelMessage) return;

    // Check if we have unsaved suggestions
    const hasSuggestions = lastModelMessage.suggestions && lastModelMessage.suggestions.length > 0;
    const allSuggestionsSaved = hasSuggestions && lastModelMessage.suggestions?.every(s => isTodoSaved(s));

    // Case 1: All suggestions added -> Hide immediately
    if (hasSuggestions && allSuggestionsSaved) {
       setIsBubbleVisible(false);
       return;
    }

    // Case 2: No suggestions (Chat or Reaction) -> Hide after delay
    if (!hasSuggestions) {
      // Keep chat bubbles visible longer (8s), reactions slightly shorter (5s)
      const delay = 8000; 
      const timer = setTimeout(() => {
        setIsBubbleVisible(false);
      }, delay);
      return () => clearTimeout(timer);
    }
    
    // Case 3: Has unsaved suggestions -> Keep visible indefinitely
    setIsBubbleVisible(true);

  }, [lastModelMessage, savedTodos, isLoading]); // Add isLoading to dependency


  // --- Logic: Avatar Reactions ---
  const triggerReaction = (type: keyof typeof AVATAR_REACTIONS) => {
    // Don't interrupt if loading
    if (isLoading) return;

    // Don't trigger if bubble currently has unsaved suggestions (don't override helpful tools)
    const hasUnsavedSuggestions = lastModelMessage?.suggestions && lastModelMessage.suggestions.some(s => !isTodoSaved(s));
    if (hasUnsavedSuggestions) return;

    const phrases = AVATAR_REACTIONS[type];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Parse the reaction (it might have tags)
    const { text, emotion } = parseResponse(randomPhrase);
    
    // Update emotion if parsed, otherwise set context-aware emotion
    if (emotion !== 'neutral') {
       setCurrentEmotion(emotion);
    } else {
       // Defaults if no tag
       if (type === 'poke') setCurrentEmotion('surprised');
       if (type === 'typing') setCurrentEmotion('focused');
       if (type === 'completion') setCurrentEmotion('excited');
    }

    const reactionMsg: Message = {
      id: `reaction-${Date.now()}`,
      role: 'model',
      text: text,
      timestamp: Date.now(),
      suggestions: []
    };
    
    setMessages(prev => [...prev, reactionMsg]);
    setIsBubbleVisible(true);
  };


  // --- Animation Loop ---
  useEffect(() => {
    let animationFrameId: number;
    let time = Math.random() * 100;

    const animate = () => {
      if (!isPaused) {
        time += 0.0015;
        const cx = window.innerWidth / 2;
        const isMobile = window.innerWidth < 640;
        
        // Closer to bottom on mobile (larger CY value = lower on screen)
        // Desktop: 190px from bottom. Mobile: 130px from bottom (closer to input)
        const cy = window.innerHeight - (isMobile ? 140 : 190); 
        
        // Restrict horizontal wander on mobile to prevent bubble clipping
        const rx = isMobile ? 10 : Math.min(window.innerWidth * 0.1, 40); 
        const ry = 10;

        const wanderX = Math.sin(time) * rx + Math.sin(time * 0.5) * (rx * 0.5);
        const wanderY = Math.cos(time * 0.8) * ry + Math.sin(time * 0.3) * (ry * 0.5);
        
        let targetX = cx + wanderX;
        let targetY = cy + wanderY;

        if (isInputFocused) {
          targetX = cx;
          targetY = cy;
        }

        targetPos.current.x = targetX;
        targetPos.current.y = targetY;

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


  // --- Parsing ---

  const parseResponse = (rawText: string): { text: string; emotion: Emotion; category: Category; suggestions: string[] } => {
    let emotion: Emotion = 'neutral';
    let category: Category = currentCategory; // Default to current if not specified
    let cleanText = rawText;

    const emotionMatch = cleanText.match(/\[(NEUTRAL|HAPPY|CALM|EXCITED|SAD|SURPRISED|FOCUSED|CONFUSED|TIRED|ANGRY|LOVE|GRATEFUL|HUNGRY)\]/i);
    if (emotionMatch) {
      emotion = emotionMatch[1].toLowerCase() as Emotion;
      cleanText = cleanText.replace(emotionMatch[0], '');
    }

    const categoryMatch = cleanText.match(/\[(DEFAULT|SENSORY|VISUAL|NATURE|CONNECTION|CREATIVE|TRANQUIL|PRESENT)\]/i);
    if (categoryMatch) {
      category = categoryMatch[1].toLowerCase() as Category;
      cleanText = cleanText.replace(categoryMatch[0], '');
    }

    const suggestions: string[] = [];
    const todoRegex = /<TODO>(.*?)<\/TODO>/gi;
    let todoMatch;
    while ((todoMatch = todoRegex.exec(cleanText)) !== null) {
      suggestions.push(todoMatch[1].trim());
    }
    cleanText = cleanText.replace(todoRegex, '').trim();

    return { emotion, category, text: cleanText, suggestions };
  };

  // --- Handlers ---

  const handleSend = async (text: string) => {
    setIsLoading(true);
    setIsBubbleVisible(true);
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
      
      setMessages(prev => [...prev, modelMsg]);
      setIsBubbleVisible(true); // Ensure visible on new message

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "The connection is a bit fuzzy...",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentEmotion('sad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTodo = (text: string) => {
    // Safe comparison
    if (savedTodos.some(t => t.text.trim() === text.trim())) return;

    const screenX = Math.random() * (window.innerWidth - 100) + 50;
    const screenY = Math.random() * (window.innerHeight * 0.3) + 80;
    const canvasX = screenX - canvasOffset.x;
    const canvasY = screenY - canvasOffset.y;
    const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;
    
    const newTodo: TodoItem = {
      id: Date.now().toString() + Math.random().toString(),
      text: text.trim(), // Store trimmed
      completed: false,
      timestamp: Date.now(),
      x: canvasX, 
      y: canvasY, 
      rotation: (Math.random() - 0.5) * 8,
      color: theme.noteBg
    };
    setSavedTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setSavedTodos(prev => {
      const newTodos = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      
      // Check for full completion reaction
      const allCompleted = newTodos.length > 0 && newTodos.every(t => t.completed);
      const wasAllCompleted = prev.every(t => t.completed) && prev.length > 0;
      
      // Only trigger if we just transitioned to all completed
      if (allCompleted && !wasAllCompleted) {
        setTimeout(() => triggerReaction('completion'), 500);
      }
      
      return newTodos;
    });
  };

  const deleteTodo = (id: string) => {
    setSavedTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateTodoPosition = (id: string, x: number, y: number) => {
    setSavedTodos(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  }

  // Derived state
  const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;

  return (
    <div 
      className="relative w-full h-screen overflow-hidden touch-none transition-colors duration-1000 ease-in-out"
      style={{ background: theme.bgGradient }} 
    >
      
      {/* 1. Dynamic Background Orbs */}
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

      {/* Credits - Top Right */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-0 text-right pointer-events-none select-none opacity-30 hover:opacity-60 transition-opacity duration-500">
        <p className="text-[9px] sm:text-[10px] text-stone-600 font-bold tracking-wide">Inspired by 武田有纪《高敏感人士幸福清单》</p>
        <p className="text-[9px] sm:text-[10px] text-stone-500 tracking-wider mt-0.5">Made by 范不着frank</p>
      </div>

      {/* 2. Memo Wall */}
      <MemoWall 
        todos={savedTodos} 
        onUpdateTodoPosition={updateTodoPosition}
        onDeleteTodo={deleteTodo}
        onToggleTodo={toggleTodo}
        canvasOffset={canvasOffset}
        onPanChange={setCanvasOffset}
      />

      {/* 3. Avatar Container */}
      <div 
        className="absolute z-30 transition-none will-change-transform pointer-events-none"
        style={{ 
          transform: `translate(${avatarPos.x - 128}px, ${avatarPos.y - 128}px)`,
        }}
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Sphere (Interactive Click) */}
          <div 
            className="relative z-10 pointer-events-auto cursor-pointer"
            onClick={() => triggerReaction('poke')}
          >
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

          {/* Speech Bubble Component */}
          <SpeechBubble 
            message={lastModelMessage || null}
            isLoading={isLoading}
            isVisible={isBubbleVisible}
            theme={{ secondary: theme.secondary, noteBg: theme.noteBg }}
            isTypingComplete={isTypingComplete}
            onTypingComplete={() => setIsTypingComplete(true)}
            onSaveTodo={handleSaveTodo}
            isTodoSaved={isTodoSaved}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          />
        </div>
      </div>

      {/* 4. Input Layer */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 z-40 flex flex-col items-center pointer-events-none">
        <InputArea 
          onSend={handleSend} 
          isLoading={isLoading} 
          onFocusChange={setIsInputFocused}
          onSmileChange={setForceSmile}
          onTypingStart={() => triggerReaction('typing')}
          onIdle={() => triggerReaction('idle')}
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
      
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed top-4 left-4 z-50 p-2 text-stone-300 hover:text-stone-500 hover:bg-white/50 rounded-full transition-all opacity-20 hover:opacity-100 pointer-events-auto"
        title="Open Debug Panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c-.836-1.372.734-2.942 2.106-2.106a1.532 1.532 0 012.287.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default App;
