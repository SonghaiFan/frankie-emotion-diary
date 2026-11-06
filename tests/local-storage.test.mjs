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

// Import previews must be read-only; replacement is one validated write.
const {parseBackup,restoreBackup,MAX_BACKUP_BYTES}=await import('../services/localStorage.ts');
function backupFixture(){
 return {...loadSnapshot(new MemoryStore()),messages:[{...message,suggestions:['Take a breath']}],todos:[{...todo,rotation:4,color:'#fef3c7'}],emotionLogs:[{id:'m',emotion:'calm',category:'present',timestamp:456,note:'Sample mood'}],language:'en',visited:true,category:'present',emotion:'calm'};
}
test('an exported backup imports and restores every record and preference exactly',()=>{
 const store=new MemoryStore();const original=backupFixture();saveSnapshot(original,store);
 const exported=store.getItem(STORAGE_KEY);const target=new MemoryStore();
 assert.deepEqual(restoreBackup(parseBackup(exported),target),original);
 assert.deepEqual(loadSnapshot(target),original);
});
test('previewing or cancelling does not write; restore replaces instead of merging',()=>{
 const store=new MemoryStore();const current=loadSnapshot(store);current.messages=[{...message,id:'old'}];saveSnapshot(current,store);
 const before=store.getItem(STORAGE_KEY);const candidate=parseBackup(JSON.stringify(backupFixture()));
 assert.equal(store.getItem(STORAGE_KEY),before);
 restoreBackup(candidate,store);assert.deepEqual(loadSnapshot(store).messages.map(m=>m.id),['a']);
});
test('invalid JSON, foreign files, unsupported versions and oversize backups are rejected',()=>{
 for(const text of ['{bad','null','[]','{"version":2}',JSON.stringify({hello:'world'}),' '.repeat(MAX_BACKUP_BYTES+1)])assert.throws(()=>parseBackup(text));
 assert.deepEqual(parseBackup('\uFEFF'+JSON.stringify(backupFixture())),backupFixture());
});
test('reject nested corruptions, invalid dates and duplicate IDs without changing existing data',()=>{
 const store=new MemoryStore();saveSnapshot(backupFixture(),store);const before=store.getItem(STORAGE_KEY);
 const edits=[s=>s.messages[0].suggestions='bad',s=>s.messages[0].emotion='not-a-mood',s=>s.messages[0].timestamp=9e15,s=>s.messages.push({...s.messages[0]}),s=>s.todos[0].x='10',s=>s.todos[0].rotation=Infinity,s=>s.todos[0].color={},s=>s.emotionLogs[0].category='unknown',s=>s.language='fr',s=>s.visited='true'];
 for(const edit of edits){const candidate=backupFixture();edit(candidate);assert.throws(()=>restoreBackup(candidate,store));assert.equal(store.getItem(STORAGE_KEY),before);}
});
test('quota failures preserve the old snapshot; an empty backup intentionally replaces records',()=>{
 const store=new MemoryStore();saveSnapshot(backupFixture(),store);const before=store.getItem(STORAGE_KEY);
 assert.throws(()=>restoreBackup(backupFixture(),{getItem:k=>store.getItem(k),setItem(){throw Error('quota');}}),/quota/);
 assert.equal(store.getItem(STORAGE_KEY),before);
 store.setItem('aurora_messages',JSON.stringify([message]));restoreBackup(loadSnapshot(new MemoryStore()),store);
 assert.equal(loadSnapshot(store).messages.length,0);
});
test('unknown properties are not imported or re-exported',()=>{
 const data=backupFixture();data.unexpectedSecret='do not import';data.messages[0].unexpected='not part of the backup contract';
 const result=parseBackup(JSON.stringify(data));assert.ok(!('unexpectedSecret' in result));assert.ok(!('unexpected' in result.messages[0]));
});
