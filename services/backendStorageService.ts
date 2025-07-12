import { CompanyDataService, Company, GermanBank, DataCollectionTask } from './companyDataService';
import { DataCollectionService, CollectionJob, ReportDownloadResult, DataExtractionResult } from './dataCollectionService';

export interface StoredCompanyData {
  id: string;
  company: Company;
  extractedData?: any;
  lastExtractionDate?: Date;
  extractionStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface StoredCollectionJob {
  id: string;
  job: CollectionJob;
  storagePath?: string;
  fileHash?: string;
  backupPath?: string;
}

export interface StorageStatistics {
  totalCompanies: number;
  totalJobs: number;
  totalExtractedData: number;
  totalStorageSize: number; // in bytes
  averageFileSize: number;
  lastBackupDate?: Date;
  storageHealth: 'healthy' | 'warning' | 'critical';
}

export class BackendStorageService {
  private companyDataService: CompanyDataService;
  private dataCollectionService: DataCollectionService;
  private storedCompanies: Map<string, StoredCompanyData> = new Map();
  private storedJobs: Map<string, StoredCollectionJob> = new Map();
  private storageDirectory: string = './storage';
  private backupDirectory: string = './backups';

  constructor() {
    this.companyDataService = new CompanyDataService();
    this.dataCollectionService = new DataCollectionService();
  }

  // Initialize storage system
  async initializeStorage(): Promise<void> {
    // Create storage directories if they don't exist
    await this.createStorageDirectories();
    
    // Load existing data from storage
    await this.loadStoredData();
  }

