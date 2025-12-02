
import React, { useEffect, useState, useRef } from 'react';
import { Category, Emotion } from '../types';
import { CATEGORY_THEMES } from '../constants';

export type EyeType = 'dot' | 'happy' | 'closed' | 'wink' | 'wide' | 'cross' | 'hearts' | 'star' | 'teary' | 'neutral_line' | 'angry' | 'relaxed';
export type MouthType = 'neutral' | 'smile' | 'bigSmile' | 'open' | 'sad' | 'cat' | 'tongue' | 'zigzag' | 'triangle' | 'frown' | 'smirk' | 'kiss' | 'none';
export type AccessoryType = 'none' | 'blush' | 'tear' | 'sweat' | 'shock' | 'sparkle' | 'halo' | 'question' | 'steam' | 'utensils';

interface AuroraSphereProps {
  isThinking: boolean;
  category: Category;
  emotion: Emotion;
  isInputFocused: boolean;
  forceSmile: boolean;
  // Overrides for Debugging
  eyeOverride?: EyeType;
  mouthOverride?: MouthType;
  accessoryOverride?: AccessoryType;
}

interface FaceConfig {
  eyes: EyeType;
  mouth: MouthType;
  accessory: AccessoryType;
  animation?: string;
}

// Maps emotions to the new cute presets
const EMOTION_PRESETS: Record<Emotion | 'thinking' | 'sleeping', FaceConfig> = {
  neutral:   { eyes: 'dot', mouth: 'neutral', accessory: 'none' },
  happy:     { eyes: 'happy', mouth: 'smile', accessory: 'blush' },
  calm:      { eyes: 'closed', mouth: 'smile', accessory: 'none' },
  excited:   { eyes: 'star', mouth: 'bigSmile', accessory: 'sparkle' },
  sad:       { eyes: 'cross', mouth: 'zigzag', accessory: 'sweat' },
  surprised: { eyes: 'wide', mouth: 'open', accessory: 'shock' },
  focused:   { eyes: 'dot', mouth: 'cat', accessory: 'none' },
  
  // New Emotions
  confused:  { eyes: 'dot', mouth: 'zigzag', accessory: 'question' },
  tired:     { eyes: 'relaxed', mouth: 'neutral', accessory: 'steam' },
  angry:     { eyes: 'angry', mouth: 'frown', accessory: 'shock' },
  love:      { eyes: 'hearts', mouth: 'smile', accessory: 'blush' },
  grateful:  { eyes: 'teary', mouth: 'smile', accessory: 'blush' },
  hungry:    { eyes: 'dot', mouth: 'tongue', accessory: 'utensils' },

  thinking:  { eyes: 'dot', mouth: 'open', accessory: 'sweat' },
  sleeping:  { eyes: 'closed', mouth: 'neutral', accessory: 'zz' } as any // zz is handled by sleep logic usually, but we map to none/sweat for now or add zz
};

