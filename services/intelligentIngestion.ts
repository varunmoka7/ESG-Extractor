import { KpiData, IngestionResult, FileType, ContentAnalysis } from '../types';

export interface IngestionConfig {
  supportedFormats: FileType[];
  maxFileSize: number; // in bytes
  enableOcr: boolean;
  enableContentAnalysis: boolean;
  parallelProcessing: boolean;
  timeout: number; // in milliseconds
}

export interface ContentMetadata {
  fileType: FileType;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  encoding?: string;
  pages?: number;
  extractedText?: string;
  confidence: number;
}

export interface IngestionRoute {
  parserId: string;
  confidence: number;
  reason: string;
  estimatedProcessingTime: number;
}

export interface ContentAnalyzer {
  analyzeContent(content: string, metadata: ContentMetadata): ContentAnalysis;
  detectLanguage(content: string): string;
  extractKeyPhrases(content: string): string[];
  identifyTopics(content: string): string[];
  detectSentiment(content: string): 'positive' | 'negative' | 'neutral';
}

export class IntelligentIngestion {
  private config: IngestionConfig;
  private parsers: Map<string, any> = new Map();
  private contentAnalyzer: ContentAnalyzer;
  private fileTypeDetectors: Map<FileType, RegExp[]> = new Map();

  constructor(config: IngestionConfig) {
    this.config = config;
    this.contentAnalyzer = new DefaultContentAnalyzer();
    this.initializeFileTypeDetectors();
    this.initializeParsers();
  }

  private initializeFileTypeDetectors(): void {
    // PDF patterns
    this.fileTypeDetectors.set('pdf', [
      /\.pdf$/i,
      /%PDF-\d+\.\d+/,
      /sustainability report|ESG report|annual report/i
    ]);

    // Excel patterns
    this.fileTypeDetectors.set('excel', [
      /\.(xlsx?|xls)$/i,
      /PK\x03\x04/, // ZIP header for .xlsx
      /D0CF11E0A1B11AE1/, // OLE header for .xls
      /spreadsheet|table|data sheet/i
    ]);

    // XBRL patterns
    this.fileTypeDetectors.set('xbrl', [
      /\.(xbrl|xml)$/i,
      /<xbrl|<xbrli:|<ix:|<link:|<schema/i,
      /XBRL|eXtensible Business Reporting Language/i
    ]);

    // HTML patterns
    this.fileTypeDetectors.set('html', [
      /\.(html?|htm)$/i,
      /<!DOCTYPE html|<html|<head|<body/i,
      /web page|webpage|website/i
    ]);

    // Text patterns
    this.fileTypeDetectors.set('text', [
      /\.(txt|md|rtf)$/i,
      /plain text|document|report/i
    ]);
  }

  private initializeParsers(): void {
    // Register parser stubs - these would be actual parser implementations
    this.parsers.set('pdf', {
      name: 'PDF Parser',
      supportedTypes: ['pdf'],
      process: async (content: string, metadata: ContentMetadata) => {
        // PDF parsing logic would go here
        return { data: [], confidence: 0.8 };
      }
    });

    this.parsers.set('excel', {
      name: 'Excel Parser',
      supportedTypes: ['excel'],
      process: async (content: string, metadata: ContentMetadata) => {
        // Excel parsing logic would go here
        return { data: [], confidence: 0.9 };
      }
    });

    this.parsers.set('xbrl', {
      name: 'XBRL Parser',
      supportedTypes: ['xbrl'],
      process: async (content: string, metadata: ContentMetadata) => {
        // XBRL parsing logic would go here
        return { data: [], confidence: 0.95 };
      }
    });

    this.parsers.set('html', {
      name: 'HTML Parser',
      supportedTypes: ['html'],
      process: async (content: string, metadata: ContentMetadata) => {
        // HTML parsing logic would go here
        return { data: [], confidence: 0.7 };
      }
    });

    this.parsers.set('text', {
      name: 'Text Parser',
      supportedTypes: ['text'],
      process: async (content: string, metadata: ContentMetadata) => {
        // Text parsing logic would go here
        return { data: [], confidence: 0.6 };
      }
    });
  }

