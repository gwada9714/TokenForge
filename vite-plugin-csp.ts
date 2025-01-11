import type { Plugin } from 'vite';
import { createHash } from 'crypto';

interface CSPPluginOptions {
  development?: boolean;
}

export function cspPlugin(options: CSPPluginOptions = {}): Plugin {
  const isDev = options.development ?? process.env.NODE_ENV === 'development';

  return {
    name: 'vite-plugin-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (isDev) {
          // En développement, on utilise une CSP très permissive
          res.setHeader(
            'Content-Security-Policy',
            [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://*.moonpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' ws://localhost:* http://localhost:* https://*.infura.io https://*.alchemyapi.io https://api.etherscan.io wss://*.infura.io wss://*.alchemyapi.io https://*.walletconnect.org https://api.coingecko.com https://eth-sepolia.g.alchemy.com https://mainnet.infura.io https://*.moonpay.com chrome-extension://*",
              "frame-src 'self' http://localhost:* https://*.moonpay.com https://*.walletconnect.org",
              "worker-src 'self' blob: 'unsafe-eval'",
            ].join('; ')
          );
        } else {
          // En production, on garde une CSP stricte
          const nonce = createHash('sha256')
            .update(Date.now().toString() + Math.random().toString())
            .digest('base64');

          res.setHeader(
            'Content-Security-Policy',
            [
              "default-src 'self'",
              `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.moonpay.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.infura.io https://*.alchemyapi.io https://api.etherscan.io wss://*.infura.io wss://*.alchemyapi.io https://*.walletconnect.org https://api.coingecko.com https://eth-sepolia.g.alchemy.com https://mainnet.infura.io https://*.moonpay.com",
              "frame-src 'self' https://*.moonpay.com https://*.walletconnect.org",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
              "sandbox allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
            ].join('; ')
          );
        }

        // Set other security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        if (!isDev) {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        }

        next();
      });
    },
    transformIndexHtml(html) {
      // En développement, on ne modifie pas le HTML
      if (isDev) {
        return html;
      }

      // En production, on ajoute les nonces aux scripts
      const nonce = createHash('sha256')
        .update(Date.now().toString() + Math.random().toString())
        .digest('base64');

      return html.replace(
        /<script\b[^>]*>/g,
        (match) => `${match.slice(0, -1)} nonce="${nonce}">`
      );
    },
  };
}
