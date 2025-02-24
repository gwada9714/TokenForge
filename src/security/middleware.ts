import { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { generateNonce } from './nonce';

export function securityMiddleware(): Plugin {
  return {
    name: 'security-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const nonce = generateNonce();
        res.setHeader(
          'Content-Security-Policy',
          `script-src 'nonce-${nonce}' 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: https://*.walletconnect.org https://*.googleapis.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.tokenforge.com wss://*.walletconnect.org https://*.infura.io https://*.alchemyapi.io; img-src 'self' data: https://*.tokenforge.com; font-src 'self' https://fonts.gstatic.com;`
        );
        next();
      });
    },
  };
}
