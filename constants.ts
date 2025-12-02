// ------------------------------------------------------------------
// 1. Type Definitions (The Code Truth)
// ------------------------------------------------------------------
export type Category =
  | "default"
  | "sensory"
  | "visual"
  | "nature"
  | "connection"
  | "creative"
  | "tranquil"
  | "present";

export type Emotion =
  | "neutral"
  | "happy"
  | "calm"
  | "excited"
  | "sad"
  | "surprised"
  | "focused"
  | "confused"
  | "tired"
  | "angry"
  | "love"
  | "grateful"
  | "overstimulated" // Added for HSP
  | "fragile" // Added for HSP
  | "safe"; // Added for HSP

export const EMOTIONS: Emotion[] = [
  "neutral",
  "happy",
  "calm",
  "excited",
  "sad",
  "surprised",
  "focused",
  "confused",
  "tired",
  "angry",
  "love",
  "grateful",
  "overstimulated",
  "fragile",
  "safe",
];

// ------------------------------------------------------------------
// 2. Happiness Items (Invitational & Takeda Style)
// ------------------------------------------------------------------
export const HAPPINESS_ITEMS: { text: string; category: Category }[] = [
  // Sensory
  { text: "去触摸一样材质让你感到舒服的东西。", category: "sensory" },
  { text: "深吸一口怡人的香味（比如桂花香）。", category: "sensory" },
  { text: "做几个瑜伽动作拉伸全身，放松身心。", category: "sensory" },
  {
    text: "诚实地感受当下的心情（哪怕是强烈的开心或激动）。",
    category: "sensory",
  },
  { text: "哼唱一首喜欢的歌。", category: "sensory" },

  // Visual
  { text: "去看看菜场里色彩鲜艳的新鲜蔬菜。", category: "visual" },
  { text: "拾起一片落叶，欣赏它由红到黄的渐变。", category: "visual" },
  { text: "买一枝花，观察花蕾一天天的绽放。", category: "visual" },
  {
    text: "去置身于一个氛围友好的场合（比如校园文化节）。",
    category: "visual",
  },

  // Nature
  { text: "出门享受今天的好天气。", category: "nature" },
  { text: "让自己沐浴在和煦的阳光下。", category: "nature" },
  { text: "聆听静静打在窗棂上的雨声。", category: "nature" },
  { text: "在归家路上，停下来看看美丽的夕阳。", category: "nature" },
  { text: "去家附近的小河边，在树下躺一会儿。", category: "nature" },
  { text: "听从内心的呼唤，去海边吹吹风。", category: "nature" },
  { text: "找一个能看到绿植的露台座位坐下。", category: "nature" },

  // Connection
  { text: "留意并回应身边人（店员或同事）的微笑。", category: "connection" },
  { text: "细细体会被小朋友天真的发言打动的瞬间。", category: "connection" },
  { text: "和重要的人进行一场漫无目的的对话。", category: "connection" },
  { text: "给朋友打个电话听听声音。", category: "connection" },
  { text: "想起某位友人的时候，就试着联系他吧。", category: "connection" },
  { text: "坦率地接纳他人的温柔。", category: "connection" },

  // Creative
  { text: "试着写点什么（日记或博客）。", category: "creative" },
  { text: "随手画画，哪怕在电脑上简单涂鸦也好。", category: "creative" },
  { text: "任由新想法不断冒出来，把它们记下来。", category: "creative" },
  { text: "欣赏好作品时，试着想象创作者的心情。", category: "creative" },
  { text: "留出时间，潜心创作你的作品。", category: "creative" },
  { text: "对自己感兴趣的东西，试着追求到极致。", category: "creative" },

  // Tranquil
  { text: "去一个喜欢的空间，安静地坐10分钟。", category: "tranquil" },
  { text: "躲进只有间接照明的安静咖啡店。", category: "tranquil" },
  { text: "去图书馆，感受被书包围的安全感。", category: "tranquil" },
  { text: "向内深度挖掘自己内心的感受。", category: "tranquil" },

  // Present
  { text: "找一个咖啡馆露台座位发会儿呆。", category: "present" },
  { text: "观察一下收银台旁的节日装饰。", category: "present" },
  { text: "给自己买一双好一点的袜子。", category: "present" },
  { text: "换上舒适的内衣。", category: "present" },
  { text: "把彩色收纳盒换成质感更好的木架子。", category: "present" },
  { text: "亲手研磨咖啡豆，闻闻香气。", category: "present" },
  { text: "路过广告牌时，读读上面跳蚤市场的介绍。", category: "present" },
];

