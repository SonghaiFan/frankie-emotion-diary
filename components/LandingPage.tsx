
import React, { useState, useEffect } from 'react';
import AuroraSphere from './AuroraSphere';
import { Emotion, Category } from '../types';
import { CATEGORY_THEMES } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
}

const DEMO_EMOTIONS: Emotion[] = ['happy', 'surprised', 'love', 'excited', 'calm', 'grateful'];

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Cycle through emotions to show personality
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentEmotion(DEMO_EMOTIONS[index]);
      index = (index + 1) % DEMO_EMOTIONS.length;
    }, 2500);
    
    // Initial distinct start
    setTimeout(() => setCurrentEmotion('happy'), 500);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsLeaving(true);
    setTimeout(onEnter, 800); // Wait for animation
  };

  const theme = CATEGORY_THEMES.default;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAF9] transition-opacity duration-1000 ${
        isLeaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-50/80 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-pink-50/80 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className={`relative z-10 flex flex-col items-center max-w-md px-6 text-center transition-all duration-1000 transform ${
        isLeaving ? 'scale-110' : 'scale-100'
      }`}>
        
        {/* Animated Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-stone-700 tracking-tight mb-2 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
          Aurora
        </h1>
        <p className="text-stone-400 text-sm font-medium tracking-widest uppercase mb-10 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
          Therapy Mentor
        </p>

        {/* The Avatar */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10 animate-pop-in" style={{ animationDelay: '0.3s' }}>
           <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl scale-90"></div>
           <AuroraSphere 
             isThinking={false}
             category="default"
             emotion={currentEmotion}
             isInputFocused={false}
             forceSmile={false} 
           />
        </div>

        {/* Intro Text */}
        <div className="space-y-4 mb-12 animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
          <p className="text-lg md:text-xl text-stone-600 font-medium leading-relaxed">
            Your gentle companion for moments of <br/>
            <span className="text-stone-400">peace</span>, <span className="text-pink-300">connection</span>, and <span className="text-blue-300">clarity</span>.
          </p>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Inspired by Yuki Takeda's <i>Happiness List</i>.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="group relative px-8 py-4 bg-stone-800 text-white rounded-full text-sm font-bold tracking-wide shadow-lg hover:shadow-xl hover:bg-stone-700 transition-all duration-300 hover:-translate-y-1 active:scale-95 animate-slide-up-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Begin Journey
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
        </button>

      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-stone-300 text-[10px] animate-slide-up-fade" style={{ animationDelay: '1s' }}>
        Designed for Highly Sensitive People (HSP)
      </div>
    </div>
  );
};

export default LandingPage;
