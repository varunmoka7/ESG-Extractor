import { KpiData, QaResult, ValidationRule, QaCorrection } from '../types';

export interface QaModel {
  id: string;
  name: string;
  type: 'outlier' | 'consistency' | 'format' | 'range' | 'custom';
  confidence: number;
  parameters: Record<string, any>;
  trainingData: QaTrainingExample[];
  lastUpdated: Date;
}

export interface QaTrainingExample {
  input: KpiData;
  expectedOutput: boolean; // true = valid, false = invalid
  correction?: QaCorrection;
  timestamp: Date;
}

export interface QaValidationResult {
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

export interface QaLearningData {
  corrections: QaCorrection[];
  accuracyMetrics: Record<string, number>;
  modelPerformance: Record<string, ModelPerformance>;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalPredictions: number;
  lastUpdated: Date;
}

export class MLQaService {
  private models: Map<string, QaModel> = new Map();
  private learningData: QaLearningData = {
    corrections: [],
    accuracyMetrics: {},
    modelPerformance: {}
  };

  constructor() {
    this.initializeDefaultModels();
  }

  private initializeDefaultModels(): void {
    // Outlier Detection Model
    const outlierModel: QaModel = {
      id: 'outlier-detection',
      name: 'Statistical Outlier Detection',
      type: 'outlier',
      confidence: 0.85,
      parameters: {
        method: 'iqr', // interquartile range
        threshold: 1.5,
        minDataPoints: 10
      },
      trainingData: [],
      lastUpdated: new Date()
    };

    // Consistency Model
    const consistencyModel: QaModel = {
      id: 'consistency-check',
      name: 'Data Consistency Validation',
      type: 'consistency',
      confidence: 0.90,
      parameters: {
        checkYearConsistency: true,
        checkUnitConsistency: true,
        checkCategoryConsistency: true,
        tolerance: 0.1
      },
      trainingData: [],
      lastUpdated: new Date()
    };

    // Format Validation Model
    const formatModel: QaModel = {
      id: 'format-validation',
      name: 'Data Format Validation',
      type: 'format',
      confidence: 0.95,
      parameters: {
        requiredFields: ['name', 'value', 'unit', 'year'],
        numericFields: ['value'],
        dateFields: ['year'],
        stringFields: ['name', 'description', 'category']
      },
      trainingData: [],
      lastUpdated: new Date()
    };

    // Range Validation Model
    const rangeModel: QaModel = {
      id: 'range-validation',
      name: 'Value Range Validation',
      type: 'range',
      confidence: 0.80,
      parameters: {
        ranges: {
          'emissions': { min: 0, max: 1000000 },
          'energy': { min: 0, max: 1000000 },
          'water': { min: 0, max: 1000000 },
          'waste': { min: 0, max: 1000000 }
        },
        percentageFields: { min: 0, max: 100 }
      },
      trainingData: [],
      lastUpdated: new Date()
    };

    this.models.set('outlier-detection', outlierModel);
    this.models.set('consistency-check', consistencyModel);
    this.models.set('format-validation', formatModel);
    this.models.set('range-validation', rangeModel);
  }

  async validateKpiData(kpiData: KpiData[]): Promise<QaValidationResult[]> {
    const results: QaValidationResult[] = [];

    for (const kpi of kpiData) {
      const validationResult = await this.validateSingleKpi(kpi, kpiData);
      results.push(validationResult);
    }

    return results;
  }

  private async validateSingleKpi(kpi: KpiData, allKpis: KpiData[]): Promise<QaValidationResult> {
    const issues: QaIssue[] = [];
    let overallConfidence = 1.0;
    const modelsUsed: string[] = [];

    // Format validation
    const formatResult = this.validateFormat(kpi);
    issues.push(...formatResult.issues);
    overallConfidence *= formatResult.confidence;
    modelsUsed.push('format-validation');

    // Range validation
    const rangeResult = this.validateRange(kpi);
    issues.push(...rangeResult.issues);
    overallConfidence *= rangeResult.confidence;
    modelsUsed.push('range-validation');

    // Consistency validation
    const consistencyResult = this.validateConsistency(kpi, allKpis);
    issues.push(...consistencyResult.issues);
    overallConfidence *= consistencyResult.confidence;
    modelsUsed.push('consistency-check');

    // Outlier detection
    const outlierResult = this.detectOutliers(kpi, allKpis);
    issues.push(...outlierResult.issues);
    overallConfidence *= outlierResult.confidence;
    modelsUsed.push('outlier-detection');

    const isValid = issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high').length === 0;
    const suggestions = this.generateSuggestions(issues);

    return {
      isValid,
      confidence: overallConfidence,
      issues,
      suggestions,
      modelUsed: modelsUsed.join(', ')
    };
  }

