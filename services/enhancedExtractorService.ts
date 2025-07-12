import { 
  KpiData, 
  ProcessingResult, 
  IngestionResult, 
  ComplianceReport, 
  CarbonAnalysis, 
  PerformanceMetrics,
  QaResult,
  FrameworkMapping
} from '../types';
import { MultiStageProcessor, defaultPipelineConfig } from './multiStageProcessor';
import { FrameworkIntelligence } from './frameworkIntelligence';
import { MLQaService } from './mlQaService';
import { PerformanceMonitor } from './performanceMonitor';
import { IntelligentIngestion } from './intelligentIngestion';
import { ComplianceScoring } from './complianceScoring';
import { AdvancedCarbonAnalysis } from './advancedCarbonAnalysis';

export interface EnhancedExtractionConfig {
  enableMultiStageProcessing: boolean;
  enableFrameworkIntelligence: boolean;
  enableMLQA: boolean;
  enablePerformanceMonitoring: boolean;
  enableIntelligentIngestion: boolean;
  enableComplianceScoring: boolean;
  enableCarbonAnalysis: boolean;
  industry?: string;
  revenue?: number;
  employees?: number;
}

export interface EnhancedExtractionResult {
  success: boolean;
  kpiData: KpiData[];
  ingestionResult?: IngestionResult;
  processingResult?: ProcessingResult;
  frameworkMappings?: FrameworkMapping[];
  complianceReport?: ComplianceReport;
  carbonAnalysis?: CarbonAnalysis;
  qaResults?: QaResult[];
  performanceMetrics?: PerformanceMetrics;
  overallConfidence: number;
  insights: string[];
  recommendations: string[];
  processingTime: number;
  generatedAt: Date;
}

export class EnhancedExtractorService {
  private multiStageProcessor: MultiStageProcessor;
  private frameworkIntelligence: FrameworkIntelligence;
  private mlQaService: MLQaService;
  private performanceMonitor: PerformanceMonitor;
  private intelligentIngestion: IntelligentIngestion;
  private complianceScoring: ComplianceScoring;
  private advancedCarbonAnalysis: AdvancedCarbonAnalysis;
  private config: EnhancedExtractionConfig;

