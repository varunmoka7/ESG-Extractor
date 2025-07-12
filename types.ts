


export enum KPICategory {
  ENVIRONMENTAL = "Environmental",
  SOCIAL = "Social",
  GOVERNANCE = "Governance",
}

export interface ReportFileInput {
  text: string;
  images: string[]; // Array of base64 encoded image strings
}

export interface KPI {
  name: string;
  value: string;
  metric_type: string;
  year: number;
  reference: string;
  confidence_score?: number;
  confidence_reasoning?: string;
  quality_flags?: string[];
  validation_status?: 'valid' | 'warning' | 'error';
  // Traceability fields
  source_text?: string; // The exact sentence or paragraph from which the metric was extracted
  source_file?: string; // The file name or URL of the source document
  source_page?: number; // The page number in the source document (if applicable)
  extraction_timestamp?: string; // ISO timestamp of when the metric was extracted
}

export interface GeminiKPI { // The structure Gemini is asked to return
  name: string;
  value: string | number;
  metric_type: string;
  year?: number | string;
  reference?: string;

  // New detailed fields for V1 Standard Extractor enhancement
  category_detail?: string;
  target_value?: string | number;
  target_year?: number | string;
  baseline_value?: string | number;
  baseline_year?: number | string;
  policy_name?: string;
  commitment_description?: string;
  methodology_standards?: string;
  data_assurance?: string;
  scope_boundary_details?: string;
  qualitative_notes?: string;
}

export interface GeminiESGResponse {
  environmental: GeminiKPI[];
  social: GeminiKPI[];
  governance: GeminiKPI[];
}

export interface ExtractedESGData {
  environmental: KPI[];
  social: KPI[];
  governance: KPI[];
}

// --- V2 Lever-based Extraction Types ---

export enum LeverKey {
  LEVER_1_1_STATIONARY_COMBUSTION = "lever_1_1_stationary_combustion",
  LEVER_1_2_MOBILE_COMBUSTION = "lever_1_2_mobile_combustion",
  LEVER_1_4_FUGITIVE_EMISSIONS = "lever_1_4_fugitive_emissions",
  LEVER_2_1_PURCHASED_ELECTRICITY = "lever_2_1_purchased_electricity",
  LEVER_3_1_PURCHASED_GOODS_SERVICES = "lever_3_1_purchased_goods_services",
  LEVER_3_3_FUEL_ENERGY_RELATED_ACTIVITIES = "lever_3_3_fuel_energy_related_activities",
  LEVER_3_4_UPSTREAM_TRANSPORTATION_DISTRIBUTION = "lever_3_4_upstream_transportation_distribution",
  LEVER_3_6_BUSINESS_TRAVEL = "lever_3_6_business_travel",
  LEVER_3_8_DOWNSTREAM_TRANSPORTATION_DISTRIBUTION = "lever_3_8_downstream_transportation_distribution",
  LEVER_3_10_USE_OF_SOLD_PRODUCTS = "lever_3_10_use_of_sold_products",
}

// For V2, V3, V4, V5 the KPI structure remains simpler unless a similar enhancement is requested for them.
// We use a specific type for their KPIs to avoid confusion, even if structurally similar to the base KPI for now.
export interface SimpleKPI {
  id: string; 
  name: string;
  value: string | number;
  metric_type: string; 
  year?: number | string;
  reference?: string;
}
export interface GeminiSimpleKPI {
  name: string;
  value: string | number;
  metric_type: string;
  year?: number | string;
  reference?: string;
}


export type LeverKPI = SimpleKPI; 
export type GeminiLeverKPI = GeminiSimpleKPI;

export type GeminiLeverResponse = {
  [key in LeverKey]?: GeminiLeverKPI[];
};

export type ExtractedLeverData = {
  [key in LeverKey]?: LeverKPI[];
};

// --- V3 Banking Sector Extraction Types ---

