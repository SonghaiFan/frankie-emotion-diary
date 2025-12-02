import React, { useEffect, useState, useRef, useCallback } from "react";
import { Category, Emotion } from "@/constants";
import { CATEGORY_THEMES } from "../constants";

// --- Types ---

export type EyeType =
  | "dot"
  | "happy"
  | "closed"
  | "wink"
  | "wide"
  | "cross"
  | "hearts"
  | "star"
  | "teary"
  | "neutral_line"
  | "angry"
  | "relaxed";

export type MouthType =
  | "neutral"
  | "smile"
  | "bigSmile"
  | "open"
  | "sad"
  | "cat"
  | "zigzag"
  | "triangle"
  | "frown"
  | "smirk"
  | "kiss"
  | "none";

export type AccessoryType =
  | "none"
  | "blush"
  | "tear"
  | "sweat"
  | "shock"
  | "sparkle"
  | "halo"
  | "question"
  | "steam"
  | "utensils";

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
  className?: string;
  customColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  smoothTransition?: boolean;
}

interface FaceConfig {
  eyes: EyeType;
  mouth: MouthType;
  accessory: AccessoryType;
}

// --- Face Configuration ---

// Maps emotions to the cute presets, including new HSP states
const EMOTION_PRESETS: Record<Emotion | "thinking" | "sleeping", FaceConfig> = {
  // Basic
  neutral: { eyes: "dot", mouth: "neutral", accessory: "none" },
  happy: { eyes: "happy", mouth: "smile", accessory: "blush" },
  calm: { eyes: "closed", mouth: "smile", accessory: "none" },
  excited: { eyes: "star", mouth: "bigSmile", accessory: "sparkle" },
  sad: { eyes: "teary", mouth: "sad", accessory: "tear" }, // "Vulnerable" look
  surprised: { eyes: "wide", mouth: "open", accessory: "shock" },
  focused: { eyes: "dot", mouth: "cat", accessory: "none" },
  confused: { eyes: "dot", mouth: "zigzag", accessory: "question" },
  tired: { eyes: "relaxed", mouth: "neutral", accessory: "steam" },
  angry: { eyes: "angry", mouth: "frown", accessory: "shock" },
  love: { eyes: "hearts", mouth: "smile", accessory: "blush" },
  grateful: { eyes: "teary", mouth: "smile", accessory: "blush" },

  // New HSP Specific States
  overstimulated: { eyes: "cross", mouth: "zigzag", accessory: "steam" }, // "System Overload" look
  fragile: { eyes: "cross", mouth: "sad", accessory: "tear" },
  safe: { eyes: "relaxed", mouth: "smile", accessory: "halo" }, // "Protected/Zen" look
  // System States
  thinking: { eyes: "dot", mouth: "open", accessory: "sweat" },
  sleeping: { eyes: "closed", mouth: "neutral", accessory: "none" },
};

// --- SVG Path Generators ---

