
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

export const sendMessage = async (text: string, contextTodos: TodoItem[] = []): Promise<string> => {
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

    const contextPrompt = `
[Current Wall Context]
Active Tasks (Sticky Notes):
${activeTasks || '(Empty)'}

Completed Tasks (Done):
${completedTasks || '(None)'}

[User Message]
${text}
`;

    const result: GenerateContentResponse = await chatSession.sendMessage({
        message: contextPrompt
    });
    return result.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