  private validateFormat(kpi: KpiData): { issues: QaIssue[]; confidence: number } {
    const issues: QaIssue[] = [];
    const model = this.models.get('format-validation');
    if (!model) return { issues, confidence: 0 };

    const { requiredFields, numericFields, dateFields } = model.parameters;

    // Check required fields
    for (const field of requiredFields) {
      if (!kpi[field as keyof KpiData]) {
        issues.push({
          type: 'format',
          severity: 'critical',
          message: `Missing required field: ${field}`,
          field,
          confidence: model.confidence
        });
      }
    }

    // Check numeric fields
    for (const field of numericFields) {
      const value = kpi[field as keyof KpiData];
      if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
        issues.push({
          type: 'format',
          severity: 'high',
          message: `Field ${field} should be numeric`,
          field,
          actualValue: value,
          confidence: model.confidence
        });
      }
    }

    // Check date fields
    for (const field of dateFields) {
      const value = kpi[field as keyof KpiData];
      if (value !== undefined) {
        const year = parseInt(value.toString());
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
          issues.push({
            type: 'format',
            severity: 'medium',
            message: `Field ${field} should be a valid year`,
            field,
            actualValue: value,
            expectedValue: 'YYYY format',
            confidence: model.confidence
          });
        }
      }
    }

    const confidence = issues.length === 0 ? model.confidence : model.confidence * 0.8;
    return { issues, confidence };
  }

  private validateRange(kpi: KpiData): { issues: QaIssue[]; confidence: number } {
    const issues: QaIssue[] = [];
    const model = this.models.get('range-validation');
    if (!model) return { issues, confidence: 0 };

    const { ranges, percentageFields } = model.parameters;

    // Check value ranges based on category
    if (kpi.value !== undefined && kpi.category) {
      const category = kpi.category.toLowerCase();
      for (const [rangeKey, range] of Object.entries(ranges)) {
        if (category.includes(rangeKey)) {
          if (kpi.value < range.min || kpi.value > range.max) {
            issues.push({
              type: 'range',
              severity: 'medium',
              message: `Value ${kpi.value} is outside expected range for ${rangeKey}`,
              field: 'value',
              actualValue: kpi.value,
              expectedValue: `${range.min} - ${range.max}`,
              confidence: model.confidence
            });
          }
          break;
        }
      }
    }

    // Check percentage fields
    if (kpi.unit && kpi.unit.toLowerCase().includes('%') && kpi.value !== undefined) {
      const percentageRange = percentageFields;
      if (kpi.value < percentageRange.min || kpi.value > percentageRange.max) {
        issues.push({
          type: 'range',
          severity: 'high',
          message: `Percentage value ${kpi.value}% is outside valid range`,
          field: 'value',
          actualValue: kpi.value,
          expectedValue: `${percentageRange.min}% - ${percentageRange.max}%`,
          confidence: model.confidence
        });
      }
    }

    const confidence = issues.length === 0 ? model.confidence : model.confidence * 0.9;
    return { issues, confidence };
  }

  private validateConsistency(kpi: KpiData, allKpis: KpiData[]): { issues: QaIssue[]; confidence: number } {
    const issues: QaIssue[] = [];
    const model = this.models.get('consistency-check');
    if (!model) return { issues, confidence: 0 };

    const { checkYearConsistency, checkUnitConsistency, checkCategoryConsistency, tolerance } = model.parameters;

    // Check year consistency
    if (checkYearConsistency && kpi.year) {
      const currentYear = new Date().getFullYear();
      if (kpi.year > currentYear + 1) {
        issues.push({
          type: 'consistency',
          severity: 'medium',
          message: `Year ${kpi.year} is in the future`,
          field: 'year',
          actualValue: kpi.year,
          expectedValue: `<= ${currentYear + 1}`,
          confidence: model.confidence
        });
      }
    }

    // Check unit consistency
    if (checkUnitConsistency && kpi.unit) {
      const similarKpis = allKpis.filter(other => 
        other.id !== kpi.id && 
        other.category === kpi.category &&
        other.name.toLowerCase().includes(kpi.name.toLowerCase().split(' ')[0])
      );

      if (similarKpis.length > 0) {
        const units = [...new Set(similarKpis.map(k => k.unit))];
        if (units.length > 1 && !units.includes(kpi.unit)) {
          issues.push({
            type: 'consistency',
            severity: 'medium',
            message: `Unit inconsistency detected for similar KPIs`,
            field: 'unit',
            actualValue: kpi.unit,
            expectedValue: units.join(' or '),
            confidence: model.confidence
          });
        }
      }
    }

    // Check category consistency
    if (checkCategoryConsistency && kpi.category) {
      const validCategories = ['Environmental', 'Social', 'Governance', 'Economic'];
      if (!validCategories.includes(kpi.category)) {
        issues.push({
          type: 'consistency',
          severity: 'low',
          message: `Category '${kpi.category}' is not standard`,
          field: 'category',
          actualValue: kpi.category,
          expectedValue: validCategories.join(', '),
          confidence: model.confidence
        });
      }
    }

    const confidence = issues.length === 0 ? model.confidence : model.confidence * 0.85;
    return { issues, confidence };
  }

  private detectOutliers(kpi: KpiData, allKpis: KpiData[]): { issues: QaIssue[]; confidence: number } {
    const issues: QaIssue[] = [];
    const model = this.models.get('outlier-detection');
    if (!model) return { issues, confidence: 0 };

    const { method, threshold, minDataPoints } = model.parameters;

    // Get similar KPIs for comparison
    const similarKpis = allKpis.filter(other => 
      other.id !== kpi.id && 
      other.category === kpi.category &&
      other.unit === kpi.unit &&
      other.value !== undefined
    );

    if (similarKpis.length < minDataPoints || kpi.value === undefined) {
      return { issues, confidence: model.confidence };
    }

    const values = similarKpis.map(k => k.value!).sort((a, b) => a - b);
    const q1 = this.calculatePercentile(values, 25);
    const q3 = this.calculatePercentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;

    if (kpi.value < lowerBound || kpi.value > upperBound) {
      issues.push({
        type: 'outlier',
        severity: 'medium',
        message: `Value ${kpi.value} appears to be an outlier`,
        field: 'value',
        actualValue: kpi.value,
        expectedValue: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`,
        confidence: model.confidence * 0.8
      });
    }

    const confidence = issues.length === 0 ? model.confidence : model.confidence * 0.8;
    return { issues, confidence };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const index = (percentile / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= values.length) return values[lower];
    if (lower === upper) return values[lower];

    return values[lower] * (1 - weight) + values[upper] * weight;
  }

  private generateSuggestions(issues: QaIssue[]): string[] {
    const suggestions: string[] = [];

    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');

    if (criticalIssues.length > 0) {
      suggestions.push('Critical issues detected. Please review and correct before proceeding.');
    }

    if (highIssues.length > 0) {
      suggestions.push('High priority issues found. Consider reviewing these values.');
    }

    const formatIssues = issues.filter(issue => issue.type === 'format');
    if (formatIssues.length > 0) {
      suggestions.push('Data format issues detected. Check field types and required fields.');
    }

    const outlierIssues = issues.filter(issue => issue.type === 'outlier');
    if (outlierIssues.length > 0) {
      suggestions.push('Potential outliers detected. Verify these values are correct.');
    }

    return suggestions;
  }

  // Learning and improvement methods
  recordCorrection(correction: QaCorrection): void {
    this.learningData.corrections.push(correction);
    this.updateModelFromCorrection(correction);
  }

  private updateModelFromCorrection(correction: QaCorrection): void {
    // Update training data for relevant models
    const trainingExample: QaTrainingExample = {
      input: correction.originalKpi,
      expectedOutput: true, // corrected data is considered valid
      correction,
      timestamp: new Date()
    };

    // Add to relevant model training data
    for (const modelId of correction.modelsInvolved) {
      const model = this.models.get(modelId);
      if (model) {
        model.trainingData.push(trainingExample);
        model.lastUpdated = new Date();
      }
    }

    // Update model performance metrics
    this.updateModelPerformance();
  }

  private updateModelPerformance(): void {
    for (const [modelId, model] of this.models) {
      if (model.trainingData.length === 0) continue;

      const recentExamples = model.trainingData.filter(
        example => example.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      );

      if (recentExamples.length === 0) continue;

      const correctPredictions = recentExamples.filter(example => {
        // Simple accuracy calculation - can be enhanced with more sophisticated ML
        return example.expectedOutput === true; // Assuming corrections improve accuracy
      }).length;

      const accuracy = correctPredictions / recentExamples.length;

      this.learningData.modelPerformance[modelId] = {
        accuracy,
        precision: accuracy, // Simplified for now
        recall: accuracy, // Simplified for now
        f1Score: accuracy, // Simplified for now
        totalPredictions: recentExamples.length,
        lastUpdated: new Date()
      };
    }
  }

  getLearningData(): QaLearningData {
    return this.learningData;
  }

  getModelPerformance(modelId: string): ModelPerformance | undefined {
    return this.learningData.modelPerformance[modelId];
  }

  getAllModels(): QaModel[] {
    return Array.from(this.models.values());
  }

  addCustomModel(model: QaModel): void {
    this.models.set(model.id, model);
  }

  updateModelParameters(modelId: string, parameters: Record<string, any>): void {
    const model = this.models.get(modelId);
    if (model) {
      model.parameters = { ...model.parameters, ...parameters };
      model.lastUpdated = new Date();
    }
  }
} 