// --- SVG Path Generators ---
const generateEyes = (type: EyeType, strokeProps: any, fillProps: any) => {
  const leftCenter = { x: 165, y: 195 };
  const rightCenter = { x: 235, y: 195 }; 

  switch (type) {
    case 'dot':
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
          <circle cx={rightCenter.x} cy={rightCenter.y} r="6" {...fillProps} />
        </>
      );
    case 'neutral_line':
      return (
        <>
          <line x1={leftCenter.x - 7} y1={leftCenter.y} x2={leftCenter.x + 7} y2={leftCenter.y} {...strokeProps} />
          <line x1={rightCenter.x - 7} y1={rightCenter.y} x2={rightCenter.x + 7} y2={rightCenter.y} {...strokeProps} />
        </>
      );
    case 'happy': // ^ ^
      return (
        <>
           <path d={`M ${leftCenter.x-10} ${leftCenter.y+5} Q ${leftCenter.x} ${leftCenter.y-10} ${leftCenter.x+10} ${leftCenter.y+5}`} {...strokeProps} />
           <path d={`M ${rightCenter.x-10} ${rightCenter.y+5} Q ${rightCenter.x} ${rightCenter.y-10} ${rightCenter.x+10} ${rightCenter.y+5}`} {...strokeProps} />
        </>
      );
    case 'closed': // - - (relaxed)
      return (
        <>
           <path d={`M ${leftCenter.x-10} ${leftCenter.y} Q ${leftCenter.x} ${leftCenter.y+2} ${leftCenter.x+10} ${leftCenter.y}`} {...strokeProps} />
           <path d={`M ${rightCenter.x-10} ${rightCenter.y} Q ${rightCenter.x} ${rightCenter.y+2} ${rightCenter.x+10} ${rightCenter.y}`} {...strokeProps} />
        </>
      );
    case 'wide': // O O (hollow)
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="8" {...strokeProps} />
          <circle cx={rightCenter.x} cy={rightCenter.y} r="8" {...strokeProps} />
        </>
      );
    case 'cross': // X X
      const size = 6;
      return (
        <>
          <path d={`M ${leftCenter.x-size} ${leftCenter.y-size} L ${leftCenter.x+size} ${leftCenter.y+size}`} {...strokeProps} />
          <path d={`M ${leftCenter.x+size} ${leftCenter.y-size} L ${leftCenter.x-size} ${leftCenter.y+size}`} {...strokeProps} />
          <path d={`M ${rightCenter.x-size} ${rightCenter.y-size} L ${rightCenter.x+size} ${rightCenter.y+size}`} {...strokeProps} />
          <path d={`M ${rightCenter.x+size} ${rightCenter.y-size} L ${rightCenter.x-size} ${rightCenter.y+size}`} {...strokeProps} />
        </>
      );
    case 'hearts':
      const heartPath = "M 0 -3 C -3 -6 -8 -2 -4 2 L 0 6 L 4 2 C 8 -2 3 -6 0 -3";
      return (
        <>
          <g transform={`translate(${leftCenter.x}, ${leftCenter.y}) scale(1.5)`}>
             <path d={heartPath} {...fillProps} />
          </g>
          <g transform={`translate(${rightCenter.x}, ${rightCenter.y}) scale(1.5)`}>
             <path d={heartPath} {...fillProps} />
          </g>
        </>
      );
    case 'star':
      const starPath = "M 0 -6 L 1.5 -1.5 L 6 -1.5 L 2.5 1.5 L 4 6 L 0 3 L -4 6 L -2.5 1.5 L -6 -1.5 L -1.5 -1.5 Z";
       return (
        <>
          <g transform={`translate(${leftCenter.x}, ${leftCenter.y}) scale(1.2)`}>
             <path d={starPath} {...fillProps} />
          </g>
          <g transform={`translate(${rightCenter.x}, ${rightCenter.y}) scale(1.2)`}>
             <path d={starPath} {...fillProps} />
          </g>
        </>
      );
    case 'wink':
      return (
        <>
           <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
           <path d={`M ${rightCenter.x-10} ${rightCenter.y} L ${rightCenter.x+10} ${rightCenter.y}`} {...strokeProps} />
        </>
       );
    case 'teary':
      return (
        <>
           <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
           <circle cx={rightCenter.x} cy={rightCenter.y} r="6" {...fillProps} />
           <path d={`M ${leftCenter.x-4} ${leftCenter.y+2} Q ${leftCenter.x} ${leftCenter.y+8} ${leftCenter.x+4} ${leftCenter.y+2}`} fill="white" />
           <path d={`M ${rightCenter.x-4} ${rightCenter.y+2} Q ${rightCenter.x} ${rightCenter.y+8} ${rightCenter.x+4} ${rightCenter.y+2}`} fill="white" />
        </>
      );
    case 'angry': // / \
       return (
         <>
            <line x1={leftCenter.x - 7} y1={leftCenter.y - 3} x2={leftCenter.x + 7} y2={leftCenter.y + 3} {...strokeProps} />
            <line x1={rightCenter.x - 7} y1={rightCenter.y + 3} x2={rightCenter.x + 7} y2={rightCenter.y - 3} {...strokeProps} />
         </>
       );
    case 'relaxed': // U U
       return (
        <>
           <path d={`M ${leftCenter.x-7} ${leftCenter.y} Q ${leftCenter.x} ${leftCenter.y+7} ${leftCenter.x+7} ${leftCenter.y}`} {...strokeProps} />
           <path d={`M ${rightCenter.x-7} ${rightCenter.y} Q ${rightCenter.x} ${rightCenter.y+7} ${rightCenter.x+7} ${rightCenter.y}`} {...strokeProps} />
        </>
       );
    default: return null;
  }
};

