import React, { useState, useEffect } from "react";
import AuroraSphere from "./AuroraSphere";
import { Emotion, Category } from "@/constants";
import { CATEGORY_THEMES } from "../constants";
import { UserProfile } from "../types";

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  user: UserProfile | null;
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
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [currentCategory, setCurrentCategory] = useState<Category>("default");
  const [isLeaving, setIsLeaving] = useState(false);

  // Cycle through emotions and categories to show personality
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentEmotion(DEMO_EMOTIONS[index % DEMO_EMOTIONS.length]);
      setCurrentCategory(DEMO_CATEGORIES[index % DEMO_CATEGORIES.length]);
      index++;
    }, 2500);

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

  const theme = CATEGORY_THEMES.default;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#FAFAF9] transition-opacity duration-1000 overflow-y-auto overflow-x-hidden ${
        isLeaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-50/80 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-pink-50/80 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s" }}
        />
      </div>

      <div className="min-h-full w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div
          className={`relative z-10 flex flex-col items-center w-full max-w-5xl text-center transition-all duration-1000 transform ${
            isLeaving ? "scale-110" : "scale-100"
          }`}
        >
          {/* Animated Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-700 tracking-tight mb-2 animate-slide-up-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Aurora
          </h1>
          <p
            className="text-stone-400 text-xs sm:text-sm font-medium tracking-widest uppercase mb-8 md:mb-12 animate-slide-up-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Therapy Mentor
          </p>

          {/* The Avatar */}
          <div
            className="relative animate-pop-in flex items-center justify-center"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl scale-90"></div>
            <AuroraSphere
              isThinking={false}
              category={currentCategory}
              emotion={currentEmotion}
              isInputFocused={false}
              forceSmile={false}
              className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96"
            />
          </div>

          {/* Intro Text & Features */}
          <div
            className="space-y-10 animate-slide-up-fade-in w-full max-w-4xl mx-auto"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-stone-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Your gentle companion for moments of{" "}
              <br className="hidden sm:block" />
              <span className="text-stone-400">peace</span>,{" "}
              <span className="text-pink-300">connection</span>, and{" "}
              <span className="text-blue-300">clarity</span>.
            </p>

            {/* CTA Buttons - Moved Up for Better Conversion */}
            <div className="flex flex-col items-center gap-4 py-6">
              {!user ? (
                <>
                  <button
                    onClick={onLogin}
                    className="group relative px-10 py-5 bg-white/80 backdrop-blur-md text-stone-600 rounded-full text-base font-medium tracking-wide shadow-lg hover:shadow-xl hover:bg-white transition-all duration-500 hover:-translate-y-1 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center min-w-[240px] border border-white/60 ring-1 ring-stone-100"
                  >
                    <svg
                      className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="group-hover:text-stone-800 transition-colors">
                      Start with Google
                    </span>
                  </button>
                  <button
                    onClick={handleStart}
                    className="text-stone-400 text-sm font-medium hover:text-stone-600 transition-all duration-300 hover:tracking-wider"
                  >
                    Continue as Guest
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStart}
                  className="group relative px-10 py-5 bg-white/80 backdrop-blur-md text-stone-600 rounded-full text-base font-medium tracking-wide shadow-lg hover:shadow-xl hover:bg-white transition-all duration-500 hover:-translate-y-1 active:scale-95 w-full sm:w-auto justify-center min-w-[240px] border border-white/60 ring-1 ring-stone-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-stone-800 transition-colors">
                    Continue as {user.displayName?.split(" ")[0] || "User"}
                    <svg
                      className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 text-stone-400 group-hover:text-stone-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              )}
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-left max-w-3xl mx-auto pt-8 border-t border-stone-100">
              <div className="bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 md:mb-4 text-blue-400 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-stone-700 font-bold text-sm md:text-base mb-1 md:mb-2">
                  Chat Freely
                </h3>
                <p className="text-stone-500 text-xs md:text-sm leading-relaxed">
                  A safe, judgment-free space to express your deepest feelings
                  and thoughts.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-50 rounded-full flex items-center justify-center mb-3 md:mb-4 text-pink-400 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1V8a1 1 0 011-1zm5-5a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                    <path d="M9 11a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1h-8a1 1 0 01-1-1v-8z" />
                  </svg>
                </div>
                <h3 className="text-stone-700 font-bold text-sm md:text-base mb-1 md:mb-2">
                  Collect Joy
                </h3>
                <p className="text-stone-500 text-xs md:text-sm leading-relaxed">
                  Turn positive moments into "Happiness Items" that float on
                  your wall.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 md:mb-4 text-green-400 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-stone-700 font-bold text-sm md:text-base mb-1 md:mb-2">
                  Track Mood
                </h3>
                <p className="text-stone-500 text-xs md:text-sm leading-relaxed">
                  Visualize your emotional journey with a gentle, private
                  calendar.
                </p>
              </div>
            </div>

            <p className="text-stone-400 text-xs max-w-xs mx-auto pt-4">
              Inspired by Yuki Takeda's <i>Happiness List</i> and Designed for
              Highly Sensitive People (HSP)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="w-full text-center py-6 text-stone-300 text-[10px] animate-slide-up-fade-in mt-auto"
          style={{ animationDelay: "1s" }}
        >
          Made by 范不着frank
        </div>
      </div>
    </div>
  );
};
export default LandingPage;
