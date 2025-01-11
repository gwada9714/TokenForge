import type { Plugin } from 'vite';
import { createHash } from 'crypto';

interface CSPPluginOptions {
  development?: boolean;
}

export function cspPlugin(options: CSPPluginOptions = {}): Plugin {
  const isDev = options.development ?? process.env.NODE_ENV === 'development';
  const nonces = new Set<string>();

  function generateNonce(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('base64');
  }

  function generateHash(content: string): string {
    return "'sha256-" + createHash('sha256').update(content).digest('base64') + "'";
  }

  return {
    name: 'vite-plugin-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = generateNonce();
        nonces.add(nonce);

        // En développement, on utilise une CSP plus permissive
        const cspHeader = isDev ? {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'unsafe-eval'",
            "'unsafe-inline'",
            "http://localhost:*",
            "ws://localhost:*",
            "https://*.moonpay.com",
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          'font-src': [
            "'self'",
            "https://fonts.gstatic.com",
            "data:",
          ],
          'img-src': [
            "'self'",
            "data:",
            "https:",
            "blob:",
          ],
          'connect-src': [
            "'self'",
            "ws://localhost:*",
            "http://localhost:*",
            "https://*.infura.io",
            "https://*.alchemyapi.io",
            "https://api.etherscan.io",
            "wss://*.infura.io",
            "wss://*.alchemyapi.io",
            "https://*.walletconnect.org",
            "https://api.coingecko.com",
            "https://eth-sepolia.g.alchemy.com",
            "https://mainnet.infura.io",
            "https://*.moonpay.com",
            "chrome-extension://*",
          ],
          'frame-src': [
            "'self'",
            "http://localhost:*",
            "https://*.moonpay.com",
            "https://*.walletconnect.org",
          ],
          'worker-src': [
            "'self'",
            "blob:",
            "'unsafe-eval'",
          ],
        } : {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'strict-dynamic'",
            `'nonce-${nonce}'`,
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          'font-src': [
            "'self'",
            "https://fonts.gstatic.com",
            "data:",
          ],
          'img-src': [
            "'self'",
            "data:",
            "https:",
            "blob:",
          ],
          'connect-src': [
            "'self'",
            "https://*.infura.io",
            "https://*.alchemyapi.io",
            "https://api.etherscan.io",
            "wss://*.infura.io",
            "wss://*.alchemyapi.io",
            "https://*.walletconnect.org",
            "https://api.coingecko.com",
            "https://eth-sepolia.g.alchemy.com",
            "https://mainnet.infura.io",
            "https://*.moonpay.com",
          ],
          'frame-src': [
            "'self'",
            "https://*.moonpay.com",
            "https://*.walletconnect.org",
          ],
          'worker-src': ["'self'", "blob:"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'self'"],
          'object-src': ["'none'"],
          'upgrade-insecure-requests': [],
        };

        const cspString = Object.entries(cspHeader)
          .map(([key, values]) => {
            if (values.length === 0) return key;
            return `${key} ${values.join(' ')}`;
          })
          .join('; ');

        res.setHeader('Content-Security-Policy', cspString);

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
      const nonce = generateNonce();
      nonces.add(nonce);

      if (isDev) {
        return html;  // Skip CSP meta tag in development
      }

      // Collect all inline scripts and styles
      const inlineScripts = new Set<string>();
      const inlineStyles = new Set<string>();

      // Extract and hash inline scripts
      html = html.replace(
        /<script[^>]*>([\s\S]*?)<\/script>/gi,
        (match, content) => {
          if (content.trim()) {
            inlineScripts.add(generateHash(content.trim()));
          }
          return match.replace('<script', `<script nonce="${nonce}"`);
        }
      );

      // Extract and hash inline styles
      html = html.replace(
        /<style[^>]*>([\s\S]*?)<\/style>/gi,
        (match, content) => {
          if (content.trim()) {
            inlineStyles.add(generateHash(content.trim()));
          }
          return match.replace('<style', `<style nonce="${nonce}"`);
        }
      );

      return html;
    },
  };
}