  constructor(config: EnhancedExtractionConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize all services
    this.multiStageProcessor = new MultiStageProcessor(defaultPipelineConfig);
    this.frameworkIntelligence = new FrameworkIntelligence();
    this.mlQaService = new MLQaService();
    this.performanceMonitor = new PerformanceMonitor();
    this.intelligentIngestion = new IntelligentIngestion({
      supportedFormats: ['pdf', 'excel', 'xbrl', 'html', 'text'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableOcr: true,
      enableContentAnalysis: true,
      parallelProcessing: true,
      timeout: 120000 // 2 minutes
    });
    this.complianceScoring = new ComplianceScoring();
    this.advancedCarbonAnalysis = new AdvancedCarbonAnalysis();

    // Register processing stages if multi-stage processing is enabled
    if (this.config.enableMultiStageProcessing) {
      this.registerProcessingStages();
    }
  }

  private registerProcessingStages(): void {
    // Register preprocessing stage
    this.multiStageProcessor.registerStage('preprocessing', {
      process: async (content: string, metadata: any) => {
        const startTime = Date.now();
        
        // Basic preprocessing: clean text, remove noise
        const cleanedContent = this.preprocessContent(content);
        
        return {
          data: [], // Preprocessing doesn't extract KPIs
          confidence: 0.9
        };
      }
    });

    // Register extraction stage
    this.multiStageProcessor.registerStage('extraction', {
      process: async (content: string, metadata: any) => {
        const startTime = Date.now();
        
        // Use existing extraction logic
        const kpiData = await this.extractKPIs(content);
        
        return {
          data: kpiData,
          confidence: 0.85
        };
      }
    });

    // Register validation stage
    this.multiStageProcessor.registerStage('validation', {
      process: async (content: string, metadata: any) => {
        const startTime = Date.now();
        
        // Validate extracted KPIs
        const kpiData = metadata.extractedKPIs || [];
        const validationResults = await this.mlQaService.validateKpiData(kpiData);
        
        return {
          data: kpiData.filter((_, index) => validationResults[index]?.isValid),
          confidence: 0.9
        };
      }
    });

    // Register enrichment stage
    this.multiStageProcessor.registerStage('enrichment', {
      process: async (content: string, metadata: any) => {
        const startTime = Date.now();
        
        // Enrich KPI data with additional context
        const kpiData = metadata.validatedKPIs || [];
        const enrichedData = this.enrichKpiData(kpiData, content);
        
        return {
          data: enrichedData,
          confidence: 0.8
        };
      }
    });

    // Register QA stage
    this.multiStageProcessor.registerStage('qa', {
      process: async (content: string, metadata: any) => {
        const startTime = Date.now();
        
        // Final QA check
        const kpiData = metadata.enrichedKPIs || [];
        const qaResults = await this.mlQaService.validateKpiData(kpiData);
        
        return {
          data: kpiData,
          confidence: 0.95
        };
      }
    });
  }

  async extractEnhanced(
    content: string,
    fileName: string,
    fileSize: number,
    mimeType?: string
  ): Promise<EnhancedExtractionResult> {
    const startTime = Date.now();
    const eventId = this.performanceMonitor.recordProcessingStart('enhanced_extraction', fileSize);

    try {
      let kpiData: KpiData[] = [];
      let ingestionResult: IngestionResult | undefined;
      let processingResult: ProcessingResult | undefined;
      let frameworkMappings: FrameworkMapping[] | undefined;
      let complianceReport: ComplianceReport | undefined;
      let carbonAnalysis: CarbonAnalysis | undefined;
      let qaResults: QaResult[] | undefined;

      // Step 1: Intelligent Ingestion
      if (this.config.enableIntelligentIngestion) {
        ingestionResult = await this.intelligentIngestion.ingestContent(content, fileName, fileSize, mimeType);
        if (ingestionResult.success) {
          kpiData = ingestionResult.data;
        }
      }

      // Step 2: Multi-Stage Processing (if ingestion didn't work or is disabled)
      if (kpiData.length === 0 && this.config.enableMultiStageProcessing) {
        processingResult = await this.multiStageProcessor.processDocument(content, {
          filename: fileName,
          filesize: fileSize,
          mimetype: mimeType
        });
        
        if (processingResult.success) {
          kpiData = processingResult.data;
        }
      }

      // Step 3: Fallback to basic extraction if needed
      if (kpiData.length === 0) {
        kpiData = await this.extractKPIs(content);
      }

      // Step 4: Framework Intelligence
      if (this.config.enableFrameworkIntelligence && kpiData.length > 0) {
        const frameworkDetection = this.frameworkIntelligence.detectFrameworks(content);
        frameworkMappings = this.frameworkIntelligence.mapToFrameworks(kpiData);
      }

      // Step 5: ML QA
      if (this.config.enableMLQA && kpiData.length > 0) {
        qaResults = await this.mlQaService.validateKpiData(kpiData);
        
        // Filter out invalid KPIs
        kpiData = kpiData.filter((_, index) => qaResults[index]?.isValid);
      }

      // Step 6: Compliance Scoring
      if (this.config.enableComplianceScoring && kpiData.length > 0) {
        const frameworkIds = frameworkMappings ? 
          [...new Set(frameworkMappings.map(m => m.frameworkId))] : 
          ['gri', 'sasb', 'tcfd'];
        
        complianceReport = this.complianceScoring.generateComplianceReport(kpiData, frameworkIds);
      }

      // Step 7: Advanced Carbon Analysis
      if (this.config.enableCarbonAnalysis && kpiData.length > 0) {
        carbonAnalysis = this.advancedCarbonAnalysis.analyzeCarbonData(
          kpiData,
          this.config.industry || 'General',
          this.config.revenue,
          this.config.employees
        );
      }

      // Step 8: Performance Monitoring
      const performanceMetrics = this.performanceMonitor.getPerformanceMetrics();

      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(
        ingestionResult,
        processingResult,
        qaResults,
        kpiData
      );

      // Generate insights and recommendations
      const insights = this.generateInsights(
        kpiData,
        frameworkMappings,
        complianceReport,
        carbonAnalysis,
        qaResults
      );

      const recommendations = this.generateRecommendations(
        kpiData,
        frameworkMappings,
        complianceReport,
        carbonAnalysis,
        qaResults
      );

      const processingTime = Date.now() - startTime;
      this.performanceMonitor.recordProcessingEnd(eventId, true, {
        success: true,
        data: kpiData,
        metadata: { processingTime },
        confidence: overallConfidence,
        traceability: {
          sourceText: content.substring(0, 200) + '...',
          sourceFile: fileName,
          page: 1,
          timestamp: new Date().toISOString()
        }
      });

      return {
        success: true,
        kpiData,
        ingestionResult,
        processingResult,
        frameworkMappings,
        complianceReport,
        carbonAnalysis,
        qaResults,
        performanceMetrics,
        overallConfidence,
        insights,
        recommendations,
        processingTime,
        generatedAt: new Date()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.performanceMonitor.recordProcessingEnd(eventId, false);
      this.performanceMonitor.recordError('enhanced_extraction', error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        kpiData: [],
        overallConfidence: 0,
        insights: [],
        recommendations: [],
        processingTime,
        generatedAt: new Date()
      };
    }
  }

  private async extractKPIs(content: string): Promise<KpiData[]> {
    // Basic KPI extraction logic - this would integrate with existing extraction
    const kpis: KpiData[] = [];
    
    // Example extraction patterns
    const patterns = [
      { regex: /(\d+(?:\.\d+)?)\s*(?:tons?|t)\s*(?:of\s+)?(?:CO2|carbon|emissions)/gi, name: 'Carbon Emissions' },
      { regex: /(\d+(?:\.\d+)?)\s*(?:kWh|kilowatt-hours?)\s*(?:of\s+)?energy/gi, name: 'Energy Consumption' },
      { regex: /(\d+(?:\.\d+)?)\s*(?:tons?|t)\s*(?:of\s+)?waste/gi, name: 'Waste Generation' },
      { regex: /(\d+(?:\.\d+)?)\s*(?:liters?|L|gallons?)\s*(?:of\s+)?water/gi, name: 'Water Consumption' }
    ];

    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern.regex);
      for (const match of matches) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          kpis.push({
            id: `kpi_${Date.now()}_${Math.random()}`,
            name: pattern.name,
            value,
            unit: this.extractUnit(match[0]),
            year: this.extractYear(content) || new Date().getFullYear(),
            category: this.categorizeKPI(pattern.name),
            description: match[0],
            confidence: 0.8,
            traceability: {
              sourceText: match[0],
              sourceFile: 'extracted',
              page: 1,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    });

    return kpis;
  }

  private preprocessContent(content: string): string {
    // Basic text preprocessing
    return content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,%()]/g, '') // Remove special characters
      .trim();
  }

