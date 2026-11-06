# Server-side OpenAI / 服务端 OpenAI

AI is available online through the app's same-origin API. Browser visitors do not receive or enter the API key. / AI 在线可用，浏览器只请求同源 API，用户无需填写 key，也不会收到 key。

- Provider: OpenAI Responses API; default model `gpt-4.1-mini`.
- Server environment: `OPENAI_API_KEY`; optional `OPENAI_MODEL`. Set sensitive `OPENAI_API_KEY` in Vercel production settings, then redeploy. Do not use `VITE_` variables for secrets.
- Local development: copy `.env.example` to `.env.local`, set your own key privately, then `npm run dev`. Vite's server middleware delegates to the same handlers as Vercel; no secret is injected into browser JavaScript.
- Aurora: `/api/chat` validates conversation and note context, keeps requests stateless, and preserves emotion/category/TODO markup.
- Generative Art: `/api/art` supports analysis and static/camera/audio code generation with strict JSON-schema output. Camera/microphone permission is only needed for the corresponding artwork, not for calling OpenAI.
- Responses use `store: false`. Conversation/preferences are sent to OpenAI for the explicit operation; app records stay in browser storage, with no Firebase or account synchronization.
- Fixed server-selected models/prompts, bounded request/output sizes, no automatic paid retries, same-origin checks, a 100-second upstream timeout and sanitized errors are included. The 15-request/10-minute IP guard is per function instance and resets with it; it is not a distributed quota. For an enforced account-wide budget or durable edge rate limits, configure OpenAI project budgets and Vercel Firewall separately.
- No request body, key or raw provider error is logged. Offline art examples are clearly labelled when the AI request fails.

```sh
npm run test:ai
npm run build
python3 site/build.py
```

Do not commit `.env.local`, change the model from browser input, or forward arbitrary upstream URLs or API parameters. Existing Gemini environment variables are unused by this integration. / 勿提交环境文件、从浏览器指定模型或代理任意上游地址；原 Gemini 环境变量不再使用。
