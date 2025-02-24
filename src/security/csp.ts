import { generateNonce } from './nonce';
import { keyManager } from './vault/key-manager';
import { cspCollector } from './monitoring/csp-collector';

export interface CSPConfig {
  nonce: string;
  directives: string[];
}

export async function getCSPDirectives(): Promise<CSPConfig> {
  const nonce = generateNonce();
  const key = await keyManager.getCurrentKey();
  
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${process.env.DEV ? "'unsafe-eval'" : ''} https://*.walletconnect.org https://*.walletconnect.com`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' " +
      "https://*.infura.io wss://*.infura.io " +
      "https://*.alchemyapi.io wss://*.alchemyapi.io " +
      "https://*.walletconnect.org wss://*.walletconnect.org " +
      "https://*.walletconnect.com wss://*.walletconnect.com " +
      "https://registry.walletconnect.org https://registry.walletconnect.com " +
      "https://api.walletconnect.com https://hub.walletconnect.com " +
      "https://explorer-api.walletconnect.com " +
      "https://verify.walletconnect.org https://verify.walletconnect.com " +
      "https://relay.walletconnect.com wss://relay.walletconnect.com " +
      "https://pulse.walletconnect.org " +
      "https://api.etherscan.io " +
      "https://eth-mainnet.g.alchemy.com https://eth-sepolia.g.alchemy.com " +
      "https://mainnet.infura.io https://api.coingecko.com",
    "frame-src 'self' https://*.walletconnect.org https://*.walletconnect.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    // Ajout du reporting
    `report-uri https://api.tokenforge.example.com/csp-report?key=${key}`
  ];

  return { nonce, directives };
}

// Gestionnaire des violations CSP
export async function handleCSPViolation(event: SecurityPolicyViolationEvent) {
  const clientId = localStorage.getItem('client_id') || undefined;
  
  await cspCollector.reportViolation({
    blockedURI: event.blockedURI,
    documentURI: event.documentURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    clientId,
  });
}
