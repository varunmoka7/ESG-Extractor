import { KpiData, CarbonAnalysis, CarbonScenario, CarbonTrend, CarbonBenchmark } from '../types';

export interface CarbonMetric {
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
}

export interface CarbonCalculation {
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  totalEmissions: number;
  intensityMetrics: CarbonIntensityMetrics;
  breakdown: CarbonBreakdown;
  uncertainty: number;
}

export interface CarbonIntensityMetrics {
  revenueIntensity: number; // tCO2e per $ revenue
  productionIntensity: number; // tCO2e per unit produced
  employeeIntensity: number; // tCO2e per employee
  energyIntensity: number; // tCO2e per kWh
}

export interface CarbonBreakdown {
  bySource: Record<string, number>;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  byBusinessUnit: Record<string, number>;
}

export interface CarbonScenario {
  id: string;
  name: string;
  description: string;
  assumptions: Record<string, any>;
  projectedEmissions: number;
  reductionPotential: number;
  costEstimate: number;
  timeline: number; // years
  confidence: number;
}

export interface CarbonTrend {
  period: string;
  emissions: number;
  intensity: number;
  growthRate: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export interface CarbonBenchmark {
  industry: string;
  peerGroup: string;
  averageEmissions: number;
  bestInClass: number;
  percentile: number;
  gap: number;
  recommendations: string[];
}

export class AdvancedCarbonAnalysis {
  private industryBenchmarks: Map<string, CarbonBenchmark> = new Map();
  private calculationMethods: Map<string, any> = new Map();

  constructor() {
    this.initializeBenchmarks();
    this.initializeCalculationMethods();
  }

  private initializeBenchmarks(): void {
    // Industry benchmarks (example data)
    const benchmarks = [
      {
        industry: 'Manufacturing',
        peerGroup: 'Large Manufacturers',
        averageEmissions: 50000,
        bestInClass: 15000,
        percentile: 75,
        gap: 35000,
        recommendations: [
          'Implement energy efficiency programs',
          'Switch to renewable energy sources',
          'Optimize production processes'
        ]
      },
      {
        industry: 'Technology',
        peerGroup: 'Tech Companies',
        averageEmissions: 20000,
        bestInClass: 5000,
        percentile: 60,
        gap: 15000,
        recommendations: [
          'Use renewable energy for data centers',
          'Implement remote work policies',
          'Optimize cloud infrastructure'
        ]
      },
      {
        industry: 'Financial Services',
        peerGroup: 'Banks and Insurance',
        averageEmissions: 15000,
        bestInClass: 3000,
        percentile: 70,
        gap: 12000,
        recommendations: [
          'Green building certifications',
          'Sustainable investment portfolios',
          'Digital transformation initiatives'
        ]
      }
    ];

    benchmarks.forEach(benchmark => {
      this.industryBenchmarks.set(benchmark.industry, benchmark);
    });
  }

  private initializeCalculationMethods(): void {
    // IPCC calculation methods
    this.calculationMethods.set('ipcc', {
      name: 'IPCC Guidelines',
      version: '2006',
      description: 'Intergovernmental Panel on Climate Change calculation methods',
      factors: {
        electricity: 0.5, // kg CO2e per kWh
        naturalGas: 2.0, // kg CO2e per m3
        diesel: 2.7, // kg CO2e per liter
        gasoline: 2.3, // kg CO2e per liter
        waste: 0.5, // kg CO2e per kg
        water: 0.3, // kg CO2e per m3
        paper: 0.8, // kg CO2e per kg
        travel: 0.2 // kg CO2e per km
      }
    });

    // GHG Protocol methods
    this.calculationMethods.set('ghg-protocol', {
      name: 'GHG Protocol',
      version: '2015',
      description: 'Greenhouse Gas Protocol calculation methods',
      factors: {
        electricity: 0.6,
        naturalGas: 2.1,
        diesel: 2.8,
        gasoline: 2.4,
        waste: 0.6,
        water: 0.4,
        paper: 0.9,
        travel: 0.25
      }
    });
  }

  analyzeCarbonData(kpiData: KpiData[], industry: string, revenue?: number, employees?: number): CarbonAnalysis {
    const carbonMetrics = this.extractCarbonMetrics(kpiData);
    const calculation = this.calculateEmissions(carbonMetrics);
    const scenarios = this.generateScenarios(calculation, industry);
    const trends = this.analyzeTrends(carbonMetrics);
    const benchmark = this.getBenchmark(industry, calculation.totalEmissions);

    return {
      metrics: carbonMetrics,
      calculation,
      scenarios,
      trends,
      benchmark,
      insights: this.generateInsights(calculation, scenarios, trends, benchmark),
      recommendations: this.generateRecommendations(calculation, scenarios, benchmark),
      generatedAt: new Date()
    };
  }

