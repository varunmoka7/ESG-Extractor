import { CompanyDataService, GermanBank, DataCollectionTask } from './companyDataService';
import { EnhancedExtractorService } from './enhancedExtractorService';

export interface ReportDownloadResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  contentType?: string;
  error?: string;
  downloadTime?: number;
}

export interface DataExtractionResult {
  success: boolean;
  extractedData?: any;
  confidence?: number;
  processingTime?: number;
  error?: string;
}

export interface CollectionJob {
  id: string;
  companyId: string;
  companyName: string;
  reportUrl: string;
  status: 'pending' | 'downloading' | 'extracting' | 'completed' | 'failed';
  downloadResult?: ReportDownloadResult;
  extractionResult?: DataExtractionResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export class DataCollectionService {
  private companyDataService: CompanyDataService;
  private extractorService: EnhancedExtractorService;
  private jobs: Map<string, CollectionJob> = new Map();
  private downloadDirectory: string = './downloads';

  constructor() {
    this.companyDataService = new CompanyDataService();
    this.extractorService = new EnhancedExtractorService({
      enableMultiStageProcessing: true,
      enableFrameworkIntelligence: true,
      enableMLQA: true,
      enablePerformanceMonitoring: true,
      enableIntelligentIngestion: true,
      enableComplianceScoring: true,
      enableCarbonAnalysis: true,
      industry: 'Banking',
      revenue: 1000000000,
      employees: 10000
    });
  }

  // Initialize collection for all German banks
  async initializeGermanBanksCollection(): Promise<CollectionJob[]> {
    const banks = this.companyDataService.getAllGermanBanks();
    const jobs: CollectionJob[] = [];

    for (const bank of banks) {
      if (bank.sustainabilityReportPdfUrl) {
        const job = await this.createCollectionJob(bank.id, bank.name, bank.sustainabilityReportPdfUrl);
        jobs.push(job);
      }
    }

    return jobs;
  }

  // Create a new collection job
  async createCollectionJob(companyId: string, companyName: string, reportUrl: string): Promise<CollectionJob> {
    const job: CollectionJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      companyName,
      reportUrl,
      status: 'pending',
      createdAt: new Date()
    };

    this.jobs.set(job.id, job);
    return job;
  }

  // Download sustainability report
  async downloadReport(jobId: string): Promise<ReportDownloadResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = 'downloading';
    job.startedAt = new Date();

    try {
      // Simulate download process (in a real implementation, you would use fetch or axios)
      const downloadResult: ReportDownloadResult = {
        success: true,
        filePath: `${this.downloadDirectory}/${job.companyName.replace(/\s+/g, '_')}_sustainability_report.pdf`,
        fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-10 MB
        contentType: 'application/pdf',
        downloadTime: Math.floor(Math.random() * 30000) + 5000 // 5-35 seconds
      };

      job.downloadResult = downloadResult;
      job.status = 'extracting';
      
      return downloadResult;
    } catch (error) {
      const downloadResult: ReportDownloadResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during download'
      };
      
      job.downloadResult = downloadResult;
      job.status = 'failed';
      job.error = downloadResult.error;
      job.completedAt = new Date();
      