export enum BankingLeverCategory {
  FINANCED_EMISSIONS = "FinancedEmissions",
  OPERATIONAL_SCOPE_3 = "OperationalScope3",
  CLIENT_MARKET_INFLUENCE = "ClientAndMarketInfluence",
}

export type BankingKPI = SimpleKPI;
export type GeminiBankingKPI = GeminiSimpleKPI;

export type GeminiBankingResponse = {
  [key in BankingLeverCategory]?: GeminiBankingKPI[];
};

export type ExtractedBankingData = {
  [key in BankingLeverCategory]?: BankingKPI[];
};

// --- V4 Apparel Sector Extraction Types (Enhanced) ---
export enum ApparelCategoryKey {
  COMPREHENSIVE_GHG_EMISSIONS = "comprehensive_ghg_emissions",
  WATER_MANAGEMENT = "water_management",
  CHEMICAL_MANAGEMENT = "chemical_management",
  WASTE_AND_CIRCULARITY = "waste_and_circularity",
  BIODIVERSITY_AND_NATURE = "biodiversity_and_nature",
  SUPPLY_CHAIN_TRANSPARENCY = "supply_chain_transparency",
  FUTURE_PLANNING_AND_TARGETS = "future_planning_and_targets",
  INTEGRATED_PERFORMANCE_EXTRACTION = "integrated_performance_extraction", 
}

export type ApparelKPI = SimpleKPI; 
export type GeminiApparelKPI = GeminiSimpleKPI; 

export type GeminiApparelResponse = {
  [key in ApparelCategoryKey]?: GeminiApparelKPI[];
};

export type ExtractedApparelData = {
  [key in ApparelCategoryKey]?: ApparelKPI[];
};

// --- V5 Waste Management Extraction Types (Self-Review Framework) ---

// Extraction Summary and Quality Control (with ID for React keys if needed)
export interface ExtractionSummary {
    total_metrics_found: number;
    duplications_eliminated: number;
    quality_flags: string[];
    treatment_methods_covered: string[];
    governance_items_prioritized: number;
}
export interface QualityControlNotes {
    duplications_resolved: string[];
    classification_adjustments: string[];
    missing_data_flags: string[];
    clarification_needed: string[];
}

// Generic Metric Interfaces (for React rendering, with ID)
export interface EnhancedWasteMetricBase {
    id: string;
    metric: string;
    value: string | number;
    unit: string;
    reference: string;
}

export interface EnhancedWasteMetric extends EnhancedWasteMetricBase {
    year?: number | string;
}

export interface EnhancedWasteCoreCDPMetric extends EnhancedWasteMetricBase {
    year?: number | string;
    scope_emissions_related?: boolean;
    carbon_equivalent?: string;
    material_type?: string;
    carbon_benefit?: string;
}

export interface EnhancedWasteCarbonIntegratedMetric extends EnhancedWasteMetricBase {
    scope?: "1" | "2" | "3";
}

export interface EnhancedWasteScopeEmissionMetric extends EnhancedWasteMetricBase {
    emission_source: string; 
    treatment_method: string;
}

export interface EnhancedPolicyFramework {
    id: string;
    policyName?: string;
    scope?: string;
    boardApproved?: boolean;
    carbonTargetsIncluded?: boolean;
    treatmentMethodsCovered?: string[];
    scopeEmissionsAddressed?: string[];
    missingElements?: string;
    reference: string;
}

export interface EnhancedGovernanceStructure {
    id:string;
    roleTitle?: string;
    carbonWasteIntegration?: boolean;
    reportingLevel?: string;
    treatmentOversight?: string[];
    scopeEmissionsAccountability?: string[];
    boardReporting?: boolean;
    reference: string;
}

// Gemini Response Interfaces (without ID)
export interface GeminiEnhancedWasteMetricBase {
    metric: string;
    value: string | number;
    unit: string;
    reference: string;
}
export interface GeminiEnhancedWasteMetric extends GeminiEnhancedWasteMetricBase {
    year?: number | string;
}

