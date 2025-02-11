import { describe, test, expect, beforeAll } from 'vitest';
import { getCSP, parseCSPHeader } from '../../src/security/csp-helper';

describe('Content Security Policy Tests', () => {
  let csp: ReturnType<typeof getCSP>;

  beforeAll(() => {
    process.env = {
      ...process.env,
      CSP_NONCE_SECRET: 'test-secret-73790c98a515e800',
      FIREBASE_API_KEY: 'test-firebase-AIzaSyAWCGLD1B4a',
      VAULT_API_URL: 'http://localhost:8200',
      FIREBASE_FUNCTIONS_URL: 'http://localhost:5001'
    };
    csp = getCSP();
  });

  test('should have valid CSP headers', async () => {
    expect(csp).toBeDefined();
    expect(csp.nonce).toMatch(/^[a-zA-Z0-9+/=]{24}$/);
  });

  test('should include required CSP directives', () => {
    expect(csp.directives).toContain("default-src 'self'");
    expect(csp.directives.find(d => d.startsWith('script-src'))).toContain(`'nonce-${csp.nonce}'`);
  });

  test('should block inline scripts without nonce', async () => {
    expect(csp.directives).toContain(`script-src 'self' 'nonce-${csp.nonce}'`);
  });

  test('should allow scripts with valid nonce', async () => {
    expect(csp.directives).toContain(`script-src 'self' 'nonce-${csp.nonce}'`);
  });

  test('should enforce connect-src restrictions', async () => {
    expect(csp.directives).toContain(process.env.VAULT_API_URL);
  });

  test('should allow Firebase URLs', () => {
    expect(csp.directives).toContain('*.firebaseapp.com');
    expect(csp.directives).toContain('*.googleapis.com');
  });

  test('should allow WalletConnect endpoints', () => {
    const connectSrc = csp.directives.find(d => d.startsWith('connect-src'));
    expect(connectSrc).toBeDefined();
    expect(connectSrc).toContain('https://*.walletconnect.org');
    expect(connectSrc).toContain('https://*.walletconnect.com');
    expect(connectSrc).toContain('https://explorer-api.walletconnect.com');
    expect(connectSrc).toContain('https://pulse.walletconnect.org');
    expect(connectSrc).toContain('wss://*.walletconnect.org');
  });

  test('should allow required API endpoints', () => {
    const connectSrc = csp.directives.find(d => d.startsWith('connect-src'));
    expect(connectSrc).toBeDefined();
    expect(connectSrc).toContain('https://*.infura.io');
    expect(connectSrc).toContain('https://*.alchemyapi.io');
  });

  test('should have secure defaults', () => {
    expect(csp.directives).toContain("object-src 'none'");
    expect(csp.directives).toContain("frame-ancestors 'none'");
    expect(csp.directives).toContain('block-all-mixed-content');
    expect(csp.directives).toContain('upgrade-insecure-requests');
  });

  test('should parse CSP header correctly', () => {
    const header = "default-src 'self'; connect-src 'self' https://*.walletconnect.org";
    const parsed = parseCSPHeader(header);
    
    expect(parsed['default-src']).toEqual(["'self'"]);
    expect(parsed['connect-src']).toEqual(["'self'", "https://*.walletconnect.org"]);
  });
});
