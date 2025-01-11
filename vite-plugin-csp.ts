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
        
        res.setHeader(
          'Content-Security-Policy',
          generateCSPHeader(nonce, isDev)
        );

        // Set other security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

        next();
      });
    },
    transformIndexHtml(html) {
      const nonce = generateNonce();
      nonces.add(nonce);

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

      // Add CSP meta tag with collected hashes
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${generateCSPHeader(nonce, isDev, {
        inlineScripts: Array.from(inlineScripts),
        inlineStyles: Array.from(inlineStyles),
      })}">`;
      
      return html.replace('</head>', `${cspMeta}\n</head>`);
    },
  };
}

interface CSPHashesOptions {
  inlineScripts?: string[];
  inlineStyles?: string[];
}

function generateCSPHeader(nonce: string, isDev: boolean, hashes: CSPHashesOptions = {}): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'strict-dynamic'",
      `'nonce-${nonce}'`,
      ...(hashes.inlineScripts || []),
      // Development-specific sources
      ...(isDev ? [
        "'unsafe-eval'",
        "'unsafe-inline'",
        'http://localhost:*',
        'ws://localhost:*'
      ] : []),
    ],
    'script-src-elem': [
      "'self'",
      "'strict-dynamic'",
      `'nonce-${nonce}'`,
      ...(hashes.inlineScripts || []),
      'https://*.moonpay.com',
      ...(isDev ? ["'unsafe-inline'", 'http://localhost:*'] : []),
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      `'nonce-${nonce}'`,
      ...(hashes.inlineStyles || []),
      'https://fonts.googleapis.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://*.infura.io',
      'https://*.alchemyapi.io',
      'https://api.etherscan.io',
      'wss://*.infura.io',
      'wss://*.alchemyapi.io',
      'https://*.walletconnect.org',
      'https://api.coingecko.com',
      'https://eth-sepolia.g.alchemy.com',
      'https://mainnet.infura.io',
      'https://*.moonpay.com',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-src': [
      "'self'",
      'https://*.moonpay.com',
      'https://*.walletconnect.org',
      ...(isDev ? ['http://localhost:*'] : []),
    ],
    'worker-src': [
      "'self'",
      'blob:',
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'sandbox': [
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
      'allow-popups-to-escape-sandbox',
      'allow-presentation',
      'allow-downloads',
    ],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      if (key === 'sandbox') return `${key} ${values.join(' ')}`;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}