const generateEyes = (type: EyeType, strokeProps: any, fillProps: any) => {
  const leftCenter = { x: 165, y: 195 };
  const rightCenter = { x: 235, y: 195 };

  switch (type) {
    case "dot":
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
          <circle cx={rightCenter.x} cy={rightCenter.y} r="6" {...fillProps} />
        </>
      );
    case "neutral_line":
      return (
        <>
          <line
            x1={leftCenter.x - 7}
            y1={leftCenter.y}
            x2={leftCenter.x + 7}
            y2={leftCenter.y}
            {...strokeProps}
          />
          <line
            x1={rightCenter.x - 7}
            y1={rightCenter.y}
            x2={rightCenter.x + 7}
            y2={rightCenter.y}
            {...strokeProps}
          />
        </>
      );
    case "happy": // ^ ^
      return (
        <>
          <path
            d={`M ${leftCenter.x - 10} ${leftCenter.y + 5} Q ${leftCenter.x} ${
              leftCenter.y - 10
            } ${leftCenter.x + 10} ${leftCenter.y + 5}`}
            {...strokeProps}
          />
          <path
            d={`M ${rightCenter.x - 10} ${rightCenter.y + 5} Q ${
              rightCenter.x
            } ${rightCenter.y - 10} ${rightCenter.x + 10} ${rightCenter.y + 5}`}
            {...strokeProps}
          />
        </>
      );
    case "closed": // - - (relaxed)
      return (
        <>
          <path
            d={`M ${leftCenter.x - 10} ${leftCenter.y} Q ${leftCenter.x} ${
              leftCenter.y + 2
            } ${leftCenter.x + 10} ${leftCenter.y}`}
            {...strokeProps}
          />
          <path
            d={`M ${rightCenter.x - 10} ${rightCenter.y} Q ${rightCenter.x} ${
              rightCenter.y + 2
            } ${rightCenter.x + 10} ${rightCenter.y}`}
            {...strokeProps}
          />
        </>
      );
    case "wide": // O O (hollow)
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="8" {...strokeProps} />
          <circle
            cx={rightCenter.x}
            cy={rightCenter.y}
            r="8"
            {...strokeProps}
          />
        </>
      );
    case "cross": // X X
      const size = 6;
      return (
        <>
          <path
            d={`M ${leftCenter.x - size} ${leftCenter.y - size} L ${
              leftCenter.x + size
            } ${leftCenter.y + size}`}
            {...strokeProps}
          />
          <path
            d={`M ${leftCenter.x + size} ${leftCenter.y - size} L ${
              leftCenter.x - size
            } ${leftCenter.y + size}`}
            {...strokeProps}
          />
          <path
            d={`M ${rightCenter.x - size} ${rightCenter.y - size} L ${
              rightCenter.x + size
            } ${rightCenter.y + size}`}
            {...strokeProps}
          />
          <path
            d={`M ${rightCenter.x + size} ${rightCenter.y - size} L ${
              rightCenter.x - size
            } ${rightCenter.y + size}`}
            {...strokeProps}
          />
        </>
      );
    case "hearts":
      const heartPath =
        "M 0 -3 C -3 -6 -8 -2 -4 2 L 0 6 L 4 2 C 8 -2 3 -6 0 -3";
      return (
        <>
          <g
            transform={`translate(${leftCenter.x}, ${leftCenter.y}) scale(1.5)`}
          >
            <path d={heartPath} {...fillProps} />
          </g>
          <g
            transform={`translate(${rightCenter.x}, ${rightCenter.y}) scale(1.5)`}
          >
            <path d={heartPath} {...fillProps} />
          </g>
        </>
      );
    case "star":
      const starPath =
        "M 0 -6 L 1.5 -1.5 L 6 -1.5 L 2.5 1.5 L 4 6 L 0 3 L -4 6 L -2.5 1.5 L -6 -1.5 L -1.5 -1.5 Z";
      return (
        <>
          <g
            transform={`translate(${leftCenter.x}, ${leftCenter.y}) scale(1.2)`}
          >
            <path d={starPath} {...fillProps} />
          </g>
          <g
            transform={`translate(${rightCenter.x}, ${rightCenter.y}) scale(1.2)`}
          >
            <path d={starPath} {...fillProps} />
          </g>
        </>
      );
    case "wink":
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
          <path
            d={`M ${rightCenter.x - 10} ${rightCenter.y} L ${
              rightCenter.x + 10
            } ${rightCenter.y}`}
            {...strokeProps}
          />
        </>
      );
    case "teary":
      return (
        <>
          <circle cx={leftCenter.x} cy={leftCenter.y} r="6" {...fillProps} />
          <circle cx={rightCenter.x} cy={rightCenter.y} r="6" {...fillProps} />
          {/* Shine/Tear reflection */}
          <path
            d={`M ${leftCenter.x - 4} ${leftCenter.y + 2} Q ${leftCenter.x} ${
              leftCenter.y + 8
            } ${leftCenter.x + 4} ${leftCenter.y + 2}`}
            fill="white"
            fillOpacity="0.5"
          />
          <path
            d={`M ${rightCenter.x - 4} ${rightCenter.y + 2} Q ${
              rightCenter.x
            } ${rightCenter.y + 8} ${rightCenter.x + 4} ${rightCenter.y + 2}`}
            fill="white"
            fillOpacity="0.5"
          />
        </>
      );
    case "angry": // / \
      return (
        <>
          <line
            x1={leftCenter.x - 7}
            y1={leftCenter.y - 3}
            x2={leftCenter.x + 7}
            y2={leftCenter.y + 3}
            {...strokeProps}
          />
          <line
            x1={rightCenter.x - 7}
            y1={rightCenter.y + 3}
            x2={rightCenter.x + 7}
            y2={rightCenter.y - 3}
            {...strokeProps}
          />
        </>
      );
    case "relaxed": // U U
      return (
        <>
          <path
            d={`M ${leftCenter.x - 7} ${leftCenter.y} Q ${leftCenter.x} ${
              leftCenter.y + 7
            } ${leftCenter.x + 7} ${leftCenter.y}`}
            {...strokeProps}
          />
          <path
            d={`M ${rightCenter.x - 7} ${rightCenter.y} Q ${rightCenter.x} ${
              rightCenter.y + 7
            } ${rightCenter.x + 7} ${rightCenter.y}`}
            {...strokeProps}
          />
        </>
      );
    default:
      return null;
  }
};

