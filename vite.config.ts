import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8082,
      strictPort: true,
      hmr: {
        port: 8082,
        clientPort: 8082,
      },
      // Handle SPA routing
      history: {
        disableDotRule: true,
        rewrites: [
          { from: /\//, to: '/index.html' }
        ]
      },
      fs: {
        strict: false,
      },
    },
    preview: {
      host: "::",
      port: 8082,
      strictPort: true,
    },
    base: '/',
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    build: {
      chunkSizeWarningLimit: 700,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
            vendor: ['@supabase/supabase-js']
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: 'automatic',
      },
    },
    plugins: [
      react(),
      {
        name: "auth-middleware",
        configureServer(server) {
          const sessions = new Map();
          function parseCookies(cookieHeader) {
            const out = {};
            if (!cookieHeader) return out;
            cookieHeader.split(";").forEach((pair) => {
              const idx = pair.indexOf("=");
              const k = pair.slice(0, idx).trim();
              const v = pair.slice(idx + 1).trim();
              if (k) out[k] = v;
            });
            return out;
          }
          server.middlewares.use(async (req, res, next) => {
            if (req.url === "/api/auth/validate-token" && req.method === "POST") {
              let body = "";
              req.on("data", (chunk) => (body += chunk));
              req.on("end", () => {
                try {
                  const data = JSON.parse(body || "{}");
                  const token = String(data.token || "");
                  const user = data.user || {};
                  if (!token || !user.id || !user.firstName) {
                    res.statusCode = 400;
                    res.end("Bad Request");
                    return;
                  }
                  const sessionId = Math.random().toString(36).slice(2);
                  sessions.set(sessionId, { 
                    id: String(user.id), 
                    firstName: String(user.firstName) 
                  });
                  res.setHeader(
                    "Set-Cookie",
                    `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
                  );
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true }));
                } catch {
                  res.statusCode = 400;
                  res.end("Bad Request");
                }
              });
              return;
            }
            if (req.url === "/api/session/me" && req.method === "GET") {
              const cookies = parseCookies(req.headers.cookie || "");
              const sid = cookies["session"];
              const user = sid ? sessions.get(sid) : null;
              if (!user) {
                res.statusCode = 401;
                res.end("Unauthorized");
                return;
              }
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(user));
              return;
            }
            if (req.url === "/api/logout" && req.method === "POST") {
              const cookies = parseCookies(req.headers.cookie || "");
              const sid = cookies["session"];
              if (sid) sessions.delete(sid);
              res.setHeader("Set-Cookie", `session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
              res.end("OK");
              return;
            }
            next();
          });
        },
      },
    ].filter(Boolean),
    // Handle 404s by redirecting to index.html for client-side routing
    appType: 'spa',
    // This ensures that all routes are handled by index.html
    // and the SPA handles the routing
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define environment variables
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || '')
    }
  };
});
