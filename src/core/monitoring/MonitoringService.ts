import { BaseLogger } from '../logger';

export class MonitoringService {
  private logger = new BaseLogger('Monitoring');
  private metrics: Map<string, number> = new Map();

  trackMetric(name: string, value: number) {
    this.metrics.set(name, value);
    this.logger.info(`Metric tracked: ${name}`, { value });
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  clearMetrics() {
    this.metrics.clear();
    this.logger.debug('Metrics cleared');
  }
}

export const monitoring = new MonitoringService();