  private enrichKpiData(kpiData: KpiData[], content: string): KpiData[] {
    return kpiData.map(kpi => ({
      ...kpi,
      description: kpi.description || this.findContextForKPI(kpi, content),
      confidence: kpi.confidence || 0.8
    }));
  }

  private findContextForKPI(kpi: KpiData, content: string): string {
    // Find context around the KPI in the content
    const kpiText = kpi.traceability.sourceText;
    const index = content.indexOf(kpiText);
    if (index !== -1) {
      const start = Math.max(0, index - 100);
      const end = Math.min(content.length, index + kpiText.length + 100);
      return content.substring(start, end);
    }
    return kpi.name;
  }

  private extractUnit(text: string): string {
    if (text.includes('tons') || text.includes('t')) return 'tons';
    if (text.includes('kWh')) return 'kWh';
    if (text.includes('liters') || text.includes('L')) return 'liters';
    if (text.includes('gallons')) return 'gallons';
    return 'units';
  }

  private extractYear(content: string): number | null {
    const yearMatch = content.match(/\b(20\d{2})\b/);
    return yearMatch ? parseInt(yearMatch[1]) : null;
  }

  private categorizeKPI(name: string): string {
    if (name.includes('Carbon') || name.includes('Emissions')) return 'Environmental';
    if (name.includes('Energy')) return 'Environmental';
    if (name.includes('Waste')) return 'Environmental';
    if (name.includes('Water')) return 'Environmental';
    return 'Other';
  }

