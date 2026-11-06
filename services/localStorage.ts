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

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

// Imported files need stricter validation than the existing legacy-data reader.
// Only documented fields are restored; file-supplied extra properties are ignored.
export function validateBackup(value: unknown): LocalSnapshot {
 const invalid = () => { throw new Error('Invalid Aurora backup.'); };
 const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
 const text = (v: unknown): v is string => typeof v === 'string';
 const date = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 8640000000000000;
 const optional = (v: unknown, check: (v: any) => boolean) => v === undefined || check(v);
 const pick = (v: Record<string, any>, keys: string[]) => Object.fromEntries(keys.filter(k => v[k] !== undefined).map(k => [k, v[k]]));
 if (!object(value)) return invalid();
 if (value.version !== 1) throw new Error('Unsupported Aurora backup version.');
 if (!Array.isArray(value.messages) || !Array.isArray(value.todos) || !Array.isArray(value.emotionLogs)
   || !CATEGORIES.includes(value.category) || !EMOTIONS.includes(value.emotion)
   || !['en', 'cn'].includes(value.language) || typeof value.visited !== 'boolean') return invalid();
 const uniqueIds = (items: unknown[]) => {
   const ids = new Set<string>();
   for (const item of items) {
     if (!object(item) || !text(item.id) || !item.id.trim() || ids.has(item.id)) return invalid();
     ids.add(item.id);
   }
 };
 for (const items of [value.messages, value.todos, value.emotionLogs]) uniqueIds(items);
 for (const m of value.messages) {
   if (!['user', 'model'].includes(m.role) || !text(m.text) || !date(m.timestamp)
     || !optional(m.type, v => ['chat', 'diary'].includes(v))
     || !optional(m.emotion, v => EMOTIONS.includes(v)) || !optional(m.category, v => CATEGORIES.includes(v))
     || !optional(m.suggestions, v => Array.isArray(v) && v.every(text))) return invalid();
 }
 for (const t of value.todos) {
   if (!text(t.text) || typeof t.completed !== 'boolean' || !date(t.timestamp)
     || ![t.x, t.y].every(v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 10000000)
     || !optional(t.rotation, v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 3600)
     || !optional(t.color, v => text(v) && v.length <= 100)) return invalid();
 }
 for (const log of value.emotionLogs) {
   if (!date(log.timestamp) || !EMOTIONS.includes(log.emotion) || !CATEGORIES.includes(log.category)
     || !optional(log.note, text)) return invalid();
 }
 return {
   version: 1,
   messages: value.messages.map(m => pick(m, ['id', 'role', 'text', 'timestamp', 'suggestions', 'category', 'emotion', 'type'])) as Message[],
   todos: value.todos.map(t => pick(t, ['id', 'text', 'completed', 'timestamp', 'x', 'y', 'rotation', 'color'])) as TodoItem[],
   emotionLogs: value.emotionLogs.map(l => pick(l, ['id', 'emotion', 'category', 'timestamp', 'note'])) as EmotionLog[],
   category: value.category, emotion: value.emotion, language: value.language, visited: value.visited,
 };
}

export function parseBackup(text: string): LocalSnapshot {
 if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 10 MB.');
 let value: unknown;
 try { value = JSON.parse(text.replace(/^\uFEFF/, '')); }
 catch { throw new Error('The file is not valid JSON.'); }
 return validateBackup(value);
}

export function restoreBackup(snapshot: LocalSnapshot, store: Store = localStorage): LocalSnapshot {
 const validated = validateBackup(snapshot);
 // The only write happens after complete validation. A failed setItem leaves
 // the existing browser snapshot intact; callers must not update UI state first.
 saveSnapshot(validated, store);
 return validated;
}