      return downloadResult;
    }
  }

  // Extract data from downloaded report
  async extractData(jobId: string): Promise<DataExtractionResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'extracting') {
      throw new Error(`Job ${jobId} is not in extracting status`);
    }

    try {
      // Simulate data extraction process
      const startTime = Date.now();
      
      // In a real implementation, you would:
      // 1. Read the downloaded PDF file
      // 2. Extract text content
      // 3. Use the EnhancedExtractorService to extract ESG data
      
      const mockContent = this.generateMockReportContent(job.companyName);
      
      const extractionResult = await this.extractorService.extractEnhanced(
        mockContent,
        `${job.companyName}_sustainability_report.pdf`,
        job.downloadResult?.fileSize || 0,
        'application/pdf'
      );

      const processingTime = Date.now() - startTime;

      const result: DataExtractionResult = {
        success: extractionResult.success,
        extractedData: extractionResult,
        confidence: extractionResult.overallConfidence,
        processingTime
      };

      job.extractionResult = result;
      job.status = 'completed';
      job.completedAt = new Date();

      return result;
    } catch (error) {
      const result: DataExtractionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during extraction'
      };

      job.extractionResult = result;
      job.status = 'failed';
      job.error = result.error;
      job.completedAt = new Date();

      return result;
    }
  }

  // Process a complete collection job (download + extract)
  async processJob(jobId: string): Promise<{ download: ReportDownloadResult; extraction: DataExtractionResult }> {
    const downloadResult = await this.downloadReport(jobId);
    
    if (!downloadResult.success) {
      throw new Error(`Download failed: ${downloadResult.error}`);
    }

    const extractionResult = await this.extractData(jobId);
    
    return { download: downloadResult, extraction: extractionResult };
  }

  // Process all pending jobs
  async processAllPendingJobs(): Promise<CollectionJob[]> {
    const pendingJobs = Array.from(this.jobs.values()).filter(job => job.status === 'pending');
    const results: CollectionJob[] = [];

    for (const job of pendingJobs) {
      try {
        await this.processJob(job.id);
        results.push(job);
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error);
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date();
        results.push(job);
      }
    }

    return results;
  }

  // Get job by ID
  getJobById(jobId: string): CollectionJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): CollectionJob[] {
    return Array.from(this.jobs.values());
  }

  // Get jobs by status
  getJobsByStatus(status: CollectionJob['status']): CollectionJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  // Get jobs by company
  getJobsByCompany(companyId: string): CollectionJob[] {
    return Array.from(this.jobs.values()).filter(job => job.companyId === companyId);
  }

  // Get collection statistics
  getCollectionStatistics() {
    const allJobs = this.getAllJobs();
    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter(job => job.status === 'completed').length;
    const failedJobs = allJobs.filter(job => job.status === 'failed').length;
    const pendingJobs = allJobs.filter(job => job.status === 'pending').length;
    const inProgressJobs = allJobs.filter(job => job.status === 'downloading' || job.status === 'extracting').length;

    const totalDownloadTime = allJobs
      .filter(job => job.downloadResult?.downloadTime)
      .reduce((sum, job) => sum + (job.downloadResult?.downloadTime || 0), 0);

    const totalProcessingTime = allJobs
      .filter(job => job.extractionResult?.processingTime)
      .reduce((sum, job) => sum + (job.extractionResult?.processingTime || 0), 0);

    const averageConfidence = allJobs
      .filter(job => job.extractionResult?.confidence)
      .reduce((sum, job) => sum + (job.extractionResult?.confidence || 0), 0) / 
      allJobs.filter(job => job.extractionResult?.confidence).length;

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      inProgressJobs,
      successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      totalDownloadTime,
      totalProcessingTime,
      averageConfidence: isNaN(averageConfidence) ? 0 : averageConfidence,
      averageDownloadTime: allJobs.filter(job => job.downloadResult?.downloadTime).length > 0 
        ? totalDownloadTime / allJobs.filter(job => job.downloadResult?.downloadTime).length 
        : 0,
      averageProcessingTime: allJobs.filter(job => job.extractionResult?.processingTime).length > 0
        ? totalProcessingTime / allJobs.filter(job => job.extractionResult?.processingTime).length
        : 0
    };
  }

  // Generate mock report content for demonstration
  private generateMockReportContent(companyName: string): string {
    return `
    ${companyName} Sustainability Report 2023
    
    Executive Summary
    ${companyName} is committed to sustainable banking practices and has made significant progress in reducing our environmental footprint while supporting our clients' transition to a low-carbon economy.
    
    Environmental Performance
    - Scope 1 emissions: 15,000 tonnes CO2e
    - Scope 2 emissions: 45,000 tonnes CO2e  
    - Scope 3 emissions: 2,500,000 tonnes CO2e
    - Renewable energy usage: 85%
    - Paper consumption: 1,200 tonnes (100% certified sustainable)
    
    Social Performance
    - Employee satisfaction: 78%
    - Gender diversity in leadership: 42%
    - Community investment: €15 million
    - Financial inclusion programs: 50,000 beneficiaries
    
    Governance Performance
    - Board independence: 75%
    - ESG training completion: 95%
    - Anti-corruption training: 100%
    - Sustainability committee meetings: 12 per year
    
    Climate Targets
    - Net-zero operations by 2030
    - Net-zero financed emissions by 2050
    - 50% reduction in operational emissions by 2025
    
    Green Finance
    - Green bond issuance: €2.5 billion
    - Sustainable loans: €15 billion
    - ESG-linked products: 25 new products launched
    
    Risk Management
    - Climate risk assessment: Completed for all major portfolios
    - ESG integration: 100% of investment decisions
    - Sustainability stress testing: Annual implementation
    `;
  }

  // Get company data service instance
  getCompanyDataService(): CompanyDataService {
    return this.companyDataService;
  }

  // Get extractor service instance
  getExtractorService(): EnhancedExtractorService {
    return this.extractorService;
  }
}