  private calculateOverallConfidence(
    ingestionResult?: IngestionResult,
    processingResult?: ProcessingResult,
    qaResults?: QaResult[],
    kpiData?: KpiData[]
  ): number {
    let confidence = 0.5; // Base confidence

    if (ingestionResult) {
      confidence = Math.max(confidence, ingestionResult.confidence);
    }

    if (processingResult) {
      confidence = Math.max(confidence, processingResult.confidence);
    }

    if (qaResults && qaResults.length > 0) {
      const avgQaConfidence = qaResults.reduce((sum, result) => sum + result.confidence, 0) / qaResults.length;
      confidence = (confidence + avgQaConfidence) / 2;
    }

    if (kpiData && kpiData.length > 0) {
      const avgKpiConfidence = kpiData.reduce((sum, kpi) => sum + (kpi.confidence || 0), 0) / kpiData.length;
      confidence = (confidence + avgKpiConfidence) / 2;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  private generateInsights(
    kpiData: KpiData[],
    frameworkMappings?: FrameworkMapping[],
    complianceReport?: ComplianceReport,
    carbonAnalysis?: CarbonAnalysis,
    qaResults?: QaResult[]
  ): string[] {
    const insights: string[] = [];

    // KPI insights
    if (kpiData.length > 0) {
      insights.push(`Successfully extracted ${kpiData.length} ESG metrics`);
      
      const categories = [...new Set(kpiData.map(k => k.category))];
      insights.push(`Coverage across ${categories.length} categories: ${categories.join(', ')}`);
    }

    // Framework insights
    if (frameworkMappings && frameworkMappings.length > 0) {
      const frameworks = [...new Set(frameworkMappings.map(m => m.frameworkName))];
      insights.push(`Detected alignment with ${frameworks.length} frameworks: ${frameworks.join(', ')}`);
    }

    // Compliance insights
    if (complianceReport) {
      insights.push(`Overall compliance score: ${(complianceReport.overallScore * 100).toFixed(1)}%`);
      
      if (complianceReport.summary.criticalGaps > 0) {
        insights.push(`${complianceReport.summary.criticalGaps} critical compliance gaps identified`);
      }
    }

    // Carbon insights
    if (carbonAnalysis) {
      insights.push(...carbonAnalysis.insights);
    }

    // QA insights
    if (qaResults) {
      const issues = qaResults.flatMap(result => result.issues);
      if (issues.length > 0) {
        insights.push(`${issues.length} data quality issues identified and addressed`);
      }
    }

    return insights;
  }

  private generateRecommendations(
    kpiData: KpiData[],
    frameworkMappings?: FrameworkMapping[],
    complianceReport?: ComplianceReport,
    carbonAnalysis?: CarbonAnalysis,
    qaResults?: QaResult[]
  ): string[] {
    const recommendations: string[] = [];

    // General recommendations
    if (kpiData.length === 0) {
      recommendations.push('No ESG metrics found. Consider reviewing document content and extraction parameters.');
    }

    // Framework recommendations
    if (frameworkMappings && frameworkMappings.length === 0) {
      recommendations.push('No framework alignment detected. Consider implementing GRI, SASB, or TCFD standards.');
    }

    // Compliance recommendations
    if (complianceReport) {
      recommendations.push(...complianceReport.assessments.flatMap(a => a.recommendations));
    }

    // Carbon recommendations
    if (carbonAnalysis) {
      recommendations.push(...carbonAnalysis.recommendations);
    }

    // QA recommendations
    if (qaResults) {
      const criticalIssues = qaResults.flatMap(result => 
        result.issues.filter(issue => issue.severity === 'critical')
      );
      
      if (criticalIssues.length > 0) {
        recommendations.push('Address critical data quality issues before proceeding with analysis.');
      }
    }

    return recommendations;
  }

  // Public methods for accessing individual services
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getPerformanceMetrics();
  }

  getFrameworkDefinitions() {
    return this.frameworkIntelligence.getFrameworkDefinitions();
  }

  getComplianceFrameworks() {
    return this.complianceScoring.getFrameworks();
  }

  updateConfig(newConfig: Partial<EnhancedExtractionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EnhancedExtractionConfig {
    return { ...this.config };
  }
} 