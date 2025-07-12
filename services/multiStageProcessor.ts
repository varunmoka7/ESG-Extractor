import { KpiData, ProcessingStage, ProcessingResult } from '../types';

export interface ProcessingStageConfig {
  name: string;
  enabled: boolean;
  priority: number;
  timeout?: number;
}

export interface PipelineConfig {
  stages: ProcessingStageConfig[];
  parallelProcessing: boolean;
  maxRetries: number;
}

export class MultiStageProcessor {
  private config: PipelineConfig;
  private stages: Map<string, ProcessingStage> = new Map();

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  registerStage(name: string, stage: ProcessingStage): void {
    this.stages.set(name, stage);
  }

  async processDocument(
    content: string,
    metadata: any,
    options?: { skipStages?: string[]; customConfig?: Partial<PipelineConfig> }
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const result: ProcessingResult = {
      success: true,
      data: [],
      metadata: {
        processingTime: 0,
        stagesExecuted: [],
        errors: [],
        warnings: []
      },
      confidence: 0,
      traceability: {
        sourceText: content.substring(0, 200) + '...',
        sourceFile: metadata?.filename || 'unknown',
        page: metadata?.page || 1,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const enabledStages = this.config.stages
        .filter(stage => stage.enabled && !options?.skipStages?.includes(stage.name))
        .sort((a, b) => a.priority - b.priority);

      if (this.config.parallelProcessing) {
        await this.executeStagesParallel(enabledStages, content, metadata, result);
      } else {
        await this.executeStagesSequential(enabledStages, content, metadata, result);
      }

      result.metadata.processingTime = Date.now() - startTime;
      result.confidence = this.calculateOverallConfidence(result);
    } catch (error) {
      result.success = false;
      result.metadata.errors.push({
        stage: 'pipeline',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    return result;
  }

  private async executeStagesSequential(
    stages: ProcessingStageConfig[],
    content: string,
    metadata: any,
    result: ProcessingResult
  ): Promise<void> {
    for (const stageConfig of stages) {
      const stage = this.stages.get(stageConfig.name);
      if (!stage) {
        result.metadata.warnings.push(`Stage ${stageConfig.name} not found`);
        continue;
      }

      try {
        const stageResult = await this.executeStageWithTimeout(stage, content, metadata, stageConfig);
        result.data.push(...stageResult.data);
        result.metadata.stagesExecuted.push({
          name: stageConfig.name,
          success: true,
          processingTime: stageResult.processingTime || 0
        });
      } catch (error) {
        result.metadata.errors.push({
          stage: stageConfig.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        result.metadata.stagesExecuted.push({
          name: stageConfig.name,
          success: false,
          processingTime: 0
        });
      }
    }
  }

  private async executeStagesParallel(
    stages: ProcessingStageConfig[],
    content: string,
    metadata: any,
    result: ProcessingResult
  ): Promise<void> {
    const stagePromises = stages.map(async (stageConfig) => {
      const stage = this.stages.get(stageConfig.name);
      if (!stage) {
        result.metadata.warnings.push(`Stage ${stageConfig.name} not found`);
        return null;
      }

      try {
        return await this.executeStageWithTimeout(stage, content, metadata, stageConfig);
      } catch (error) {
        result.metadata.errors.push({
          stage: stageConfig.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return null;
      }
    });

    const stageResults = await Promise.all(stagePromises);
    
    stageResults.forEach((stageResult, index) => {
      if (stageResult) {
        result.data.push(...stageResult.data);
        result.metadata.stagesExecuted.push({
          name: stages[index].name,
          success: true,
          processingTime: stageResult.processingTime || 0
        });
      } else {
        result.metadata.stagesExecuted.push({
          name: stages[index].name,
          success: false,
          processingTime: 0
        });
      }
    });
  }

  private async executeStageWithTimeout(
    stage: ProcessingStage,
    content: string,
    metadata: any,
    config: ProcessingStageConfig
  ): Promise<{ data: KpiData[]; processingTime?: number }> {
    const startTime = Date.now();
    
    if (config.timeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Stage ${config.name} timed out`)), config.timeout);
      });
      
      const stagePromise = stage.process(content, metadata);
      const result = await Promise.race([stagePromise, timeoutPromise]);
      
      return {
        data: result.data,
        processingTime: Date.now() - startTime
      };
    } else {
      const result = await stage.process(content, metadata);
      return {
        data: result.data,
        processingTime: Date.now() - startTime
      };
    }
  }

  private calculateOverallConfidence(result: ProcessingResult): number {
    if (result.data.length === 0) return 0;
    
    const totalConfidence = result.data.reduce((sum, kpi) => sum + (kpi.confidence || 0), 0);
    const avgConfidence = totalConfidence / result.data.length;
    
    // Penalize for errors and warnings
    const errorPenalty = result.metadata.errors.length * 0.1;
    const warningPenalty = result.metadata.warnings.length * 0.05;
    
    return Math.max(0, Math.min(1, avgConfidence - errorPenalty - warningPenalty));
  }

  getPipelineStatus(): { totalStages: number; enabledStages: number; registeredStages: number } {
    return {
      totalStages: this.config.stages.length,
      enabledStages: this.config.stages.filter(s => s.enabled).length,
      registeredStages: this.stages.size
    };
  }
}

// Default pipeline configuration
export const defaultPipelineConfig: PipelineConfig = {
  stages: [
    { name: 'preprocessing', enabled: true, priority: 1, timeout: 30000 },
    { name: 'extraction', enabled: true, priority: 2, timeout: 60000 },
    { name: 'validation', enabled: true, priority: 3, timeout: 30000 },
    { name: 'enrichment', enabled: true, priority: 4, timeout: 45000 },
    { name: 'qa', enabled: true, priority: 5, timeout: 30000 }
  ],
  parallelProcessing: false,
  maxRetries: 3
}; 