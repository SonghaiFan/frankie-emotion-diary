import React, { useState } from "react";
import { Category, Emotion, EMOTIONS, CATEGORY_THEMES } from "../constants";
import { EyeType, MouthType, AccessoryType } from "./AuroraSphere";

interface DebugPanelProps {
  currentCategory: Category;
  currentEmotion: Emotion;
  isThinking: boolean;
  forceSmile: boolean;
  isInputFocused: boolean;
  onCategoryChange: (c: Category) => void;
  onEmotionChange: (e: Emotion) => void;
  onThinkingChange: (t: boolean) => void;
  onSmileChange: (s: boolean) => void;
  onFocusChange: (f: boolean) => void;
  // Overrides
  onOverrideChange?: (
    eyes: EyeType | undefined,
    mouth: MouthType | undefined,
    acc: AccessoryType | undefined
  ) => void;
  onClose: () => void;
}

// Lists for Dropdowns
const EYES: EyeType[] = [
  "dot",
  "happy",
  "closed",
  "wink",
  "wide",
  "cross",
  "hearts",
  "star",
  "teary",
  "neutral_line",
  "angry",
  "relaxed",
];
const MOUTHS: MouthType[] = [
  "neutral",
  "smile",
  "bigSmile",
  "open",
  "sad",
  "cat",
  "zigzag",
  "triangle",
  "frown",
  "smirk",
  "kiss",
  "none",
];
const ACCESSORIES: AccessoryType[] = [
  "none",
  "blush",
  "tear",
  "sweat",
  "shock",
  "sparkle",
  "halo",
  "question",
  "steam",
  "utensils",
];

const DebugPanel: React.FC<DebugPanelProps> = ({
  currentCategory,
  currentEmotion,
  isThinking,
  forceSmile,
  isInputFocused,
  onCategoryChange,
  onEmotionChange,
  onThinkingChange,
  onSmileChange,
  onFocusChange,
  onOverrideChange,
  onClose,
}) => {
  const [selectedEye, setSelectedEye] = useState<EyeType | "default">(
    "default"
  );
  const [selectedMouth, setSelectedMouth] = useState<MouthType | "default">(
    "default"
  );
  const [selectedAcc, setSelectedAcc] = useState<AccessoryType | "default">(
    "default"
  );

  const handleOverride = (
    e: EyeType | "default",
    m: MouthType | "default",
    a: AccessoryType | "default"
  ) => {
    setSelectedEye(e);
    setSelectedMouth(m);
    setSelectedAcc(a);
    if (onOverrideChange) {
      onOverrideChange(
        e === "default" ? undefined : e,
        m === "default" ? undefined : m,
        a === "default" ? undefined : a
      );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-2xl p-5 w-80 max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto text-xs font-mono pointer-events-auto transition-all animate-in slide-in-from-right-10">
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-stone-100">
        <h3 className="font-bold text-stone-800 text-sm">Aurora Debugger</h3>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-800 transition-colors p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* State Toggles */}
      <div className="space-y-3 mb-6">
        <h4 className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
          States
        </h4>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-stone-600 group-hover:text-stone-900">
            Is Thinking (Loading)
          </span>
          <input
            type="checkbox"
            className="accent-stone-800"
            checked={isThinking}
            onChange={(e) => onThinkingChange(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-stone-600 group-hover:text-stone-900">
            Force Smile (Sentiment)
          </span>
          <input
            type="checkbox"
            className="accent-stone-800"
            checked={forceSmile}
            onChange={(e) => onSmileChange(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-stone-600 group-hover:text-stone-900">
            Input Focused
          </span>
          <input
            type="checkbox"
            className="accent-stone-800"
            checked={isInputFocused}
            onChange={(e) => onFocusChange(e.target.checked)}
          />
        </label>
      </div>

      {/* Custom Face Builder (Overrides) */}
      <div className="mb-6 p-3 bg-stone-50 rounded-lg border border-stone-100">
        <h4 className="font-bold text-stone-500 uppercase tracking-wider text-[10px] mb-3">
          Custom Face Builder
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-stone-500">Eyes</label>
            <select
              className="bg-white border border-stone-200 rounded px-2 py-1 w-24 md:w-32"
              value={selectedEye}
              onChange={(e) =>
                handleOverride(
                  e.target.value as any,
                  selectedMouth,
                  selectedAcc
                )
              }
            >
              <option value="default">Default</option>
              {EYES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-stone-500">Mouth</label>
            <select
              className="bg-white border border-stone-200 rounded px-2 py-1 w-24 md:w-32"
              value={selectedMouth}
              onChange={(e) =>
                handleOverride(selectedEye, e.target.value as any, selectedAcc)
              }
            >
              <option value="default">Default</option>
              {MOUTHS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-stone-500">Accessory</label>
            <select
              className="bg-white border border-stone-200 rounded px-2 py-1 w-24 md:w-32"
              value={selectedAcc}
              onChange={(e) =>
                handleOverride(
                  selectedEye,
                  selectedMouth,
                  e.target.value as any
                )
              }
            >
              <option value="default">Default</option>
              {ACCESSORIES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Emotions */}
      <div className="mb-6">
        <h4 className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-3">
          Emotion Preset
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {EMOTIONS.map((e) => (
            <button
              key={e}
              onClick={() => onEmotionChange(e)}
              className={`px-3 py-2 rounded-lg border text-left transition-all ${
                currentEmotion === e
                  ? "bg-stone-800 text-white border-stone-800 shadow-md transform scale-105"
                  : "bg-white text-stone-600 border-stone-100 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-3">
          Theme Category
        </h4>
        <div className="space-y-2">
          {(Object.keys(CATEGORY_THEMES) as Category[]).map((c) => {
            const theme = CATEGORY_THEMES[c];
            return (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                  currentCategory === c
                    ? "bg-stone-50 border-stone-400 ring-1 ring-stone-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-stone-50"
                }`}
              >
                <span className="capitalize text-stone-700">{c}</span>
                <div className="flex gap-1">
                  <span
                    className="w-3 h-3 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.primary }}
                    title="Primary"
                  ></span>
                  <span
                    className="w-3 h-3 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.secondary }}
                    title="Secondary"
                  ></span>
                  <span
                    className="w-3 h-3 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.tertiary }}
                    title="Tertiary"
                  ></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
