import { Plugin } from "vite";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import { generateNonce } from "./nonce";

/**
 * Génère une politique CSP sécurisée adaptée au mode de développement ou de production
 */
function generateCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  // Domaines autorisés
  const ALLOWED_DOMAINS = {
    scripts: [
      "https://*.walletconnect.org",
      "https://*.googleapis.com",
      "https://*.sentry.io",
    ],
    styles: ["https://fonts.googleapis.com"],
    connect: [
      "https://*.tokenforge.com",
      "wss://*.walletconnect.org",
      "https://*.infura.io",
      "https://*.alchemyapi.io",
      "https://*.alchemy.com",
      "https://*.etherscan.io",
    ],
    images: [
      "https://*.tokenforge.com",
      "https://*.walletconnect.org",
      "https://*.infura.io",
    ],
    fonts: ["https://fonts.gstatic.com"],
    frames: ["https://*.walletconnect.org"],
  };

  // Directives de base
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      `'nonce-${nonce}'`,
      "'self'",
      // En développement uniquement, autoriser eval et inline
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      "chrome-extension:",
      ...ALLOWED_DOMAINS.scripts,
    ],
    "style-src": [
      "'self'",
      // Styles inline nécessaires pour Material-UI
      "'unsafe-inline'",
      ...ALLOWED_DOMAINS.styles,
    ],
    "connect-src": ["'self'", ...ALLOWED_DOMAINS.connect],
    "img-src": ["'self'", "data:", ...ALLOWED_DOMAINS.images],
    "font-src": ["'self'", ...ALLOWED_DOMAINS.fonts],
    "frame-src": ["'self'", ...ALLOWED_DOMAINS.frames],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "media-src": ["'self'"],
    "manifest-src": ["'self'"],
  };

  // En production, ajouter des directives de sécurité supplémentaires
  if (!isDev) {
    directives["upgrade-insecure-requests"] = [];
    directives["block-all-mixed-content"] = [];
  }

  // Convertir les directives en chaîne CSP
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Middleware de sécurité pour Vite
 */
export function securityMiddleware(): Plugin {
  return {
    name: "security-middleware",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          // Générer un nonce unique pour chaque requête
          const nonce = generateNonce();

          // Définir les en-têtes de sécurité
          res.setHeader("Content-Security-Policy", generateCSP(nonce));
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("X-Frame-Options", "DENY");
          res.setHeader("X-XSS-Protection", "1; mode=block");
          res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

          // Stocker le nonce dans la requête pour qu'il soit accessible aux plugins
          (req as any).cspNonce = nonce;

          next();
        }
      );
    },
  };
}