  // Create necessary storage directories
  private async createStorageDirectories(): Promise<void> {
    const directories = [
      this.storageDirectory,
      this.backupDirectory,
      `${this.storageDirectory}/companies`,
      `${this.storageDirectory}/jobs`,
      `${this.storageDirectory}/extracted_data`,
      `${this.storageDirectory}/reports`,
      `${this.backupDirectory}/daily`,
      `${this.backupDirectory}/weekly`,
      `${this.backupDirectory}/monthly`
    ];

    for (const dir of directories) {
      try {
        // In a real implementation, you would use fs.mkdirSync with recursive option
        console.log(`Creating directory: ${dir}`);
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  // Load existing data from storage
  private async loadStoredData(): Promise<void> {
    try {
      // In a real implementation, you would load data from database or file system
      console.log('Loading stored data...');
      
      // For now, we'll initialize with the German banks data
      const banks = this.companyDataService.getAllGermanBanks();
      for (const bank of banks) {
        this.storedCompanies.set(bank.id, {
          id: bank.id,
          company: bank,
          extractionStatus: 'not_started'
        });
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }

  // Store company data
  async storeCompanyData(company: Company, extractedData?: any): Promise<StoredCompanyData> {
    const storedData: StoredCompanyData = {
      id: company.id,
      company,
      extractedData,
      lastExtractionDate: extractedData ? new Date() : undefined,
      extractionStatus: extractedData ? 'completed' : 'not_started',
      metadata: {
        storedAt: new Date(),
        version: '1.0'
      }
    };

    this.storedCompanies.set(company.id, storedData);
    await this.saveCompanyDataToStorage(company.id, storedData);
    
    return storedData;
  }

  // Store collection job
  async storeCollectionJob(job: CollectionJob): Promise<StoredCollectionJob> {
    const storedJob: StoredCollectionJob = {
      id: job.id,
      job,
      storagePath: `${this.storageDirectory}/jobs/${job.id}.json`,
      fileHash: this.generateFileHash(job),
      backupPath: `${this.backupDirectory}/daily/${job.id}_${Date.now()}.json`
    };

    this.storedJobs.set(job.id, storedJob);
    await this.saveJobToStorage(job.id, storedJob);
    
    return storedJob;
  }

  // Store extracted ESG data
  async storeExtractedData(companyId: string, extractedData: any): Promise<void> {
    const storedCompany = this.storedCompanies.get(companyId);
    if (!storedCompany) {
      throw new Error(`Company ${companyId} not found in storage`);
    }

    storedCompany.extractedData = extractedData;
    storedCompany.lastExtractionDate = new Date();
    storedCompany.extractionStatus = 'completed';

    this.storedCompanies.set(companyId, storedCompany);
    await this.saveCompanyDataToStorage(companyId, storedCompany);
  }

  // Get stored company data
  getStoredCompanyData(companyId: string): StoredCompanyData | undefined {
    return this.storedCompanies.get(companyId);
  }

  // Get all stored companies
  getAllStoredCompanies(): StoredCompanyData[] {
    return Array.from(this.storedCompanies.values());
  }

  // Get stored collection job
  getStoredCollectionJob(jobId: string): StoredCollectionJob | undefined {
    return this.storedJobs.get(jobId);
  }

  // Get all stored jobs
  getAllStoredJobs(): StoredCollectionJob[] {
    return Array.from(this.storedJobs.values());
  }

  // Get companies with extracted data
  getCompaniesWithExtractedData(): StoredCompanyData[] {
    return Array.from(this.storedCompanies.values()).filter(
      company => company.extractionStatus === 'completed' && company.extractedData
    );
  }

  // Get companies by extraction status
  getCompaniesByExtractionStatus(status: StoredCompanyData['extractionStatus']): StoredCompanyData[] {
    return Array.from(this.storedCompanies.values()).filter(
      company => company.extractionStatus === status
    );
  }

  // Update extraction status
  async updateExtractionStatus(companyId: string, status: StoredCompanyData['extractionStatus']): Promise<void> {
    const storedCompany = this.storedCompanies.get(companyId);
    if (!storedCompany) {
      throw new Error(`Company ${companyId} not found in storage`);
    }

    storedCompany.extractionStatus = status;
    if (status === 'completed') {
      storedCompany.lastExtractionDate = new Date();
    }

    this.storedCompanies.set(companyId, storedCompany);
    await this.saveCompanyDataToStorage(companyId, storedCompany);
  }

  // Search stored companies
  searchStoredCompanies(query: string): StoredCompanyData[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.storedCompanies.values()).filter(company =>
      company.company.name.toLowerCase().includes(searchTerm) ||
      company.company.industry.toLowerCase().includes(searchTerm) ||
      company.company.country.toLowerCase().includes(searchTerm)
    );
  }

  // Get storage statistics
  getStorageStatistics(): StorageStatistics {
    const totalCompanies = this.storedCompanies.size;
    const totalJobs = this.storedJobs.size;
    const totalExtractedData = this.getCompaniesWithExtractedData().length;
    
    // Calculate total storage size (simulated)
    const totalStorageSize = totalCompanies * 1024 + totalJobs * 2048 + totalExtractedData * 5120; // KB
    const averageFileSize = totalCompanies > 0 ? totalStorageSize / totalCompanies : 0;

    // Determine storage health
    let storageHealth: StorageStatistics['storageHealth'] = 'healthy';
    if (totalStorageSize > 1000000000) { // 1GB
      storageHealth = 'warning';
    }
    if (totalStorageSize > 5000000000) { // 5GB
      storageHealth = 'critical';
    }

    return {
      totalCompanies,
      totalJobs,
      totalExtractedData,
      totalStorageSize,
      averageFileSize,
      storageHealth
    };
  }

  // Create backup
  async createBackup(backupType: 'daily' | 'weekly' | 'monthly'): Promise<string> {
    const backupId = `backup_${backupType}_${Date.now()}`;
    const backupPath = `${this.backupDirectory}/${backupType}/${backupId}`;

    try {
      // In a real implementation, you would:
      // 1. Create a compressed archive of all storage data
      // 2. Include metadata about the backup
      // 3. Store backup information in a registry
      
      const backupData = {
        id: backupId,
        type: backupType,
        createdAt: new Date(),
        companies: Array.from(this.storedCompanies.values()),
        jobs: Array.from(this.storedJobs.values()),
        statistics: this.getStorageStatistics()
      };

      console.log(`Created backup: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error(`Failed to create backup:`, error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Extract the backup archive
      // 2. Validate the backup data
      // 3. Restore all data to storage
      
      console.log(`Restoring from backup: ${backupPath}`);
      
      // For now, we'll just reload the initial data
      await this.loadStoredData();
    } catch (error) {
      console.error(`Failed to restore from backup:`, error);
      throw error;
    }
  }

  // Clean up old data
  async cleanupOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let cleanedCount = 0;

    // Clean up old jobs
    for (const [jobId, storedJob] of this.storedJobs.entries()) {
      if (storedJob.job.completedAt && storedJob.job.completedAt < cutoffDate) {
        this.storedJobs.delete(jobId);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} old records`);
    return cleanedCount;
  }

  // Export data
  async exportData(format: 'json' | 'csv' | 'excel'): Promise<string> {
    const exportId = `export_${format}_${Date.now()}`;
    const exportPath = `${this.storageDirectory}/exports/${exportId}.${format}`;

    try {
      const exportData = {
        companies: Array.from(this.storedCompanies.values()),
        jobs: Array.from(this.storedJobs.values()),
        statistics: this.getStorageStatistics(),
        exportedAt: new Date()
      };

      // In a real implementation, you would format the data according to the specified format
      console.log(`Exported data to: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error(`Failed to export data:`, error);
      throw error;
    }
  }

  // Private helper methods
  private async saveCompanyDataToStorage(companyId: string, data: StoredCompanyData): Promise<void> {
    // In a real implementation, you would save to database or file system
    console.log(`Saving company data for ${companyId}`);
  }

  private async saveJobToStorage(jobId: string, data: StoredCollectionJob): Promise<void> {
    // In a real implementation, you would save to database or file system
    console.log(`Saving job data for ${jobId}`);
  }

  private generateFileHash(data: any): string {
    // In a real implementation, you would generate a proper hash
    return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get service instances
  getCompanyDataService(): CompanyDataService {
    return this.companyDataService;
  }

  getDataCollectionService(): DataCollectionService {
    return this.dataCollectionService;
  }
}