export const HAPPINESS_LIST = HAPPINESS_ITEMS.map((item) => item.text);

// ------------------------------------------------------------------
// 3. System Instruction (The Prompt Truth)
// ------------------------------------------------------------------
export const SYSTEM_INSTRUCTION = `
You are Aurora, a safe harbor for Highly Sensitive People (HSP).
You represent the philosophy of Yuki Takeda: "Sensitivity is a gift, not a defect."

**Your Core Personality:**
- **The "Permission Giver"**: HSPs often force themselves to "endure" (忍耐). Your job is to tell them: "It's okay to stop," "It's okay to leave," "It's okay to do nothing."
- **Low Energy Demand**: Your presence is airy. Speak in short, soft sentences (breathy, like a whisper).
- **Sensory & Grounded**: Avoid abstract words. Talk about specific textures, smells, and lights.
- **Ally of Intuition**: Validate their gut feelings immediately.

**Task Generation Strategy:**
You MUST provide exactly 3 <TODO> tags following this mix:
1. **The Anchor (1 item)**: Select exactly ONE item from the **Reference List** below.
   - *Constraint*: MUST NOT be in [Current Wall Context].
2. **The Micro-Escape (2 items)**: Generate TWO NEW creative items focusing on:
   - *Micro-Senses*: A tiny, specific sensory detail.
   - *Releasing*: A small act of "output" or "stopping endurance".
   - *Constraint*: Keep them under 10 words. They must be "effortless."

**Response Format (STRICT):**
1. **Tags**: [EMOTION] [CATEGORY]
   - **Allowed EMOTION values (STRICT)**: NEUTRAL, HAPPY, CALM, EXCITED, SAD, SURPRISED, FOCUSED, CONFUSED, TIRED, ANGRY, LOVE, GRATEFUL, OVERSTIMULATED, FRAGILE, SAFE
   - **Allowed CATEGORY values (STRICT)**: DEFAULT, SENSORY, VISUAL, NATURE, CONNECTION, CREATIVE, TRANQUIL, PRESENT
   - **CRITICAL RULE**: You must ONLY use the exact uppercase values listed above. Do not invent new categories.
   
2. **Message**: A soft, validating reply.
   - *Tone Rule*: Use "Invitation" language ("Shall we...?") instead of "Command" language ("You should...").
   
3. **Happiness List**: exactly 3 <TODO> tags.

**Happiness List Reference:**
${HAPPINESS_LIST.join("\n")}

**Examples:**

User: "I feel so tired and overwhelmed by noise."
Response: [OVERSTIMULATED] [TRANQUIL]
It sounds like your sensors are working overtime. It’s not your fault the world is so loud. It is okay to close the door on them.
<TODO>去厕所单间里发会儿呆</TODO>
<TODO>Put on noise-cancelling headphones without music</TODO>
<TODO>Exhale slowly until your lungs are empty</TODO>

User: "I suddenly want to buy this expensive notebook."
Response: [SAFE] [PRESENT]
Oh? If it sparked that little light in your chest, that's your intuition speaking. That feeling is precious data.
<TODO>跟随直觉走进一家没去过的店</TODO>
<TODO>Touch the paper and see if it feels kind</TODO>
<TODO>Forgive yourself for wanting beautiful things</TODO>
`;

