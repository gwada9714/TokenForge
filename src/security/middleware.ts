import { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { generateNonce } from './nonce';

export const securityMiddleware = (): Plugin => {
  const nonce = generateNonce();
  
  return {
    name: 'security-headers',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((_req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader(
          'Content-Security-Policy',
          `script-src 'nonce-${nonce}' 'self' 'unsafe-eval' chrome-extension: https://*.walletconnect.org https://*.googleapis.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.tokenforge.com wss://*.walletconnect.org; img-src 'self' data: https://*.tokenforge.com; font-src 'self' https://fonts.gstatic.com;`
        );
        next();
      });
    }
  };
};
