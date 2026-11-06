import type { TodoItem, Message } from '../types';
export interface ChatContent { role: string; parts: { text?: string }[]; }
let initialHistory: {role: string; text: string}[] = [];
export function initializeChat(history: ChatContent[] = []) {
  initialHistory = history.filter(m => m.role === 'user' || m.role === 'model').map(m => ({role:m.role,text:m.parts.map(p=>p.text||'').join('')}));
}
export async function sendMessage(text: string, todos: TodoItem[] = [], emotion?: string, category?: string, history: Message[] = []): Promise<string> {
  const messages = history.filter(m=>m.type!=='diary'&&m.id!=='init'&&!m.id.startsWith('reaction-')).map(m=>({role:m.role,text:m.text}));
  const res = await fetch('/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(115000),
    body:JSON.stringify({text,todos:todos.slice(-100).map(t=>({text:t.text,completed:t.completed})),emotion,category,history:(messages.length?messages:initialHistory).slice(-20)})});
  const data = await res.json(); if(!res.ok) throw new Error(data.error || 'AI connection failed.');
  if(typeof data.text!=='string') throw new Error('Invalid AI response.'); return data.text;
}
