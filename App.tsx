
import React, { useState, useEffect, useRef } from "react";
import AuroraSphere, {
  EyeType,
  MouthType,
  AccessoryType,
} from "./components/AuroraSphere";
import InputArea from "./components/InputArea";
import MemoWall from "./components/MemoWall";
import DebugPanel from "./components/DebugPanel";
import SpeechBubble from "./components/SpeechBubble";
import LocalMenu from "./components/LocalMenu";
import ImportBackup from "./components/ImportBackup";
import EmotionCalendar from "./components/EmotionCalendar";
import ChatHistory from "./components/ChatHistory";
import LandingPage from "./components/LandingPage";
import ZenMode from "./components/ZenMode";
import MyDiary from "./components/MyDiary";
import { sendMessage, initializeChat } from "./services/openaiService";
import { Message, TodoItem, EmotionLog } from "./types";
import { Category, Emotion } from "./constants";
import {
  CATEGORY_THEMES,
  AVATAR_REACTIONS,
  EMOTIONS,
  NEW_USER_GREETING,
} from "./constants";
import type { ChatContent as Content } from "./services/openaiService";
import { loadSnapshot, saveSnapshot, restoreBackup, type LocalSnapshot } from "./services/localStorage";


const App: React.FC<{ onRestored: () => void }> = ({ onRestored }) => {
  // --- State ---
  // Landing Page State
  const [showLanding, setShowLanding] = useState(true);
  const [language, setLanguage] = useState<"en" | "cn">("cn");

  // Initialize from LocalStorage if available, otherwise default
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>("default");
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [forceSmile, setForceSmile] = useState(false);
  const [savedTodos, setSavedTodos] = useState<TodoItem[]>([]);
  const [deletedTodoTexts, setDeletedTodoTexts] = useState<Set<string>>(
    new Set()
  );

  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [showImport, setShowImport] = useState(false);
  const restoringBackup = useRef(false);
  const [visited, setVisited] = useState(false);
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [ChatHistoryTargetDate, setChatHistoryTargetDate] = useState<string | null>(null);

  // ... (rest of state)

  // ... (rest of handlers)

  const handleCalendarDateClick = (date: string) => {
    setChatHistoryTargetDate(date);
    setShowCalendar(false);
    setShowChatHistory(true);
  };

  // ... (rest of render)

  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [debugOverrides, setDebugOverrides] = useState<{
    eyes?: EyeType;
    mouth?: MouthType;
    accessory?: AccessoryType;
  }>({});

  // Canvas State
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Helper for safe comparison
  const isTodoSaved = (text: string) =>
    savedTodos.some((t) => t.text.trim() === text.trim()) ||
    deletedTodoTexts.has(text.trim());

  // Parsing Helper - Refactored for Robustness
  const parseResponse = (
    rawText: string
  ): {
    text: string;
    emotion: Emotion;
    category: Category;
    suggestions: string[];
  } => {
    let emotion: Emotion = "neutral";
    let category: Category = currentCategory;
    let cleanText = rawText || ""; // Ensure string
    const suggestions: string[] = [];

    // 1. Extract Emotion Tags [HAPPY] - Callback approach allows single-pass removal
    const emotionRegex = new RegExp(
      `\\[(${EMOTIONS.join("|").toUpperCase()})\\]`,
      "gi"
    );
    cleanText = cleanText.replace(emotionRegex, (match, p1) => {
      if (p1) emotion = p1.toUpperCase().toLowerCase() as Emotion;
      return ""; // Remove tag from string
    });

    // 2. Extract Category Tags [NATURE]
    cleanText = cleanText.replace(
      /\[(DEFAULT|SENSORY|VISUAL|NATURE|CONNECTION|CREATIVE|TRANQUIL|PRESENT)\]/gi,
      (match, p1) => {
        if (p1) category = p1.toUpperCase().toLowerCase() as Category;
        return ""; // Remove tag from string
      }
    );

    // 3. Extract Todo Tags <TODO>...</TODO>
    // Insert a marker for the UI to know where to split the message
    let markerInserted = false;
    cleanText = cleanText.replace(/<TODO>(.*?)<\/TODO>/gi, (match, content) => {
      if (content && content.trim()) {
        suggestions.push(content.trim());
      }
      if (!markerInserted) {
        markerInserted = true;
        return "[[TODO_SECTION]]";
      }
      return ""; // Remove subsequent tags
    });

    return { emotion, category, text: cleanText.trim(), suggestions };
  };

  // Helper to re-init chat from a message list
  const reinitializeChat = (msgs: Message[]) => {
    const history: Content[] = msgs
      .filter((m) => m.type !== "diary" && m.id !== "init" && !m.id.startsWith("reaction-"))
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
    initializeChat(history);
  };

  // Hydrate before writing, so mounting never overwrites existing browser data.
  useEffect(() => {
    try {
      const state = loadSnapshot();
      const greeting = parseResponse(NEW_USER_GREETING);
      const restored = state.messages.length ? state.messages : [{id:'init',role:'model' as const,text:greeting.text,timestamp:Date.now(),suggestions:greeting.suggestions}];
      setMessages(restored); setSavedTodos(state.todos); setEmotionLogs(state.emotionLogs);
      setCurrentCategory(state.category); setCurrentEmotion(state.emotion);
      setLanguage(state.language); setVisited(state.visited); setShowLanding(!state.visited);
      reinitializeChat(restored); setHydrated(true);
    } catch {
      setStorageError('Local data could not be loaded. Existing saved data is unchanged; this session will not overwrite it.');
    }
  }, []);

  const snapshot: LocalSnapshot = {version:1,messages,todos:savedTodos,emotionLogs,category:currentCategory,emotion:currentEmotion,language,visited};
  useEffect(() => {
    if (!hydrated || restoringBackup.current) return;
    try { saveSnapshot(snapshot); setStorageError(''); }
    catch { setStorageError('Changes could not be saved in this browser. Export a backup before closing this page.'); }
  }, [hydrated, messages, savedTodos, emotionLogs, currentCategory, currentEmotion, language, visited]);

  const recordEmotion = (emotion: Emotion, category: Category, note = '') => {
    setEmotionLogs(prev => [...prev, {id:crypto.randomUUID(),emotion,category,note,timestamp:Date.now()}]);
  };
  const exportBackup = () => {
    const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
    const a=document.createElement('a'); a.href=url; a.download='aurora-backup-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),0);
  };

  const handleRestore = (backup: LocalSnapshot) => {
    if (isLoading) throw new Error('Wait for the active AI response.');
    restoringBackup.current = true;
    try { restoreBackup(backup); }
    catch (error) { restoringBackup.current = false; throw error; }
    // Remount locally so offline restores also reset drafts and AI history.
    // The old instance keeps its persistence/reaction guard until unmounted.
    onRestored();
  };

  const lastModelMessage = [...messages].reverse().find(m => m.role === "model") || null;

  // Reset typing state when message changes
  useEffect(() => {
    setIsTypingComplete(false);
  }, [lastModelMessage?.id]);

  const [userClosedBubbleId, setUserClosedBubbleId] = useState<string | null>(null);

  // --- Logic: Bubble Visibility Management ---
  useEffect(() => {
    // If landing page is shown, hide bubble
    if (showLanding) {
      setIsBubbleVisible(false);
      return;
    }

    if (isLoading) {
      setIsBubbleVisible(true);
      return;
    }

    if (!lastModelMessage) return;

    // On first load/enter, show the bubble if it's the greeting or recent
    if (!isBubbleVisible && !showLanding && !userClosedBubbleId) {
      // Only if it was recently added? Or just show it.
      // Let's show it.
      setIsBubbleVisible(true);
    }

    const hasSuggestions =
      lastModelMessage.suggestions && lastModelMessage.suggestions.length > 0;
    const allSuggestionsSaved =
      hasSuggestions &&
      lastModelMessage.suggestions?.every((s) => isTodoSaved(s));

    if (hasSuggestions && allSuggestionsSaved) {
      setIsBubbleVisible(false);
      return;
    }

    // If user explicitly closed this specific message, keep it closed
    if (userClosedBubbleId === lastModelMessage.id) {
        setIsBubbleVisible(false);
        return;
    }

    if (!hasSuggestions) {
      const delay = 20000;
      const timer = setTimeout(() => {
        setIsBubbleVisible(false);
      }, delay);
      return () => clearTimeout(timer);
    }

    setIsBubbleVisible(true);
  }, [lastModelMessage, savedTodos, isLoading, showLanding, userClosedBubbleId]);

  // --- Logic: Avatar Reactions ---
  const triggerReaction = (type: keyof typeof AVATAR_REACTIONS) => {
    if (isLoading || showLanding || restoringBackup.current) return;

    const hasUnsavedSuggestions =
      lastModelMessage?.suggestions &&
      lastModelMessage.suggestions.some((s) => !isTodoSaved(s));
    
    // Only block if bubble is visible AND has unsaved suggestions
    if (isBubbleVisible && hasUnsavedSuggestions) return;

    const phrases = AVATAR_REACTIONS[type];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    const { text, emotion } = parseResponse(randomPhrase);

    if (emotion !== "neutral") {
      setCurrentEmotion(emotion);
    } else {
      if (type === "poke") setCurrentEmotion("surprised");
      if (type === "typing") setCurrentEmotion("focused");
      if (type === "completion") setCurrentEmotion("excited");
    }

    const reactionMsg: Message = {
      id: `reaction-${Date.now()}`,
      role: "model",
      text: text,
      timestamp: Date.now(),
      suggestions: [],
    };

    setMessages((prev) => [...prev, reactionMsg]);
    setIsBubbleVisible(true);

    // Reaction messages are ephemeral and not added to persistent history
  };



  // --- Handlers ---

  const handleEnterApp = () => {
    setShowLanding(false);
    setVisited(true);
    setIsBubbleVisible(true);
  };

  const handleSend = async (text: string, type: 'chat' | 'diary' = 'chat', overrideEmotion?: Emotion, overrideCategory?: Category) => {
    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: Date.now(),
      type: type,
      category: overrideCategory || currentCategory,
      emotion: overrideEmotion || currentEmotion,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (type === "diary") recordEmotion(userMsg.emotion!, userMsg.category!, text);

    setIsLoading(true);
    setIsBubbleVisible(true);
    setCurrentEmotion("focused");

    try {
      // Pass complete history (messages) and new text to the AI service.
      // The service will slice the history to the last N messages.
      // We also pass todo context explicitly and any overrides.
      const rawResponse = await sendMessage(text, savedTodos, overrideEmotion, overrideCategory, messages);
      const {
        text: cleanText,
        emotion,
        category,
        suggestions,
      } = parseResponse(rawResponse);

      setCurrentCategory(category);
      setCurrentEmotion(emotion);

      // Record emotion on this device
      if (type !== "diary" && emotion !== "neutral") {
        recordEmotion(emotion, category, text);
      }

      // Update the local message context
      const updatedUserMsg = { ...userMsg, category, emotion };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? updatedUserMsg : m))
      );

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: cleanText,
        timestamp: Date.now(),
        suggestions: suggestions,
        category: category, // Use local variable
        emotion: emotion,   // Use local variable
        type: type === 'diary' ? 'chat' : 'chat', // AI response is always chat for now, or maybe inherit? Let's keep it chat to show in bubble.
      };

      setMessages((prev) => [...prev, modelMsg]);
      setIsBubbleVisible(true);

      // The message state is persisted locally
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "model",
        text: "The connection is a bit fuzzy...",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setCurrentEmotion("sad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTodo = (text: string) => {
    if (savedTodos.some((t) => t.text.trim() === text.trim())) return;

    const screenX = Math.random() * (window.innerWidth - 100) + 50;
    const screenY = Math.random() * (window.innerHeight * 0.3) + 80;
    const canvasX = screenX - canvasOffset.x;
    const canvasY = screenY - canvasOffset.y;
    const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;

    const newTodo: TodoItem = {
      id: Date.now().toString() + Math.random().toString(),
      text: text.trim(),
      completed: false,
      timestamp: Date.now(),
      x: canvasX,
      y: canvasY,
      rotation: (Math.random() - 0.5) * 8,
      color: theme.noteBg,
    };

    setSavedTodos((prev) => [newTodo, ...prev]);


  };

  const toggleTodo = (id: string) => {
    const item = savedTodos.find(t => t.id === id);
    if (!item) return;
    const toggled = {...item, completed: !item.completed};
    const next = savedTodos.map(t => t.id === id ? toggled : t);
    setSavedTodos(next);
    if (toggled.completed) recordEmotion('excited', currentCategory, `Completed: ${toggled.text}`);
    if (next.length && next.every(t => t.completed) && !savedTodos.every(t => t.completed)) {
      setTimeout(() => triggerReaction('completion'), 500);
    }
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = savedTodos.find((t) => t.id === id);
    if (todoToDelete) {
      setDeletedTodoTexts((prev) =>
        new Set(prev).add(todoToDelete.text.trim())
      );
    }
    setSavedTodos((prev) => prev.filter((t) => t.id !== id));

  };

  const updateTodoPosition = (id: string, x: number, y: number) => {
    setSavedTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  const handleSaveAllTodos = () => {
    if (lastModelMessage?.suggestions) {
      lastModelMessage.suggestions.forEach((suggestion) => {
        handleSaveTodo(suggestion);
      });
    }
  };

  const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;

  const [isZenMode, setIsZenMode] = useState(false);
  const [showMyDiary, setShowMyDiary] = useState(false);

  // ... (rest of state)

  const handleZenSave = async (text: string, emotion: Emotion, category: Category) => {
    if (!text.trim()) return false;
    setMessages(prev => [...prev, {id:crypto.randomUUID(),role:'user',text:text.trim(),timestamp:Date.now(),type:'diary',emotion,category}]);
    recordEmotion(emotion, category, text.trim());
    return true;
  };

  // ... (rest of render)

  const handleCenterView = () => {
    if (savedTodos.length === 0) {
      setCanvasOffset({ x: 0, y: 0 });
      return;
    }

    // Calculate the center of all todos
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    savedTodos.forEach(todo => {
      minX = Math.min(minX, todo.x);
      maxX = Math.max(maxX, todo.x);
      minY = Math.min(minY, todo.y);
      maxY = Math.max(maxY, todo.y);
    });

    // Add note width/height to bounds (approximate)
    maxX += 192; // w-48 is 12rem = 192px
    maxY += 192; // Assume square-ish for safety

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // We want to center this point on the screen.
    // The MemoWall renders items at (todo.x + canvasOffset.x, todo.y + canvasOffset.y).
    // To center (centerX, centerY) at the screen center (which is effectively 0,0 in our relative coordinate space if we assume the container is centered),
    // we need the resulting coordinate to be 0 (or centered in the viewport).
    // However, MemoWall is absolute inset-0.
    // Let's assume we want to shift the view so that the center of the bounding box is at the center of the screen.
    // Screen center is roughly (window.innerWidth / 2, window.innerHeight / 2).
    // So: centerX + offset = screenCenter.
    // offset = screenCenter - centerX.
    
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    setCanvasOffset({
      x: screenCenterX - centerX,
      y: screenCenterY - centerY
    });
  };

  return (
    <div
      className={`relative w-full h-[100dvh] overflow-hidden ${showImport ? "touch-auto" : "touch-none"} transition-colors duration-1000 ease-in-out`}
      style={{ background: theme.bgGradient }}
    >
      {showImport ? <ImportBackup language={language} waitingForAI={isLoading} onClose={() => setShowImport(false)} onExport={exportBackup} onRestore={handleRestore} /> : null}
      {/* Zen Mode Overlay */}
      {isZenMode && (
        <ZenMode 
            onExit={() => setIsZenMode(false)}
            onSave={handleZenSave}
            theme={theme}
        />
      )}

      {storageError ? <div role="alert" className="fixed top-2 left-2 right-2 z-[200] bg-amber-50 text-amber-950 border border-amber-200 rounded-lg p-3 text-sm">{storageError} <button className="underline ml-2" onClick={exportBackup}>Export backup</button> <button className="underline ml-2" onClick={() => setShowImport(true)}>Import backup</button></div> : null}
      {/* Main App Content - Hidden when in Zen Mode */}
      <div className={`transition-opacity duration-700 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {showLanding && (
            <LandingPage
              onEnter={handleEnterApp}
              language={language}
              setLanguage={setLanguage}
            />
          )}

          {/* 1. Dynamic Background Orbs */}
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply transition-colors duration-1000 z-0">
            {/* ... orbs ... */}
             <div
              className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${
                currentCategory === "nature"
                  ? "bg-sky-100"
                  : currentCategory === "sensory"
                  ? "bg-pink-100"
                  : "bg-blue-50"
              }`}
            />
            <div
              className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${
                currentCategory === "creative" ? "bg-purple-100" : "bg-cyan-50"
              }`}
            />
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
            className={`absolute left-1/2 -translate-x-1/2 bottom-[10px] sm:bottom-[40px] z-30 transition-all duration-700 ease-in-out pointer-events-none ${
              showLanding ? "opacity-0 translate-y-20" : "opacity-100 translate-y-0"
            }`}
          >
             {/* ... avatar ... */}
             <div className="relative w-64 h-64 lg:w-96 lg:h-96 flex items-center justify-center">
              <div
                className="relative z-10 pointer-events-auto cursor-pointer"
                onClick={() => {
                    triggerReaction("poke");
                    handleCenterView();
                }}
              >
                <AuroraSphere
                  className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96"
                  isThinking={isLoading}
                  category={currentCategory}
                  emotion={currentEmotion}
                  isInputFocused={isInputFocused}
                  forceSmile={forceSmile}
                  eyeOverride={debugOverrides.eyes}
                  mouthOverride={debugOverrides.mouth}
                  accessoryOverride={debugOverrides.accessory}
                  isInBottle={false}
                />
              </div>

              <SpeechBubble
                message={lastModelMessage || null}
                isLoading={isLoading}
                isVisible={isBubbleVisible}
                theme={{ secondary: theme.secondary, noteBg: theme.noteBg }}
                isTypingComplete={isTypingComplete}
                onTypingComplete={() => setIsTypingComplete(true)}
                onSaveTodo={handleSaveTodo}
                isTodoSaved={isTodoSaved}
                onClose={() => {
                  setIsBubbleVisible(false);
                  if (lastModelMessage) setUserClosedBubbleId(lastModelMessage.id);
                }}
                onSaveAllTodos={handleSaveAllTodos}
              />
            </div>
          </div>

          {/* 4. Input Layer */}
          <div
            className={`absolute bottom-0 left-0 w-full p-4 md:p-6 z-40 flex flex-col items-center pointer-events-none transition-opacity duration-700 ${
              showLanding ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
            }`}
          >
            <InputArea
              onSend={handleSend}
              isLoading={isLoading}
              onFocusChange={setIsInputFocused}
              onSmileChange={setForceSmile}
              onTypingStart={() => triggerReaction("typing")}
              onIdle={() => triggerReaction("idle")}
              onEnterZenMode={() => setIsZenMode(true)}
            />
          </div>

          {/* Top Center: Credits */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none select-none opacity-30 hover:opacity-60 transition-opacity duration-500 ${
              showLanding ? "opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-[9px] sm:text-[10px] text-stone-600 font-bold tracking-wide">
              Inspired by 武田友纪《高敏感人士幸福清单》
            </p>
            <p className="text-[9px] sm:text-[10px] text-stone-500 tracking-wider mt-0.5">
              <span style={{ display: "inline-block", pointerEvents: "auto" }}><a href="https://songhaifan.github.io/frankie-emotion-diary/" aria-label="About Frankie emotion diary" style={{ display: "inline-flex", alignItems: "center", padding: "6px", color: "inherit",  }}><span aria-hidden="true" style={{ display: "block", width: 76, height: 26, backgroundColor: "currentColor", mask: "url(/frankie-signature.svg) center / contain no-repeat", WebkitMask: "url(/frankie-signature.svg) center / contain no-repeat" }} /></a></span>
            </p>
          </div>

          {/* Top Right: Auth */}
          <div
            className={`absolute top-0 right-0 p-4 z-50 flex flex-col items-end gap-2 transition-opacity duration-500 ${
              showLanding ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <LocalMenu language={language}
              onOpenCalendar={() => setShowCalendar(true)}
              onOpenChatHistory={() => setShowChatHistory(true)}
              onOpenMyDiary={() => setShowMyDiary(true)}
              onImport={() => setShowImport(true)}
              onExport={exportBackup}
              onOpenDebug={import.meta.env.DEV ? () => setShowDebug(true) : undefined}
            />
          </div>
      </div>

      {/* 5. Modals & Overlays (Outside the hidden div to ensure they can still work if needed, though Zen Mode usually blocks them) */}
      {/* Actually, we want modals to be hidden too if Zen Mode is active, but Zen Mode is on top anyway. */}
      
      {showCalendar && (
        <EmotionCalendar
          logs={emotionLogs}
          onClose={() => setShowCalendar(false)}
          onDateClick={handleCalendarDateClick}
        />
      )}

      {showChatHistory && (
        <ChatHistory
          messages={messages}
          onClose={() => {
            setShowChatHistory(false);
            setChatHistoryTargetDate(null); // Reset target date on close
          }}
          initialDate={ChatHistoryTargetDate}
        />
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
          onOverrideChange={(eyes, mouth, accessory) =>
            setDebugOverrides({ eyes, mouth, accessory })
          }
          onClose={() => setShowDebug(false)}
        />
      )}

      {showMyDiary && (
        <MyDiary 
            messages={messages}
            onUpdate={(entry) => setMessages(prev => prev.map(m => m.id === entry.id ? entry : m))}
            onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
            onClose={() => setShowMyDiary(false)}
        />
      )}
    </div>
  );
};

export default App;
