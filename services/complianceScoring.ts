import { KpiData, ComplianceScore, FrameworkMapping, ComplianceReport } from '../types';

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: ComplianceCategory[];
  requirements: ComplianceRequirement[];
  scoringMethod: 'binary' | 'weighted' | 'percentage';
}

export interface ComplianceCategory {
  id: string;
  name: string;
  weight: number;
  requirements: string[];
  description: string;
}

export interface ComplianceRequirement {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  mandatory: boolean;
  weight: number;
  validationRules: ComplianceValidationRule[];
  evidenceTypes: string[];
}

export interface ComplianceValidationRule {
  type: 'presence' | 'range' | 'format' | 'consistency' | 'completeness';
  value: any;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceAssessment {
  frameworkId: string;
  frameworkName: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  requirementScores: Record<string, number>;
  gaps: ComplianceGap[];
  strengths: string[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface ComplianceGap {
  requirementId: string;
  requirementName: string;
  categoryId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface ComplianceEvidence {
  requirementId: string;
  evidenceType: string;
  description: string;
  source: string;
  confidence: number;
  timestamp: Date;
}

export class ComplianceScoring {
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();

  constructor() {
    this.initializeFrameworks();
  }

  private initializeFrameworks(): void {
    // GRI Standards Framework
    const griFramework: ComplianceFramework = {
      id: 'gri',
      name: 'Global Reporting Initiative (GRI)',
      version: '2021',
      description: 'Global sustainability reporting standards',
      scoringMethod: 'weighted',
      categories: [
        {
          id: 'environmental',
          name: 'Environmental',
          weight: 0.4,
          requirements: ['gri-305-1', 'gri-305-2', 'gri-306-1', 'gri-307-1'],
          description: 'Environmental impact and performance'
        },
        {
          id: 'social',
          name: 'Social',
          weight: 0.35,
          requirements: ['gri-413-1', 'gri-414-1', 'gri-415-1'],
          description: 'Social responsibility and stakeholder engagement'
        },
        {
          id: 'governance',
          name: 'Governance',
          weight: 0.25,
          requirements: ['gri-102-1', 'gri-103-1', 'gri-205-1'],
          description: 'Governance structure and ethics'
        }
      ],
      requirements: [
        {
          id: 'gri-305-1',
          categoryId: 'environmental',
          name: 'Direct (Scope 1) GHG emissions',
          description: 'Gross direct (Scope 1) GHG emissions in metric tons of CO2 equivalent',
          mandatory: true,
          weight: 0.3,
          validationRules: [
            {
              type: 'presence',
              value: true,
              message: 'Scope 1 emissions must be reported',
              severity: 'critical'
            },
            {
              type: 'range',
              value: { min: 0, max: 1000000 },
              message: 'Emissions value should be reasonable',
              severity: 'medium'
            }
          ],
          evidenceTypes: ['metric', 'calculation', 'verification']
        },
        {
          id: 'gri-305-2',
          categoryId: 'environmental',
          name: 'Energy indirect (Scope 2) GHG emissions',
          description: 'Gross energy indirect (Scope 2) GHG emissions in metric tons of CO2 equivalent',
          mandatory: true,
          weight: 0.3,
          validationRules: [
            {
              type: 'presence',
              value: true,
              message: 'Scope 2 emissions must be reported',
              severity: 'critical'
            }
          ],
          evidenceTypes: ['metric', 'calculation', 'verification']
        },
        {
          id: 'gri-413-1',
          categoryId: 'social',
          name: 'Operations with local community engagement',
          description: 'Operations with significant actual and potential negative impacts on local communities',
          mandatory: false,
          weight: 0.2,
          validationRules: [
            {
              type: 'presence',
              value: true,
              message: 'Community engagement should be documented',
              severity: 'medium'
            }
          ],
          evidenceTypes: ['policy', 'procedure', 'documentation']
        }
      ]
    };

    // SASB Framework
    const sasbFramework: ComplianceFramework = {
      id: 'sasb',
      name: 'Sustainability Accounting Standards Board (SASB)',
      version: '2018',
      description: 'Industry-specific sustainability accounting standards',
      scoringMethod: 'binary',
      categories: [
        {
          id: 'environment',
          name: 'Environment',
          weight: 0.4,
          requirements: ['sasb-env-1', 'sasb-env-2'],
          description: 'Environmental risks and opportunities'
        },
        {
          id: 'social-capital',
          name: 'Social Capital',
          weight: 0.3,
          requirements: ['sasb-soc-1', 'sasb-soc-2'],
          description: 'Social relationships and stakeholder engagement'
        },
        {
          id: 'human-capital',
          name: 'Human Capital',
          weight: 0.3,
          requirements: ['sasb-hum-1'],
          description: 'Human rights and labor relations'
        }
      ],
      requirements: [
        {
          id: 'sasb-env-1',
          categoryId: 'environment',
          name: 'GHG Emissions',
          description: 'Total GHG emissions and intensity',
          mandatory: true,
          weight: 0.5,
          validationRules: [
            {
              type: 'presence',
              value: true,
              message: 'GHG emissions must be reported',
              severity: 'critical'
            }
          ],
          evidenceTypes: ['metric', 'disclosure']
        }
      ]
    };

    this.frameworks.set('gri', griFramework);
    this.frameworks.set('sasb', sasbFramework);
  }

  assessCompliance(
    kpiData: KpiData[],
    frameworkId: string,
    evidence?: ComplianceEvidence[]
  ): ComplianceAssessment {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    const categoryScores: Record<string, number> = {};
    const requirementScores: Record<string, number> = {};
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];

    // Assess each category
    for (const category of framework.categories) {
      const categoryRequirements = framework.requirements.filter(req => req.categoryId === category.id);
      const categoryScore = this.assessCategory(category, categoryRequirements, kpiData, evidence);
      categoryScores[category.id] = categoryScore;
    }

    // Assess each requirement
    for (const requirement of framework.requirements) {
      const requirementScore = this.assessRequirement(requirement, kpiData, evidence);
      requirementScores[requirement.id] = requirementScore;

      // Identify gaps
      if (requirementScore < 0.5) {
        gaps.push(this.createGap(requirement, requirementScore));
      } else if (requirementScore > 0.8) {
        strengths.push(`${requirement.name}: Strong compliance (${(requirementScore * 100).toFixed(1)}%)`);
      }
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore(framework, categoryScores, requirementScores);

    // Generate recommendations
    const recommendations = this.generateRecommendations(gaps, framework);

    const assessment: ComplianceAssessment = {
      frameworkId,
      frameworkName: framework.name,
      overallScore,
      categoryScores,
      requirementScores,
      gaps,
      strengths,
      recommendations,
      lastUpdated: new Date()
    };

    this.assessments.set(`${frameworkId}_${Date.now()}`, assessment);
    return assessment;
  }

  private assessCategory(
    category: ComplianceCategory,
    requirements: ComplianceRequirement[],
    kpiData: KpiData[],
    evidence?: ComplianceEvidence[]
  ): number {
    if (requirements.length === 0) return 0;

    const requirementScores = requirements.map(req => 
      this.assessRequirement(req, kpiData, evidence)
    );

    // Weighted average based on requirement weights
    const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
    const weightedScore = requirements.reduce((sum, req, index) => 
      sum + (requirementScores[index] * req.weight), 0
    );

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private assessRequirement(
    requirement: ComplianceRequirement,
    kpiData: KpiData[],
    evidence?: ComplianceEvidence[]
  ): number {
    let score = 0;
    let totalWeight = 0;

    // Check validation rules
    for (const rule of requirement.validationRules) {
      const ruleScore = this.validateRule(rule, requirement, kpiData, evidence);
      const ruleWeight = this.getRuleWeight(rule.severity);
      
      score += ruleScore * ruleWeight;
      totalWeight += ruleWeight;
    }

    // Check evidence
    if (evidence) {
      const relevantEvidence = evidence.filter(e => e.requirementId === requirement.id);
      if (relevantEvidence.length > 0) {
        const evidenceScore = relevantEvidence.reduce((sum, e) => sum + e.confidence, 0) / relevantEvidence.length;
        score += evidenceScore * 0.3; // Evidence contributes 30% to score
        totalWeight += 0.3;
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private validateRule(
    rule: ComplianceValidationRule,
    requirement: ComplianceRequirement,
    kpiData: KpiData[],
    evidence?: ComplianceEvidence[]
  ): number {
    switch (rule.type) {
      case 'presence':
        return this.validatePresence(requirement, kpiData, evidence);
      
      case 'range':
        return this.validateRange(rule, requirement, kpiData);
      
      case 'format':
        return this.validateFormat(rule, requirement, kpiData);
      
      case 'consistency':
        return this.validateConsistency(rule, requirement, kpiData);
      
      case 'completeness':
        return this.validateCompleteness(requirement, kpiData);
      
      default:
        return 0;
    }
  }

  private validatePresence(
    requirement: ComplianceRequirement,
    kpiData: KpiData[],
    evidence?: ComplianceEvidence[]
  ): number {
    // Check if KPI data exists for this requirement
    const relevantKpis = kpiData.filter(kpi => 
      kpi.name.toLowerCase().includes(requirement.name.toLowerCase()) ||
      kpi.description.toLowerCase().includes(requirement.name.toLowerCase())
    );

    if (relevantKpis.length > 0) return 1.0;

    // Check if evidence exists
    if (evidence) {
      const relevantEvidence = evidence.filter(e => e.requirementId === requirement.id);
      if (relevantEvidence.length > 0) return 0.8;
    }

    return 0.0;
  }

  private validateRange(
    rule: ComplianceValidationRule,
    requirement: ComplianceRequirement,
    kpiData: KpiData[]
  ): number {
    const relevantKpis = kpiData.filter(kpi => 
      kpi.name.toLowerCase().includes(requirement.name.toLowerCase())
    );

    if (relevantKpis.length === 0) return 0.0;

    const range = rule.value as { min: number; max: number };
    const validKpis = relevantKpis.filter(kpi => 
      kpi.value !== undefined && 
      kpi.value >= range.min && 
      kpi.value <= range.max
    );

    return validKpis.length / relevantKpis.length;
  }

  private validateFormat(
    rule: ComplianceValidationRule,
    requirement: ComplianceRequirement,
    kpiData: KpiData[]
  ): number {
    // Basic format validation - can be enhanced
    const relevantKpis = kpiData.filter(kpi => 
      kpi.name.toLowerCase().includes(requirement.name.toLowerCase())
    );

    if (relevantKpis.length === 0) return 0.0;

    const validKpis = relevantKpis.filter(kpi => 
      kpi.name && kpi.value !== undefined && kpi.unit
    );

    return validKpis.length / relevantKpis.length;
  }

  private validateConsistency(
    rule: ComplianceValidationRule,
    requirement: ComplianceRequirement,
    kpiData: KpiData[]
  ): number {
    // Basic consistency check - can be enhanced
    const relevantKpis = kpiData.filter(kpi => 
      kpi.name.toLowerCase().includes(requirement.name.toLowerCase())
    );

    if (relevantKpis.length < 2) return 1.0; // No consistency check needed

    // Check for consistent units
    const units = [...new Set(relevantKpis.map(k => k.unit))];
    if (units.length === 1) return 1.0;

    return 0.5; // Partial consistency
  }

  private validateCompleteness(
    requirement: ComplianceRequirement,
    kpiData: KpiData[]
  ): number {
    const relevantKpis = kpiData.filter(kpi => 
      kpi.name.toLowerCase().includes(requirement.name.toLowerCase())
    );

    if (relevantKpis.length === 0) return 0.0;

    const completeKpis = relevantKpis.filter(kpi => 
      kpi.name && kpi.value !== undefined && kpi.unit && kpi.year
    );

    return completeKpis.length / relevantKpis.length;
  }

  private getRuleWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 1.0;
      case 'high': return 0.8;
      case 'medium': return 0.6;
      case 'low': return 0.4;
      default: return 0.5;
    }
  }

  private calculateOverallScore(
    framework: ComplianceFramework,
    categoryScores: Record<string, number>,
    requirementScores: Record<string, number>
  ): number {
    if (framework.scoringMethod === 'weighted') {
      // Weighted average by category
      let totalScore = 0;
      let totalWeight = 0;

      for (const category of framework.categories) {
        const categoryScore = categoryScores[category.id] || 0;
        totalScore += categoryScore * category.weight;
        totalWeight += category.weight;
      }

      return totalWeight > 0 ? totalScore / totalWeight : 0;
    } else if (framework.scoringMethod === 'binary') {
      // Binary scoring - all requirements must be met
      const mandatoryRequirements = framework.requirements.filter(req => req.mandatory);
      const metRequirements = mandatoryRequirements.filter(req => 
        (requirementScores[req.id] || 0) >= 0.8
      );

      return mandatoryRequirements.length > 0 ? 
        metRequirements.length / mandatoryRequirements.length : 0;
    } else {
      // Percentage scoring
      const allScores = Object.values(requirementScores);
      return allScores.length > 0 ? 
        allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
    }
  }

  private createGap(requirement: ComplianceRequirement, score: number): ComplianceGap {
    const severity = score < 0.2 ? 'critical' : 
                    score < 0.5 ? 'high' : 
                    score < 0.7 ? 'medium' : 'low';

    return {
      requirementId: requirement.id,
      requirementName: requirement.name,
      categoryId: requirement.categoryId,
      severity,
      description: `Requirement ${requirement.name} is not fully met (score: ${(score * 100).toFixed(1)}%)`,
      impact: this.getGapImpact(severity),
      remediation: this.getGapRemediation(requirement),
      estimatedEffort: this.getGapEffort(severity)
    };
  }

  private getGapImpact(severity: string): string {
    switch (severity) {
      case 'critical': return 'High regulatory risk and potential non-compliance';
      case 'high': return 'Significant compliance risk and stakeholder concern';
      case 'medium': return 'Moderate compliance risk';
      case 'low': return 'Minor compliance improvement opportunity';
      default: return 'Unknown impact';
    }
  }

  private getGapRemediation(requirement: ComplianceRequirement): string {
    return `Implement ${requirement.name} reporting and validation procedures. Consider automated data collection and verification.`;
  }

  private getGapEffort(severity: string): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'critical': return 'high';
      case 'high': return 'medium';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private generateRecommendations(gaps: ComplianceGap[], framework: ComplianceFramework): string[] {
    const recommendations: string[] = [];

    const criticalGaps = gaps.filter(gap => gap.severity === 'critical');
    const highGaps = gaps.filter(gap => gap.severity === 'high');

    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical compliance gaps immediately`);
    }

    if (highGaps.length > 0) {
      recommendations.push(`Prioritize ${highGaps.length} high-priority compliance improvements`);
    }

    if (gaps.length > 0) {
      recommendations.push('Implement automated compliance monitoring and reporting');
      recommendations.push('Establish regular compliance review and update procedures');
    }

    return recommendations;
  }

  // Public methods
  getFrameworks(): ComplianceFramework[] {
    return Array.from(this.frameworks.values());
  }

  getFramework(id: string): ComplianceFramework | undefined {
    return this.frameworks.get(id);
  }

  getAssessments(): ComplianceAssessment[] {
    return Array.from(this.assessments.values());
  }

  getAssessment(id: string): ComplianceAssessment | undefined {
    return this.assessments.get(id);
  }

  generateComplianceReport(
    kpiData: KpiData[],
    frameworkIds: string[],
    evidence?: ComplianceEvidence[]
  ): ComplianceReport {
    const assessments = frameworkIds.map(id => 
      this.assessCompliance(kpiData, id, evidence)
    );

    const overallScore = assessments.reduce((sum, assessment) => 
      sum + assessment.overallScore, 0
    ) / assessments.length;

    return {
      assessments,
      overallScore,
      generatedAt: new Date(),
      summary: {
        totalFrameworks: assessments.length,
        averageScore: overallScore,
        criticalGaps: assessments.reduce((sum, a) => 
          sum + a.gaps.filter(g => g.severity === 'critical').length, 0
        ),
        highPriorityGaps: assessments.reduce((sum, a) => 
          sum + a.gaps.filter(g => g.severity === 'high').length, 0
        )
      }
    };
  }
} 