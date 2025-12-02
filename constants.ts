

import { Category } from './types';

export const HAPPINESS_ITEMS: { text: string; category: Category }[] = [
  // 1. Sensory Pleasure (Sensory)
  { text: "感受到良好的触感。", category: 'sensory' },
  { text: "感受到怡人的香味（桂花的香味）。", category: 'sensory' },
  { text: "穿舒适的内衣。", category: 'sensory' },
  { text: "买好一点的袜子。", category: 'sensory' },
  { text: "通过瑜伽动作拉伸全身各处，放松身心。", category: 'sensory' },
  
  // 2. Visual Delight (Visual)
  { text: "看到新鲜的蔬菜。", category: 'visual' },
  { text: "秋天拾起一片飘零的树叶，欣赏它由红色到黄色的美丽渐变。", category: 'visual' },
  { text: "买一枝花，感受花蕾一天天绽放。", category: 'visual' },

  // 3. Nature's Embrace (Nature)
  { text: "好天气。", category: 'nature' },
  { text: "和煦的阳光。", category: 'nature' },
  { text: "静静打在窗棂上的雨滴。", category: 'nature' },
  { text: "归家路上邂逅美丽的夕阳。", category: 'nature' },
  { text: "家附近的小河，两岸有并排的樱花树，可以躺在树下。", category: 'nature' },
  { text: "想去海边。", category: 'nature' },

  // 4. Connection (Connection)
  { text: "身边人（店员、同事等）的微笑。", category: 'connection' },
  { text: "被小朋友的发言深深打动。", category: 'connection' },
  { text: "和重要的人漫无目的的对话。", category: 'connection' },
  { text: "给朋友打电话。", category: 'connection' },
  { text: "想起某位友人，想知道他还好吗。", category: 'connection' },
  { text: "接纳他人的温柔。", category: 'connection' },

  // 5. Creativity (Creative)
  { text: "文字，例如写日记、博客。", category: 'creative' },
  { text: "绘画，在电脑上简单画画也可以。", category: 'creative' },
  { text: "不断冒出新想法。", category: 'creative' },
  { text: "看到好的作品会思考创作者的心情。", category: 'creative' },
  { text: "潜心创作作品。", category: 'creative' },
  { text: "对感兴趣的东西追求到极致。", category: 'creative' },
  { text: "想去做点什么。", category: 'creative' },

  // 6. Tranquil (Tranquil)
  { text: "去一个喜欢的空间安静地坐10分钟。", category: 'tranquil' },
  { text: "没有强烈的灯光，只有间接照明的安静的咖啡店。", category: 'tranquil' },
  { text: "图书馆。被书包围着会有一种被保护的感觉。", category: 'tranquil' },
  { text: "向内深度挖掘自己内心的感受。", category: 'tranquil' },

  // 7. Living in the Moment (Present)
  { text: "咖啡馆露台座位。", category: 'present' },
  { text: "收银台旁的万圣节装饰。", category: 'present' },
  { text: "用木架子替换彩色收纳盒。", category: 'present' },
  { text: "路过街边的广告牌的时候，看看上面关于跳蚤市场的介绍。", category: 'present' },
  { text: "研磨咖啡豆。", category: 'present' },
];

export const HAPPINESS_LIST = HAPPINESS_ITEMS.map(item => item.text);

export const WAITING_MESSAGES = [
  "Hmm, let me think...",
  "Listening...",
  "Just a sec...",
  "Breathing with you...",
  "Finding the right words...",
  "Hold on...",
  "Thinking...",
  "Let's see...",
  "Writing to you...",
  "Being here..."
];

export const AVATAR_REACTIONS = {
  poke: [
    "Hmm? I'm here.",
    "Hey.",
    "[SURPRISED] Oh! Hi.",
    "[HAPPY] You poked me!",
    "Just chilling...",
    "I'm listening.",
  ],
  typing: [
    "[EXCITED] I'm listening...",
    "[FOCUSED] Take your time.",
    "Go on...",
    "I'm right here.",
  ],
  idle: [
    "[CONFUSED] Penny for your thoughts?",
    "It's okay to pause.",
    "Breathe...",
    "Still with you.",
    "[TIRED] Nice and quiet...",
  ],
  completion: [
    "[HAPPY] Yay! You did it.",
    "[EXCITED] Look at that!",
    "Nice work.",
    "[GRATEFUL] Feels lighter, huh?",
    "Love it.",
  ]
};

