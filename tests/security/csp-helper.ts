import { Page } from '@playwright/test';

export interface CSPViolation {
  blockedURI: string;
  violatedDirective: string;
  originalPolicy: string;
  disposition: string;
  timestamp: string;
}

export async function setupCSPViolationCollection(page: Page): Promise<CSPViolation[]> {
  const violations: CSPViolation[] = [];

  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      window.postMessage({
        type: 'csp-violation',
        violation: {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
          disposition: e.disposition,
          timestamp: new Date().toISOString()
        }
      }, '*');
    });
  });

  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      console.log('CSP Violation detected:', msg.text());
    }
  });

  page.on('pageerror', error => {
    if (error.message.includes('Content Security Policy')) {
      console.log('CSP Error:', error.message);
    }
  });

  await page.exposeFunction('reportCSPViolation', (violation: CSPViolation) => {
    violations.push(violation);
  });

  return violations;
}

export function parseCSPHeader(cspHeader: string): Record<string, string[]> {
  const directives: Record<string, string[]> = {};
  
  cspHeader.split(';').forEach(directive => {
    const [name, ...values] = directive.trim().split(/\s+/);
    if (name) {
      directives[name] = values;
    }
  });
  
  return directives;
}