  async ingestContent(
    content: string,
    fileName: string,
    fileSize: number,
    mimeType?: string
  ): Promise<IngestionResult> {
    const startTime = Date.now();

    try {
      // Validate file size
      if (fileSize > this.config.maxFileSize) {
        throw new Error(`File size ${fileSize} exceeds maximum allowed size ${this.config.maxFileSize}`);
      }

      // Detect file type
      const metadata = await this.detectFileType(content, fileName, fileSize, mimeType);

      // Analyze content if enabled
      let contentAnalysis: ContentAnalysis | undefined;
      if (this.config.enableContentAnalysis) {
        contentAnalysis = this.contentAnalyzer.analyzeContent(content, metadata);
      }

      // Route to appropriate parser
      const route = this.routeToParser(content, metadata, contentAnalysis);

      // Process with selected parser
      const parser = this.parsers.get(route.parserId);
      if (!parser) {
        throw new Error(`Parser ${route.parserId} not found`);
      }

      const parserResult = await this.executeWithTimeout(
        parser.process(content, metadata),
        this.config.timeout
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: parserResult.data,
        metadata: {
          fileType: metadata.fileType,
          fileName: metadata.fileName,
          fileSize: metadata.fileSize,
          processingTime,
          parserUsed: route.parserId,
          confidence: route.confidence,
          contentAnalysis
        },
        confidence: route.confidence * parserResult.confidence,
        traceability: {
          sourceText: content.substring(0, 200) + '...',
          sourceFile: fileName,
          page: 1,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        data: [],
        metadata: {
          fileType: 'unknown',
          fileName,
          fileSize,
          processingTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        confidence: 0,
        traceability: {
          sourceText: content.substring(0, 200) + '...',
          sourceFile: fileName,
          page: 1,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async detectFileType(
    content: string,
    fileName: string,
    fileSize: number,
    mimeType?: string
  ): Promise<ContentMetadata> {
    let detectedType: FileType = 'unknown';
    let confidence = 0;

    // Check file extension first
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      for (const [fileType, patterns] of this.fileTypeDetectors) {
        if (patterns.some(pattern => pattern.test(`.${extension}`))) {
          detectedType = fileType;
          confidence = 0.8;
          break;
        }
      }
    }

    // Check MIME type if available
    if (mimeType && confidence < 0.9) {
      const mimeTypeMap: Record<string, FileType> = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
        'application/vnd.ms-excel': 'excel',
        'application/xml': 'xbrl',
        'text/html': 'html',
        'text/plain': 'text'
      };

      const mimeDetectedType = mimeTypeMap[mimeType];
      if (mimeDetectedType) {
        detectedType = mimeDetectedType;
        confidence = 0.9;
      }
    }

    // Check content patterns
    if (confidence < 0.7) {
      for (const [fileType, patterns] of this.fileTypeDetectors) {
        const contentMatches = patterns.filter(pattern => 
          pattern.test(content.substring(0, 1000)) // Check first 1000 characters
        ).length;

        if (contentMatches > 0) {
          const contentConfidence = contentMatches / patterns.length;
          if (contentConfidence > confidence) {
            detectedType = fileType;
            confidence = contentConfidence;
          }
        }
      }
    }

    return {
      fileType: detectedType,
      fileName,
      fileSize,
      mimeType,
      confidence
    };
  }

  private routeToParser(
    content: string,
    metadata: ContentMetadata,
    contentAnalysis?: ContentAnalysis
  ): IngestionRoute {
    const routes: IngestionRoute[] = [];

    // Check each parser's suitability
    for (const [parserId, parser] of this.parsers) {
      if (parser.supportedTypes.includes(metadata.fileType)) {
        let confidence = metadata.confidence;
        let reason = `File type ${metadata.fileType} matches parser ${parserId}`;
        let estimatedTime = 5000; // Default 5 seconds

        // Adjust confidence based on content analysis
        if (contentAnalysis) {
          if (contentAnalysis.language === 'en' && parserId !== 'xbrl') {
            confidence *= 1.1; // Boost confidence for English content
          }

          if (contentAnalysis.topics.some(topic => 
            topic.toLowerCase().includes('esg') || 
            topic.toLowerCase().includes('sustainability')
          )) {
            confidence *= 1.2; // Boost confidence for ESG-related content
          }

          // Adjust estimated time based on content size
          estimatedTime = Math.max(2000, Math.min(30000, content.length / 100));
        }

        routes.push({
          parserId,
          confidence,
          reason,
          estimatedProcessingTime: estimatedTime
        });
      }
    }

    // Sort by confidence and return the best route
    routes.sort((a, b) => b.confidence - a.confidence);
    
    if (routes.length === 0) {
      // Fallback to text parser
      return {
        parserId: 'text',
        confidence: 0.3,
        reason: 'No specific parser found, using text parser as fallback',
        estimatedProcessingTime: 3000
      };
    }

    return routes[0];
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Utility methods
  getSupportedFormats(): FileType[] {
    return this.config.supportedFormats;
  }

  getParserInfo(parserId: string): any {
    return this.parsers.get(parserId);
  }

  getAllParsers(): Array<{ id: string; info: any }> {
    return Array.from(this.parsers.entries()).map(([id, info]) => ({ id, info }));
  }

  addParser(parserId: string, parser: any): void {
    this.parsers.set(parserId, parser);
  }

  updateConfig(newConfig: Partial<IngestionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default content analyzer implementation
class DefaultContentAnalyzer implements ContentAnalyzer {
  analyzeContent(content: string, metadata: ContentMetadata): ContentAnalysis {
    return {
      language: this.detectLanguage(content),
      keyPhrases: this.extractKeyPhrases(content),
      topics: this.identifyTopics(content),
      sentiment: this.detectSentiment(content),
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      hasNumbers: /\d/.test(content),
      hasTables: /table|grid|spreadsheet/i.test(content),
      hasCharts: /chart|graph|figure/i.test(content)
    };
  }

  detectLanguage(content: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'of', 'to', 'in', 'is', 'it', 'you', 'that', 'he'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'];
    const frenchWords = ['le', 'la', 'de', 'et', 'à', 'en', 'un', 'est', 'il', 'que'];

    const words = content.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const spanishCount = words.filter(word => spanishWords.includes(word)).length;
    const frenchCount = words.filter(word => frenchWords.includes(word)).length;

    if (englishCount > spanishCount && englishCount > frenchCount) return 'en';
    if (spanishCount > englishCount && spanishCount > frenchCount) return 'es';
    if (frenchCount > englishCount && frenchCount > spanishCount) return 'fr';
    
    return 'en'; // Default to English
  }

  extractKeyPhrases(content: string): string[] {
    // Simple key phrase extraction based on frequency and importance
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const importantWords = ['sustainability', 'environmental', 'social', 'governance', 'esg', 'emissions', 'carbon', 'energy', 'waste', 'water'];
    
    return Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 2 || importantWords.includes(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  identifyTopics(content: string): string[] {
    const topics: string[] = [];
    const contentLower = content.toLowerCase();

    // ESG topics
    if (contentLower.includes('environmental') || contentLower.includes('emissions') || contentLower.includes('carbon')) {
      topics.push('Environmental');
    }
    if (contentLower.includes('social') || contentLower.includes('community') || contentLower.includes('diversity')) {
      topics.push('Social');
    }
    if (contentLower.includes('governance') || contentLower.includes('board') || contentLower.includes('ethics')) {
      topics.push('Governance');
    }
    if (contentLower.includes('esg') || contentLower.includes('sustainability')) {
      topics.push('ESG');
    }

    // Industry topics
    if (contentLower.includes('financial') || contentLower.includes('banking') || contentLower.includes('investment')) {
      topics.push('Financial Services');
    }
    if (contentLower.includes('manufacturing') || contentLower.includes('industrial') || contentLower.includes('production')) {
      topics.push('Manufacturing');
    }
    if (contentLower.includes('technology') || contentLower.includes('software') || contentLower.includes('digital')) {
      topics.push('Technology');
    }

    return topics.length > 0 ? topics : ['General'];
  }

  detectSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['improve', 'increase', 'positive', 'good', 'better', 'success', 'achievement', 'progress'];
    const negativeWords = ['decrease', 'negative', 'bad', 'worse', 'failure', 'problem', 'issue', 'risk'];

    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
} 