
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
import AuthButton from "./components/AuthButton";
import EmotionCalendar from "./components/EmotionCalendar";
import ChatDiaryModal from "./components/ChatDiaryModal";
import LandingPage from "./components/LandingPage";
import { sendMessage, initializeChat } from "./services/geminiService";
import { Message, TodoItem, UserProfile } from "./types";
import { Category, Emotion } from "./constants";
import {
  CATEGORY_THEMES,
  AVATAR_REACTIONS,
  EMOTIONS,
  NEW_USER_GREETING,
  GUEST_MESSAGE_LIMIT,
} from "./constants";
import { Content } from "@google/genai";
import {
  subscribeToAuthChanges,
  logEmotion,
  syncTodoToCloud,
  deleteTodoFromCloud,
  getUserTodos,
  saveChatMessage,
  getRecentChatHistory,
  signInWithGoogle,
  signOut,
} from "./services/firebase";

const MANAGER_UID = "qv7LevpiYLhSA3jEI1nLyMtO5Rt1";

const App: React.FC = () => {
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

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChatDiary, setShowChatDiary] = useState(false);

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
  const reinitializeGemini = (msgs: Message[]) => {
    const history: Content[] = msgs
      .filter((m) => m.id !== "init" && !m.id.startsWith("reaction-"))
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
    initializeChat(history);
  };

  // --- 1. Initialization & Persistence ---
  useEffect(() => {
    // Try to load user from localStorage first
    const cachedUser = localStorage.getItem("aurora_user_profile");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Failed to parse cached user", e);
      }
    }

    // Auth Listener with Cloud Sync
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        // If user logs in, we can optionally auto-dismiss landing page,
        // but for now we keep it manual or based on "aurora_visited"
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
        };
        setUser(userProfile);
        localStorage.setItem("aurora_user_profile", JSON.stringify(userProfile));

        // Sync Todos
        const cloudTodos = await getUserTodos(firebaseUser.uid);

        // Merge Local Guest Todos if not already in cloud
        const localTodos = JSON.parse(
          localStorage.getItem("aurora_todos") || "[]"
        );
        const mergedTodos = [...cloudTodos];
        const cloudIds = new Set(cloudTodos.map((t) => t.id));

        for (const localT of localTodos) {
          if (!cloudIds.has(localT.id)) {
            await syncTodoToCloud(firebaseUser.uid, localT);
            mergedTodos.push(localT);
          }
        }
        setSavedTodos(mergedTodos);

        // --- 2. Fetch Cloud Chat History ---
        const cloudHistory = await getRecentChatHistory(firebaseUser.uid);
        if (cloudHistory.length > 0) {
          setMessages(cloudHistory);
          reinitializeGemini(cloudHistory);
          // Don't show bubble immediately on load if it's old history
          // setIsBubbleVisible(true);
        } else {
          // New User or Empty History -> Keep current Guest Messages but now they are tied to user
          if (messages.length > 0) {
            messages.forEach((m) => saveChatMessage(firebaseUser.uid, m));
          }
        }
      } else {
        setUser(null);
      }
    });

    const loadState = () => {
      try {
        const storedMessages = localStorage.getItem("aurora_messages");
        const storedTodos = localStorage.getItem("aurora_todos");
        const storedCategory = localStorage.getItem("aurora_category");
        const storedEmotion = localStorage.getItem("aurora_emotion");
        const hasVisited = localStorage.getItem("aurora_visited");

        // Optional: If user has visited before, maybe skip landing?
        // For now, let's always show it for the vibe, or check session logic.
        // if (hasVisited) setShowLanding(false);

        if (storedMessages) {
          const parsedMsgs = JSON.parse(storedMessages) as Message[];
          setMessages(parsedMsgs);
          reinitializeGemini(parsedMsgs);
        } else {
          // New User: Greeting
          const rawGreeting = NEW_USER_GREETING;
          const parsed = parseResponse(rawGreeting);
          const greeting: Message = {
            id: "init",
            role: "model",
            text: parsed.text,
            timestamp: Date.now(),
            suggestions: parsed.suggestions,
          };
          setMessages([greeting]);
          setCurrentCategory(parsed.category);
          setCurrentEmotion(parsed.emotion);
          initializeChat();
        }

        if (!user && storedTodos) setSavedTodos(JSON.parse(storedTodos));
        if (storedCategory) setCurrentCategory(storedCategory as Category);
        if (storedEmotion) setCurrentEmotion(storedEmotion as Emotion);
      } catch (e) {
        console.error("Failed to load state", e);
        initializeChat();
      }
    };

    loadState();
    return () => unsubscribe();
  }, []); // Run once on mount

  // Persist State Changes (Local Storage Backup)
  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem("aurora_messages", JSON.stringify(messages));
    localStorage.setItem("aurora_todos", JSON.stringify(savedTodos));
    localStorage.setItem("aurora_category", currentCategory);
    localStorage.setItem("aurora_emotion", currentEmotion);
  }, [messages, savedTodos, currentCategory, currentEmotion]);

  const lastModelMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  // Reset typing state when message changes
  useEffect(() => {
    setIsTypingComplete(false);
  }, [lastModelMessage?.id]);

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
    if (!isBubbleVisible && !showLanding) {
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

    if (!hasSuggestions) {
      const delay = 8000;
      const timer = setTimeout(() => {
        setIsBubbleVisible(false);
      }, delay);
      return () => clearTimeout(timer);
    }

    setIsBubbleVisible(true);
  }, [lastModelMessage, savedTodos, isLoading, showLanding]);

  // --- Logic: Avatar Reactions ---
  const triggerReaction = (type: keyof typeof AVATAR_REACTIONS) => {
    if (isLoading || showLanding) return;

    const hasUnsavedSuggestions =
      lastModelMessage?.suggestions &&
      lastModelMessage.suggestions.some((s) => !isTodoSaved(s));
    if (hasUnsavedSuggestions) return;

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

    // Reaction messages are ephemeral and not saved to cloud history
  };



  // --- Handlers ---

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("aurora_user_profile");
    localStorage.clear(); // This clears everything including visited state, maybe too aggressive?
    // Let's keep it consistent with previous behavior but ensure profile is gone
    window.location.reload();
  };

  const handleEnterApp = () => {
    setShowLanding(false);
    localStorage.setItem("aurora_visited", "true");
    setIsBubbleVisible(true);
  };

  const handleSend = async (text: string) => {
    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Save User Msg to Cloud
    if (user) saveChatMessage(user.uid, userMsg);

    // Check Guest Limit
    if (!user) {
      const userMsgCount = messages.filter((m) => m.role === "user").length;
      if (userMsgCount >= GUEST_MESSAGE_LIMIT) {
        const limitMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "我们已经聊了很多啦。想要继续深入对话的话，请登录账号吧。\n(Guest limit reached: 20 messages)",
          timestamp: Date.now(),
          suggestions: [],
        };
        setMessages((prev) => [...prev, limitMsg]);
        setIsBubbleVisible(true);
        setCurrentEmotion("neutral");
        return;
      }
    }

    setIsLoading(true);
    setIsBubbleVisible(true);
    setCurrentEmotion("focused");

    try {
      // Pass complete history + new text implicitly via the Gemini session
      // But we pass todo context explicitly
      const rawResponse = await sendMessage(text, savedTodos);
      const {
        text: cleanText,
        emotion,
        category,
        suggestions,
      } = parseResponse(rawResponse);

      setCurrentCategory(category);
      setCurrentEmotion(emotion);

      // Log emotion to Cloud
      if (user && emotion !== "neutral") {
        logEmotion(user.uid, emotion, category, text);
      }

      // Update User Msg with new context and save again
      const updatedUserMsg = { ...userMsg, category, emotion };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? updatedUserMsg : m))
      );
      if (user) saveChatMessage(user.uid, updatedUserMsg);

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: cleanText,
        timestamp: Date.now(),
        suggestions: suggestions,
        category: category, // Use local variable
        emotion: emotion,   // Use local variable
      };

      setMessages((prev) => [...prev, modelMsg]);
      setIsBubbleVisible(true);

      // Save Model Msg to Cloud
      if (user) saveChatMessage(user.uid, modelMsg);
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

    // Sync to cloud
    if (user) {
      syncTodoToCloud(user.uid, newTodo);
    }
  };

  const toggleTodo = (id: string) => {
    let toggledItem: TodoItem | undefined;

    setSavedTodos((prev) => {
      const newTodos = prev.map((t) => {
        if (t.id === id) {
          toggledItem = { ...t, completed: !t.completed };
          return toggledItem;
        }
        return t;
      });

      const allCompleted =
        newTodos.length > 0 && newTodos.every((t) => t.completed);
      const wasAllCompleted = prev.every((t) => t.completed) && prev.length > 0;

      if (allCompleted && !wasAllCompleted) {
        setTimeout(() => triggerReaction("completion"), 500);
      }

      return newTodos;
    });

    if (user && toggledItem) {
      syncTodoToCloud(user.uid, toggledItem);

      // Log "Completion" as a positive emotion event!
      if (toggledItem.completed) {
        logEmotion(
          user.uid,
          "excited",
          currentCategory,
          `Completed: ${toggledItem.text}`
        );
      }
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
    if (user) {
      deleteTodoFromCloud(user.uid, id);
    }
  };

  const updateTodoPosition = (id: string, x: number, y: number) => {
    setSavedTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  // New handler called only when drag ends to sync final position
  const handleTodoDragEnd = (id: string) => {
    if (!user) return;
    const todo = savedTodos.find((t) => t.id === id);
    if (todo) {
      syncTodoToCloud(user.uid, todo);
    }
  };

  const handleSaveAllTodos = () => {
    if (lastModelMessage?.suggestions) {
      lastModelMessage.suggestions.forEach((suggestion) => {
        handleSaveTodo(suggestion);
      });
    }
  };

  const theme = CATEGORY_THEMES[currentCategory] || CATEGORY_THEMES.default;

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden touch-none transition-colors duration-1000 ease-in-out"
      style={{ background: theme.bgGradient }}
    >
      {showLanding && (
        <LandingPage
          onEnter={handleEnterApp}
          onLogin={signInWithGoogle}
          user={user}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {/* 1. Dynamic Background Orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply transition-colors duration-1000 z-0">
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
        onDragEnd={handleTodoDragEnd}
        canvasOffset={canvasOffset}
        onPanChange={setCanvasOffset}
      />

      {/* 3. Avatar Container */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-[10px] sm:bottom-[40px] z-30 transition-all duration-700 ease-in-out pointer-events-none ${
          showLanding ? "opacity-0 translate-y-20" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="relative w-64 h-64 lg:w-96 lg:h-96 flex items-center justify-center">
          <div
            className="relative z-10 pointer-events-auto cursor-pointer"
            onClick={() => triggerReaction("poke")}
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
            onClose={() => setIsBubbleVisible(false)}
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
          Made by 范不着frank
        </p>
      </div>

      {/* Top Right: Auth */}
      <div
        className={`absolute top-0 right-0 p-4 z-50 flex flex-col items-end gap-2 transition-opacity duration-500 ${
          showLanding ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <AuthButton
          user={user}
          onOpenCalendar={() => setShowCalendar(true)}
          onOpenChatDiary={() => setShowChatDiary(true)}
          onOpenDebug={() => setShowDebug(true)}
          showDebugOption={
            process.env.NODE_ENV === "development" || user?.uid === MANAGER_UID
          }
          onLogout={handleLogout}
        />
      </div>

      {/* 5. Modals & Overlays */}
      {showCalendar && user && (
        <EmotionCalendar
          uid={user.uid}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showChatDiary && user && (
        <ChatDiaryModal
          user={user}
          onClose={() => setShowChatDiary(false)}
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


    </div>
  );
};

export default App;
