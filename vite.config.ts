import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { aiApi } from './server/vite-api';
import handler from './api/chat.js';
export default defineConfig({
  server: { port: 3000, host: '127.0.0.1' },
  plugins: [react(), aiApi({ '/api/chat': handler })],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
});