  private extractCarbonMetrics(kpiData: KpiData[]): CarbonMetric[] {
    const carbonKeywords = [
      'emission', 'carbon', 'ghg', 'co2', 'greenhouse gas',
      'scope 1', 'scope 2', 'scope 3', 'energy', 'fuel',
      'electricity', 'natural gas', 'diesel', 'gasoline'
    ];

    return kpiData
      .filter(kpi => {
        const text = `${kpi.name} ${kpi.description}`.toLowerCase();
        return carbonKeywords.some(keyword => text.includes(keyword));
      })
      .map(kpi => this.convertToCarbonMetric(kpi));
  }

  private convertToCarbonMetric(kpi: KpiData): CarbonMetric {
    // Determine scope based on KPI content
    const scope = this.determineScope(kpi);
    const category = this.determineCategory(kpi);
    const methodology = this.determineMethodology(kpi);

    return {
      id: kpi.id,
      name: kpi.name,
      value: kpi.value || 0,
      unit: kpi.unit || 'tCO2e',
      year: kpi.year || new Date().getFullYear(),
      scope,
      category,
      source: kpi.source || 'extracted',
      confidence: kpi.confidence || 0.8,
      methodology
    };
  }

  private determineScope(kpi: KpiData): 1 | 2 | 3 {
    const text = `${kpi.name} ${kpi.description}`.toLowerCase();
    
    if (text.includes('scope 1') || text.includes('direct')) return 1;
    if (text.includes('scope 2') || text.includes('indirect') || text.includes('electricity')) return 2;
    if (text.includes('scope 3') || text.includes('value chain') || text.includes('supply chain')) return 3;
    
    // Default based on category
    if (text.includes('energy') || text.includes('electricity')) return 2;
    if (text.includes('travel') || text.includes('waste') || text.includes('water')) return 3;
    
    return 1; // Default to scope 1
  }

  private determineCategory(kpi: KpiData): string {
    const text = `${kpi.name} ${kpi.description}`.toLowerCase();
    
    if (text.includes('energy') || text.includes('electricity')) return 'Energy';
    if (text.includes('fuel') || text.includes('gas') || text.includes('diesel')) return 'Fuel';
    if (text.includes('waste')) return 'Waste';
    if (text.includes('water')) return 'Water';
    if (text.includes('travel') || text.includes('transport')) return 'Transport';
    if (text.includes('paper') || text.includes('office')) return 'Office';
    
    return 'Other';
  }

  private determineMethodology(kpi: KpiData): string {
    // Determine calculation methodology based on KPI content
    const text = `${kpi.name} ${kpi.description}`.toLowerCase();
    
    if (text.includes('ipcc') || text.includes('intergovernmental')) return 'IPCC Guidelines';
    if (text.includes('ghg protocol') || text.includes('protocol')) return 'GHG Protocol';
    if (text.includes('iso') || text.includes('14064')) return 'ISO 14064';
    
    return 'Standard Calculation';
  }

  private calculateEmissions(metrics: CarbonMetric[]): CarbonCalculation {
    const scope1Emissions = metrics
      .filter(m => m.scope === 1)
      .reduce((sum, m) => sum + m.value, 0);

    const scope2Emissions = metrics
      .filter(m => m.scope === 2)
      .reduce((sum, m) => sum + m.value, 0);

    const scope3Emissions = metrics
      .filter(m => m.scope === 3)
      .reduce((sum, m) => sum + m.value, 0);

    const totalEmissions = scope1Emissions + scope2Emissions + scope3Emissions;

    const intensityMetrics = this.calculateIntensityMetrics(totalEmissions);
    const breakdown = this.calculateBreakdown(metrics);
    const uncertainty = this.calculateUncertainty(metrics);

    return {
      scope1Emissions,
      scope2Emissions,
      scope3Emissions,
      totalEmissions,
      intensityMetrics,
      breakdown,
      uncertainty
    };
  }

  private calculateIntensityMetrics(totalEmissions: number): CarbonIntensityMetrics {
    // These would be calculated with actual business data
    // For now, using example values
    const revenue = 1000000; // $1M revenue
    const production = 10000; // 10K units
    const employees = 100; // 100 employees
    const energy = 500000; // 500K kWh

    return {
      revenueIntensity: totalEmissions / (revenue / 1000), // tCO2e per $1K revenue
      productionIntensity: totalEmissions / production, // tCO2e per unit
      employeeIntensity: totalEmissions / employees, // tCO2e per employee
      energyIntensity: totalEmissions / (energy / 1000) // tCO2e per 1K kWh
    };
  }

