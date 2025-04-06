// vite.config.ts
import {
  defineConfig,
  loadEnv,
} from "file:///C:/Users/Win10/tokenforge-app/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Win10/tokenforge-app/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { VitePWA } from "file:///C:/Users/Win10/tokenforge-app/node_modules/vite-plugin-pwa/dist/index.js";
import dts from "file:///C:/Users/Win10/tokenforge-app/node_modules/vite-plugin-dts/dist/index.mjs";

// src/security/nonce.ts
import crypto from "crypto";
var generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
};

// src/security/middleware.ts
function securityMiddleware() {
  return {
    name: "security-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = generateNonce();
        res.setHeader(
          "Content-Security-Policy",
          `script-src 'nonce-${nonce}' 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: https://*.walletconnect.org https://*.googleapis.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.tokenforge.com wss://*.walletconnect.org https://*.infura.io https://*.alchemyapi.io; img-src 'self' data: https://*.tokenforge.com; font-src 'self' https://fonts.gstatic.com;`
        );
        next();
      });
    },
  };
}

// vite.config.ts
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url =
  "file:///C:/Users/Win10/tokenforge-app/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var cspConfig = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'wasm-unsafe-eval'",
    "https://*.firebaseio.com",
    "'unsafe-inline'",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:", "blob:"],
  "font-src": ["'self'", "data:", "https:"],
  "connect-src": [
    "'self'",
    "https://*.firebase.app",
    "https://*.firebaseio.com",
    "https://*.cloudfunctions.net",
    "wss://*.firebaseio.com",
    "https://firestore.googleapis.com",
    "ws://localhost:*",
    "https://*.googleapis.com",
  ],
  "frame-src": ["'self'", "https://*.firebaseapp.com"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
};
var cspString = Object.entries(cspConfig)
  .map(([key, values]) => `${key} ${values.join(" ")}`)
  .join("; ");
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  return {
    define: {
      "process.env": Object.entries(env).reduce((prev, [key, val]) => {
        return {
          ...prev,
          [key]: val,
        };
      }, {}),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __FIREBASE_CONFIG__: {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
      },
    },
    css: {
      postcss: "./postcss.config.cjs",
    },
    server: {
      port: PORT,
      strictPort: true,
      host: true,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: PORT,
        clientPort: PORT,
      },
      open: true,
      headers: {
        "Cache-Control": isDev
          ? "no-store"
          : "public, max-age=31536000, immutable",
        "Content-Security-Policy": isDev ? "" : cspString,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      },
      watch: {
        usePolling: true,
      },
    },
    plugins: [
      // Middleware de sécurité désactivé en développement
      !isDev && securityMiddleware(),
      react({
        babel: {
          plugins: [
            ["@emotion/babel-plugin", { sourceMap: true }],
            "@babel/plugin-syntax-import-meta",
          ],
          parserOpts: {
            plugins: ["jsx", "importMeta"],
          },
        },
        jsxRuntime: "classic",
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "TokenForge",
          short_name: "TokenForge",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      dts({
        insertTypesEntry: true,
        exclude: ["**/*.test.ts"],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: isDev,
      outDir: process.env.BUILD_PATH || "dist",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("firebase")) return "firebase";
              if (id.includes("react")) return "react";
              if (id.includes("@emotion")) return "emotion";
              if (id.includes("@mui")) return "mui";
              return "vendor";
            }
          },
        },
      },
      target: ["esnext", "edge89", "firefox79", "chrome87", "safari14"],
      minify: !isDev,
      chunkSizeWarningLimit: 1e3,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
      exclude: ["@firebase/auth", "@firebase/app"],
      esbuildOptions: {
        target: "esnext",
      },
    },
  };
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3NlY3VyaXR5L25vbmNlLnRzIiwgInNyYy9zZWN1cml0eS9taWRkbGV3YXJlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcV2luMTBcXFxcdG9rZW5mb3JnZS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFdpbjEwXFxcXHRva2VuZm9yZ2UtYXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9XaW4xMC90b2tlbmZvcmdlLWFwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcclxuaW1wb3J0IHsgc2VjdXJpdHlNaWRkbGV3YXJlIH0gZnJvbSAnLi9zcmMvc2VjdXJpdHkvbWlkZGxld2FyZSc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xyXG5cclxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xyXG5cclxuY29uc3QgY3NwQ29uZmlnID0ge1xyXG4gICdkZWZhdWx0LXNyYyc6IFtcIidzZWxmJ1wiXSxcclxuICAnc2NyaXB0LXNyYyc6IFtcIidzZWxmJ1wiLCBcIid3YXNtLXVuc2FmZS1ldmFsJ1wiLCBcImh0dHBzOi8vKi5maXJlYmFzZWlvLmNvbVwiLCBcIid1bnNhZmUtaW5saW5lJ1wiXSxcclxuICAnc3R5bGUtc3JjJzogW1wiJ3NlbGYnXCIsIFwiJ3Vuc2FmZS1pbmxpbmUnXCJdLFxyXG4gICdpbWctc3JjJzogW1wiJ3NlbGYnXCIsICdkYXRhOicsICdodHRwczonLCAnYmxvYjonXSxcclxuICAnZm9udC1zcmMnOiBbXCInc2VsZidcIiwgJ2RhdGE6JywgJ2h0dHBzOiddLFxyXG4gICdjb25uZWN0LXNyYyc6IFtcclxuICAgIFwiJ3NlbGYnXCIsXHJcbiAgICAnaHR0cHM6Ly8qLmZpcmViYXNlLmFwcCcsXHJcbiAgICAnaHR0cHM6Ly8qLmZpcmViYXNlaW8uY29tJyxcclxuICAgICdodHRwczovLyouY2xvdWRmdW5jdGlvbnMubmV0JyxcclxuICAgICd3c3M6Ly8qLmZpcmViYXNlaW8uY29tJyxcclxuICAgICdodHRwczovL2ZpcmVzdG9yZS5nb29nbGVhcGlzLmNvbScsXHJcbiAgICAnd3M6Ly9sb2NhbGhvc3Q6KicsXHJcbiAgICAnaHR0cHM6Ly8qLmdvb2dsZWFwaXMuY29tJ1xyXG4gIF0sXHJcbiAgJ2ZyYW1lLXNyYyc6IFtcIidzZWxmJ1wiLCAnaHR0cHM6Ly8qLmZpcmViYXNlYXBwLmNvbSddLFxyXG4gICdtYW5pZmVzdC1zcmMnOiBbXCInc2VsZidcIl0sXHJcbiAgJ3dvcmtlci1zcmMnOiBbXCInc2VsZidcIiwgJ2Jsb2I6J10sXHJcbiAgJ29iamVjdC1zcmMnOiBbXCInbm9uZSdcIl0sXHJcbiAgJ2Jhc2UtdXJpJzogW1wiJ3NlbGYnXCJdLFxyXG4gICdmb3JtLWFjdGlvbic6IFtcIidzZWxmJ1wiXSxcclxuICAnZnJhbWUtYW5jZXN0b3JzJzogW1wiJ25vbmUnXCJdLFxyXG4gICd1cGdyYWRlLWluc2VjdXJlLXJlcXVlc3RzJzogW11cclxufTtcclxuXHJcbmNvbnN0IGNzcFN0cmluZyA9IE9iamVjdC5lbnRyaWVzKGNzcENvbmZpZylcclxuICAubWFwKChba2V5LCB2YWx1ZXNdKSA9PiBgJHtrZXl9ICR7dmFsdWVzLmpvaW4oJyAnKX1gKVxyXG4gIC5qb2luKCc7ICcpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gIGNvbnN0IGlzRGV2ID0gbW9kZSA9PT0gJ2RldmVsb3BtZW50JztcclxuICBjb25zdCBQT1JUID0gcHJvY2Vzcy5lbnYuUE9SVCA/IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQpIDogMzAwMjtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRlZmluZToge1xyXG4gICAgICAncHJvY2Vzcy5lbnYnOiBPYmplY3QuZW50cmllcyhlbnYpLnJlZHVjZSgocHJldiwgW2tleSwgdmFsXSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAuLi5wcmV2LFxyXG4gICAgICAgICAgW2tleV06IHZhbFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt9KSxcclxuICAgICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcclxuICAgICAgX19GSVJFQkFTRV9DT05GSUdfXzoge1xyXG4gICAgICAgIGFwaUtleTogZW52LlZJVEVfRklSRUJBU0VfQVBJX0tFWSxcclxuICAgICAgICBhdXRoRG9tYWluOiBlbnYuVklURV9GSVJFQkFTRV9BVVRIX0RPTUFJTixcclxuICAgICAgICBwcm9qZWN0SWQ6IGVudi5WSVRFX0ZJUkVCQVNFX1BST0pFQ1RfSUQsXHJcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogZW52LlZJVEVfRklSRUJBU0VfU1RPUkFHRV9CVUNLRVQsXHJcbiAgICAgICAgbWVzc2FnaW5nU2VuZGVySWQ6IGVudi5WSVRFX0ZJUkVCQVNFX01FU1NBR0lOR19TRU5ERVJfSUQsXHJcbiAgICAgICAgYXBwSWQ6IGVudi5WSVRFX0ZJUkVCQVNFX0FQUF9JRFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgY3NzOiB7XHJcbiAgICAgIHBvc3Rjc3M6ICcuL3Bvc3Rjc3MuY29uZmlnLmNqcydcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogUE9SVCxcclxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgaG1yOiB7XHJcbiAgICAgICAgcHJvdG9jb2w6ICd3cycsXHJcbiAgICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXHJcbiAgICAgICAgcG9ydDogUE9SVCxcclxuICAgICAgICBjbGllbnRQb3J0OiBQT1JUXHJcbiAgICAgIH0sXHJcbiAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogaXNEZXYgPyBcIm5vLXN0b3JlXCIgOiBcInB1YmxpYywgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlXCIsXHJcbiAgICAgICAgXCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiOiBpc0RldiA/ICcnIDogY3NwU3RyaW5nLFxyXG4gICAgICAgICdYLUNvbnRlbnQtVHlwZS1PcHRpb25zJzogJ25vc25pZmYnLFxyXG4gICAgICAgICdYLUZyYW1lLU9wdGlvbnMnOiAnREVOWScsXHJcbiAgICAgICAgJ1gtWFNTLVByb3RlY3Rpb24nOiAnMTsgbW9kZT1ibG9jaycsXHJcbiAgICAgICAgJ1JlZmVycmVyLVBvbGljeSc6ICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJyxcclxuICAgICAgICAnUGVybWlzc2lvbnMtUG9saWN5JzogJ2NhbWVyYT0oKSwgbWljcm9waG9uZT0oKSwgZ2VvbG9jYXRpb249KCksIGludGVyZXN0LWNvaG9ydD0oKSwgcGF5bWVudD0oKSwgdXNiPSgpLCBibHVldG9vdGg9KCknLFxyXG4gICAgICAgICdTdHJpY3QtVHJhbnNwb3J0LVNlY3VyaXR5JzogJ21heC1hZ2U9MzE1MzYwMDA7IGluY2x1ZGVTdWJEb21haW5zJ1xyXG4gICAgICB9LFxyXG4gICAgICB3YXRjaDoge1xyXG4gICAgICAgIHVzZVBvbGxpbmc6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgLy8gTWlkZGxld2FyZSBkZSBzXHUwMEU5Y3VyaXRcdTAwRTkgZFx1MDBFOXNhY3Rpdlx1MDBFOSBlbiBkXHUwMEU5dmVsb3BwZW1lbnRcclxuICAgICAgIWlzRGV2ICYmIHNlY3VyaXR5TWlkZGxld2FyZSgpLFxyXG4gICAgICByZWFjdCh7XHJcbiAgICAgICAgYmFiZWw6IHtcclxuICAgICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgICAgWydAZW1vdGlvbi9iYWJlbC1wbHVnaW4nLCB7IHNvdXJjZU1hcDogdHJ1ZSB9XSxcclxuICAgICAgICAgICAgJ0BiYWJlbC9wbHVnaW4tc3ludGF4LWltcG9ydC1tZXRhJ1xyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHBhcnNlck9wdHM6IHtcclxuICAgICAgICAgICAgcGx1Z2luczogWydqc3gnLCAnaW1wb3J0TWV0YSddXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBqc3hSdW50aW1lOiAnY2xhc3NpYydcclxuICAgICAgfSksXHJcbiAgICAgIFZpdGVQV0Eoe1xyXG4gICAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAncm9ib3RzLnR4dCcsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLFxyXG4gICAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgICBuYW1lOiAnVG9rZW5Gb3JnZScsXHJcbiAgICAgICAgICBzaG9ydF9uYW1lOiAnVG9rZW5Gb3JnZScsXHJcbiAgICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc3JjOiAnL2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBkdHMoe1xyXG4gICAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXHJcbiAgICAgICAgZXhjbHVkZTogWycqKi8qLnRlc3QudHMnXVxyXG4gICAgICB9KVxyXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgc291cmNlbWFwOiBpc0RldixcclxuICAgICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9QQVRIIHx8ICdkaXN0JyxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICBtYWluOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZpcmViYXNlJykpIHJldHVybiAnZmlyZWJhc2UnO1xyXG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSkgcmV0dXJuICdyZWFjdCc7XHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAZW1vdGlvbicpKSByZXR1cm4gJ2Vtb3Rpb24nO1xyXG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQG11aScpKSByZXR1cm4gJ211aSc7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0YXJnZXQ6IFsnZXNuZXh0JywgJ2VkZ2U4OScsICdmaXJlZm94NzknLCAnY2hyb21lODcnLCAnc2FmYXJpMTQnXSxcclxuICAgICAgbWluaWZ5OiAhaXNEZXYsXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMFxyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnXSxcclxuICAgICAgZXhjbHVkZTogWydAZmlyZWJhc2UvYXV0aCcsICdAZmlyZWJhc2UvYXBwJ10sXHJcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnZXNuZXh0J1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSk7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxXaW4xMFxcXFx0b2tlbmZvcmdlLWFwcFxcXFxzcmNcXFxcc2VjdXJpdHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFdpbjEwXFxcXHRva2VuZm9yZ2UtYXBwXFxcXHNyY1xcXFxzZWN1cml0eVxcXFxub25jZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvV2luMTAvdG9rZW5mb3JnZS1hcHAvc3JjL3NlY3VyaXR5L25vbmNlLnRzXCI7aW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlTm9uY2UgPSAoKSA9PiB7XHJcbiAgcmV0dXJuIGNyeXB0by5yYW5kb21CeXRlcygxNikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTm9uY2Uobm9uY2U6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIC8vIFZcdTAwRTlyaWZpZSBxdWUgbGUgbm9uY2UgZXN0IHVuZSBjaGFcdTAwRUVuZSBiYXNlNjQgdmFsaWRlIGRlIDI0IGNhcmFjdFx1MDBFOHJlc1xyXG4gIGNvbnN0IGJhc2U2NFJlZ2V4ID0gL15bQS1aYS16MC05Ky9dezIyfT09JC87XHJcbiAgcmV0dXJuIGJhc2U2NFJlZ2V4LnRlc3Qobm9uY2UpO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcV2luMTBcXFxcdG9rZW5mb3JnZS1hcHBcXFxcc3JjXFxcXHNlY3VyaXR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxXaW4xMFxcXFx0b2tlbmZvcmdlLWFwcFxcXFxzcmNcXFxcc2VjdXJpdHlcXFxcbWlkZGxld2FyZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvV2luMTAvdG9rZW5mb3JnZS1hcHAvc3JjL3NlY3VyaXR5L21pZGRsZXdhcmUudHNcIjtpbXBvcnQgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHR5cGUgeyBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB0eXBlIHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZU5vbmNlIH0gZnJvbSAnLi9ub25jZSc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2VjdXJpdHlNaWRkbGV3YXJlKCk6IFBsdWdpbiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdzZWN1cml0eS1taWRkbGV3YXJlJyxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UsIG5leHQ6ICgpID0+IHZvaWQpID0+IHtcclxuICAgICAgICBjb25zdCBub25jZSA9IGdlbmVyYXRlTm9uY2UoKTtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKFxyXG4gICAgICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JyxcclxuICAgICAgICAgIGBzY3JpcHQtc3JjICdub25jZS0ke25vbmNlfScgJ3NlbGYnICd1bnNhZmUtZXZhbCcgJ3Vuc2FmZS1pbmxpbmUnIGNocm9tZS1leHRlbnNpb246IGh0dHBzOi8vKi53YWxsZXRjb25uZWN0Lm9yZyBodHRwczovLyouZ29vZ2xlYXBpcy5jb20gaHR0cHM6Ly8qLnNlbnRyeS5pbzsgc3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbTsgY29ubmVjdC1zcmMgJ3NlbGYnIGh0dHBzOi8vKi50b2tlbmZvcmdlLmNvbSB3c3M6Ly8qLndhbGxldGNvbm5lY3Qub3JnIGh0dHBzOi8vKi5pbmZ1cmEuaW8gaHR0cHM6Ly8qLmFsY2hlbXlhcGkuaW87IGltZy1zcmMgJ3NlbGYnIGRhdGE6IGh0dHBzOi8vKi50b2tlbmZvcmdlLmNvbTsgZm9udC1zcmMgJ3NlbGYnIGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb207YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgbmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlSLFNBQVMsY0FBYyxlQUFlO0FBQ3ZULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUzs7O0FDSmdTLE9BQU8sWUFBWTtBQUU1VCxJQUFNLGdCQUFnQixNQUFNO0FBQ2pDLFNBQU8sT0FBTyxZQUFZLEVBQUUsRUFBRSxTQUFTLFFBQVE7QUFDakQ7OztBQ0NPLFNBQVMscUJBQTZCO0FBQzNDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUF1QjtBQUNyQyxhQUFPLFlBQVksSUFBSSxDQUFDLEtBQXNCLEtBQXFCLFNBQXFCO0FBQ3RGLGNBQU0sUUFBUSxjQUFjO0FBQzVCLFlBQUk7QUFBQSxVQUNGO0FBQUEsVUFDQSxxQkFBcUIsS0FBSztBQUFBLFFBQzVCO0FBQ0EsYUFBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7OztBRmJBLFNBQVMscUJBQXFCO0FBTjJJLElBQU0sMkNBQTJDO0FBUTFOLElBQU0sYUFBYSxjQUFjLHdDQUFlO0FBQ2hELElBQU0sWUFBWSxLQUFLLFFBQVEsVUFBVTtBQUV6QyxJQUFNLFlBQVk7QUFBQSxFQUNoQixlQUFlLENBQUMsUUFBUTtBQUFBLEVBQ3hCLGNBQWMsQ0FBQyxVQUFVLHNCQUFzQiw0QkFBNEIsaUJBQWlCO0FBQUEsRUFDNUYsYUFBYSxDQUFDLFVBQVUsaUJBQWlCO0FBQUEsRUFDekMsV0FBVyxDQUFDLFVBQVUsU0FBUyxVQUFVLE9BQU87QUFBQSxFQUNoRCxZQUFZLENBQUMsVUFBVSxT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LE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLGFBQWE7QUFBQSxVQUNiLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELElBQUk7QUFBQSxRQUNGLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxXQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLFFBQVEsUUFBUSxJQUFJLGNBQWM7QUFBQSxNQUNsQyxlQUFlO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTCxNQUFNLEtBQUssUUFBUSxXQUFXLFlBQVk7QUFBQSxRQUM1QztBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sY0FBYyxDQUFDLE9BQU87QUFDcEIsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixrQkFBSSxHQUFHLFNBQVMsVUFBVSxFQUFHLFFBQU87QUFDcEMsa0JBQUksR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBQ2pDLGtCQUFJLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUNwQyxrQkFBSSxHQUFHLFNBQVMsTUFBTSxFQUFHLFFBQU87QUFDaEMscUJBQU87QUFBQSxZQUNUO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRLENBQUMsVUFBVSxVQUFVLGFBQWEsWUFBWSxVQUFVO0FBQUEsTUFDaEUsUUFBUSxDQUFDO0FBQUEsTUFDVCx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFNBQVMsYUFBYSxrQkFBa0IsaUJBQWlCO0FBQUEsTUFDbkUsU0FBUyxDQUFDLGtCQUFrQixlQUFlO0FBQUEsTUFDM0MsZ0JBQWdCO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
