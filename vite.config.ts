import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // QA receives only explicit dummy/local values from its launcher. Loading the
  // project dotenv files here would reintroduce production provider settings.
  const env = mode === 'qa' ? {} : loadEnv(mode, '.', '');
  // Expose only server-side configuration to local API handlers, never to client define().
  for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SPREADSHEET_OWNER_EMAIL']) {
    if (process.env[key] === undefined && env[key]) process.env[key] = env[key];
  }
  return {
    envDir: mode === 'qa' ? false : undefined,
    plugins: [react(), tailwindcss(), {
      name: 'local-api',
      configureServer(server) {
        const handlers: Record<string, string> = {
          '/api/admin/users': '/api/admin/users.ts', '/api/admin/backup': '/api/admin/backup.ts',
          '/api/ai/chat': '/api/ai/chat.ts', '/api/forms/sync-sheet': '/api/forms/sync-sheet.ts',
          '/api/forms/submit': '/api/forms/submit.ts',
          '/api/compiler/typescript': '/api/compiler/typescript.ts',
        };
        server.middlewares.use(async (req: any, res: any, next) => {
          const pathname = req.url?.split('?')[0];
          if (!pathname?.startsWith('/api/')) return next();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.status = (code: number) => { res.statusCode = code; return res; };
          res.json = (value: unknown) => res.end(JSON.stringify(value));
          if (!handlers[pathname]) return res.status(404).json({ error: 'API route not found.' });
          let body = '';
          try {
            for await (const chunk of req) {
              body += chunk;
              if (Buffer.byteLength(body) > 1_000_000) return res.status(413).json({ error: 'Request too large.' });
            }
            req.body = body ? JSON.parse(body) : {};
          } catch { return res.status(400).json({ error: 'Invalid JSON.' }); }
          try {
            const module = await server.ssrLoadModule(handlers[pathname]);
            await module.default(req, res);
          } catch { if (!res.writableEnded) res.status(500).json({ error: 'Server operation failed.' }); }
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        ...(mode === 'qa' ? { preserveEntrySignatures: 'strict' as const, input: { app: path.resolve('index.html'), qa: path.resolve('qa-audit/test-entry.ts') } } : {}),
        output: {
          entryFileNames: (chunk) => chunk.name === 'qa' ? 'qa-entry.js' : 'assets/[name]-[hash].js',
          manualChunks(id) {
            // Shared helpers belong outside feature chunks: public pages also use
            // them and must not download PDF or chart packages to obtain them.
            if (id.includes('commonjsHelpers') || id.includes('vite/preload-helper')) return 'vendor-runtime';
            if (id.includes('/node_modules/clsx/') || id.includes('/node_modules/tailwind-merge/')) return 'vendor-ui';
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('xlsx')) return 'vendor-spreadsheets';
              if (id.includes('jspdf')) return 'vendor-pdf';
              if (id.includes('html2canvas')) return 'vendor-canvas';
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
