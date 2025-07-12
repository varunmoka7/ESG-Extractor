import { ProcessingResult, PerformanceMetrics, SystemHealth, ErrorLog } from '../types';

export interface PerformanceEvent {
  id: string;
  timestamp: Date;
  eventType: 'processing_start' | 'processing_end' | 'error' | 'warning' | 'stage_complete';
  stage?: string;
  duration?: number;
  dataSize?: number;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalProcessed: number;
  successfulProcessed: number;
  failedProcessed: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  errorRate: number;
  throughput: number; // documents per hour
  lastUpdated: Date;
}

export interface StagePerformance {
  stageName: string;
  totalExecutions: number;
  successfulExecutions: number;
  averageDuration: number;
  totalDuration: number;
  errorRate: number;
  lastExecution: Date;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueSize: number;
  timestamp: Date;
}

export class PerformanceMonitor {
  private events: PerformanceEvent[] = [];
  private stageStats: Map<string, StagePerformance> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private maxEvents: number = 10000;
  private maxMetrics: number = 1000;

  constructor() {
    this.startSystemMonitoring();
  }

  recordProcessingStart(stage: string, dataSize?: number): string {
    const eventId = this.generateEventId();
    const event: PerformanceEvent = {
      id: eventId,
      timestamp: new Date(),
      eventType: 'processing_start',
      stage,
      dataSize,
      metadata: { startTime: Date.now() }
    };

    this.addEvent(event);
    return eventId;
  }

  recordProcessingEnd(eventId: string, success: boolean, result?: ProcessingResult): void {
    const startEvent = this.events.find(e => e.id === eventId);
    if (!startEvent) return;

    const duration = Date.now() - startEvent.metadata!.startTime;
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType: 'processing_end',
      stage: startEvent.stage,
      duration,
      success,
      metadata: {
        resultData: result?.data?.length || 0,
        confidence: result?.confidence || 0,
        errors: result?.metadata?.errors?.length || 0,
        warnings: result?.metadata?.warnings?.length || 0
      }
    };