const generateMouth = (type: MouthType, strokeProps: any, fillProps: any) => {
  const center = { x: 200, y: 225 }; 

  switch (type) {
    case 'neutral': // -
      return <path d={`M ${center.x-5} ${center.y} L ${center.x+5} ${center.y}`} {...strokeProps} />;
    case 'smile': // u
      return <path d={`M ${center.x-10} ${center.y-2} Q ${center.x} ${center.y+8} ${center.x+10} ${center.y-2}`} {...strokeProps} />;
    case 'bigSmile': // D shape
      return <path d={`M ${center.x-12} ${center.y-2} Q ${center.x} ${center.y+15} ${center.x+12} ${center.y-2} Z`} {...strokeProps} fill={strokeProps.stroke} fillOpacity="0.1" />;
    case 'open': // o
       return <circle cx={center.x} cy={center.y+2} r="6" {...strokeProps} />;
    case 'sad': // n
      return <path d={`M ${center.x-8} ${center.y+5} Q ${center.x} ${center.y-2} ${center.x+8} ${center.y+5}`} {...strokeProps} />;
    case 'cat': // :3
      return <path d={`M ${center.x-10} ${center.y} Q ${center.x-5} ${center.y+6} ${center.x} ${center.y} Q ${center.x+5} ${center.y+6} ${center.x+10} ${center.y}`} {...strokeProps} />;
    case 'zigzag': // ~ (smoother)
      return <path d={`M ${center.x-10} ${center.y+1} Q ${center.x-5} ${center.y-3} ${center.x} ${center.y+1} Q ${center.x+5} ${center.y+5} ${center.x+10} ${center.y+1}`} {...strokeProps} />;
    case 'triangle': // Triangle open
      return <path d={`M ${center.x-8} ${center.y+5} L ${center.x+8} ${center.y+5} L ${center.x} ${center.y-5} Z`} {...strokeProps} />;
    case 'tongue': // :P style
      return (
        <g>
           {/* Mouth line */}
          <path d={`M ${center.x-12} ${center.y-2} Q ${center.x} ${center.y+6} ${center.x+12} ${center.y-2}`} {...strokeProps} />
           {/* Tongue - bigger, U shape */}
          <path d={`M ${center.x-6} ${center.y+3} Q ${center.x} ${center.y+15} ${center.x+6} ${center.y+3}`} {...strokeProps} fill={strokeProps.stroke} fillOpacity="0.1" />
        </g>
      );
    case 'frown':
        return <path d={`M ${center.x-6} ${center.y+4} Q ${center.x} ${center.y} ${center.x+6} ${center.y+4}`} {...strokeProps} />;
    case 'smirk':
        return <path d={`M ${center.x-8} ${center.y} Q ${center.x} ${center.y+2} ${center.x+8} ${center.y-2}`} {...strokeProps} />;
    case 'kiss': // 3 shape rotated
        return <path d={`M ${center.x-4} ${center.y-3} Q ${center.x} ${center.y} ${center.x-4} ${center.y+3} M ${center.x+4} ${center.y-3} Q ${center.x} ${center.y} ${center.x+4} ${center.y+3}`} {...strokeProps} />;
    case 'none':
        return null;
    default: return null;
  }
};

