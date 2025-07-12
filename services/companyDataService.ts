import { v4 as uuidv4 } from 'uuid';

export interface Company {
  id: string;
  name: string;
  industry: string;
  country: string;
  website: string;
  sustainabilityReportUrl?: string;
  reportYear?: number;
  reportType?: 'sustainability' | 'esg' | 'integrated' | 'annual';
  reportLanguage?: string;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'pending';
  metadata?: Record<string, any>;
}

export interface GermanBank extends Company {
  bankType: 'commercial' | 'savings' | 'cooperative' | 'development' | 'investment';
  assets?: number; // in EUR
  employees?: number;
  headquarters: string;
  regulatoryAuthority?: string;
  sustainabilityReportPdfUrl?: string;
  sustainabilityReportHtmlUrl?: string;
  reportAccessMethod?: 'direct' | 'login_required' | 'contact_required';
  reportNotes?: string;
}

export interface DataCollectionTask {
  id: string;
  companyId: string;
  taskType: 'report_download' | 'data_extraction' | 'url_verification';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export class CompanyDataService {
  private companies: Map<string, Company> = new Map();
  private germanBanks: Map<string, GermanBank> = new Map();
  private tasks: Map<string, DataCollectionTask> = new Map();

  constructor() {
    this.initializeGermanBanks();
  }

  private initializeGermanBanks(): void {
    const germanBanksData: GermanBank[] = [
      {
        id: uuidv4(),
        name: 'Deutsche Bank',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.deutsche-bank.de',
        bankType: 'commercial',
        assets: 1312000000000, // 1.312 trillion EUR
        employees: 84000,
        headquarters: 'Frankfurt am Main',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.deutsche-bank.de/ir/en/sustainability/sustainability-reports.html',
        sustainabilityReportPdfUrl: 'https://www.deutsche-bank.de/content/dam/deutsche-bank/de/ir/downloads/sustainability/2024/Deutsche-Bank-Sustainability-Report-2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'English',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Commerzbank',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.commerzbank.de',
        bankType: 'commercial',
        assets: 463000000000, // 463 billion EUR
        employees: 38000,
        headquarters: 'Frankfurt am Main',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.commerzbank.de/en/hauptnavigation/aktionaere/berichte/sustainability-report.html',
        sustainabilityReportPdfUrl: 'https://www.commerzbank.de/media/aktionaere/berichte/sustainability-report/2024/Commerzbank_Sustainability_Report_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'English',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'DZ Bank',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.dzbank.de',
        bankType: 'cooperative',
        assets: 580000000000, // 580 billion EUR
        employees: 31000,
        headquarters: 'Frankfurt am Main',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.dzbank.de/content/dzbank_de/en/home/ueber_uns/nachhaltigkeit/nachhaltigkeitsbericht.html',
        sustainabilityReportPdfUrl: 'https://www.dzbank.de/content/dam/dzbank_de/downloads/nachhaltigkeit/nachhaltigkeitsbericht/DZ_Bank_Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'KfW Bankengruppe',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.kfw.de',
        bankType: 'development',
        assets: 507000000000, // 507 billion EUR
        employees: 7000,
        headquarters: 'Frankfurt am Main',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.kfw.de/stories/ueber-die-kfw/nachhaltigkeit/nachhaltigkeitsbericht/',
        sustainabilityReportPdfUrl: 'https://www.kfw.de/Download-Center/Konzernthemen/Nachhaltigkeit/Nachhaltigkeitsbericht/KfW-Nachhaltigkeitsbericht-2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Bayerische Landesbank (BayernLB)',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.bayernlb.de',
        bankType: 'savings',
        assets: 250000000000, // 250 billion EUR
        employees: 7000,
        headquarters: 'Munich',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.bayernlb.de/internet/de/ueber_uns/nachhaltigkeit/nachhaltigkeitsbericht/index.html',
        sustainabilityReportPdfUrl: 'https://www.bayernlb.de/internet/de/ueber_uns/nachhaltigkeit/nachhaltigkeitsbericht/Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Landesbank Baden-Württemberg (LBBW)',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.lbbw.de',
        bankType: 'savings',
        assets: 320000000000, // 320 billion EUR
        employees: 10000,
        headquarters: 'Stuttgart',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.lbbw.de/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/',
        sustainabilityReportPdfUrl: 'https://www.lbbw.de/content/dam/lbbw/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/LBBW_Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Norddeutsche Landesbank (NORD/LB)',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.nordlb.de',
        bankType: 'savings',
        assets: 150000000000, // 150 billion EUR
        employees: 6000,
        headquarters: 'Hanover',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.nordlb.de/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/',
        sustainabilityReportPdfUrl: 'https://www.nordlb.de/content/dam/nordlb/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/NORD_LB_Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Helaba (Landesbank Hessen-Thüringen)',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.helaba.de',
        bankType: 'savings',
        assets: 200000000000, // 200 billion EUR
        employees: 6000,
        headquarters: 'Frankfurt am Main',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.helaba.de/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/',
        sustainabilityReportPdfUrl: 'https://www.helaba.de/content/dam/helaba/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/Helaba_Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Deutsche Kreditbank (DKB)',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.dkb.de',
        bankType: 'savings',
        assets: 45000000000, // 45 billion EUR
        employees: 2000,
        headquarters: 'Berlin',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.dkb.de/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/',
        sustainabilityReportPdfUrl: 'https://www.dkb.de/content/dam/dkb/ueber-uns/nachhaltigkeit/nachhaltigkeitsbericht/DKB_Nachhaltigkeitsbericht_2023.pdf',
        reportYear: 2023,
        reportType: 'sustainability',
        reportLanguage: 'German',
        reportAccessMethod: 'direct',
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Volkswagen Bank',
        industry: 'Banking',
        country: 'Germany',
        website: 'https://www.volkswagenbank.de',
        bankType: 'commercial',
        assets: 30000000000, // 30 billion EUR
        employees: 1000,
        headquarters: 'Braunschweig',
        regulatoryAuthority: 'BaFin',
        sustainabilityReportUrl: 'https://www.volkswagenbank.de/ueber-uns/nachhaltigkeit/',
        reportYear: 2023,
        reportType: 'integrated',
        reportLanguage: 'German',
        reportAccessMethod: 'contact_required',
        reportNotes: 'Sustainability information integrated in Volkswagen Group reports',
        lastUpdated: new Date(),
        status: 'active'
      }
    ];

    germanBanksData.forEach(bank => {
      this.germanBanks.set(bank.id, bank);
      this.companies.set(bank.id, bank);
    });
  }

  // Get all German banks
  getAllGermanBanks(): GermanBank[] {
    return Array.from(this.germanBanks.values());
  }

  // Get bank by ID
  getBankById(id: string): GermanBank | undefined {
    return this.germanBanks.get(id);
  }

  // Get bank by name
  getBankByName(name: string): GermanBank | undefined {
    return Array.from(this.germanBanks.values()).find(bank => 
      bank.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Add new company
  addCompany(company: Omit<Company, 'id' | 'lastUpdated'>): Company {
    const newCompany: Company = {
      ...company,
      id: uuidv4(),
      lastUpdated: new Date()
    };
    this.companies.set(newCompany.id, newCompany);
    return newCompany;
  }

  // Update company
  updateCompany(id: string, updates: Partial<Company>): Company | null {
    const company = this.companies.get(id);
    if (!company) return null;

    const updatedCompany: Company = {
      ...company,
      ...updates,
      lastUpdated: new Date()
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  // Delete company
  deleteCompany(id: string): boolean {
    return this.companies.delete(id) && this.germanBanks.delete(id);
  }

  // Create data collection task
  createTask(task: Omit<DataCollectionTask, 'id' | 'createdAt'>): DataCollectionTask {
    const newTask: DataCollectionTask = {
      ...task,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  // Get task by ID
  getTaskById(id: string): DataCollectionTask | undefined {
    return this.tasks.get(id);
  }

  // Get tasks by company ID
  getTasksByCompanyId(companyId: string): DataCollectionTask[] {
    return Array.from(this.tasks.values()).filter(task => task.companyId === companyId);
  }

  // Update task status
  updateTaskStatus(id: string, status: DataCollectionTask['status'], error?: string): DataCollectionTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    const updatedTask: DataCollectionTask = {
      ...task,
      status,
      error,
      startedAt: status === 'in_progress' ? new Date() : task.startedAt,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : task.completedAt
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Get all pending tasks
  getPendingTasks(): DataCollectionTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === 'pending');
  }

  // Get tasks by priority
  getTasksByPriority(priority: DataCollectionTask['priority']): DataCollectionTask[] {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  // Search companies
  searchCompanies(query: string): Company[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.companies.values()).filter(company =>
      company.name.toLowerCase().includes(searchTerm) ||
      company.industry.toLowerCase().includes(searchTerm) ||
      company.country.toLowerCase().includes(searchTerm)
    );
  }

  // Get companies by industry
  getCompaniesByIndustry(industry: string): Company[] {
    return Array.from(this.companies.values()).filter(company =>
      company.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  // Get companies by country
  getCompaniesByCountry(country: string): Company[] {
    return Array.from(this.companies.values()).filter(company =>
      company.country.toLowerCase() === country.toLowerCase()
    );
  }

  // Get statistics
  getStatistics() {
    const totalCompanies = this.companies.size;
    const totalBanks = this.germanBanks.size;
    const totalTasks = this.tasks.size;
    const pendingTasks = this.getPendingTasks().length;
    const completedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'completed').length;

    return {
      totalCompanies,
      totalBanks,
      totalTasks,
      pendingTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  }
}