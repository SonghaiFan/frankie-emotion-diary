
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { TodoItem } from '../types';

let chatSession: Chat | null = null;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = (history: Content[] = []) => {
  const ai = getClient();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
    history: history
  });
};

import { Message } from '../types';

export const sendMessage = async (text: string, contextTodos: TodoItem[] = [], overrideEmotion?: string, overrideCategory?: string, history: Message[] = []): Promise<string> => {
  // If session doesn't exist (and wasn't initialized with history), init empty
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
     throw new Error("Failed to initialize chat session.");
  }

  try {
    // Format the wall context
    const activeTasks = contextTodos.filter(t => !t.completed).map(t => `- ${t.text}`).join('\n');
    const completedTasks = contextTodos.filter(t => t.completed).map(t => `- ${t.text}`).join('\n');

    // Format recent history (last 5 messages)
    // Filter out system/init messages if any, and keep only user/model
    const recentHistory = history
        .filter(m => m.id !== 'init' && !m.id.startsWith('reaction-'))
        .slice(-5)
        .map(m => `${m.role === 'user' ? '[User]' : '[Aurora]'}: ${m.text}`)
        .join('\n');

    const contextPrompt = `
[Current Wall Context]
Active Tasks (Sticky Notes):
${activeTasks || '(Empty)'}

Completed Tasks (Done):
${completedTasks || '(None)'}

[Recent Conversation Memory (Last 5 interactions)]
${recentHistory || '(None)'}

[User Message]
${text}

${overrideEmotion ? `[User Selected Emotion: ${overrideEmotion}]` : ''}
${overrideCategory ? `[User Selected Category: ${overrideCategory}]` : ''}
${(overrideEmotion || overrideCategory) ? 'Please respect the user\'s selected emotion and category in your response logic, but you can still infer nuances.' : ''}
`;

    console.log("--- Sending to Gemini ---");
    console.log(contextPrompt);
    console.log("-------------------------");

    const result: GenerateContentResponse = await chatSession.sendMessage({
        message: contextPrompt
    });
    return result.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
