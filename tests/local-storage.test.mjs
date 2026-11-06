import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSnapshot,saveSnapshot,STORAGE_KEY} from '../services/localStorage.ts';
class MemoryStore {
 data=new Map();getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,v);}
}
const message={id:'a',role:'user',text:'A local diary',timestamp:123,type:'diary',emotion:'calm',category:'present'};
const todo={id:'n',text:'Drink water',completed:false,x:30,y:40,timestamp:123};
test('migrates legacy browser data without deleting old keys or consulting an account',()=>{
 const store=new MemoryStore();store.setItem('aurora_messages',JSON.stringify([message]));store.setItem('aurora_todos',JSON.stringify([todo]));store.setItem('aurora_category','present');store.setItem('aurora_visited','true');store.setItem('aurora_user_profile','not valid JSON and must never be read');
 const state=loadSnapshot(store);assert.deepEqual(state.messages,[message]);assert.deepEqual(state.todos,[todo]);assert.equal(state.visited,true);saveSnapshot(state,store);
 assert.equal(store.getItem('aurora_messages'),JSON.stringify([message]));assert.equal(store.getItem('aurora_user_profile'),'not valid JSON and must never be read');
 assert.deepEqual(loadSnapshot(store),state);
});
test('persisted diary edits and deletions survive a reload and do not reappear from legacy keys',()=>{
 const store=new MemoryStore();store.setItem('aurora_messages',JSON.stringify([message]));let state=loadSnapshot(store);
 state.messages=[{...message,text:'Edited'}];saveSnapshot(state,store);assert.equal(loadSnapshot(store).messages[0].text,'Edited');
 state.messages=[];saveSnapshot(state,store);assert.equal(loadSnapshot(store).messages.length,0);assert.ok(store.getItem('aurora_messages').includes('A local diary'));
});
test('preserves note positions, completion, mood history, language and empty message arrays',()=>{
 const store=new MemoryStore();const state=loadSnapshot(store);state.todos=[{...todo,completed:true}];state.emotionLogs=[{id:'m',emotion:'calm',category:'present',timestamp:456,note:'Feeling calm'}];state.language='en';saveSnapshot(state,store);
 assert.deepEqual(loadSnapshot(store),state);
});
test('corrupt or unsupported data is left unchanged rather than silently reset',()=>{
 const store=new MemoryStore();store.setItem(STORAGE_KEY,'{bad');assert.throws(()=>loadSnapshot(store));assert.equal(store.getItem(STORAGE_KEY),'{bad');
 store.setItem(STORAGE_KEY,JSON.stringify({version:2}));assert.throws(()=>loadSnapshot(store));assert.equal(JSON.parse(store.getItem(STORAGE_KEY)).version,2);
});
test('storage failures propagate, allowing an honest persistence warning and in-memory export',()=>{
 const state=loadSnapshot(new MemoryStore());assert.throws(()=>saveSnapshot(state,{setItem(){throw Error('quota');},getItem(){return null;}}),/quota/);
 assert.doesNotThrow(()=>JSON.stringify(state));
});
test('private diary entries are excluded from AI chat context',async()=>{
 const {initializeChat,sendMessage}=await import('../services/openaiService.ts');
 const original=globalThis.fetch;let request;
 try {
  initializeChat();globalThis.fetch=async(url,init)=>{assert.equal(url,'/api/chat');request=JSON.parse(init.body);return new Response(JSON.stringify({text:'Hello'}));};
  await sendMessage('A chat message',[],undefined,undefined,[message,{id:'chat',role:'user',text:'A previous chat',timestamp:123,type:'chat'}]);
  assert.equal(request.history.length,1);assert.equal(request.history[0].text,'A previous chat');assert.ok(!JSON.stringify(request).includes('A local diary'));
 } finally {globalThis.fetch=original;}
});