export interface GeminiEnhancedWasteCoreCDPMetric extends GeminiEnhancedWasteMetricBase {
    year?: number | string;
    scope_emissions_related?: boolean;
    carbon_equivalent?: string;
    material_type?: string;
    carbon_benefit?: string;
}

export interface GeminiEnhancedWasteCarbonIntegratedMetric extends GeminiEnhancedWasteMetricBase {
    scope?: "1" | "2" | "3";
}

export interface GeminiEnhancedWasteScopeEmissionMetric extends GeminiEnhancedWasteMetricBase {
    emission_source: string;
    treatment_method: string;
}

export interface GeminiEnhancedPolicyFramework {
    policyName?: string;
    scope?: string;
    boardApproved?: boolean;
    carbonTargetsIncluded?: boolean;
    treatmentMethodsCovered?: string[];
    scopeEmissionsAddressed?: string[];
    missingElements?: string;
    reference: string;
}

export interface GeminiEnhancedGovernanceStructure {
    roleTitle?: string;
    carbonWasteIntegration?: boolean;
    reportingLevel?: string;
    treatmentOversight?: string[];
    scopeEmissionsAccountability?: string[];
    boardReporting?: boolean;
    reference: string;
}


// Main Gemini and Extracted Data structures
export type GeminiWasteResponse = {
    extraction_summary?: ExtractionSummary;
    quality_control_notes?: QualityControlNotes;
    lever_design_zero_waste?: {
        core_cdp_metrics?: GeminiEnhancedWasteCoreCDPMetric[];
        carbon_integrated_metrics?: GeminiEnhancedWasteCarbonIntegratedMetric[];
        prevention_metrics?: GeminiEnhancedWasteMetric[];
    };
    lever_material_recovery?: {
        core_cdp_metrics?: GeminiEnhancedWasteCoreCDPMetric[];
        treatment_specific?: {
            recycling?: GeminiEnhancedWasteMetric[];
            composting?: GeminiEnhancedWasteMetric[];
            wastewater_treatment?: GeminiEnhancedWasteMetric[];
        };
        circular_economy_metrics?: GeminiEnhancedWasteMetric[];
    };
    lever_waste_to_energy?: {
        landfill_gas_to_energy?: GeminiEnhancedWasteMetric[];
        waste_to_energy_incineration?: GeminiEnhancedWasteMetric[];
        incineration_without_recovery?: GeminiEnhancedWasteMetric[];
        energy_recovery_metrics?: GeminiEnhancedWasteMetric[];
    };
    lever_regulatory_compliance?: {
        zero_waste_metrics?: GeminiEnhancedWasteMetric[];
        compliance_metrics?: GeminiEnhancedWasteMetric[];
        stewardship_metrics?: GeminiEnhancedWasteMetric[];
    };
    carbon_treatment_analysis?: {
        landfill_carbon?: GeminiEnhancedWasteMetric[];
        incineration_carbon?: GeminiEnhancedWasteMetric[];
        recycling_carbon?: GeminiEnhancedWasteMetric[];
        composting_carbon?: GeminiEnhancedWasteMetric[];
        wastewater_carbon?: GeminiEnhancedWasteMetric[];
    };
    scope_emissions_waste?: {
        scope_1?: GeminiEnhancedWasteScopeEmissionMetric[];
        scope_2?: GeminiEnhancedWasteScopeEmissionMetric[];
        scope_3?: GeminiEnhancedWasteScopeEmissionMetric[];
    };
    governanceIntelligence?: {
        policyFrameworks?: GeminiEnhancedPolicyFramework[];
        governanceStructures?: GeminiEnhancedGovernanceStructure[];
    };
}

