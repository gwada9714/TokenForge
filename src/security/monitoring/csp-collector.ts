import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

export interface CSPViolationReport {
  id?: string;
  blockedURI: string;
  documentURI: string;
  violatedDirective: string;
  originalPolicy: string;
  timestamp: Date;
  userAgent: string;
  clientId?: string;
}

class CSPCollector {
  private db;
  private readonly collectionName = 'csp-violations';

  constructor() {
    // Initialisation de Firebase (à configurer avec vos credentials)
    const app = initializeApp({
      // Utiliser les variables d'environnement pour les credentials
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    });
    this.db = getFirestore(app);
  }

  async reportViolation(violation: Omit<CSPViolationReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, this.collectionName), {
        ...violation,
        timestamp: Timestamp.fromDate(violation.timestamp),
        reportedAt: Timestamp.now(),
      });
      
      console.debug('CSP violation logged with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging CSP violation:', error);
      // En cas d'erreur, on stocke localement
      this.storeLocalViolation(violation);
      throw error;
    }
  }

  private storeLocalViolation(violation: Omit<CSPViolationReport, 'id'>) {
    const violations = JSON.parse(
      localStorage.getItem('csp-violations') || '[]'
    ) as Array<Omit<CSPViolationReport, 'id'>>;

    violations.push({
      ...violation,
      timestamp: violation.timestamp,
    });

    localStorage.setItem('csp-violations', JSON.stringify(violations));
  }

  async syncLocalViolations() {
    const violations = JSON.parse(
      localStorage.getItem('csp-violations') || '[]'
    ) as Array<Omit<CSPViolationReport, 'id'>>;
    
    if (violations.length === 0) return;

    for (const violation of violations) {
      try {
        await this.reportViolation(violation);
      } catch (error) {
        console.error('Error syncing local violation:', error);
        continue;
      }
    }

    localStorage.removeItem('csp-violations');
  }
}

export const cspCollector = new CSPCollector();
