
import React, { useState, useEffect } from "react";
import AuroraSphere from "./AuroraSphere";
import { Emotion, Category } from "@/constants";
import { CATEGORY_THEMES, TRANSLATIONS } from "../constants";
import { UserProfile } from "../types";

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  user: UserProfile | null;
  language: "en" | "cn";
  setLanguage: (lang: "en" | "cn") => void;
}

const DEMO_EMOTIONS: Emotion[] = [
  "happy",
  "surprised",
  "love",
  "excited",
  "calm",
  "grateful",
];

const DEMO_CATEGORIES: Category[] = [
  "default",
  "nature",
  "creative",
  "sensory",
  "connection",
  "tranquil",
];

const LandingPage: React.FC<LandingPageProps> = ({
  onEnter,
  onLogin,
  user,
  language,
  setLanguage,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [currentCategory, setCurrentCategory] = useState<Category>("default");
  const [isLeaving, setIsLeaving] = useState(false);

  const t = TRANSLATIONS[language];

  // Cycle through emotions and categories to show personality
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentEmotion(DEMO_EMOTIONS[index % DEMO_EMOTIONS.length]);
      setCurrentCategory(DEMO_CATEGORIES[index % DEMO_CATEGORIES.length]);
      index++;
    }, 3000); // Slower, more gentle transition

    // Initial distinct start
    setTimeout(() => {
      setCurrentEmotion("happy");
      setCurrentCategory("nature");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsLeaving(true);
    setTimeout(onEnter, 800); // Wait for animation
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#FAFAF9] transition-opacity duration-1000 overflow-y-auto overflow-x-hidden ${
        isLeaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-50/60 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-pink-50/60 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "15s" }}
        />
      </div>

      {/* Language Toggle */}
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <button
          onClick={() => setLanguage(language === "en" ? "cn" : "en")}
          className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full text-stone-500 text-xs font-bold tracking-widest hover:bg-white hover:text-stone-800 transition-all duration-300 shadow-sm hover:shadow-md border border-white/40"
        >
          {language === "en" ? "CN" : "EN"}
        </button>
      </div>

      <div className="min-h-full w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`flex flex-col items-center w-full max-w-4xl text-center transition-all duration-1000 transform ${
            isLeaving ? "scale-105 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* 1. The Entity (Visual Center) */}
          <div
            className="relative animate-pop-in flex items-center justify-center mb-8 sm:mb-12"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl scale-95"></div>
            <AuroraSphere
              isThinking={false}
              category={currentCategory}
              emotion={currentEmotion}
              isInputFocused={false}
              forceSmile={false}
              className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96"
              smoothTransition={true}
              isInBottle={true}
            />
          </div>

          {/* 2. The Identity (Title & Slogan) */}
          <h1
            className="text-4xl sm:text-5xl font-bold text-stone-700 tracking-tight mb-3 animate-slide-up-normal"
            style={{ animationDelay: "0.1s" }}
          >
            Aurora
          </h1>
          <p
            className="text-stone-400 text-xs sm:text-sm font-medium tracking-widest uppercase mb-10 animate-slide-up-normal"
            style={{ animationDelay: "0.2s" }}
          >
            {t.slogan}
          </p>

          {/* 3. The Intro (Poetic Description) */}
          <div
            className="max-w-2xl mx-auto space-y-8 animate-slide-up-normal mb-12"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-stone-600 leading-relaxed">
              {t.intro.part1} <br className="hidden sm:block" />
              <span className="font-bold mx-1">
                <span className="text-rose-400">{t.intro.key1}</span>
                <span className="text-stone-300">, </span>
                <span className="text-violet-400">{t.intro.key2}</span>
                <span className="text-stone-300">, </span>
                <span className="text-sky-400">{t.intro.key3}</span>
              </span>
              <br className="hidden sm:block" />
              {t.intro.part2}
            </p>
          </div>

          {/* 4. The Action (CTA) */}
          <div
            className="flex flex-col items-center gap-5 animate-slide-up-normal mb-16"
            style={{ animationDelay: "0.6s" }}
          >
            {!user ? (
              <>
                <button
                  onClick={onLogin}
                  className="group relative px-8 py-4 bg-white/80 backdrop-blur-md text-stone-600 rounded-full text-sm font-medium tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white transition-all duration-500 hover:-translate-y-1 active:scale-95 flex items-center gap-3 min-w-[220px] justify-center border border-white/60"
                >
                  <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                    ✨
                  </span>
                  <span className="group-hover:text-stone-800 transition-colors">
                    {t.startGoogle}
                  </span>
                </button>
                <button
                  onClick={handleStart}
                  className="text-stone-400 text-xs font-medium hover:text-stone-600 transition-all duration-300 border-b border-transparent hover:border-stone-300 pb-0.5"
                >
                  {t.continueGuest}
                </button>
              </>
            ) : (
              <button
                onClick={handleStart}
                className="group relative px-10 py-5 bg-white/40 backdrop-blur-xl border border-white/50 text-stone-700 rounded-full text-base font-medium tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/60 transition-all duration-500 hover:-translate-y-1 active:scale-95 min-w-[240px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t.continueUser} {user.displayName?.split(" ")[0] || "User"}
                </span>
              </button>
            )}
          </div>

          {/* 5. The Lore (Narrative Cards) */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full border-t border-stone-100 pt-12 animate-slide-up-normal"
            style={{ animationDelay: "0.8s" }}
          >
            {/* Origin */}
            <div className="text-left px-4 group">
              <h3 className="text-stone-800 text-lg mb-2 group-hover:text-sky-400 transition-colors">
                {t.story.origin.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed font-light">
                {t.story.origin.desc}
              </p>
            </div>

            {/* Resonance (The Sticker Logic) */}
            <div className="text-left px-4 md:border-l md:border-stone-100 group">
              <h3 className="text-stone-800 text-lg mb-2 group-hover:text-rose-400 transition-colors">
                {t.story.resonance.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed font-light">
                {t.story.resonance.desc}
              </p>
            </div>

            {/* Memory */}
            <div className="text-left px-4 md:border-l md:border-stone-100 group">
              <h3 className="text-stone-800 text-lg mb-2 group-hover:text-violet-400 transition-colors">
                {t.story.memory.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed font-light">
                {t.story.memory.desc}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="w-full text-center pt-16 pb-6 text-stone-300 text-[10px] animate-slide-up-normal"
            style={{ animationDelay: "1.2s" }}
          >
            {t.footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
