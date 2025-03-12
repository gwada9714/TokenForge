/**
 * Utilitaires pour mesurer et analyser les performances des requêtes Firestore
 * 
 * Ce module permet de collecter des métriques de performance pour les opérations
 * Firestore et d'analyser les requêtes qui pourraient nécessiter des optimisations.
 */

import { logger } from '@/core/logger';
import { performance } from 'perf_hooks';
import { getPerformance, trace } from 'firebase/performance';

// Interface pour les métriques de performance
interface QueryMetric {
  operation: string;
  path: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

// Classe singleton pour gérer les métriques de performance
export class FirestorePerformanceMonitor {
  private static instance: FirestorePerformanceMonitor;
  private metrics: QueryMetric[] = [];
  private isEnabled = true;
  
  private constructor() {
    logger.info({
      category: 'Firestore',
      message: 'Moniteur de performances Firestore initialisé'
    });
  }
  
  public static getInstance(): FirestorePerformanceMonitor {
    if (!FirestorePerformanceMonitor.instance) {
      FirestorePerformanceMonitor.instance = new FirestorePerformanceMonitor();
    }
    return FirestorePerformanceMonitor.instance;
  }
  
  /**
   * Active ou désactive la collecte de métriques
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info({
      category: 'Firestore',
      message: `Monitoring de performances Firestore ${enabled ? 'activé' : 'désactivé'}`
    });
  }
  
  /**
   * Wrapper pour mesurer la performance d'une fonction asynchrone
   */
  public async measureAsync<T>(
    operation: string,
    path: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.isEnabled) {
      return fn();
    }
    
    const startTime = performance.now();
    let success = false;
    let errorMessage: string | undefined;
    
    try {
      // Créer un trace Firebase Performance
      const firebasePerf = getPerformance();
      const customTrace = trace(firebasePerf, `firestore_${operation}`);
      customTrace.putAttribute('path', path);
      customTrace.start();
      
      // Exécuter la fonction
      const result = await fn();
      success = true;
      
      // Finaliser le trace
      customTrace.stop();
      
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Enregistrer la métrique
      this.recordMetric({
        operation,
        path,
        duration,
        timestamp: new Date(),
        success,
        error: errorMessage
      });
    }
  }
  
  /**
   * Enregistre une métrique de performance
   */
  private recordMetric(metric: QueryMetric): void {
    this.metrics.push(metric);
    
    // Limiter le nombre de métriques stockées en mémoire
    if (this.metrics.length > 1000) {
      this.metrics.shift(); // Retirer la plus ancienne métrique
    }
    
    // Alerter sur les requêtes lentes
    if (metric.duration > 1000) {
      logger.warn({
        category: 'Firestore',
        message: `Requête Firestore lente détectée: ${metric.operation} (${Math.round(metric.duration)}ms)`,
        data: { path: metric.path, success: metric.success }
      });
    }
  }
  
  /**
   * Récupère toutes les métriques collectées
   */
  public getMetrics(): QueryMetric[] {
    return [...this.metrics];
  }
  
  /**
   * Récupère les métriques filtrées par opération
   */
  public getMetricsByOperation(operation: string): QueryMetric[] {
    return this.metrics.filter(metric => metric.operation === operation);
  }
  
  /**
   * Récupère les métriques filtrées par chemin
   */
  public getMetricsByPath(pathPrefix: string): QueryMetric[] {
    return this.metrics.filter(metric => metric.path.startsWith(pathPrefix));
  }
  
  /**
   * Calcule le temps moyen d'exécution pour une opération donnée
   */
  public getAverageDuration(operation: string): number {
    const metrics = this.getMetricsByOperation(operation);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }
  
  /**
   * Identifie les requêtes les plus lentes
   */
  public getSlowestQueries(limit = 10): QueryMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
  
  /**
   * Réinitialise toutes les métriques collectées
   */
  public resetMetrics(): void {
    this.metrics = [];
    logger.info({
      category: 'Firestore',
      message: 'Métriques de performances Firestore réinitialisées'
    });
  }
  
  /**
   * Génère un rapport de performances
   */
  public generatePerformanceReport(): Record<string, unknown> {
    // Regrouper par opération
    const operationGroups: Record<string, QueryMetric[]> = {};
    
    this.metrics.forEach(metric => {
      if (!operationGroups[metric.operation]) {
        operationGroups[metric.operation] = [];
      }
      operationGroups[metric.operation].push(metric);
    });
    
    // Calculer les statistiques pour chaque opération
    const operationStats: Record<string, unknown> = {};
    
    Object.entries(operationGroups).forEach(([operation, metrics]) => {
      const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
      const avgDuration = totalDuration / metrics.length;
      const successRate = metrics.filter(m => m.success).length / metrics.length;
      
      operationStats[operation] = {
        count: metrics.length,
        avgDurationMs: Math.round(avgDuration),
        minDurationMs: Math.round(Math.min(...metrics.map(m => m.duration))),
        maxDurationMs: Math.round(Math.max(...metrics.map(m => m.duration))),
        successRate: successRate.toFixed(2),
        totalDurationMs: Math.round(totalDuration)
      };
    });
    
    // Générer le rapport complet
    return {
      totalQueries: this.metrics.length,
      timeRange: {
        from: this.metrics.length > 0 ? this.metrics[0].timestamp : null,
        to: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null
      },
      operationStats,
      slowestQueries: this.getSlowestQueries(5).map(q => ({
        operation: q.operation,
        path: q.path,
        durationMs: Math.round(q.duration),
        timestamp: q.timestamp
      }))
    };
  }
}

// Exportation de l'instance singleton
export const firestorePerformance = FirestorePerformanceMonitor.getInstance();

/**
 * Fonction utilitaire pour envelopper une fonction avec la mesure de performance
 * @param operation Nom de l'opération (ex: 'get', 'set', 'query')
 * @param path Chemin de la collection/document
 * @param fn Fonction à exécuter
 */
export async function withPerformanceTracking<T>(
  operation: string,
  path: string,
  fn: () => Promise<T>
): Promise<T> {
  return firestorePerformance.measureAsync(operation, path, fn);
}
