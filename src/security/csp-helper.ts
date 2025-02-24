import crypto from 'crypto';

interface CSPConfig {
  nonce: string;
  directives: string[];
}

export function generateNonce(): string {
  return crypto
    .randomBytes(16)
    .toString('base64');
}

export function getCSP(): CSPConfig {
  const nonce = generateNonce();
  
  const directives = [
    // Directive de base
    "default-src 'self'",
    
    // Scripts avec nonce et WalletConnect
    `script-src 'self' 'nonce-${nonce}' https://*.walletconnect.com`,
    
    // Styles (permettre inline pour l'UI)
    "style-src 'self' 'unsafe-inline'",
    
    // Connexions (API, WebSocket, etc.)
    `connect-src 'self' 
     https://*.infura.io 
     https://*.alchemyapi.io 
     wss://*.walletconnect.org 
     https://*.walletconnect.org 
     https://*.walletconnect.com
     https://explorer-api.walletconnect.com
     https://pulse.walletconnect.org`,
    
    // Images et médias
    "img-src 'self' data: https:",
    "media-src 'self'",
    
    // Fonts
    "font-src 'self'",
    
    // Autres restrictions de sécurité
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    
    // Mises à niveau de sécurité
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ];

  return {
    nonce,
    directives: directives.map(d => d.replace(/\s+/g, ' ').trim())
  };
}

export function parseCSPHeader(header: string): Record<string, string[]> {
  const directives: Record<string, string[]> = {};
  
  header.split(';').forEach(directive => {
    const [key, ...values] = directive.trim().split(/\s+/);
    if (key) {
      directives[key] = values;
    }
  });
  
  return directives;
}
