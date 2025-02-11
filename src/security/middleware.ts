import { Plugin } from 'vite';
import crypto from 'crypto';

export function securityMiddleware(): Plugin {
  return {
    name: 'security-middleware',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const nonce = crypto.randomBytes(16).toString('base64');
          const isDev = process.env.NODE_ENV === 'development';
          
          // Construction des directives CSP avec le nonce
          const connectSrc = [
            "'self'",
            isDev && "ws://localhost:*",
            isDev && "http://localhost:*",
            "https://*.infura.io",
            "wss://*.infura.io",
            "https://*.alchemyapi.io",
            "wss://*.alchemyapi.io",
            "https://*.walletconnect.org",
            "wss://*.walletconnect.org",
            "https://explorer.walletconnect.com"
          ].filter(Boolean).join(' ');

          // En développement, nous devons autoriser eval pour le HMR de Vite
          const scriptSrc = [
            "'self'",
            `'nonce-${nonce}'`,
            isDev && "'unsafe-eval'",
            isDev && "'unsafe-inline'",
            "https://*.walletconnect.org"
          ].filter(Boolean).join(' ');

          const csp = [
            "default-src 'self'",
            `script-src ${scriptSrc}`,
            "style-src 'self' 'unsafe-inline'",
            `connect-src ${connectSrc}`,
            "img-src 'self' data: https:",
            "media-src 'self'",
            "frame-src 'self' https://*.walletconnect.org",
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            isDev ? "" : "upgrade-insecure-requests"
          ].filter(Boolean).join('; ');

          // Définir les en-têtes de sécurité
          res.setHeader('Content-Security-Policy', csp);
          res.setHeader('X-Content-Security-Policy', csp);
          
          // Stocker le nonce pour l'utiliser dans la transformation HTML
          (req as any).nonce = nonce;
          next();
        });
      };
    },
    transformIndexHtml(html, ctx) {
      const nonce = (ctx.server as any)?.middlewares?.stack[0]?.handle?.nonce;
      if (!nonce) return html;

      // Ajouter le nonce à toutes les balises script
      return html.replace(
        /<script\b([^>]*)>/g,
        (match, attrs) => `<script${attrs} nonce="${nonce}">`
      );
    }
  };
}
