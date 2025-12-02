
export type Category = 
  | 'default'
  | 'sensory'
  | 'visual'
  | 'nature'
  | 'connection'
  | 'creative'
  | 'tranquil'
  | 'present';

export type Emotion = 
  | 'neutral'
  | 'happy'
  | 'calm'
  | 'excited'
  | 'sad'
  | 'surprised'
  | 'focused'
  | 'confused'
  | 'tired'
  | 'angry'
  | 'love'
  | 'grateful'
  | 'hungry';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp: number;
  // Visual properties for the Memo Wall
  x: number;
  y: number;
  rotation: number;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestions?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentCategory: Category;
  currentEmotion: Emotion;
  savedTodos: TodoItem[];
}
