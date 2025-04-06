import { logger } from '../core/logger';
import * as Sentry from '@sentry/react';

const LOG_CATEGORY = 'CSP Report';

interface CspReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'status-code': number;
  };
}

export const handleCspReport = async (req: Request): Promise<Response> => {
  try {
    const report = await req.json() as CspReport;

    // Log la violation
    logger.warn(LOG_CATEGORY, 'CSP Violation detected', {
      documentUri: report['csp-report']['document-uri'],
      violatedDirective: report['csp-report']['violated-directive'],
      blockedUri: report['csp-report']['blocked-uri']
    });

    // Envoyer à Sentry pour le monitoring
    if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
      Sentry.captureMessage('CSP Violation', {
        level: 'warning',
        extra: report
      });
    }

    // Stocker dans Firestore pour analyse
    const { db } = await import('../config/firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    await addDoc(collection(db, 'cspViolations'), {
      ...report['csp-report'],
      timestamp: serverTimestamp(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      env: import.meta.env.VITE_ENV
    });

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': import.meta.env.VITE_API_URL,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    logger.error(LOG_CATEGORY, 'Failed to process CSP report', error);
    
    if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
      Sentry.captureException(error);
    }

    return new Response(JSON.stringify({ error: 'Failed to process CSP report' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
