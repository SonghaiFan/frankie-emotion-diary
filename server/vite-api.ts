import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
export function aiApi(routes: Record<string, (req: any, res: any) => Promise<void>>): Plugin {
  return { name: 'server-only-ai', configureServer(server) {
    const env = loadEnv(server.config.mode, process.cwd(), 'OPENAI_');
    for (const key of ['OPENAI_API_KEY', 'OPENAI_MODEL']) if (env[key]) process.env[key] = env[key];
    server.middlewares.use((req, res, next) => {
      const handler = routes[(req.url || '').split('?')[0]]; if (!handler) return next();
      const response = res as any; response.status = (code: number) => { res.statusCode = code; return response; };
      response.json = (body: unknown) => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(body)); };
      void handler(req, response);
    });
  }};
}