const generateMouth = (type: MouthType, strokeProps: any, fillProps: any) => {
  const center = { x: 200, y: 225 };

  switch (type) {
    case "neutral": // -
      return (
        <path
          d={`M ${center.x - 5} ${center.y} L ${center.x + 5} ${center.y}`}
          {...strokeProps}
        />
      );
    case "smile": // u
      return (
        <path
          d={`M ${center.x - 10} ${center.y - 2} Q ${center.x} ${
            center.y + 8
          } ${center.x + 10} ${center.y - 2}`}
          {...strokeProps}
        />
      );
    case "bigSmile": // D shape
      return (
        <path
          d={`M ${center.x - 12} ${center.y - 2} Q ${center.x} ${
            center.y + 15
          } ${center.x + 12} ${center.y - 2} Z`}
          {...strokeProps}
          fill={strokeProps.stroke}
          fillOpacity="0.1"
        />
      );
    case "open": // o
      return <circle cx={center.x} cy={center.y + 2} r="6" {...strokeProps} />;
    case "sad": // n
      return (
        <path
          d={`M ${center.x - 8} ${center.y + 5} Q ${center.x} ${center.y - 2} ${
            center.x + 8
          } ${center.y + 5}`}
          {...strokeProps}
        />
      );
    case "cat": // :3
      return (
        <path
          d={`M ${center.x - 10} ${center.y} Q ${center.x - 5} ${
            center.y + 6
          } ${center.x} ${center.y} Q ${center.x + 5} ${center.y + 6} ${
            center.x + 10
          } ${center.y}`}
          {...strokeProps}
        />
      );
    case "zigzag": // ~ (smoother)
      return (
        <path
          d={`M ${center.x - 10} ${center.y + 1} Q ${center.x - 5} ${
            center.y - 3
          } ${center.x} ${center.y + 1} Q ${center.x + 5} ${center.y + 5} ${
            center.x + 10
          } ${center.y + 1}`}
          {...strokeProps}
        />
      );
    case "triangle": // Triangle open
      return (
        <path
          d={`M ${center.x - 8} ${center.y + 5} L ${center.x + 8} ${
            center.y + 5
          } L ${center.x} ${center.y - 5} Z`}
          {...strokeProps}
        />
      );
    case "frown":
      return (
        <path
          d={`M ${center.x - 6} ${center.y + 4} Q ${center.x} ${center.y} ${
            center.x + 6
          } ${center.y + 4}`}
          {...strokeProps}
        />
      );
    case "smirk":
      return (
        <path
          d={`M ${center.x - 8} ${center.y} Q ${center.x} ${center.y + 2} ${
            center.x + 8
          } ${center.y - 2}`}
          {...strokeProps}
        />
      );
    case "kiss": // 3 shape rotated
      return (
        <path
          d={`M ${center.x - 4} ${center.y - 3} Q ${center.x} ${center.y} ${
            center.x - 4
          } ${center.y + 3} M ${center.x + 4} ${center.y - 3} Q ${center.x} ${
            center.y
          } ${center.x + 4} ${center.y + 3}`}
          {...strokeProps}
        />
      );
    case "none":
      return null;
    default:
      return null;
  }
};