const generateAccessory = (type: AccessoryType, strokeProps: any) => {
  // Styles for "sketchy" look
  const sketchStyle = { ...strokeProps, strokeWidth: 2.5, opacity: 0.8, fill: 'none' };
  
  switch (type) {
    case 'blush': // Simple hatching
      return (
        <>
          <g transform="translate(155, 210)">
             <line x1="0" y1="0" x2="6" y2="-6" {...sketchStyle} opacity="0.4" />
             <line x1="6" y1="0" x2="12" y2="-6" {...sketchStyle} opacity="0.4" />
          </g>
          <g transform="translate(230, 210)">
             <line x1="0" y1="0" x2="6" y2="-6" {...sketchStyle} opacity="0.4" />
             <line x1="6" y1="0" x2="12" y2="-6" {...sketchStyle} opacity="0.4" />
          </g>
        </>
      );
    case 'sweat': // Perfect water drop 💧
      return (
        <g transform="translate(250, 175) rotate(-10)">
           <path d="M 0 0 C -5 6 -5 13 0 13 C 5 13 5 6 0 0" {...sketchStyle} fill={sketchStyle.stroke} fillOpacity="0.15" />
        </g>
      );
    case 'tear': // Perfect water drop 💧
      return (
        <g transform="translate(160, 215)">
           <path d="M 0 0 C -4 5 -4 10 0 10 C 4 10 4 5 0 0" {...sketchStyle} fill={sketchStyle.stroke} fillOpacity="0.15" />
        </g>
      );
    case 'shock': // || lines
      return (
        <g transform="translate(255, 160)">
          <line x1="0" y1="0" x2="0" y2="12" {...sketchStyle} />
          <line x1="8" y1="0" x2="8" y2="12" {...sketchStyle} />
        </g>
      );
    case 'sparkle': // Simple cross stars
      return (
        <g transform="translate(260, 170)">
           <path d="M 5 0 L 5 10 M 0 5 L 10 5" {...sketchStyle} />
           <path d="M 20 15 L 20 20 M 17.5 17.5 L 22.5 17.5" {...sketchStyle} strokeWidth="1.5" />
        </g>
      );
    case 'halo': // Simple ellipse loop
       return (
        <ellipse cx="200" cy="155" rx="25" ry="6" {...sketchStyle} />
       );
    case 'question': // Hand drawn ?
       return (
        <path d="M 255 170 Q 265 160 270 170 Q 270 180 260 180 L 260 185 M 260 192 L 260 194" {...sketchStyle} strokeWidth="3" />
       );
    case 'steam': // Simple curves
       return (
         <g {...sketchStyle}>
           <path d="M 240 160 Q 245 155 240 150" />
           <path d="M 250 165 Q 255 160 250 155" />
         </g>
       );
    case 'utensils': // Abstract knife/fork lines
       return (
         <g transform="translate(260, 180)" {...sketchStyle}>
           <path d="M 0 0 L 0 12" />
           <path d="M 6 0 L 6 12" />
           <path d="M 12 0 L 12 12" />
         </g>
       );
    default: return null;
  }
}

// --- Main Component ---