export type ExtractedWasteData = {
    extraction_summary?: ExtractionSummary;
    quality_control_notes?: QualityControlNotes;
    lever_design_zero_waste?: {
        core_cdp_metrics?: EnhancedWasteCoreCDPMetric[];
        carbon_integrated_metrics?: EnhancedWasteCarbonIntegratedMetric[];
        prevention_metrics?: EnhancedWasteMetric[];
    };
    lever_material_recovery?: {
        core_cdp_metrics?: EnhancedWasteCoreCDPMetric[];
        treatment_specific?: {
            recycling?: EnhancedWasteMetric[];
            composting?: EnhancedWasteMetric[];
            wastewater_treatment?: EnhancedWasteMetric[];
        };
        circular_economy_metrics?: EnhancedWasteMetric[];
    };
    lever_waste_to_energy?: {
        landfill_gas_to_energy?: EnhancedWasteMetric[];
        waste_to_energy_incineration?: EnhancedWasteMetric[];
        incineration_without_recovery?: EnhancedWasteMetric[];
        energy_recovery_metrics?: EnhancedWasteMetric[];
    };
    lever_regulatory_compliance?: {
        zero_waste_metrics?: EnhancedWasteMetric[];
        compliance_metrics?: EnhancedWasteMetric[];
        stewardship_metrics?: EnhancedWasteMetric[];
    };
    carbon_treatment_analysis?: {
        landfill_carbon?: EnhancedWasteMetric[];
        incineration_carbon?: EnhancedWasteMetric[];
        recycling_carbon?: EnhancedWasteMetric[];
        composting_carbon?: EnhancedWasteMetric[];
        wastewater_carbon?: EnhancedWasteMetric[];
    };
    scope_emissions_waste?: {
        scope_1?: EnhancedWasteScopeEmissionMetric[];
        scope_2?: EnhancedWasteScopeEmissionMetric[];
        scope_3?: EnhancedWasteScopeEmissionMetric[];
    };
    governanceIntelligence?: {
        policyFrameworks?: EnhancedPolicyFramework[];
        governanceStructures?: EnhancedGovernanceStructure[];
    };
}


// --- Performance Report Types ---
export interface KPIAnalysis {
  kpiName: string;
  kpiValue: string | number;
  explanation: string;
  rating?: string; 
}

export interface PerformanceCategoryRating {
  categoryName: string; 
  rating: string; 
  explanation: string; 
  keyKpiAnalyses: KPIAnalysis[]; 
}

export interface PerformanceReportData {
  reportTitle: string;
  overallESGRating: {
    rating: string;
    summary: string;
  };
  categoryRatings: PerformanceCategoryRating[];
  overallAnalysis: string; 
  generatedDate: string; 
}

// Multi-Stage Processing Types
export interface ProcessingStage {
  process(content: string, metadata: any): Promise<{ data: KpiData[]; confidence?: number }>;
}

export interface ProcessingResult {
  success: boolean;
  data: KpiData[];
  metadata: {
    processingTime: number;
    stagesExecuted: Array<{
      name: string;
      success: boolean;
      processingTime: number;
    }>;
    errors: Array<{
      stage: string;
      error: string;
      timestamp: string;
    }>;
    warnings: string[];
  };
  confidence: number;
  traceability: TraceabilityInfo;
}

// Framework Intelligence Types
export interface FrameworkMapping {
  kpiId: string;
  frameworkId: string;
  frameworkName: string;
  matchedMetrics: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  complianceStatus: 'compliant' | 'partial' | 'non-compliant';
}

export interface ComplianceScore {
  overall: number;
  byFramework: Record<string, number>;
  recommendations: string[];
}

// ML QA Types
export interface QaResult {
  isValid: boolean;
  confidence: number;
  issues: QaIssue[];
  suggestions: string[];
  modelUsed: string;
}

export interface QaIssue {
  type: 'outlier' | 'consistency' | 'format' | 'range' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  field?: string;
  expectedValue?: any;
  actualValue?: any;
  confidence: number;
}

export interface QaCorrection {
  id: string;
  originalKpi: KpiData;
  correctedKpi: KpiData;
  reason: string;
  modelsInvolved: string[];
  timestamp: Date;
  userFeedback?: string;
}