  private calculateBreakdown(metrics: CarbonMetric[]): CarbonBreakdown {
    const bySource: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    const byBusinessUnit: Record<string, number> = {};

    metrics.forEach(metric => {
      // By source
      bySource[metric.source] = (bySource[metric.source] || 0) + metric.value;
      
      // By category
      byCategory[metric.category] = (byCategory[metric.category] || 0) + metric.value;
      
      // By location (would need location data)
      byLocation['Main Office'] = (byLocation['Main Office'] || 0) + metric.value;
      
      // By business unit (would need business unit data)
      byBusinessUnit['Operations'] = (byBusinessUnit['Operations'] || 0) + metric.value;
    });

    return { bySource, byCategory, byLocation, byBusinessUnit };
  }

  private calculateUncertainty(metrics: CarbonMetric[]): number {
    if (metrics.length === 0) return 0;

    // Calculate uncertainty based on confidence levels and data quality
    const avgConfidence = metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length;
    const dataCompleteness = metrics.length / 10; // Assuming 10 is complete dataset
    
    return Math.max(0, Math.min(1, (1 - avgConfidence) * 0.7 + (1 - dataCompleteness) * 0.3));
  }

  private generateScenarios(calculation: CarbonCalculation, industry: string): CarbonScenario[] {
    const scenarios: CarbonScenario[] = [];

    // Business as usual scenario
    scenarios.push({
      id: 'bau',
      name: 'Business as Usual',
      description: 'No additional carbon reduction measures',
      assumptions: { growthRate: 0.02, efficiencyImprovement: 0.01 },
      projectedEmissions: calculation.totalEmissions * 1.05, // 5% growth
      reductionPotential: 0,
      costEstimate: 0,
      timeline: 5,
      confidence: 0.9
    });

    // Moderate reduction scenario
    scenarios.push({
      id: 'moderate',
      name: 'Moderate Reduction',
      description: 'Implement standard energy efficiency and renewable energy measures',
      assumptions: { energyEfficiency: 0.15, renewableEnergy: 0.3, behaviorChange: 0.1 },
      projectedEmissions: calculation.totalEmissions * 0.75, // 25% reduction
      reductionPotential: 0.25,
      costEstimate: calculation.totalEmissions * 50, // $50 per tCO2e
      timeline: 3,
      confidence: 0.8
    });

    // Aggressive reduction scenario
    scenarios.push({
      id: 'aggressive',
      name: 'Aggressive Reduction',
      description: 'Comprehensive decarbonization strategy with significant investment',
      assumptions: { energyEfficiency: 0.3, renewableEnergy: 0.8, circularEconomy: 0.2 },
      projectedEmissions: calculation.totalEmissions * 0.4, // 60% reduction
      reductionPotential: 0.6,
      costEstimate: calculation.totalEmissions * 150, // $150 per tCO2e
      timeline: 5,
      confidence: 0.7
    });

    // Net zero scenario
    scenarios.push({
      id: 'net-zero',
      name: 'Net Zero',
      description: 'Achieve net zero emissions through comprehensive decarbonization and offsets',
      assumptions: { completeDecarbonization: 0.9, carbonRemoval: 0.1 },
      projectedEmissions: 0,
      reductionPotential: 1.0,
      costEstimate: calculation.totalEmissions * 300, // $300 per tCO2e
      timeline: 10,
      confidence: 0.6
    });

    return scenarios;
  }

  private analyzeTrends(metrics: CarbonMetric[]): CarbonTrend[] {
    const trends: CarbonTrend[] = [];

    // Group metrics by year
    const yearlyData = new Map<number, number>();
    metrics.forEach(metric => {
      yearlyData.set(metric.year, (yearlyData.get(metric.year) || 0) + metric.value);
    });

    const years = Array.from(yearlyData.keys()).sort();
    
    for (let i = 1; i < years.length; i++) {
      const currentYear = years[i];
      const previousYear = years[i - 1];
      const currentEmissions = yearlyData.get(currentYear) || 0;
      const previousEmissions = yearlyData.get(previousYear) || 0;
      
      const growthRate = previousEmissions > 0 ? 
        (currentEmissions - previousEmissions) / previousEmissions : 0;

      trends.push({
        period: `${previousYear}-${currentYear}`,
        emissions: currentEmissions,
        intensity: currentEmissions / 1000, // Normalized intensity
        growthRate,
        trendDirection: growthRate > 0.05 ? 'increasing' : 
                       growthRate < -0.05 ? 'decreasing' : 'stable',
        confidence: 0.8
      });
    }

    return trends;
  }