const generateAccessory = (type: AccessoryType, strokeProps: any) => {
  // Styles for "sketchy" look
  const sketchStyle = {
    ...strokeProps,
    strokeWidth: 2.5,
    opacity: 0.8,
    fill: "none",
  };

  switch (type) {
    case "blush": // Simple hatching
      return (
        <>
          <g transform="translate(155, 220)">
            <line x1="0" y1="0" x2="6" y2="-6" {...sketchStyle} opacity="0.4" />
            <line
              x1="6"
              y1="0"
              x2="12"
              y2="-6"
              {...sketchStyle}
              opacity="0.4"
            />
          </g>
          <g transform="translate(230, 220)">
            <line x1="0" y1="0" x2="6" y2="-6" {...sketchStyle} opacity="0.4" />
            <line
              x1="6"
              y1="0"
              x2="12"
              y2="-6"
              {...sketchStyle}
              opacity="0.4"
            />
          </g>
        </>
      );
    case "sweat": // Perfect water drop 💧
      return (
        <g transform="translate(250, 175) rotate(-10)">
          <path
            d="M 0 0 C -5 6 -5 13 0 13 C 5 13 5 6 0 0"
            {...sketchStyle}
            fill={sketchStyle.stroke}
            fillOpacity="0.15"
          />
        </g>
      );
    case "tear": // Perfect water drop 💧
      return (
        <g transform="translate(160, 215)">
          <path
            d="M 0 0 C -4 5 -4 10 0 10 C 4 10 4 5 0 0"
            {...sketchStyle}
            fill={sketchStyle.stroke}
            fillOpacity="0.15"
          />
        </g>
      );
    case "shock": // || lines
      return (
        <g transform="translate(255, 160)">
          <line x1="0" y1="0" x2="0" y2="12" {...sketchStyle} />
          <line x1="8" y1="0" x2="8" y2="12" {...sketchStyle} />
        </g>
      );
    case "sparkle": // Simple cross stars
      return (
        <g transform="translate(260, 170)">
          <path d="M 5 0 L 5 10 M 0 5 L 10 5" {...sketchStyle} />
          <path
            d="M 20 15 L 20 20 M 17.5 17.5 L 22.5 17.5"
            {...sketchStyle}
            strokeWidth="1.5"
          />
        </g>
      );
    case "halo": // Simple ellipse loop
      return <ellipse cx="200" cy="155" rx="25" ry="6" {...sketchStyle} />;
    case "question": // Hand drawn ?
      return (
        <path
          d="M 255 170 Q 265 160 270 170 Q 270 180 260 180 L 260 185 M 260 192 L 260 194"
          {...sketchStyle}
          strokeWidth="3"
        />
      );
    case "steam": // Simple curves
      return (
        <g {...sketchStyle}>
          <path d="M 240 160 Q 245 155 240 150" />
          <path d="M 250 165 Q 255 160 250 155" />
        </g>
      );
    case "utensils": // Abstract knife/fork lines
      return (
        <g transform="translate(260, 180)" {...sketchStyle}>
          <path d="M 0 0 L 0 12" />
          <path d="M 6 0 L 6 12" />
          <path d="M 12 0 L 12 12" />
        </g>
      );
    default:
      return null;
  }
};

// --- Main Component ---