export interface ValidationRule {
  type: 'range' | 'format' | 'presence' | 'consistency';
  value: any;
  message: string;
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  overallStats: {
    totalProcessed: number;
    successfulProcessed: number;
    failedProcessed: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
    errorRate: number;
    throughput: number;
    lastUpdated: Date;
  };
  stagePerformance: Array<{
    stageName: string;
    totalExecutions: number;
    successfulExecutions: number;
    averageDuration: number;
    totalDuration: number;
    errorRate: number;
    lastExecution: Date;
  }>;
  systemHealth: SystemHealth;
  errorLogs: ErrorLog[];
  generatedAt: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueSize: number;
  lastUpdated: Date;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  stage: string;
  error: string;
  metadata: Record<string, any>;
}

// Intelligent Ingestion Types
export type FileType = 'pdf' | 'excel' | 'xbrl' | 'html' | 'text' | 'unknown';

export interface IngestionResult {
  success: boolean;
  data: KpiData[];
  metadata: {
    fileType: FileType;
    fileName: string;
    fileSize: number;
    processingTime: number;
    parserUsed: string;
    confidence: number;
    contentAnalysis?: ContentAnalysis;
    error?: string;
  };
  confidence: number;
  traceability: TraceabilityInfo;
}

export interface ContentAnalysis {
  language: string;
  keyPhrases: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  wordCount: number;
  characterCount: number;
  hasNumbers: boolean;
  hasTables: boolean;
  hasCharts: boolean;
}

// Compliance Scoring Types
export interface ComplianceReport {
  assessments: Array<{
    frameworkId: string;
    frameworkName: string;
    overallScore: number;
    categoryScores: Record<string, number>;
    requirementScores: Record<string, number>;
    gaps: Array<{
      requirementId: string;
      requirementName: string;
      categoryId: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      impact: string;
      remediation: string;
      estimatedEffort: 'low' | 'medium' | 'high';
    }>;
    strengths: string[];
    recommendations: string[];
    lastUpdated: Date;
  }>;
  overallScore: number;
  generatedAt: Date;
  summary: {
    totalFrameworks: number;
    averageScore: number;
    criticalGaps: number;
    highPriorityGaps: number;
  };
}

// Advanced Carbon Analysis Types
export interface CarbonAnalysis {
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    year: number;
    scope: 1 | 2 | 3;
    category: string;
    source: string;
    confidence: number;
    methodology: string;
  }>;
  calculation: {
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    totalEmissions: number;
    intensityMetrics: {
      revenueIntensity: number;
      productionIntensity: number;
      employeeIntensity: number;
      energyIntensity: number;
    };
    breakdown: {
      bySource: Record<string, number>;
      byCategory: Record<string, number>;
      byLocation: Record<string, number>;
      byBusinessUnit: Record<string, number>;
    };
    uncertainty: number;
  };
  scenarios: Array<{
    id: string;
    name: string;
    description: string;
    assumptions: Record<string, any>;
    projectedEmissions: number;
    reductionPotential: number;
    costEstimate: number;
    timeline: number;
    confidence: number;
  }>;
  trends: Array<{
    period: string;
    emissions: number;
    intensity: number;
    growthRate: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  }>;
  benchmark?: {
    industry: string;
    peerGroup: string;
    averageEmissions: number;
    bestInClass: number;
    percentile: number;
    gap: number;
    recommendations: string[];
  };
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

// Enhanced KPI Data with Traceability
export interface KpiData {
  id: string;
  name: string;
  value: number;
  unit: string;
  year: number;
  category: string;
  description?: string;
  source?: string;
  confidence?: number;
  traceability: TraceabilityInfo;
}

export interface TraceabilityInfo {
  sourceText: string;
  sourceFile: string;
  page: number;
  timestamp: string;
}

declare global {
  const pdfjsLib: any;
}