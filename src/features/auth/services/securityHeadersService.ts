import { errorService } from './errorService';

class SecurityHeadersService {
  private static instance: SecurityHeadersService;

  private constructor() {
    this.setupSecurityHeaders();
  }

  static getInstance(): SecurityHeadersService {
    if (!SecurityHeadersService.instance) {
      SecurityHeadersService.instance = new SecurityHeadersService();
    }
    return SecurityHeadersService.instance;
  }

  private setupSecurityHeaders(): void {
    try {
      // Configuration CSP
      const cspHeader = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://*.trusted.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': [
          "'self'",
          'https://*.infura.io',
          'https://*.alchemyapi.io',
          'wss://*.walletconnect.org'
        ],
        'frame-src': ["'self'", 'https://*.walletconnect.org'],
        'worker-src': ["'self'", 'blob:'],
        'font-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"]
      };

      // Convertir l'objet CSP en chaîne
      const cspString = Object.entries(cspHeader)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');

      // Ajouter les headers via meta tag (puisque nous ne pouvons pas modifier les headers HTTP directement côté client)
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = cspString;
      document.head.appendChild(meta);

      // Autres headers de sécurité via meta tags
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };

      Object.entries(headers).forEach(([key, value]) => {
        const meta = document.createElement('meta');
        meta.httpEquiv = key;
        meta.content = value;
        document.head.appendChild(meta);
      });
    } catch (error) {
      errorService.handleError(error);
    }
  }

  // Méthode pour vérifier si les headers sont correctement configurés
  verifySecurityHeaders(): boolean {
    try {
      const metas = document.getElementsByTagName('meta');
      const requiredHeaders = [
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy'
      ];

      const foundHeaders = Array.from(metas)
        .map(meta => meta.httpEquiv)
        .filter(Boolean);

      return requiredHeaders.every(header => foundHeaders.includes(header));
    } catch (error) {
      errorService.handleError(error);
      return false;
    }
  }
}

export const securityHeadersService = SecurityHeadersService.getInstance();