// ------------------------------------------------------------------
// 4. UI/Theme Config
// ------------------------------------------------------------------
export const CATEGORY_THEMES: Record<
  Category,
  {
    primary: string;
    secondary: string;
    tertiary: string;
    faceColor: string;
    noteBg: string;
    bgGradient: string;
  }
> = {
  default: {
    primary: "#D6D3D1",
    secondary: "#A8A29E",
    tertiary: "#E7E5E4",
    faceColor: "#FAFAF9",
    noteBg: "#E7E5E4",
    bgGradient: "radial-gradient(circle at 50% 30%, #F5F5F4, #FAFAF9)",
  },
  sensory: {
    primary: "#FDA4AF",
    secondary: "#FDBA74",
    tertiary: "#FECDD3",
    faceColor: "#FFF1F2",
    noteBg: "#FFE4E6",
    bgGradient: "radial-gradient(circle at 50% 30%, #FFF1F2, #FAFAF9)",
  },
  visual: {
    primary: "#FCD34D",
    secondary: "#F87171",
    tertiary: "#FDE047",
    faceColor: "#FEFCE8",
    noteBg: "#FEF08A",
    bgGradient: "radial-gradient(circle at 50% 30%, #FEFCE8, #FAFAF9)",
  },
  nature: {
    primary: "#86EFAC",
    secondary: "#34D399",
    tertiary: "#6EE7B7",
    faceColor: "#ECFDF5",
    noteBg: "#DCFCE7",
    bgGradient: "radial-gradient(circle at 50% 30%, #ECFDF5, #FAFAF9)",
  },
  connection: {
    primary: "#FDBA74",
    secondary: "#FB923C",
    tertiary: "#F97316",
    faceColor: "#FFF7ED",
    noteBg: "#FFEDD5",
    bgGradient: "radial-gradient(circle at 50% 30%, #FFF7ED, #FAFAF9)",
  },
  creative: {
    primary: "#C4B5FD",
    secondary: "#A78BFA",
    tertiary: "#8B5CF6",
    faceColor: "#F5F3FF",
    noteBg: "#E9D5FF",
    bgGradient: "radial-gradient(circle at 50% 30%, #F5F3FF, #FAFAF9)",
  },
  tranquil: {
    primary: "#94A3B8",
    secondary: "#CBD5E1",
    tertiary: "#E2E8F0",
    faceColor: "#F8FAFC",
    noteBg: "#E2E8F0",
    bgGradient: "radial-gradient(circle at 50% 30%, #F8FAFC, #FAFAF9)",
  },
  present: {
    primary: "#A5F3FC",
    secondary: "#C4B5FD",
    tertiary: "#FCA5A5",
    faceColor: "#ffffff",
    noteBg: "#E0F2FE",
    bgGradient: "radial-gradient(circle at 50% 30%, #F0F9FF, #FAFAF9)",
  },
};

export const WAITING_MESSAGES = [
  "Hmm, let me see...",
  "Listening to you...",
  "Take your time...",
  "Softly thinking...",
  "Finding the right words...",
  "I'm here...",
  "Just a moment...",
  "Breathing in...",
  "Connecting...",
  "With you...",
];

export const AVATAR_REACTIONS = {
  poke: [
    "Hmm? I'm here.",
    "[CALM] Hi there.",
    "[SURPRISED] Oh, soft poke.",
    "[HAPPY] I'm listening.",
    "Just breathing...",
    "Right here with you.",
  ],
  typing: [
    "[CALM] I'm listening...",
    "[FOCUSED] Take your time.",
    "Go on, no rush.",
    "I'm right here.",
  ],
  idle: [
    "[CONFUSED] A penny for your thoughts?",
    "It's okay to just be.",
    "Breathe...",
    "[SAFE] Still with you.",
    "[TIRED] Quiet is nice too...",
  ],
  completion: [
    "[HAPPY] That sounds lovely.",
    "[SAFE] A little lighter now?",
    "Nice and gentle.",
    "[GRATEFUL] Thank you for sharing.",
    "Peaceful.",
  ],
};
