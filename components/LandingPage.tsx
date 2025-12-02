import React, { useState } from "react";

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleStart = () => {
    setIsLeaving(true);
    setTimeout(onEnter, 800); // Wait for animation
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ${
        isLeaving ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Text Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Title */}
        <h1
          className="text-4xl md:text-5xl font-bold text-stone-700 tracking-tight mb-2 animate-slide-up-fade-in font-['Zen_Maru_Gothic']"
          style={{ animationDelay: "0.1s" }}
        >
          Aurora
        </h1>
        <p
          className="text-stone-400 text-sm font-medium tracking-widest uppercase mb-4 animate-slide-up-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Therapy Mentor
        </p>

        {/* Spacer for the Avatar that lives in App.tsx */}
        <div className="w-64 h-64 md:w-80 md:h-80 mb-6 shrink-0" />

        {/* Intro Text */}
        <div
          className="space-y-4 mb-10 animate-slide-up-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-lg md:text-xl text-stone-600 font-medium leading-relaxed">
            Your gentle companion for moments of <br />
            <span className="text-stone-400">peace</span>,{" "}
            <span className="text-pink-300">connection</span>, and{" "}
            <span className="text-blue-300">clarity</span>.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="group relative px-8 py-4 bg-stone-800 text-white rounded-full text-sm font-bold tracking-wide shadow-lg hover:shadow-xl hover:bg-stone-700 transition-all duration-300 hover:-translate-y-1 active:scale-95 animate-slide-up-fade-in overflow-hidden"
          style={{ animationDelay: "0.6s" }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Begin Journey
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
          <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
        </button>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-6 text-stone-300 text-[10px] animate-slide-up-fade-in"
        style={{ animationDelay: "0.8s" }}
      >
        Designed for Highly Sensitive People (HSP)
      </div>
    </div>
  );
};

export default LandingPage;