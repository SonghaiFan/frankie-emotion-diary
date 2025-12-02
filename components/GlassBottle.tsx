import React from "react";

// --- Bottle Geometry (Relative to 200, 200) ---

// 1. The Outer Shell (Exterior surface)
export const BOTTLE_OUTER_PATH = `
  M -65 -145
  Q -65 -135 -75 -125
  Q -140 -80 -140 20
  L -140 90
  Q -140 155 0 155
  Q 140 155 140 90
  L 140 20
  Q 140 -80 75 -125
  Q 65 -135 65 -145
  L 65 -160
  L -65 -160
  Z
`;

// 2. The Inner Cavity (Interior surface where Aurora lives)
// Inset by ~15px to create the "Thick Wall" look
export const BOTTLE_INNER_PATH = `
  M -48 -145
  Q -48 -130 -58 -120
  Q -122 -75 -122 20
  L -122 88
  Q -122 140 0 140
  Q 122 140 122 88
  L 122 20
  Q 122 -75 58 -120
  Q 48 -130 48 -145
  L 48 -160
  L -48 -160
  Z
`;

export const BottleBack: React.FC = () => (
  <g transform="translate(200, 200)">
    {/* --- Glass Solid Mass (The "Wall") --- */}
    <path
      d={BOTTLE_OUTER_PATH}
      fill="rgba(255, 255, 255, 0.15)"
      stroke="none"
    />
    
    {/* Inner cavity wall definition */}
    <path
        d={BOTTLE_INNER_PATH}
        fill="rgba(0, 0, 0, 0.05)" 
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.5"
    />

    {/* Bottom Weight (The "Punt") */}
    <path 
        d="M -110 100 Q 0 135 110 100 Q 110 135 0 135 Q -110 135 -110 100"
        fill="rgba(255, 255, 255, 0.2)"
        stroke="none"
    />

    {/* --- Thicker Outer Boundary --- */}
    <path
      d={BOTTLE_OUTER_PATH}
      fill="none"
      stroke="rgba(255, 255, 255, 0.9)"
      strokeWidth="6"
    />
    
    {/* Subtle inner stroke for glass thickness illusion */}
    <path
      d={BOTTLE_OUTER_PATH}
      fill="none"
      stroke="rgba(255, 255, 255, 0.3)"
      strokeWidth="1"
      transform="scale(0.97)"
    />
  </g>
);

export const BottleFront: React.FC = () => (
  <g transform="translate(200, 200)" pointerEvents="none">
    <defs>
      <linearGradient id="glassRefraction" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="white" stopOpacity="0.1" />
        <stop offset="25%" stopColor="white" stopOpacity="0.4" />
        <stop offset="50%" stopColor="white" stopOpacity="0" />
        <stop offset="75%" stopColor="white" stopOpacity="0.3" />
        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* --- Glass Refraction Sheen --- */}
    <path
      d={BOTTLE_OUTER_PATH}
      fill="url(#glassRefraction)"
      opacity="0.5"
    />

    {/* Left Shoulder Highlight - Sharp & Bright */}
    <path
      d="M -130 10 Q -130 -60 -70 -115"
      fill="none"
      stroke="white"
      strokeWidth="4.5"
      strokeOpacity="0.9"
      strokeLinecap="round"
    />

    {/* Right Shoulder Highlight - Soft */}
    <path
      d="M 130 10 Q 130 -60 70 -115"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeOpacity="0.5"
      strokeLinecap="round"
    />
    
    {/* Left Body Glint - Vertical Long */}
    <path
      d="M -132 40 Q -132 100 -100 135"
      fill="none"
      stroke="white"
      strokeWidth="3.5"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />

    {/* Right Body Glint */}
    <path
      d="M 132 30 Q 132 50 130 60"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeOpacity="0.5"
      strokeLinecap="round"
    />
    
    {/* Rim/Neck Ring Highlight */}
    <path
      d="M -65 -145 Q 0 -135 65 -145"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeOpacity="0.8"
    />

    {/* Bottom Curve Reflection - Thicker */}
    <path
      d="M -80 148 Q 0 160 80 148"
      fill="none"
      stroke="white"
      strokeWidth="4"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
  </g>
);