const AuroraSphere: React.FC<AuroraSphereProps> = ({
  isThinking,
  category,
  emotion,
  isInputFocused,
  forceSmile,
  eyeOverride,
  mouthOverride,
  accessoryOverride,
  className = "w-40 h-40 sm:w-64 sm:h-64",
  customColors,
  smoothTransition = false,
}) => {
  const themeStyle = CATEGORY_THEMES[category] || CATEGORY_THEMES.default;
  const style = customColors ? { ...themeStyle, ...customColors } : themeStyle;
  const [currentCategory, setCurrentCategory] = useState(category);
  const [animating, setAnimating] = useState(false);

  // Interaction State
  const [faceOffset, setFaceOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref to track mouse position even when not moving
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Handle Category Transitions
  useEffect(() => {
    if (category !== currentCategory) {
      if (smoothTransition) {
        setCurrentCategory(category);
      } else {
        setAnimating(true);
        const timer = setTimeout(() => {
          setCurrentCategory(category);
          setAnimating(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [category, currentCategory, smoothTransition]);

  // Determine current face config
  let currentFace = isThinking
    ? EMOTION_PRESETS.thinking
    : EMOTION_PRESETS[emotion] || EMOTION_PRESETS.neutral;

  // Apply Manual Overrides
  if (eyeOverride) currentFace = { ...currentFace, eyes: eyeOverride };
  if (mouthOverride) currentFace = { ...currentFace, mouth: mouthOverride };
  if (accessoryOverride)
    currentFace = { ...currentFace, accessory: accessoryOverride };

  // Interaction Overrides
  if (forceSmile && !eyeOverride) {
    currentFace = {
      ...currentFace,
      eyes: "happy",
      mouth: "bigSmile",
      accessory: "blush",
    };
  } else if (isInputFocused && !isThinking && !forceSmile && !eyeOverride) {
    currentFace = {
      ...currentFace,
      eyes: "dot",
      mouth: "none",
      accessory: "none",
    };
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

  // Update Face Offset Logic (Decoupled)
  const updateFaceOffset = useCallback(() => {
    if (!containerRef.current) return;

    // If input is focused, immediately force the "looking down" pose
    if (isInputFocused) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const deltaX = lastMousePos.current.x - centerX;

      const x = deltaX / 12;
      const limit = 40;
      const clampedX = Math.max(-limit, Math.min(limit, x));

      setFaceOffset({ x: clampedX * 0.3, y: 75 });
    } else {
      // Normal tracking behavior
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = lastMousePos.current.x - centerX;
      const deltaY = lastMousePos.current.y - centerY;

      const x = deltaX / 12;
      const y = deltaY / 12;
      const limit = 40;
      const clampedX = Math.max(-limit, Math.min(limit, x));
      const clampedY = Math.max(-limit, Math.min(limit, y));

      setFaceOffset({ x: clampedX, y: clampedY });
    }
  }, [isInputFocused]);

  // Trigger update immediately when focus state changes
  useEffect(() => {
    updateFaceOffset();
  }, [updateFaceOffset]);

  // Mouse Tracking Listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateFaceOffset();
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [updateFaceOffset]);

  // Face Style Props
  const strokeProps = {
    stroke: "white",
    strokeWidth: 8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  const fillProps = {
    fill: "white",
  };

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-200 ease-out ${className} ${
        animating ? "scale-90 opacity-80" : "scale-100 opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))" }}
      >
        <defs>
          <filter id="aurora-flow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="20"
              result="blur"
            />
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
              seed="5"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015;0.01;0.015"
                dur="15s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="blur"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* --- Background Aurora Body --- */}
        <g filter="url(#aurora-flow)" opacity="0.9">
          {/* Cluster 1: Primary */}
          <circle
            cx="180"
            cy="180"
            r="110"
            fill={style.primary}
            opacity="0.7"
            style={{ transition: "fill 1.5s ease-in-out" }}
          >
            <animate
              attributeName="cx"
              values="180;200;160;180"
              dur="12s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="180;160;200;180"
              dur="14s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="110;120;100;110"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Cluster 2: Secondary */}
          <circle
            cx="220"
            cy="180"
            r="110"
            fill={style.secondary}
            opacity="0.7"
            style={{ transition: "fill 1.5s ease-in-out" }}
          >
            <animate
              attributeName="cx"
              values="220;200;240;220"
              dur="13s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="180;200;160;180"
              dur="11s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="110;100;120;110"
              dur="12s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Cluster 3: Tertiary */}
          <circle
            cx="200"
            cy="230"
            r="110"
            fill={style.tertiary}
            opacity="0.7"
            style={{ transition: "fill 1.5s ease-in-out" }}
          >
            <animate
              attributeName="cx"
              values="200;220;180;200"
              dur="15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="230;210;250;230"
              dur="13s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="110;115;105;110"
              dur="14s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* --- Face Layer --- */}
        <g
          style={{
            transform: `translate(${faceOffset.x}px, ${faceOffset.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
          // Gentle glow on features
          filter="drop-shadow(0 0 2px rgba(255,255,255,0.5))"
        >
          {generateEyes(currentFace.eyes, strokeProps, fillProps)}
          {generateMouth(currentFace.mouth, strokeProps, fillProps)}
          {generateAccessory(currentFace.accessory, strokeProps)}
        </g>
      </svg>
    </div>
  );
};

export default AuroraSphere;