const AuroraSphere: React.FC<AuroraSphereProps> = ({ 
  isThinking, category, emotion, isInputFocused, forceSmile,
  eyeOverride, mouthOverride, accessoryOverride
}) => {
  const style = CATEGORY_THEMES[category] || CATEGORY_THEMES.default;
  const [currentCategory, setCurrentCategory] = useState(category);
  const [animating, setAnimating] = useState(false);
  
  // Interaction State
  const [faceOffset, setFaceOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Category Transitions
  useEffect(() => {
    if (category !== currentCategory) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setCurrentCategory(category);
        setAnimating(false);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [category, currentCategory]);

  // Determine current face config
  let currentFace = isThinking 
    ? EMOTION_PRESETS.thinking 
    : EMOTION_PRESETS[emotion] || EMOTION_PRESETS.neutral;

  // Apply Manual Overrides
  if (eyeOverride) currentFace = { ...currentFace, eyes: eyeOverride };
  if (mouthOverride) currentFace = { ...currentFace, mouth: mouthOverride };
  if (accessoryOverride) currentFace = { ...currentFace, accessory: accessoryOverride };

  // Interaction Overrides (Lower priority than debug overrides usually, but let's keep logic simple)
  if (forceSmile && !eyeOverride) {
    currentFace = { ...currentFace, eyes: 'happy', mouth: 'bigSmile', accessory: 'blush' };
  } else if (isInputFocused && !isThinking && !forceSmile && !eyeOverride) {
     currentFace = { ...currentFace, eyes: 'dot', mouth: 'none', accessory: 'none' };
  }

  // --- Animation Logic ---

  // Blinking
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      const nextBlink = Math.random() * 4000 + 2000;
      setTimeout(blinkLoop, nextBlink);
    };
    const timer = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Mouse/Eye Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX);
      const deltaY = (e.clientY - centerY);

      // Dampening - increased sensitivity and range
      const x = deltaX / 12; // Was 30
      const y = deltaY / 12; // Was 30
      const limit = 40; // Was 20
      const clampedX = Math.max(-limit, Math.min(limit, x));
      const clampedY = Math.max(-limit, Math.min(limit, y));

      if (isInputFocused) {
          setFaceOffset({ x: clampedX * 0.3, y: 75 });
      } else {
          setFaceOffset({ x: clampedX, y: clampedY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isInputFocused]);

  // Face Style Props
  const strokeProps = {
    stroke: style.faceColor,
    strokeWidth: "3", 
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
    style: { filter: "url(#face-glow)" }
  };

  const fillProps = {
    fill: style.faceColor,
    style: { filter: "url(#face-glow)" }
  };

  const filterId = "aurora-flow";

  return (
    <div 
      ref={containerRef}
      className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 transition-transform duration-700 ease-in-out pointer-events-none`}
    >
      <svg 
        viewBox="0 0 400 400" 
        className={`w-full h-full drop-shadow-2xl transition-opacity duration-500 ${animating ? 'opacity-80' : 'opacity-100'}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Main Aurora Filter */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="3" result="noise" seed="5">
              <animate attributeName="baseFrequency" values="0.012;0.008;0.012" dur="15s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="blur" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          </filter>

          <filter id="face-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
            <feFlood floodColor="rgba(0,0,0,0.15)" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated Glow Body */}
        <g filter={`url(#${filterId})`}>
          <circle cx="200" cy="200" r="130" fill={style.primary} className="animate-[pulse_4s_ease-in-out_infinite]" opacity="0.9" />
          <circle cx="160" cy="180" r="90" fill={style.secondary} className="animate-[pulse_5s_ease-in-out_infinite_reverse]" opacity="0.8" />
          <circle cx="240" cy="220" r="100" fill={style.tertiary} className="animate-[pulse_6s_ease-in-out_infinite]" opacity="0.8" />
          <circle cx="200" cy="240" r="80" fill={style.primary} className="animate-[pulse_7s_ease-in-out_infinite]" opacity="0.7" />
        </g>
        
        {/* Face Group */}
        <g 
          style={{ 
            transform: `translate(${faceOffset.x}px, ${faceOffset.y}px)`, 
            transition: 'transform 0.1s ease-out' 
          }}
        >
          {isBlinking 
             ? generateEyes('closed', strokeProps, fillProps) 
             : generateEyes(currentFace.eyes, strokeProps, fillProps)
          }
          {generateMouth(currentFace.mouth, strokeProps, fillProps)}
          {generateAccessory(currentFace.accessory, strokeProps)}
        </g>
      </svg>
    </div>
  );
};

export default AuroraSphere;
