
import React, { useState, useEffect } from 'react';
import AuroraSphere, { EyeType, MouthType, AccessoryType } from './components/AuroraSphere';
import InputArea from './components/InputArea';
import MemoWall from './components/MemoWall';
import DebugPanel from './components/DebugPanel';
import SpeechBubble from './components/SpeechBubble';
import AuthButton from './components/AuthButton';
import EmotionCalendar from './components/EmotionCalendar';
import LandingPage from './components/LandingPage';
import { sendMessage } from './services/geminiService';
import { Message, Category, Emotion, TodoItem, UserProfile } from './types';
import { CATEGORY_THEMES } from './constants';
import { 
  subscribeToAuthChanges, 
  logEmotion, 
  syncTodoToCloud, 
  deleteTodoFromCloud, 
  getUserTodos,
  saveChatMessage,
  getRecentChatHistory
} from './services/firebase';

const App: React.FC = () => {
  // --- State ---
  // Landing Page State
  const [showLanding, setShowLanding] = useState(true);

  // Initialize from LocalStorage if available, otherwise default
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>('default');
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [forceSmile, setForceSmile] = useState(false);
  const [savedTodos, setSavedTodos] = useState<TodoItem[]>([]);
  
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [debugOverrides, setDebugOverrides] = useState<{
    eyes?: EyeType;
    mouth?: MouthType;
    accessory?: AccessoryType;
  }>({});
  
  // Canvas State
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Avatar Physics State
  const [isPaused, setIsPaused] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Helper for safe comparison
  const isTodoSaved = (text: string) => savedTodos.some(t => t.text.trim() === text.trim());

  // Parsing Helper
  const parseResponse = (rawText: string): { text: string; emotion: Emotion; category: Category; suggestions: string[] } => {
    let emotion: Emotion = 'neutral';
    let category: Category = currentCategory; 
    let cleanText = rawText || ''; 
    const suggestions: string[] = [];

    // 1. Extract Emotion Tags
    cleanText = cleanText.replace(/\[(NEUTRAL|HAPPY|CALM|EXCITED|SAD|SURPRISED|FOCUSED|CONFUSED|TIRED|ANGRY|LOVE|GRATEFUL|HUNGRY)\]/gi, (match, p1) => {
      if (p1) emotion = p1.toUpperCase().toLowerCase() as Emotion;
      return ''; 
    });

    // 2. Extract Category Tags
    cleanText = cleanText.replace(/\[(DEFAULT|SENSORY|VISUAL|NATURE|CONNECTION|CREATIVE|TRANQUIL|PRESENT)\]/gi, (match, p1) => {
      if (p1) category = p1.toUpperCase().toLowerCase() as Category;
      return ''; 
    });

    // 3. Extract Todo Tags
    cleanText = cleanText.replace(/<TODO>(.*?)<\/TODO>/gi, (match, content) => {
      if (content && content.trim()) {
        suggestions.push(content.trim());
      }
      return ''; 
    });

    return { emotion, category, text: cleanText.trim(), suggestions };
  };

  // --- Initialization & Persistence ---
  useEffect(() => {
    // Auth Listener
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
        
        // Fetch Cloud Data
        const cloudTodos = await getUserTodos(firebaseUser.uid);
        
        // Merge Local Guest Todos
        const localTodos = JSON.parse(localStorage.getItem('aurora_todos') || '[]');
        const mergedTodos = [...cloudTodos];
        const cloudIds = new Set(cloudTodos.map(t => t.id));
        
        for (const localT of localTodos) {
            if (!cloudIds.has(localT.id)) {
                await syncTodoToCloud(firebaseUser.uid, localT);
                mergedTodos.push(localT);
            }
        }
        setSavedTodos(mergedTodos);

        // Fetch Cloud Chat History
        const cloudHistory = await getRecentChatHistory(firebaseUser.uid);
        if (cloudHistory.length > 0) {
            setMessages(cloudHistory);
            // If history exists, show bubble
            setIsBubbleVisible(true);
            setIsTypingComplete(true);
        } else {
             // Sync existing local messages if any
             if (messages.length > 0) {
                 messages.forEach(m => saveChatMessage(firebaseUser.uid, m));
             }
        }

      } else {
        setUser(null);
        // Load local todos for guest
        const localTodos = localStorage.getItem('aurora_todos');
        if (localTodos) setSavedTodos(JSON.parse(localTodos));
      }
    });

    const loadState = () => {
      try {
        const storedMessages = localStorage.getItem('aurora_messages');
        const storedCategory = localStorage.getItem('aurora_category');
        const storedEmotion = localStorage.getItem('aurora_emotion');
        const hasVisited = localStorage.getItem('aurora_visited');

        if (hasVisited) setShowLanding(false);

        if (storedMessages) {
          const parsedMsgs = JSON.parse(storedMessages) as Message[];
          setMessages(parsedMsgs);
          // Show bubble if there is history
          if (parsedMsgs.length > 0) {
            setIsBubbleVisible(true);
            setIsTypingComplete(true);
          }
        } else {
           // Initial Greeting
           const initialMsg: Message = {
               id: 'init',
               role: 'model',
               text: "Hi there. I'm Aurora.\nHow is your heart feeling today?",
               timestamp: Date.now(),
               suggestions: []
           };
           setMessages([initialMsg]);
           setIsBubbleVisible(true);
           setIsTypingComplete(true);
        }
        
        if (storedCategory) setCurrentCategory(storedCategory as Category);
        if (storedEmotion) setCurrentEmotion(storedEmotion as Emotion);

      } catch (e) {
        console.error("Failed to load state", e);
      }
    };

    loadState();
    return () => unsubscribe();
  }, []); // Run once

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('aurora_messages', JSON.stringify(messages));
    localStorage.setItem('aurora_category', currentCategory);
    localStorage.setItem('aurora_emotion', currentEmotion);
    if (!user) {
        localStorage.setItem('aurora_todos', JSON.stringify(savedTodos));
    }
    // Mark visited once loaded
    if (!showLanding) {
        localStorage.setItem('aurora_visited', 'true');
    }
  }, [messages, currentCategory, currentEmotion, savedTodos, user, showLanding]);

  // --- Handlers ---

  const handleSend = async (text: string) => {
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now(),
        suggestions: []
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsBubbleVisible(true); 
    setIsTypingComplete(false);
    
    if (user) {
       // Fire and forget, but logging enabled in service
       saveChatMessage(user.uid, userMsg);
    }

    try {
        // Construct History: Last 10 messages, filtering out internal/init messages
        const recentHistory = messages
          .filter(m => m.id !== 'init' && !m.id.startsWith('reaction-'))
          .slice(-10); // Take last 10
        
        const responseText = await sendMessage(text, savedTodos, recentHistory);
        const { text: responseContent, emotion, category, suggestions } = parseResponse(responseText);

        const modelMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseContent,
            timestamp: Date.now(),
            suggestions: suggestions || []
        };

        setMessages(prev => [...prev, modelMsg]);
        setCurrentCategory(category);
        setCurrentEmotion(emotion);
        
        if (user) {
            saveChatMessage(user.uid, modelMsg);
            logEmotion(user.uid, emotion, category, text);
        }
    } catch (error) {
        console.error("Error generating response", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "I'm having a little trouble connecting right now. Can we try again?",
            timestamp: Date.now(),
            suggestions: []
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddTodo = async (text: string) => {
      const newTodo: TodoItem = {
          id: Date.now().toString(),
          text,
          completed: false,
          timestamp: Date.now(),
          x: Math.random() * 200 + (window.innerWidth/2 - 200),
          y: Math.random() * 200 + (window.innerHeight/2 - 200),
          rotation: Math.random() * 10 - 5,
          color: CATEGORY_THEMES[currentCategory].noteBg
      };
      
      const newTodos = [...savedTodos, newTodo];
      setSavedTodos(newTodos);
      if (user) syncTodoToCloud(user.uid, newTodo);
  };

  const handleUpdateTodoPosition = (id: string, x: number, y: number) => {
      const updated = savedTodos.map(t => t.id === id ? { ...t, x, y } : t);
      setSavedTodos(updated);
  };

  const handleDragEnd = (id: string) => {
      const todo = savedTodos.find(t => t.id === id);
      if (todo && user) {
          syncTodoToCloud(user.uid, todo);
      }
  };

  const handleDeleteTodo = (id: string) => {
      setSavedTodos(prev => prev.filter(t => t.id !== id));
      if (user) deleteTodoFromCloud(user.uid, id);
  };

  const handleToggleTodo = (id: string) => {
      const todo = savedTodos.find(t => t.id === id);
      if (!todo) return;
      
      const updatedTodo = { ...todo, completed: !todo.completed };
      setSavedTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      if (user) syncTodoToCloud(user.uid, updatedTodo);
  };

  const theme = CATEGORY_THEMES[currentCategory];

  // Get last message for bubble
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const showBubble = isBubbleVisible && (isLoading || (lastMessage?.role === 'model'));

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden transition-colors duration-1000 ease-in-out selection:bg-stone-200"
      style={{
          background: theme.bgGradient
      }}
    >
      {/* 1. Background Layers */}
      <MemoWall 
        todos={savedTodos}
        onUpdateTodoPosition={handleUpdateTodoPosition}
        onDragEnd={handleDragEnd}
        onDeleteTodo={handleDeleteTodo}
        onToggleTodo={handleToggleTodo}
        canvasOffset={canvasOffset}
        onPanChange={setCanvasOffset}
      />
      
      {/* Landing White Overlay (Behind Avatar, In Front of MemoWall) */}
      <div 
        className={`absolute inset-0 bg-[#FAFAF9] z-20 transition-opacity duration-1000 ease-in-out pointer-events-none ${
          showLanding ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. Main Content Layer (Avatar, Input, Auth) */}
      <div className="relative z-30 w-full h-full flex flex-col pointer-events-none">
          
          {/* Header: Auth & Credits - Improved Glassmorphism */}
          <div
            className={`absolute top-0 right-0 p-6 z-50 flex flex-col items-end gap-3 transition-all duration-700 ${
              showLanding ? "opacity-0 translate-y-[-20px]" : "opacity-100 translate-y-0"
            }`}
          >
             <div className="pointer-events-auto">
                <AuthButton user={user} onOpenCalendar={() => setShowCalendar(true)} />
             </div>

             <div className="group flex flex-col items-end">
                <div className="bg-white/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:shadow-md hover:scale-105 cursor-default">
                  <p className="text-[10px] sm:text-[11px] text-stone-600 font-bold tracking-wide">
                    Inspired by 武田有纪《高敏感人士幸福清单》
                  </p>
                  <div className="h-px w-full bg-stone-300/50 my-1 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></div>
                  <p className="text-[9px] sm:text-[10px] text-stone-400 tracking-wider text-right">
                    Made by 范不着frank
                  </p>
                </div>
             </div>
          </div>
          
          {/* Debug Toggle */}
          <div className="absolute top-4 left-4 z-50 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={() => setShowDebug(true)} className="text-xs text-stone-300">Dev</button>
          </div>

          {/* Center Stage: Avatar & Bubble */}
          {/* The flex container keeps the avatar at the bottom (justify-end), 
              but we transform it UP when landing is active to center it. */}
          <div className="flex-1 flex flex-col items-center justify-end pb-8 md:pb-12 relative transition-all duration-1000 ease-in-out">
              <div 
                className={`relative transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${
                  showLanding 
                    ? '-translate-y-[35vh] scale-110' // Centered position
                    : 'translate-y-0 scale-100'        // Chat position
                }`}
              >
                  {/* Hide Bubble during landing */}
                  <div className={`transition-opacity duration-500 ${showLanding ? 'opacity-0' : 'opacity-100'}`}>
                    <SpeechBubble 
                      message={lastMessage?.role === 'model' ? lastMessage : null}
                      isLoading={isLoading}
                      isVisible={showBubble && !showLanding}
                      theme={theme}
                      onTypingComplete={() => setIsTypingComplete(true)}
                      isTypingComplete={isTypingComplete}
                      onSaveTodo={handleAddTodo}
                      isTodoSaved={isTodoSaved}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    />
                  </div>
                  
                  <div className="pointer-events-auto cursor-pointer" onClick={() => {
                      if (!isLoading && !showLanding) {
                          setForceSmile(true);
                          setTimeout(() => setForceSmile(false), 2000);
                      }
                  }}>
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
              </div>
          </div>

          {/* Bottom Input Area */}
          <div className={`w-full pb-6 px-4 z-30 pointer-events-auto bg-gradient-to-t from-white/30 to-transparent transition-all duration-1000 ${
              showLanding ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
              <InputArea 
                  onSend={handleSend}
                  isLoading={isLoading}
                  onFocusChange={setIsInputFocused}
                  onSmileChange={setForceSmile}
                  onTypingStart={() => {
                      setForceSmile(false); 
                  }}
                  onIdle={() => {}}
              />
          </div>
      </div>

      {/* 3. Overlay Text Layer (Title & Button) - z-40 */}
      {showLanding && (
        <div className="absolute inset-0 z-40 pointer-events-auto flex items-center justify-center">
             <LandingPage onEnter={() => setShowLanding(false)} />
        </div>
      )}
      
      {showCalendar && user && (
          <EmotionCalendar uid={user.uid} onClose={() => setShowCalendar(false)} />
      )}
      
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
            onOverrideChange={(e, m, a) => setDebugOverrides({ eyes: e, mouth: m, accessory: a })}
            onClose={() => setShowDebug(false)}
          />
      )}

    </div>
  );
};

export default App;
