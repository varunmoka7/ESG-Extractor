import { KpiData, FrameworkMapping, ComplianceScore } from '../types';

export interface FrameworkDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: string[];
  metrics: FrameworkMetric[];
  requirements: FrameworkRequirement[];
}

export interface FrameworkMetric {
  id: string;
  name: string;
  description: string;
  unit: string;
  category: string;
  required: boolean;
  aliases: string[];
  calculationMethod?: string;
}

export interface FrameworkRequirement {
  id: string;
  description: string;
  category: string;
  mandatory: boolean;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  type: 'range' | 'format' | 'presence' | 'consistency';
  value: any;
  message: string;
}

export interface FrameworkDetectionResult {
  detectedFrameworks: DetectedFramework[];
  confidence: number;
  recommendations: string[];
}

export interface DetectedFramework {
  framework: FrameworkDefinition;
  confidence: number;
  matchedMetrics: string[];
  matchedRequirements: string[];
}

export class FrameworkIntelligence {
  private frameworks: Map<string, FrameworkDefinition> = new Map();
  private detectionPatterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializeFrameworks();
    this.initializeDetectionPatterns();
  }

  private initializeFrameworks(): void {
    // GRI Standards
    const griFramework: FrameworkDefinition = {
      id: 'gri',
      name: 'Global Reporting Initiative (GRI)',
      version: '2021',
      description: 'Global sustainability reporting standards',
      categories: ['Environmental', 'Social', 'Governance'],
      metrics: [
        {
          id: 'gri-305-1',
          name: 'Direct (Scope 1) GHG emissions',
          description: 'Gross direct (Scope 1) GHG emissions in metric tons of CO2 equivalent',
          unit: 'tCO2e',
          category: 'Environmental',
          required: true,
          aliases: ['scope 1 emissions', 'direct emissions', 'GHG emissions', 'carbon emissions']
        },
        {
          id: 'gri-305-2',
          name: 'Energy indirect (Scope 2) GHG emissions',
          description: 'Gross energy indirect (Scope 2) GHG emissions in metric tons of CO2 equivalent',
          unit: 'tCO2e',
          category: 'Environmental',
          required: true,
          aliases: ['scope 2 emissions', 'indirect emissions', 'energy emissions']
        },
        {
          id: 'gri-413-1',
          name: 'Operations with local community engagement',
          description: 'Operations with significant actual and potential negative impacts on local communities',
          unit: 'number',
          category: 'Social',
          required: false,
          aliases: ['community engagement', 'local community', 'social impact']
        }
      ],
      requirements: [
        {
          id: 'gri-101',
          description: 'Foundation - General Disclosures',
          category: 'Governance',
          mandatory: true,
          validationRules: [
            { type: 'presence', value: true, message: 'Organization profile must be disclosed' }
          ]
        }
      ]
    };

    // SASB Standards
    const sasbFramework: FrameworkDefinition = {
      id: 'sasb',
      name: 'Sustainability Accounting Standards Board (SASB)',
      version: '2018',
      description: 'Industry-specific sustainability accounting standards',
      categories: ['Environment', 'Social Capital', 'Human Capital', 'Business Model', 'Leadership'],
      metrics: [
        {
          id: 'sasb-env-1',
          name: 'GHG Emissions',
          description: 'Total GHG emissions and intensity',
          unit: 'tCO2e',
          category: 'Environment',
          required: true,
          aliases: ['greenhouse gas', 'carbon footprint', 'emissions intensity']
        }
      ],
      requirements: [
        {
          id: 'sasb-gen',
          description: 'General Issue Category',
          category: 'Governance',
          mandatory: true,
          validationRules: [
            { type: 'presence', value: true, message: 'General issue category must be addressed' }
          ]
        }
      ]
    };

    // TCFD Framework
    const tcfdFramework: FrameworkDefinition = {
      id: 'tcfd',
      name: 'Task Force on Climate-related Financial Disclosures (TCFD)',
      version: '2017',
      description: 'Climate-related financial risk disclosure framework',
      categories: ['Governance', 'Strategy', 'Risk Management', 'Metrics and Targets'],
      metrics: [
        {
          id: 'tcfd-metrics-1',
          name: 'Climate-related metrics',
          description: 'Metrics used to assess climate-related risks and opportunities',
          unit: 'various',
          category: 'Metrics and Targets',
          required: true,
          aliases: ['climate metrics', 'climate risk', 'climate opportunity']
        }
      ],
      requirements: [
        {
          id: 'tcfd-gov-1',
          description: 'Governance - Board oversight',
          category: 'Governance',
          mandatory: true,
          validationRules: [
            { type: 'presence', value: true, message: 'Board oversight of climate-related risks must be disclosed' }
          ]
        }
      ]
    };

    this.frameworks.set('gri', griFramework);
    this.frameworks.set('sasb', sasbFramework);
    this.frameworks.set('tcfd', tcfdFramework);
  }

  private initializeDetectionPatterns(): void {
    // GRI patterns
    this.detectionPatterns.set('gri', [
      /GRI|Global Reporting Initiative/i,
      /GRI-\d+/g,
      /sustainability report/i,
      /ESG report/i,
      /scope [12] emissions/i,
      /greenhouse gas|GHG/i
    ]);

    // SASB patterns
    this.detectionPatterns.set('sasb', [
      /SASB|Sustainability Accounting Standards Board/i,
      /industry-specific/i,
      /materiality assessment/i,
      /financial materiality/i
    ]);

    // TCFD patterns
    this.detectionPatterns.set('tcfd', [
      /TCFD|Task Force on Climate-related Financial Disclosures/i,
      /climate-related financial risk/i,
      /climate scenario analysis/i,
      /transition risk|physical risk/i
    ]);
  }

  detectFrameworks(content: string): FrameworkDetectionResult {
    const detectedFrameworks: DetectedFramework[] = [];
    let totalConfidence = 0;

    for (const [frameworkId, patterns] of this.detectionPatterns) {
      const framework = this.frameworks.get(frameworkId);
      if (!framework) continue;

      let matches = 0;
      let totalPatterns = patterns.length;

      for (const pattern of patterns) {
        const patternMatches = content.match(pattern);
        if (patternMatches) {
          matches += patternMatches.length;
        }
      }

      const confidence = matches / totalPatterns;
      if (confidence > 0.1) { // Threshold for detection
        const matchedMetrics = this.findMatchedMetrics(content, framework);
        const matchedRequirements = this.findMatchedRequirements(content, framework);

        detectedFrameworks.push({
          framework,
          confidence,
          matchedMetrics,
          matchedRequirements
        });

        totalConfidence += confidence;
      }
    }

    const recommendations = this.generateRecommendations(detectedFrameworks);

    return {
      detectedFrameworks: detectedFrameworks.sort((a, b) => b.confidence - a.confidence),
      confidence: detectedFrameworks.length > 0 ? totalConfidence / detectedFrameworks.length : 0,
      recommendations
    };
  }

  private findMatchedMetrics(content: string, framework: FrameworkDefinition): string[] {
    const matchedMetrics: string[] = [];
    
    for (const metric of framework.metrics) {
      const searchTerms = [metric.name, ...metric.aliases];
      for (const term of searchTerms) {
        if (content.toLowerCase().includes(term.toLowerCase())) {
          matchedMetrics.push(metric.id);
          break;
        }
      }
    }

    return matchedMetrics;
  }

  private findMatchedRequirements(content: string, framework: FrameworkDefinition): string[] {
    const matchedRequirements: string[] = [];
    
    for (const requirement of framework.requirements) {
      if (content.toLowerCase().includes(requirement.description.toLowerCase())) {
        matchedRequirements.push(requirement.id);
      }
    }

    return matchedRequirements;
  }

  private generateRecommendations(detectedFrameworks: DetectedFramework[]): string[] {
    const recommendations: string[] = [];

    if (detectedFrameworks.length === 0) {
      recommendations.push('No specific ESG frameworks detected. Consider using GRI, SASB, or TCFD standards.');
      return recommendations;
    }

    for (const detected of detectedFrameworks) {
      if (detected.confidence > 0.7) {
        recommendations.push(`Strong ${detected.framework.name} alignment detected. Ensure all mandatory metrics are reported.`);
      } else if (detected.confidence > 0.3) {
        recommendations.push(`Partial ${detected.framework.name} alignment. Review missing metrics and requirements.`);
      }
    }

    // Cross-framework recommendations
    const frameworkIds = detectedFrameworks.map(d => d.framework.id);
    if (frameworkIds.includes('gri') && frameworkIds.includes('sasb')) {
      recommendations.push('Both GRI and SASB detected. Consider integrated reporting approach.');
    }

    return recommendations;
  }

  mapToFrameworks(kpiData: KpiData[]): FrameworkMapping[] {
    const mappings: FrameworkMapping[] = [];

    for (const kpi of kpiData) {
      for (const [frameworkId, framework] of this.frameworks) {
        const matchedMetrics = framework.metrics.filter(metric => 
          this.metricMatchesKpi(kpi, metric)
        );

        if (matchedMetrics.length > 0) {
          mappings.push({
            kpiId: kpi.id,
            frameworkId,
            frameworkName: framework.name,
            matchedMetrics: matchedMetrics.map(m => ({
              id: m.id,
              name: m.name,
              confidence: this.calculateMappingConfidence(kpi, m)
            })),
            complianceStatus: this.assessCompliance(kpi, matchedMetrics[0])
          });
        }
      }
    }

    return mappings;
  }

  private metricMatchesKpi(kpi: KpiData, metric: FrameworkMetric): boolean {
    const kpiText = `${kpi.name} ${kpi.description} ${kpi.category}`.toLowerCase();
    const metricText = `${metric.name} ${metric.description} ${metric.aliases.join(' ')}`.toLowerCase();

    // Check for exact matches
    if (kpiText.includes(metric.name.toLowerCase()) || 
        metric.aliases.some(alias => kpiText.includes(alias.toLowerCase()))) {
      return true;
    }

    // Check for semantic similarity (basic implementation)
    const kpiWords = kpiText.split(/\s+/);
    const metricWords = metricText.split(/\s+/);
    const commonWords = kpiWords.filter(word => metricWords.includes(word));
    
    return commonWords.length >= 2; // At least 2 common words
  }

  private calculateMappingConfidence(kpi: KpiData, metric: FrameworkMetric): number {
    const kpiText = `${kpi.name} ${kpi.description}`.toLowerCase();
    const metricText = `${metric.name} ${metric.description}`.toLowerCase();

    // Simple word overlap calculation
    const kpiWords = new Set(kpiText.split(/\s+/));
    const metricWords = new Set(metricText.split(/\s+/));
    
    const intersection = new Set([...kpiWords].filter(x => metricWords.has(x)));
    const union = new Set([...kpiWords, ...metricWords]);
    
    return intersection.size / union.size;
  }

  private assessCompliance(kpi: KpiData, metric: FrameworkMetric): 'compliant' | 'partial' | 'non-compliant' {
    if (!kpi.value || kpi.value === 0) {
      return metric.required ? 'non-compliant' : 'partial';
    }

    // Basic compliance check - can be enhanced with more sophisticated validation
    return 'compliant';
  }

  calculateComplianceScore(mappings: FrameworkMapping[]): ComplianceScore {
    const totalMappings = mappings.length;
    if (totalMappings === 0) {
      return { overall: 0, byFramework: {}, recommendations: [] };
    }

    const byFramework: Record<string, number> = {};
    const frameworkCounts: Record<string, number> = {};

    for (const mapping of mappings) {
      const frameworkId = mapping.frameworkId;
      frameworkCounts[frameworkId] = (frameworkCounts[frameworkId] || 0) + 1;

      const complianceValue = mapping.complianceStatus === 'compliant' ? 1 : 
                             mapping.complianceStatus === 'partial' ? 0.5 : 0;
      
      byFramework[frameworkId] = (byFramework[frameworkId] || 0) + complianceValue;
    }

    // Calculate overall score
    const totalCompliance = Object.values(byFramework).reduce((sum, score) => sum + score, 0);
    const overall = totalCompliance / totalMappings;

    // Normalize by-framework scores
    for (const frameworkId in byFramework) {
      byFramework[frameworkId] = byFramework[frameworkId] / frameworkCounts[frameworkId];
    }

    const recommendations = this.generateComplianceRecommendations(mappings, byFramework);

    return {
      overall,
      byFramework,
      recommendations
    };
  }

  private generateComplianceRecommendations(mappings: FrameworkMapping[], byFramework: Record<string, number>): string[] {
    const recommendations: string[] = [];

    for (const [frameworkId, score] of Object.entries(byFramework)) {
      if (score < 0.5) {
        recommendations.push(`Improve ${frameworkId.toUpperCase()} compliance - current score: ${(score * 100).toFixed(1)}%`);
      }
    }

    const nonCompliantMappings = mappings.filter(m => m.complianceStatus === 'non-compliant');
    if (nonCompliantMappings.length > 0) {
      recommendations.push(`Address ${nonCompliantMappings.length} non-compliant metrics`);
    }

    return recommendations;
  }

  getFrameworkDefinitions(): FrameworkDefinition[] {
    return Array.from(this.frameworks.values());
  }

  getFrameworkById(id: string): FrameworkDefinition | undefined {
    return this.frameworks.get(id);
  }
} 