import type { Plugin } from 'vite';
import { randomBytes } from 'crypto';

export function cspPlugin(): Plugin {
  return {
    name: 'vite-plugin-csp',
    transformIndexHtml(html) {
      const nonce = randomBytes(16).toString('base64');
      return html.replace('${nonce}', nonce);
    },
  };
}
