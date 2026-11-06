const buckets = new Map();
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function string(value, max = 6000) { if (typeof value !== 'string' || value.length > max) throw new HttpError(400, 'Invalid request.'); return value; }
export function history(value) {
  if (!Array.isArray(value) || value.length > 100) throw new HttpError(400, 'Invalid history.');
  return value.map(h => { if (!h || !['kept','discarded'].includes(h.action)) throw new HttpError(400, 'Invalid interaction.');
    return { term: string(h.term, 200), action: h.action, visualElements: (Array.isArray(h.visualElements) ? h.visualElements.slice(0,20) : []).map(v => string(v,100)) }; });
}
export async function respond(req, res, action) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); throw new HttpError(405,'Use POST.'); }
    if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415,'Use application/json.');
    if (req.headers.origin) {
      let host; try { host = new URL(req.headers.origin).host; } catch { throw new HttpError(403,'Invalid origin.'); }
      if (host !== req.headers.host) throw new HttpError(403,'Cross-origin requests are not allowed.');
    }
    let body = req.body;
    if (body === undefined) { const chunks=[]; let size=0; for await (const chunk of req) { size+=Buffer.byteLength(chunk); if(size>64000) throw new HttpError(413,'Request too large.'); chunks.push(Buffer.from(chunk)); } body=Buffer.concat(chunks).toString(); }
    if (typeof body === 'string') { if(Buffer.byteLength(body)>64000) throw new HttpError(413,'Request too large.'); try { body=JSON.parse(body); } catch { throw new HttpError(400,'Invalid JSON.'); } }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body))>64000) throw new HttpError(400,'Invalid request.');
    // Best-effort per-instance guard, not a distributed quota. Edge limits can be added in Vercel Firewall.
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
    const now=Date.now(); for(const [k,v] of buckets) if(v.until<now) buckets.delete(k);
    const b=buckets.get(ip)||{count:0,until:now+600000};
    if (++b.count>15 || (!buckets.has(ip)&&buckets.size>=5000)) { res.setHeader('Retry-After','600'); throw new HttpError(429,'Please wait before trying again.'); }
    buckets.set(ip,b);
    const result=await action(body);
    res.status(200).json(result);
  } catch(e) { res.status(e instanceof HttpError ? e.status : 502).json({error:e instanceof HttpError ? e.message : 'AI service is temporarily unavailable. Please try again.'}); }
}
export async function generate({instructions,input,schema,name,maxTokens=1600,temperature=0.9}) {
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw new HttpError(503,'AI service is not configured.');
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(100000),
    body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,instructions,input,temperature,max_output_tokens:maxTokens,
      ...(schema ? {text:{format:{type:'json_schema',name,strict:true,schema}}} : {})})
  });
  if(!response.ok) throw new HttpError(response.status===429 ? 429 : 502,'AI service is temporarily unavailable. Please try again.');
  const data=await response.json();
  if(data.status!=='completed') throw new HttpError(502,'AI response was incomplete. Please try again.');
  const text=(data.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
  if(!text) throw new HttpError(502,'AI returned no usable response. Please try again.');
  if(!schema) return text;
  let value; try {value=JSON.parse(text);} catch {throw new HttpError(502,'AI returned invalid output.');}
  if(!value || schema.required.some(k=>typeof value[k]!=='string'||!value[k].trim())) throw new HttpError(502,'AI returned invalid output.');
  return value;
}
export const objectSchema = keys => ({type:'object',properties:Object.fromEntries(keys.map(k=>[k,{type:'string'}])),required:keys,additionalProperties:false});
