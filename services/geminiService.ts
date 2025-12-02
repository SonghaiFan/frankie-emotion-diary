
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { TodoItem, Message } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends a message to Gemini with the specific context provided.
 * This is stateless: it creates a new chat session for every turn to ensure
 * strict adherence to the provided history context.
 */
export const sendMessage = async (
  text: string, 
  contextTodos: TodoItem[] = [],
  historyMessages: Message[] = []
): Promise<string> => {
  
  const ai = getClient();

  // Convert app Messages to Gemini Content objects
  const history: Content[] = historyMessages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
    history: history
  });

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