    this.addEvent(event);
    this.updateStageStats(startEvent.stage!, duration, success);
  }

  recordError(stage: string, error: string, metadata?: Record<string, any>): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType: 'error',
      stage,
      error,
      success: false,
      metadata
    };

    this.addEvent(event);
  }

  recordWarning(stage: string, warning: string, metadata?: Record<string, any>): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType: 'warning',
      stage,
      metadata: { warning, ...metadata }
    };

    this.addEvent(event);
  }

  recordStageComplete(stage: string, duration: number, success: boolean): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType: 'stage_complete',
      stage,
      duration,
      success
    };

    this.addEvent(event);
    this.updateStageStats(stage, duration, success);
  }

  private addEvent(event: PerformanceEvent): void {
    this.events.push(event);
    
    // Maintain event limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private updateStageStats(stageName: string, duration: number, success: boolean): void {
    let stats = this.stageStats.get(stageName);
    if (!stats) {
      stats = {
        stageName,
        totalExecutions: 0,
        successfulExecutions: 0,
        averageDuration: 0,
        totalDuration: 0,
        errorRate: 0,
        lastExecution: new Date()
      };
    }

    stats.totalExecutions++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.totalExecutions;
    stats.lastExecution = new Date();

    if (success) {
      stats.successfulExecutions++;
    }

    stats.errorRate = (stats.totalExecutions - stats.successfulExecutions) / stats.totalExecutions;
    this.stageStats.set(stageName, stats);
  }

  getPerformanceStats(timeRange?: { start: Date; end: Date }): PerformanceStats {
    const filteredEvents = this.filterEventsByTimeRange(this.events, timeRange);
    const processingEvents = filteredEvents.filter(e => e.eventType === 'processing_end');

    const totalProcessed = processingEvents.length;
    const successfulProcessed = processingEvents.filter(e => e.success).length;
    const failedProcessed = totalProcessed - successfulProcessed;
    const totalProcessingTime = processingEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    const averageProcessingTime = totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0;
    const errorRate = totalProcessed > 0 ? failedProcessed / totalProcessed : 0;

    // Calculate throughput (documents per hour)
    let throughput = 0;
    if (timeRange && timeRange.end.getTime() - timeRange.start.getTime() > 0) {
      const hoursElapsed = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
      throughput = totalProcessed / hoursElapsed;
    }

    return {
      totalProcessed,
      successfulProcessed,
      failedProcessed,
      averageProcessingTime,
      totalProcessingTime,
      errorRate,
      throughput,
      lastUpdated: new Date()
    };
  }

  getStagePerformance(stageName?: string): StagePerformance[] {
    if (stageName) {
      const stats = this.stageStats.get(stageName);
      return stats ? [stats] : [];
    }
    return Array.from(this.stageStats.values());
  }

  getErrorLogs(timeRange?: { start: Date; end: Date }): ErrorLog[] {
    const filteredEvents = this.filterEventsByTimeRange(this.events, timeRange);
    const errorEvents = filteredEvents.filter(e => e.eventType === 'error');

    return errorEvents.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      stage: event.stage || 'unknown',
      error: event.error || 'Unknown error',
      metadata: event.metadata || {}
    }));
  }

  getSystemHealth(): SystemHealth {
    const recentMetrics = this.systemMetrics.slice(-10); // Last 10 metrics
    if (recentMetrics.length === 0) {
      return {
        status: 'unknown',
        cpuUsage: 0,
        memoryUsage: 0,
        activeConnections: 0,
        queueSize: 0,
        lastUpdated: new Date()
      };
    }

    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length;
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;
    const avgConnections = recentMetrics.reduce((sum, m) => sum + m.activeConnections, 0) / recentMetrics.length;
    const avgQueueSize = recentMetrics.reduce((sum, m) => sum + m.queueSize, 0) / recentMetrics.length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (avgCpu > 80 || avgMemory > 80) {
      status = 'critical';
    } else if (avgCpu > 60 || avgMemory > 60) {
      status = 'warning';
    }

    return {
      status,
      cpuUsage: avgCpu,
      memoryUsage: avgMemory,
      activeConnections: avgConnections,
      queueSize: avgQueueSize,
      lastUpdated: new Date()
    };
  }

  getPerformanceMetrics(timeRange?: { start: Date; end: Date }): PerformanceMetrics {
    const stats = this.getPerformanceStats(timeRange);
    const stagePerformance = this.getStagePerformance();
    const systemHealth = this.getSystemHealth();
    const errorLogs = this.getErrorLogs(timeRange);

    return {
      overallStats: stats,
      stagePerformance,
      systemHealth,
      errorLogs,
      generatedAt: new Date()
    };
  }

  private filterEventsByTimeRange(events: PerformanceEvent[], timeRange?: { start: Date; end: Date }): PerformanceEvent[] {
    if (!timeRange) return events;

    return events.filter(event => 
      event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startSystemMonitoring(): void {
    // Simulate system metrics collection
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private collectSystemMetrics(): void {
    // In a real implementation, this would collect actual system metrics
    // For now, we'll simulate with random values
    const metrics: SystemMetrics = {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 10),
      queueSize: Math.floor(Math.random() * 5),
      timestamp: new Date()
    };

    this.systemMetrics.push(metrics);
    
    // Maintain metrics limit
    if (this.systemMetrics.length > this.maxMetrics) {
      this.systemMetrics = this.systemMetrics.slice(-this.maxMetrics);
    }
  }

  // Utility methods for monitoring
  getRecentEvents(limit: number = 50): PerformanceEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByStage(stage: string, limit: number = 100): PerformanceEvent[] {
    return this.events
      .filter(event => event.stage === stage)
      .slice(-limit);
  }

  getEventsByType(eventType: string, limit: number = 100): PerformanceEvent[] {
    return this.events
      .filter(event => event.eventType === eventType)
      .slice(-limit);
  }

  clearOldEvents(olderThan: Date): void {
    this.events = this.events.filter(event => event.timestamp >= olderThan);
  }

  clearOldMetrics(olderThan: Date): void {
    this.systemMetrics = this.systemMetrics.filter(metric => metric.timestamp >= olderThan);
  }

  // Export functionality
  exportPerformanceData(): {
    events: PerformanceEvent[];
    stageStats: StagePerformance[];
    systemMetrics: SystemMetrics[];
  } {
    return {
      events: [...this.events],
      stageStats: Array.from(this.stageStats.values()),
      systemMetrics: [...this.systemMetrics]
    };
  }

  importPerformanceData(data: {
    events: PerformanceEvent[];
    stageStats: StagePerformance[];
    systemMetrics: SystemMetrics[];
  }): void {
    this.events = data.events;
    this.stageStats = new Map(data.stageStats.map(stats => [stats.stageName, stats]));
    this.systemMetrics = data.systemMetrics;
  }
} 