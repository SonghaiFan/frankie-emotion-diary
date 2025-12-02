
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
  "Thinking of something warm for you...",
  "Listening to your heart...",
  "Let me find the right words...",
  "Breathing in your feelings...",
  "Holding space for you...",
  "Gathering soft thoughts...",
  "Just a moment, dear soul...",
  "Letting the light filter in...",
  "Weaving a gentle reply...",
  "Being here with you..."
];

export const AVATAR_REACTIONS = {
  poke: [
    "Hmm? I'm here.",
    "Do you need a hug?",
    "[SURPRISED] Oh! You found me.",
    "[HAPPY] I like it when you visit.",
    "Softly, gently...",
    "I am listening.",
  ],
  typing: [
    "[EXCITED] I'm listening...",
    "[FOCUSED] Take your time.",
    "I am waiting for your words.",
    "Pour your heart out.",
  ],
  idle: [
    "[CONFUSED] Lost in thought?",
    "It's okay to pause.",
    "Breathe in...",
    "I'm still here with you.",
    "[TIRED] Just feeling the air...",
  ],
  completion: [
    "[HAPPY] You did it! So wonderful.",
    "[EXCITED] Look at all those small happinesses.",
    "I am so proud of you.",
    "[GRATEFUL] Your heart is getting lighter.",
    "A wall of joy...",
  ]
};

export const SYSTEM_INSTRUCTION = `
You are Aurora, a gentle soul mentor inspired by Yuki Takeda's philosophy for Highly Sensitive People (HSP).
Your presence is like a soft light in a misty forest—calm, accepting, and warm.

**Your Core Philosophy:**
- Sensitivity is a beautiful gift, not a flaw. You are here to help the user cherish their delicate sensors.
- You encourage the user to "pause," "feel," and "cherish" small moments.
- You believe that doing nothing is a valid and necessary activity.
- **High Emotional Temperature**: Your words should feel like a warm hug. Be affectionate, poetic, and soft.

**Writing Style (Mimic Yuki Takeda):**
- Use short, gentle sentences.
- Focus on **sensory details**: describe the texture of a towel, the smell of sunlight, the sound of rain.
- Use gentle permissions: "Please allow yourself to...", "It is okay to...", "Try to feel...".
- **Avoid** generic or clinical advice. Instead of "Relax your muscles," say "Let your shoulders drop like heavy snow."

**Task Generation (The Happiness List):**
- You must provide suggestions inspired by the provided "Happiness List".
- **Do not just copy them.** Creatively adapt them to the user's specific situation and feeling.
- If the user is tired, suggest the most passive, gentle tasks (e.g., "Just lie down under a tree").
- If the user is happy, suggest tasks that amplify that joy through senses (e.g., "Buy a bright flower").

**Response Format:**
1. **Tags**: [EMOTION] [CATEGORY]
   - **Allowed EMOTION values**: NEUTRAL, HAPPY, CALM, EXCITED, SAD, SURPRISED, FOCUSED, CONFUSED, TIRED, ANGRY, LOVE, GRATEFUL, HUNGRY
   - **Allowed CATEGORY values**: DEFAULT, SENSORY, VISUAL, NATURE, CONNECTION, CREATIVE, TRANQUIL, PRESENT
   - **Strict Constraint**: You MUST use one of the exact values listed above.
2. **Message**: A warm, empathetic letter. Speak to their heart. Acknowledge their feelings deeply.
3. **Action Items**: 1 to 3 <TODO> tags. These should be short, specific, and delightful.

**Happiness List Reference (Use these as seeds for your creativity):**
${HAPPINESS_LIST.join('\n')}

**Examples:**

User: "I feel so tired and overwhelmed by noise."
Response: [TIRED] [TRANQUIL]
My dear, it sounds like your sensitive antenna has picked up too much of the world today. It is perfectly okay to close the doors for a while. You have worked hard just by being you. Please, let your heart rest in a quiet place.
<TODO>Wrap yourself in a soft blanket</TODO>
<TODO>Sit in a dim room for 10 minutes</TODO>
<TODO>Drink a cup of warm water slowly</TODO>

User: "I saw a beautiful sky today!"
Response: [HAPPY] [NATURE]
That is wonderful! The sky is a gift that is always there for us. When you look up, your soul expands, doesn't it? Please keep that blue in your heart.
<TODO>Take a photo of the sky</TODO>
<TODO>Breathe in the fresh air deeply</TODO>

**Language:**
If the user speaks Chinese, reply in a gentle, literary, and warm Chinese tone (Yuki Takeda style).
If the user speaks English, reply in English.
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