  private getBenchmark(industry: string, totalEmissions: number): CarbonBenchmark | undefined {
    const benchmark = this.industryBenchmarks.get(industry);
    if (!benchmark) return undefined;

    const percentile = this.calculatePercentile(totalEmissions, benchmark.averageEmissions, benchmark.bestInClass);
    const gap = totalEmissions - benchmark.bestInClass;

    return {
      ...benchmark,
      percentile,
      gap,
      recommendations: benchmark.recommendations
    };
  }

  private calculatePercentile(value: number, average: number, bestInClass: number): number {
    // Simple percentile calculation
    if (value <= bestInClass) return 100;
    if (value >= average * 2) return 0;
    
    return Math.max(0, Math.min(100, 100 - ((value - bestInClass) / (average * 2 - bestInClass)) * 100));
  }

  private generateInsights(
    calculation: CarbonCalculation,
    scenarios: CarbonScenario[],
    trends: CarbonTrend[],
    benchmark?: CarbonBenchmark
  ): string[] {
    const insights: string[] = [];

    // Scope insights
    if (calculation.scope3Emissions > calculation.scope1Emissions + calculation.scope2Emissions) {
      insights.push('Scope 3 emissions dominate your carbon footprint, indicating significant supply chain impact');
    }

    if (calculation.scope2Emissions > calculation.scope1Emissions) {
      insights.push('Electricity consumption is your largest emission source - consider renewable energy options');
    }

    // Trend insights
    if (trends.length > 0) {
      const latestTrend = trends[trends.length - 1];
      if (latestTrend.trendDirection === 'increasing') {
        insights.push('Emissions are trending upward - immediate action needed to reverse this trend');
      } else if (latestTrend.trendDirection === 'decreasing') {
        insights.push('Emissions are decreasing - continue current reduction strategies');
      }
    }

    // Benchmark insights
    if (benchmark) {
      if (benchmark.percentile < 25) {
        insights.push(`You're in the top 25% of ${benchmark.industry} companies for carbon performance`);
      } else if (benchmark.percentile > 75) {
        insights.push(`You're below average for ${benchmark.industry} - significant improvement opportunities exist`);
      }
    }

    // Scenario insights
    const moderateScenario = scenarios.find(s => s.id === 'moderate');
    if (moderateScenario) {
      insights.push(`Moderate reduction scenario could save ${moderateScenario.reductionPotential * 100}% of emissions at $${moderateScenario.costEstimate.toLocaleString()}`);
    }

    return insights;
  }

  private generateRecommendations(
    calculation: CarbonCalculation,
    scenarios: CarbonScenario[],
    benchmark?: CarbonBenchmark
  ): string[] {
    const recommendations: string[] = [];

    // High-impact recommendations
    if (calculation.scope2Emissions > calculation.scope1Emissions) {
      recommendations.push('Switch to renewable energy sources for electricity');
      recommendations.push('Implement energy efficiency programs');
    }

    if (calculation.scope3Emissions > calculation.scope1Emissions + calculation.scope2Emissions) {
      recommendations.push('Engage with suppliers to reduce supply chain emissions');
      recommendations.push('Implement sustainable procurement policies');
    }

    // Quick wins
    recommendations.push('Conduct energy audits to identify efficiency opportunities');
    recommendations.push('Implement employee engagement programs for carbon reduction');
    recommendations.push('Set science-based targets for carbon reduction');

    // Long-term strategies
    recommendations.push('Develop a comprehensive carbon reduction roadmap');
    recommendations.push('Invest in carbon removal technologies');
    recommendations.push('Consider carbon offset programs for unavoidable emissions');

    // Benchmark-based recommendations
    if (benchmark && benchmark.percentile > 50) {
      recommendations.push(...benchmark.recommendations);
    }

    return recommendations;
  }

  // Public methods
  getCalculationMethods(): any[] {
    return Array.from(this.calculationMethods.values());
  }

  getBenchmarks(): CarbonBenchmark[] {
    return Array.from(this.industryBenchmarks.values());
  }

  addBenchmark(benchmark: CarbonBenchmark): void {
    this.industryBenchmarks.set(benchmark.industry, benchmark);
  }

  calculateCarbonFootprint(activityData: Record<string, number>, method: string = 'ipcc'): number {
    const calculationMethod = this.calculationMethods.get(method);
    if (!calculationMethod) {
      throw new Error(`Calculation method ${method} not found`);
    }

    let totalEmissions = 0;
    for (const [activity, value] of Object.entries(activityData)) {
      const factor = calculationMethod.factors[activity];
      if (factor) {
        totalEmissions += value * factor;
      }
    }

    return totalEmissions;
  }
} 