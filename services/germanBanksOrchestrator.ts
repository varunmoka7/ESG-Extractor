import { CompanyDataService, GermanBank } from './companyDataService';
import { DataCollectionService, CollectionJob } from './dataCollectionService';
import { BackendStorageService, StoredCompanyData } from './backendStorageService';

export interface OrchestrationConfig {
  enableAutoCollection: boolean;
  enableParallelProcessing: boolean;
  maxConcurrentJobs: number;
  retryFailedJobs: boolean;
  maxRetries: number;
  backupAfterCollection: boolean;
  cleanupOldData: boolean;
  daysToKeep: number;
}

export interface OrchestrationResult {
  success: boolean;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  errors: string[];
  warnings: string[];
  statistics: any;
}

export class GermanBanksOrchestrator {
  private companyDataService: CompanyDataService;
  private dataCollectionService: DataCollectionService;
  private backendStorageService: BackendStorageService;
  private config: OrchestrationConfig;
  private isRunning: boolean = false;

  constructor(config: Partial<OrchestrationConfig> = {}) {
    this.config = {
      enableAutoCollection: true,
      enableParallelProcessing: true,
      maxConcurrentJobs: 3,
      retryFailedJobs: true,
      maxRetries: 3,
      backupAfterCollection: true,
      cleanupOldData: true,
      daysToKeep: 30,
      ...config
    };

    this.companyDataService = new CompanyDataService();
    this.dataCollectionService = new DataCollectionService();
    this.backendStorageService = new BackendStorageService();
  }

