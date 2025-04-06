import { PERFORMANCE_THRESHOLDS } from "@/__tests__/test-utils/config";

interface PerformanceMetrics {
  startTime: number;
  measurements: {
    responseTime: number[];
    memoryUsage: number[];
    errors: Error[];
    networkLatency: number[];
  };
}

interface PerformanceReport {
  totalTime: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  throughput: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  networkLatency: {
    average: number;
    max: number;
    p95: number;
  };
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private readonly thresholds = PERFORMANCE_THRESHOLDS;

  startMetrics(id: string = "default"): string {
    this.metrics.set(id, {
      startTime: performance.now(),
      measurements: {
        responseTime: [],
        memoryUsage: [],
        errors: [],
        networkLatency: [],
      },
    });
    return id;
  }

  recordMeasurement(
    id: string,
    type: keyof PerformanceMetrics["measurements"],
    value: any
  ): void {
    const metrics = this.metrics.get(id);
    if (!metrics) return;

    metrics.measurements[type].push(value);
  }

  endMetrics(id: string): PerformanceReport {
    const metrics = this.metrics.get(id);
    if (!metrics) {
      throw new Error(`No metrics found for id: ${id}`);
    }

    const endTime = performance.now();
    const totalTime = endTime - metrics.startTime;

    const report = this.generateReport(metrics, totalTime);
    this.validateThresholds(report);

    this.metrics.delete(id);
    return report;
  }

  async measureBaseline(
    operation: () => Promise<void>
  ): Promise<PerformanceReport> {
    const id = this.startMetrics("baseline");

    try {
      await operation();
    } finally {
      return this.endMetrics(id);
    }
  }

  async trackMemoryUsage(
    operation: () => Promise<void>
  ): Promise<{ peak: number; leaked: number }> {
    const initialMemory = process.memoryUsage().heapUsed;
    const measurements: number[] = [];

    const interval = setInterval(() => {
      measurements.push(process.memoryUsage().heapUsed);
    }, 100);

    try {
      await operation();
    } finally {
      clearInterval(interval);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const peak = Math.max(...measurements);

    return {
      peak,
      leaked: Math.max(0, finalMemory - initialMemory),
    };
  }

  async trackConnections(
    operation: () => Promise<void>
  ): Promise<{ peak: number; leaked: number }> {
    const activeConnections = new Set<string>();
    const measurements: number[] = [];

    const addConnection = (id: string) => {
      activeConnections.add(id);
      measurements.push(activeConnections.size);
    };

    const removeConnection = (id: string) => {
      activeConnections.delete(id);
    };

    try {
      await operation();
    } finally {
      // Cleanup
    }

    return {
      peak: Math.max(...measurements),
      leaked: activeConnections.size,
    };
  }

  private generateReport(
    metrics: PerformanceMetrics,
    totalTime: number
  ): PerformanceReport {
    const { responseTime, memoryUsage, errors, networkLatency } =
      metrics.measurements;

    const sortedResponseTimes = [...responseTime].sort((a, b) => a - b);
    const p95Index = Math.floor(responseTime.length * 0.95);
    const p99Index = Math.floor(responseTime.length * 0.99);

    return {
      totalTime,
      averageResponseTime: this.calculateAverage(responseTime),
      maxResponseTime: Math.max(...responseTime),
      minResponseTime: Math.min(...responseTime),
      throughput: (responseTime.length / totalTime) * 1000,
      errorRate: errors.length / responseTime.length,
      p95ResponseTime: sortedResponseTimes[p95Index],
      p99ResponseTime: sortedResponseTimes[p99Index],
      averageMemoryUsage: this.calculateAverage(memoryUsage),
      peakMemoryUsage: Math.max(...memoryUsage),
      networkLatency: {
        average: this.calculateAverage(networkLatency),
        max: Math.max(...networkLatency),
        p95: this.calculatePercentile(networkLatency, 95),
      },
    };
  }

  private validateThresholds(report: PerformanceReport): void {
    if (report.averageResponseTime > this.thresholds.averageResponseTime) {
      console.warn(
        `Average response time (${report.averageResponseTime}ms) exceeds threshold (${this.thresholds.averageResponseTime}ms)`
      );
    }

    if (report.maxResponseTime > this.thresholds.maxResponseTime) {
      console.warn(
        `Max response time (${report.maxResponseTime}ms) exceeds threshold (${this.thresholds.maxResponseTime}ms)`
      );
    }

    if (report.throughput < this.thresholds.minThroughput) {
      console.warn(
        `Throughput (${report.throughput}/s) below threshold (${this.thresholds.minThroughput}/s)`
      );
    }

    if (report.peakMemoryUsage > this.thresholds.maxMemoryUsage) {
      console.warn(
        `Peak memory usage (${report.peakMemoryUsage} bytes) exceeds threshold (${this.thresholds.maxMemoryUsage} bytes)`
      );
    }
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length
      : 0;
  }

  private calculatePercentile(numbers: number[], percentile: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index];
  }
}
