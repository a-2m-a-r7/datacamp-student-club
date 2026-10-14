import http from 'node:http';
import fs from 'node:fs';
import { createServer } from 'vite';
import adminUsers from '../api/admin/users';
import backup from '../api/admin/backup';
import syncSheet from '../api/forms/sync-sheet';
import submitForm from '../api/forms/submit';
import chat from '../api/ai/chat';
import compileTypeScript from '../api/compiler/typescript';
import profileAvatar from '../api/profile/avatar';

if (fs.existsSync('.env')) process.loadEnvFile('.env');
const handlers: Record<string, (req: any, res: any) => Promise<any>> = {
  '/api/profile/avatar': profileAvatar, '/api/admin/users': adminUsers, '/api/admin/backup': backup,
  '/api/forms/sync-sheet': syncSheet, '/api/forms/submit': submitForm,
  '/api/ai/chat': chat, '/api/compiler/typescript': compileTypeScript,
};
const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  if (!pathname.startsWith('/api/')) return vite.middlewares(req, res);
  const handler = handlers[pathname];
  res.setHeader('Content-Type', 'application/json');
  const response = res as any;
  response.status = (code: number) => { res.statusCode = code; return response; };
  response.json = (value: unknown) => res.end(JSON.stringify(value));
  if (!handler) return response.status(404).json({ error: 'API not found.' });
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 1_000_000) return response.status(413).json({ error: 'Request too large.' });
    }
    (req as any).body = body ? JSON.parse(body) : {};
    await handler(req, response);
  } catch {
    if (!res.writableEnded) response.status(500).json({ error: 'Server operation failed.' });
  }
});
server.on('error', error => { console.error('Unable to start local server:', error.message); process.exitCode = 1; });
server.listen(3000, '127.0.0.1', () => console.log('DataCamp: http://127.0.0.1:3000 (frontend and server APIs)'));
