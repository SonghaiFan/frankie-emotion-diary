import type { Message, TodoItem, EmotionLog, Category, Emotion } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants.ts';
export const STORAGE_KEY = 'aurora_local_v1';
export interface LocalSnapshot { version: 1; messages: Message[]; todos: TodoItem[]; emotionLogs: EmotionLog[]; category: Category; emotion: Emotion; language: 'en'|'cn'; visited: boolean; }
interface Store { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export function normalize(value: unknown): LocalSnapshot {
 const s = value as LocalSnapshot;
 if (!s || s.version !== 1 || !Array.isArray(s.messages) || !Array.isArray(s.todos) || !Array.isArray(s.emotionLogs)) throw new Error('Local data could not be read. Existing storage has been left unchanged.');
 if (s.messages.some(m=>!m || typeof m.id!=='string' || !['user','model'].includes(m.role) || typeof m.text!=='string' || !Number.isFinite(m.timestamp)) || s.todos.some(t=>!t || typeof t.id!=='string' || typeof t.text!=='string' || typeof t.completed!=='boolean') || s.emotionLogs.some(l=>!l || typeof l.id!=='string' || !Number.isFinite(l.timestamp) || !EMOTIONS.includes(l.emotion) || !CATEGORIES.includes(l.category))) throw new Error('Local data could not be read. Existing storage has been left unchanged.');
 return {...s, category:CATEGORIES.includes(s.category)?s.category:'default', emotion:EMOTIONS.includes(s.emotion)?s.emotion:'neutral',language:s.language==='en'?'en':'cn',visited:!!s.visited};
}
export function loadSnapshot(store: Store = localStorage): LocalSnapshot {
 const saved=store.getItem(STORAGE_KEY);
 if(saved!==null) return normalize(JSON.parse(saved));
 // Migrate existing browser data once, without deleting or changing legacy keys.
 const read=(key: string,fallback: unknown)=>{const raw=store.getItem(key);return raw===null?fallback:JSON.parse(raw);};
 return normalize({version:1,messages:read('aurora_messages',[]),todos:read('aurora_todos',[]),emotionLogs:read('aurora_emotion_logs',[]),category:store.getItem('aurora_category')||'default',emotion:store.getItem('aurora_emotion')||'neutral',language:store.getItem('aurora_language')||'cn',visited:store.getItem('aurora_visited')==='true'});
}
export function saveSnapshot(snapshot: LocalSnapshot, store: Store = localStorage) {
 // One atomic localStorage write; quota/permission failures must reach the UI.
 store.setItem(STORAGE_KEY, JSON.stringify(normalize(snapshot)));
}
