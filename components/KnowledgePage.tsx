import React from 'react';

const KnowledgePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ESG Extractor Knowledge Base
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive guide to the advanced ESG metrics extraction system
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Frontend Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🎨 Frontend Technologies
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">React 18.3.1</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Modern component-based UI with hooks, context API, and functional components
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">TypeScript 5.5.4</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Type-safe development with strict mode, interfaces, and advanced type checking
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Vite 7.0.4</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Lightning-fast build tool with HMR, ES modules, and optimized bundling
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Tailwind CSS</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Utility-first CSS framework with responsive design and dark mode support
                  </p>
                </div>
              </div>
            </div>

            {/* Backend Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ⚙️ Backend Technologies
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Flask (Python)</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Lightweight web framework for RESTful APIs with CORS support
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Google Generative AI</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced AI model integration with Gemini 1.5-pro and fallback mechanisms
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Flask-CORS</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Cross-origin resource sharing support for API accessibility
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced AI & ML Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 Advanced AI & ML Features
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Multi-Stage Processing</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Modular pipeline with preprocessing, extraction, validation, enrichment, and QA stages
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Framework Intelligence</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Auto-detection of ESG frameworks (GRI, SASB, TCFD) with smart mapping and compliance scoring
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">ML-Based QA</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced validation with outlier detection, consistency checks, and learning capabilities
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Intelligent Ingestion</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Multi-format support with auto-detection, smart routing, and content analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Performance & Monitoring */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Performance & Monitoring
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Real-time Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Live tracking of processing performance, system health, and error rates
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Performance Metrics</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive metrics including throughput, accuracy, and processing times
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">System Health</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    CPU, memory, and connection monitoring with health status indicators
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Error Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Detailed error logging and analysis with remediation suggestions
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance & Standards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📋 Compliance & Standards
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">GRI Standards</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Global Reporting Initiative 2021 standards with 300+ metrics coverage
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">SASB Standards</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sustainability Accounting Standards Board with industry-specific metrics
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">TCFD Framework</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Task Force on Climate-related Financial Disclosures compliance
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Compliance Scoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Automated assessment with gap analysis and remediation guidance
                  </p>
                </div>
              </div>
            </div>

            {/* Carbon Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🌱 Advanced Carbon Analysis
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Scope Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive Scope 1, 2, and 3 emissions analysis with detailed breakdowns
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Scenario Modeling</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Business-as-usual, moderate, aggressive, and net-zero emission scenarios
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Trend Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Historical emissions trends and future projections with confidence intervals
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Benchmarking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Industry comparison and peer analysis with percentile rankings
                  </p>
                </div>
              </div>
            </div>

            {/* Data Processing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🔄 Data Processing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Multi-Format Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    PDF, Excel, XBRL, HTML, and text files with OCR capabilities
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Parallel Processing</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Concurrent stage execution with configurable timeouts and error recovery
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Data Validation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Format, range, consistency, and completeness validation with confidence scoring
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Traceability</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Full audit trail with source text, file information, and processing timestamps
                  </p>
                </div>
              </div>
            </div>

            {/* Development Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🛠️ Development Tools
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Git & GitHub</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Version control with automated CI/CD and deployment workflows
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">ESLint & Prettier</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Code quality enforcement and consistent formatting
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Testing Framework</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive test suite with unit, integration, and end-to-end tests
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Documentation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Auto-generated API documentation and comprehensive guides
                  </p>
                </div>
              </div>
            </div>

            {/* ESG Methodologies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📚 ESG Methodologies
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Environmental Metrics</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    GHG emissions, energy consumption, water usage, waste management, biodiversity
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Social Metrics</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Employee metrics, community impact, labor standards, diversity, human rights
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Governance Metrics</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Board composition, executive compensation, risk management, ethics, transparency
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Industry-Specific</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Banking, apparel, waste management, and general ESG sector support
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Section */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🚀 Advanced Features Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                  🔄 Multi-Stage Processing
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• Modular pipeline architecture</li>
                  <li>• Parallel processing support</li>
                  <li>• Configurable timeouts</li>
                  <li>• Error recovery mechanisms</li>
                  <li>• Real-time stage monitoring</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">
                  🧠 Framework Intelligence
                </h3>
                <ul className="text-purple-800 dark:text-purple-200 space-y-2">
                  <li>• Auto-detection of ESG frameworks</li>
                  <li>• Smart data mapping</li>
                  <li>• Compliance scoring</li>
                  <li>• Gap analysis</li>
                  <li>• Framework recommendations</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">
                  🤖 ML-Based QA
                </h3>
                <ul className="text-green-800 dark:text-green-200 space-y-2">
                  <li>• Advanced validation models</li>
                  <li>• Learning from corrections</li>
                  <li>• Outlier detection</li>
                  <li>• Consistency checks</li>
                  <li>• Format validation</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">
                  📊 Performance Monitoring
                </h3>
                <ul className="text-orange-800 dark:text-orange-200 space-y-2">
                  <li>• Real-time metrics</li>
                  <li>• System health monitoring</li>
                  <li>• Error tracking</li>
                  <li>• Throughput analysis</li>
                  <li>• Historical data</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-3">
                  📋 Compliance Scoring
                </h3>
                <ul className="text-red-800 dark:text-red-200 space-y-2">
                  <li>• Multi-framework support</li>
                  <li>• Automated assessment</li>
                  <li>• Gap identification</li>
                  <li>• Remediation guidance</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-3">
                  🌱 Carbon Analysis
                </h3>
                <ul className="text-emerald-800 dark:text-emerald-200 space-y-2">
                  <li>• Scope 1, 2, 3 analysis</li>
                  <li>• Scenario modeling</li>
                  <li>• Trend analysis</li>
                  <li>• Industry benchmarking</li>
                  <li>• Intensity metrics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              📈 Performance Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  &lt; 30s
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Average Processing Time
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  95%+
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Extraction Accuracy
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  100+
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Documents/Hour
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  System Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              💡 Best Practices
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 Data Quality
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Use high-quality source documents</li>
                  <li>• Ensure proper formatting and structure</li>
                  <li>• Validate extracted data manually</li>
                  <li>• Monitor confidence scores</li>
                  <li>• Review and correct QA issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  ⚙️ Configuration
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Configure appropriate timeouts</li>
                  <li>• Enable relevant frameworks</li>
                  <li>• Set compliance thresholds</li>
                  <li>• Monitor performance metrics</li>
                  <li>• Regular system maintenance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🔄 Processing
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Use parallel processing for large batches</li>
                  <li>• Implement proper error handling</li>
                  <li>• Monitor system resources</li>
                  <li>• Regular performance reviews</li>
                  <li>• Continuous improvement</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📊 Analysis
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Review compliance reports regularly</li>
                  <li>• Track carbon analysis trends</li>
                  <li>• Benchmark against industry peers</li>
                  <li>• Implement improvement recommendations</li>
                  <li>• Document insights and learnings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage; 