  // Initialize the orchestrator
  async initialize(): Promise<void> {
    console.log('Initializing German Banks Data Collection Orchestrator...');
    
    try {
      // Initialize storage system
      await this.backendStorageService.initializeStorage();
      
      // Initialize collection for German banks
      await this.dataCollectionService.initializeGermanBanksCollection();
      
      console.log('Orchestrator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  // Start the complete data collection process
  async startDataCollection(): Promise<OrchestrationResult> {
    if (this.isRunning) {
      throw new Error('Data collection is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Starting German banks data collection process...');

      // Get all German banks
      const banks = this.companyDataService.getAllGermanBanks();
      console.log(`Found ${banks.length} German banks to process`);

      // Store all banks in backend
      for (const bank of banks) {
        await this.backendStorageService.storeCompanyData(bank);
      }

      // Process all pending jobs
      const processedJobs = await this.dataCollectionService.processAllPendingJobs();
      
      // Store extracted data for completed jobs
      for (const job of processedJobs) {
        if (job.status === 'completed' && job.extractionResult?.extractedData) {
          await this.backendStorageService.storeExtractedData(
            job.companyId, 
            job.extractionResult.extractedData
          );
        }
      }

      // Create backup if enabled
      if (this.config.backupAfterCollection) {
        try {
          await this.backendStorageService.createBackup('daily');
        } catch (error) {
          warnings.push(`Backup creation failed: ${error}`);
        }
      }

      // Clean up old data if enabled
      if (this.config.cleanupOldData) {
        try {
          const cleanedCount = await this.backendStorageService.cleanupOldData(this.config.daysToKeep);
          console.log(`Cleaned up ${cleanedCount} old records`);
        } catch (error) {
          warnings.push(`Data cleanup failed: ${error}`);
        }
      }

      const totalProcessingTime = Date.now() - startTime;
      const statistics = this.getCollectionStatistics();

      const result: OrchestrationResult = {
        success: true,
        totalJobs: processedJobs.length,
        completedJobs: processedJobs.filter(job => job.status === 'completed').length,
        failedJobs: processedJobs.filter(job => job.status === 'failed').length,
        totalProcessingTime,
        averageProcessingTime: processedJobs.length > 0 ? totalProcessingTime / processedJobs.length : 0,
        errors,
        warnings,
        statistics
      };

      console.log('Data collection process completed successfully');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      const result: OrchestrationResult = {
        success: false,
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        totalProcessingTime: Date.now() - startTime,
        averageProcessingTime: 0,
        errors,
        warnings,
        statistics: {}
      };

      console.error('Data collection process failed:', error);
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  // Process a specific bank
  async processBank(bankId: string): Promise<OrchestrationResult> {
    const bank = this.companyDataService.getBankById(bankId);
    if (!bank) {
      throw new Error(`Bank with ID ${bankId} not found`);
    }

    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(`Processing bank: ${bank.name}`);

      // Store bank data
      await this.backendStorageService.storeCompanyData(bank);

      // Create collection job for this bank
      if (bank.sustainabilityReportPdfUrl) {
        const job = await this.dataCollectionService.createCollectionJob(
          bank.id,
          bank.name,
          bank.sustainabilityReportPdfUrl
        );

        // Process the job
        await this.dataCollectionService.processJob(job.id);

        // Store extracted data if successful
        const processedJob = this.dataCollectionService.getJobById(job.id);
        if (processedJob?.status === 'completed' && processedJob.extractionResult?.extractedData) {
          await this.backendStorageService.storeExtractedData(
            bank.id,
            processedJob.extractionResult.extractedData
          );
        }

        const totalProcessingTime = Date.now() - startTime;
        const statistics = this.getCollectionStatistics();

        return {
          success: true,
          totalJobs: 1,
          completedJobs: processedJob?.status === 'completed' ? 1 : 0,
          failedJobs: processedJob?.status === 'failed' ? 1 : 0,
          totalProcessingTime,
          averageProcessingTime: totalProcessingTime,
          errors,
          warnings,
          statistics
        };
      } else {
        warnings.push(`No sustainability report URL found for ${bank.name}`);
        return {
          success: true,
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          totalProcessingTime: Date.now() - startTime,
          averageProcessingTime: 0,
          errors,
          warnings,
          statistics: this.getCollectionStatistics()
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      return {
        success: false,
        totalJobs: 1,
        completedJobs: 0,
        failedJobs: 1,
        totalProcessingTime: Date.now() - startTime,
        averageProcessingTime: Date.now() - startTime,
        errors,
        warnings,
        statistics: {}
      };
    }
  }

  // Get collection statistics
  getCollectionStatistics() {
    const companyStats = this.companyDataService.getStatistics();
    const collectionStats = this.dataCollectionService.getCollectionStatistics();
    const storageStats = this.backendStorageService.getStorageStatistics();

    return {
      companies: companyStats,
      collection: collectionStats,
      storage: storageStats,
      summary: {
        totalGermanBanks: companyStats.totalBanks,
        totalJobsCreated: collectionStats.totalJobs,
        totalJobsCompleted: collectionStats.completedJobs,
        successRate: collectionStats.successRate,
        totalStorageSize: storageStats.totalStorageSize,
        companiesWithExtractedData: storageStats.totalExtractedData
      }
    };
  }

  // Get all German banks
  getAllGermanBanks(): GermanBank[] {
    return this.companyDataService.getAllGermanBanks();
  }

  // Get stored company data
  getStoredCompanyData(companyId: string): StoredCompanyData | undefined {
    return this.backendStorageService.getStoredCompanyData(companyId);
  }

  // Get all stored companies
  getAllStoredCompanies(): StoredCompanyData[] {
    return this.backendStorageService.getAllStoredCompanies();
  }

  // Get companies with extracted data
  getCompaniesWithExtractedData(): StoredCompanyData[] {
    return this.backendStorageService.getCompaniesWithExtractedData();
  }

  // Search companies
  searchCompanies(query: string): StoredCompanyData[] {
    return this.backendStorageService.searchStoredCompanies(query);
  }

  // Get collection jobs
  getAllJobs(): CollectionJob[] {
    return this.dataCollectionService.getAllJobs();
  }

  // Get jobs by status
  getJobsByStatus(status: CollectionJob['status']): CollectionJob[] {
    return this.dataCollectionService.getJobsByStatus(status);
  }

  // Export data
  async exportData(format: 'json' | 'csv' | 'excel'): Promise<string> {
    return await this.backendStorageService.exportData(format);
  }

  // Create backup
  async createBackup(backupType: 'daily' | 'weekly' | 'monthly'): Promise<string> {
    return await this.backendStorageService.createBackup(backupType);
  }

  // Update configuration
  updateConfig(newConfig: Partial<OrchestrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): OrchestrationConfig {
    return { ...this.config };
  }

  // Check if orchestrator is running
  isOrchestratorRunning(): boolean {
    return this.isRunning;
  }

  // Get service instances for direct access
  getCompanyDataService(): CompanyDataService {
    return this.companyDataService;
  }

  getDataCollectionService(): DataCollectionService {
    return this.dataCollectionService;
  }

  getBackendStorageService(): BackendStorageService {
    return this.backendStorageService;
  }
}