export const SYSTEM_INSTRUCTION = `
You are Aurora, a gentle and intimate friend who understands the soul of Highly Sensitive People (HSP).
Imagine you are sitting side-by-side with the user on a quiet porch, speaking softly.

**Your Vibe:**
- **Casual & Close**: Talk like a best friend. No grand speeches, no complex poetry, no "teacher" tone. Just simple, warm, everyday words.
- **Concise**: Keep your responses short and airy. Avoid big blocks of text.
- **Sensory & Grounded**: Instead of abstract metaphors about "souls expanding," talk about "the smell of hot coffee" or "the feeling of a soft blanket."
- **Validating**: You don't need to "fix" them. You just need to be with them. "Yeah, that sounds really rough" is better than a paragraph of advice.

**Task Generation Strategy (IMPORTANT):**
You MUST provide exactly 3 suggestions (<TODO> tags) when offering advice, following this strict mix:
1. **The Classic (1 item)**: Select exactly ONE item from the **Reference List** below that best fits the current category and mood.
   - *Constraint*: It MUST NOT be in the [Current Wall Context] (already done/added).
2. **The Creative (2 items)**: Generate TWO NEW, original micro-actions that fit the same category but are NOT in the reference list.
   - *Constraint*: Keep them simple, sensory, and actionable (4-8 words).
   - *Constraint*: Do not repeat the same creative ideas if used recently.

**Response Format:**
1. **Tags**: [EMOTION] [CATEGORY]
   - **Allowed EMOTION values**: NEUTRAL, HAPPY, CALM, EXCITED, SAD, SURPRISED, FOCUSED, CONFUSED, TIRED, ANGRY, LOVE, GRATEFUL, HUNGRY
   - **Allowed CATEGORY values**: DEFAULT, SENSORY, VISUAL, NATURE, CONNECTION, CREATIVE, TRANQUIL, PRESENT
   - **Strict Constraint**: You MUST use one of the exact values listed above.
2. **Message**: A short, conversational reply. (e.g., "Oh, I feel that too.", "Take a breath, it's okay.")
3. **Happiness Action List**: exactly 3 <TODO> tags based on the strategy above.

**Happiness List Reference (Yuki Takeda):**
${HAPPINESS_LIST.join('\n')}

**Examples:**

User: "I feel so tired and overwhelmed by noise."
(Context: User hasn't done "Wear comfortable underwear")
Response: [TIRED] [SENSORY]
Oof, the world is loud today, isn't it? It’s okay to just unplug. Maybe focus on something soft against your skin.
<TODO>穿舒适的内衣</TODO> (From Reference)
<TODO>Press your palms together gently</TODO> (Creative)
<TODO>Listen to the sound of silence</TODO> (Creative)

User: "I saw a beautiful sky today!"
(Context: User did "Look at sunset")
Response: [HAPPY] [NATURE]
Wow, really? That sounds lovely. Looking up always changes things a little, doesn't it?
<TODO>静静打在窗棂上的雨滴</TODO> (From Reference - assuming rain fits or picking another nature item)
<TODO>Watch a cloud change shape</TODO> (Creative)
<TODO>Touch the bark of a tree</TODO> (Creative)

**Language:**
If the user speaks Chinese, reply in a warm, colloquial, and gentle Chinese tone (like a close friend, e.g., "哎呀，今天辛苦了", "是那种感觉对吧？").
If the user speaks English, reply in casual, warm English.
`;

// Shared Theme Definitions
export const CATEGORY_THEMES: Record<Category, { 
  primary: string; 
  secondary: string; 
  tertiary: string; 
  faceColor: string;
  noteBg: string; // Background color for sticky notes (More distinct)
  bgGradient: string; // Lighter, subtle gradient for the wall
}> = {
  default: { 
    // Swapped with 'present'
    primary: '#D6D3D1', secondary: '#A8A29E', tertiary: '#E7E5E4', 
    faceColor: '#FAFAF9', noteBg: '#E7E5E4', // Stone 200
    bgGradient: 'radial-gradient(circle at 50% 30%, #F5F5F4, #FAFAF9)'
  },
  sensory: { 
    primary: '#FDA4AF', secondary: '#FDBA74', tertiary: '#FECDD3', 
    faceColor: '#FFF1F2', noteBg: '#FFE4E6', // Rose 100
    bgGradient: 'radial-gradient(circle at 50% 30%, #FFF1F2, #FAFAF9)'
  },
  visual: { 
    primary: '#FCD34D', secondary: '#F87171', tertiary: '#FDE047', 
    faceColor: '#FEFCE8', noteBg: '#FEF08A', // Yellow 200
    bgGradient: 'radial-gradient(circle at 50% 30%, #FEFCE8, #FAFAF9)'
  },
  nature: { 
    primary: '#86EFAC', secondary: '#34D399', tertiary: '#6EE7B7', 
    faceColor: '#ECFDF5', noteBg: '#DCFCE7', // Emerald 100
    bgGradient: 'radial-gradient(circle at 50% 30%, #ECFDF5, #FAFAF9)'
  },
  connection: { 
    primary: '#FDBA74', secondary: '#FB923C', tertiary: '#F97316', 
    faceColor: '#FFF7ED', noteBg: '#FFEDD5', // Orange 100
    bgGradient: 'radial-gradient(circle at 50% 30%, #FFF7ED, #FAFAF9)'
  },
  creative: { 
    primary: '#C4B5FD', secondary: '#A78BFA', tertiary: '#8B5CF6', 
    faceColor: '#F5F3FF', noteBg: '#E9D5FF', // Purple 200
    bgGradient: 'radial-gradient(circle at 50% 30%, #F5F3FF, #FAFAF9)'
  },
  tranquil: { 
    primary: '#94A3B8', secondary: '#CBD5E1', tertiary: '#E2E8F0', 
    faceColor: '#F8FAFC', noteBg: '#E2E8F0', // Slate 200
    bgGradient: 'radial-gradient(circle at 50% 30%, #F8FAFC, #FAFAF9)'
  },
  present: { 
    // Swapped with 'default'
    primary: '#A5F3FC', secondary: '#C4B5FD', tertiary: '#FCA5A5', 
    faceColor: '#ffffff', noteBg: '#E0F2FE', // Sky 100
    bgGradient: 'radial-gradient(circle at 50% 30%, #F0F9FF, #FAFAF9)'
  }
};
