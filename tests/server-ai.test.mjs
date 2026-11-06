import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';
const realFetch = globalThis.fetch;
let ip=0;
async function call(body,headers={},method='POST') {
 const req={method,body,headers:{host:'test.local','content-type':'application/json','x-forwarded-for':String(++ip),...headers}};
 const res={code:0,setHeader(){},status(c){this.code=c;return this;},json(body){this.body=body;}};
 await handler(req,res);return res;
}
const body={text:'hello',history:[{role:'model',text:'earlier'}],todos:[]};
const success={text:'[CALM][PRESENT]Hello.<TODO>Drink water</TODO>'};
const output = value => new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:typeof value==='string'?value:JSON.stringify(value)}]}]}));
test.beforeEach(()=>{process.env.OPENAI_API_KEY='test-only-server-secret';});
test.afterEach(()=>{globalThis.fetch=realFetch;delete process.env.OPENAI_API_KEY;});
test('secret stays upstream; model is server controlled and storage is disabled',async()=>{
 let sent;globalThis.fetch=async(url,init)=>{sent={url,...init};return output(success.text);};
 const r=await call({...body,model:'untrusted-browser-model'});assert.equal(r.code,200);
 assert.equal(sent.url,'https://api.openai.com/v1/responses');assert.equal(sent.headers.Authorization,'Bearer test-only-server-secret');
 const request=JSON.parse(sent.body);assert.equal(request.store,false);assert.notEqual(request.model,'untrusted-browser-model');assert.ok(request.instructions);
 assert.ok(!JSON.stringify(r.body).includes('test-only-server-secret'));
});
test('reject invalid JSON, methods, cross-origin requests and invalid payloads before paid calls',async()=>{
 globalThis.fetch=()=>{throw Error('must not call upstream');};
 assert.equal((await call('{bad')).code,400);assert.equal((await call({}, {},'GET')).code,405);
 assert.equal((await call(body,{origin:'https://other.example'})).code,403);assert.equal((await call({})).code,400);
});
test('provider failures and incomplete output return sanitized errors',async()=>{
 globalThis.fetch=async()=>new Response('test-only-server-secret provider-debug',{status:401});
 const r=await call(body);assert.equal(r.code,502);assert.ok(!JSON.stringify(r.body).includes('test-only-server-secret'));
 globalThis.fetch=async()=>new Response(JSON.stringify({status:'incomplete',output:[]}));assert.equal((await call(body)).code,502);
 delete process.env.OPENAI_API_KEY;assert.equal((await call(body)).code,503);
});
test('bounded request size is enforced',async()=>{assert.equal((await call(JSON.stringify({value:'x'.repeat(65000)}))).code,413);});
