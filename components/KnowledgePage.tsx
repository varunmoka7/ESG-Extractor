import React from 'react';

const KnowledgePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ESG Metrics Extractor - Technology Stack & Frameworks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive guide to all the frameworks, technologies, and methodologies 
            used in designing and implementing our ESG metrics extraction system.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Frontend Technologies */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Frontend Technologies
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">React 18.3.1</h3>
                  <p className="text-gray-600 mt-2">
                    Modern React with hooks, functional components, and concurrent features for 
                    building interactive user interfaces with optimal performance.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Functional components with hooks</li>
                    <li>• Context API for state management</li>
                    <li>• Concurrent rendering features</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">TypeScript 5.5.4</h3>
                  <p className="text-gray-600 mt-2">
                    Strongly typed JavaScript for better development experience, 
                    error prevention, and enhanced code maintainability.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Strict type checking</li>
                    <li>• Interface definitions for data structures</li>
                    <li>• Enhanced IDE support and autocomplete</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Vite 7.0.4</h3>
                  <p className="text-gray-600 mt-2">
                    Next-generation frontend build tool providing lightning-fast 
                    development server and optimized production builds.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Hot module replacement (HMR)</li>
                    <li>• ES modules-based development</li>
                    <li>• Optimized production bundling</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Tailwind CSS</h3>
                  <p className="text-gray-600 mt-2">
                    Utility-first CSS framework for rapid UI development with 
                    consistent design system and responsive components.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Utility-first approach</li>
                    <li>• Responsive design utilities</li>
                    <li>• Custom component styling</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">UUID 10.0.0</h3>
                  <p className="text-gray-600 mt-2">
                    Unique identifier generation for creating distinct keys for 
                    React components and data tracking.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Unique ID generation</li>
                    <li>• Component key management</li>
                    <li>• Data tracking and identification</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Backend Technologies */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </span>
              Backend Technologies
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Flask (Python)</h3>
                  <p className="text-gray-600 mt-2">
                    Lightweight web framework for building RESTful APIs with 
                    clean architecture and easy deployment.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• RESTful API endpoints</li>
                    <li>• CORS support for cross-origin requests</li>
                    <li>• JSON request/response handling</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Google Generative AI</h3>
                  <p className="text-gray-600 mt-2">
                    Advanced AI model integration using Gemini 1.5 Pro for 
                    intelligent ESG data extraction and analysis.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Gemini 1.5 Pro model</li>
                    <li>• Structured prompt engineering</li>
                    <li>• JSON output formatting</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Flask-CORS</h3>
                  <p className="text-gray-600 mt-2">
                    Cross-Origin Resource Sharing support for seamless 
                    communication between frontend and backend services.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Cross-origin request handling</li>
                    <li>• Security policy management</li>
                    <li>• Browser compatibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* AI & Machine Learning */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              AI & Machine Learning Frameworks
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Google Generative AI (@google/genai)</h3>
                <p className="text-gray-600 mt-2">
                  Official Google AI SDK for integrating Gemini models with structured 
                  prompting and response handling for ESG data extraction.
                </p>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Gemini 1.5 Pro model integration</li>
                      <li>• Structured prompt engineering</li>
                      <li>• JSON response parsing</li>
                      <li>• Error handling and fallbacks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Use Cases:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• ESG metrics extraction</li>
                      <li>• Industry-specific analysis</li>
                      <li>• Data validation and cleaning</li>
                      <li>• Report summarization</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Prompt Engineering Framework</h3>
                <p className="text-gray-600 mt-2">
                  Specialized system instructions and prompts designed for different 
                  ESG extraction scenarios and industry verticals.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Extractor Types:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Standard ESG extraction</li>
                      <li>• Carbon reduction levers</li>
                      <li>• Banking sector metrics</li>
                      <li>• Apparel industry KPIs</li>
                    </ul>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Waste management analysis</li>
                      <li>• Governance intelligence</li>
                      <li>• Material recovery metrics</li>
                      <li>• Regulatory compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Architecture & Design Patterns */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Architecture & Design Patterns
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Component-Based Architecture</h3>
                  <p className="text-gray-600 mt-2">
                    Modular React components with clear separation of concerns 
                    and reusable UI elements.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Reusable component library</li>
                    <li>• Props-based data flow</li>
                    <li>• Composition over inheritance</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Context API Pattern</h3>
                  <p className="text-gray-600 mt-2">
                    Global state management using React Context for API keys, 
                    themes, and application-wide data.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Theme management</li>
                    <li>• API key storage</li>
                    <li>• Global state sharing</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Service Layer Pattern</h3>
                  <p className="text-gray-600 mt-2">
                    Dedicated service classes for API communication, data processing, 
                    and business logic separation.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• API service abstraction</li>
                    <li>• Data transformation</li>
                    <li>• Error handling</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">RESTful API Design</h3>
                  <p className="text-gray-600 mt-2">
                    Clean REST API endpoints with proper HTTP methods, 
                    status codes, and JSON response formatting.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• POST /generate for AI processing</li>
                    <li>• GET /models for debugging</li>
                    <li>• JSON request/response format</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Development Tools & Configuration */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              Development Tools & Configuration
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">TypeScript Configuration</h3>
                  <p className="text-gray-600 mt-2">
                    Strict TypeScript setup with modern ES2020 features and 
                    comprehensive type checking.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• ES2020 target with DOM support</li>
                    <li>• Strict type checking enabled</li>
                    <li>• Path mapping for clean imports</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Vite Configuration</h3>
                  <p className="text-gray-600 mt-2">
                    Optimized build configuration with environment variables, 
                    proxy settings, and path resolution.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Environment variable handling</li>
                    <li>• API proxy configuration</li>
                    <li>• Path alias resolution</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Development Scripts</h3>
                  <p className="text-gray-600 mt-2">
                    NPM scripts for development, building, and previewing 
                    the application.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• npm run dev - Development server</li>
                    <li>• npm run build - Production build</li>
                    <li>• npm run preview - Build preview</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Environment Management</h3>
                  <p className="text-gray-600 mt-2">
                    Secure API key management and environment variable 
                    configuration for different deployment stages.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• GEMINI_API_KEY configuration</li>
                    <li>• Environment-specific settings</li>
                    <li>• Secure credential handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ESG Framework Methodologies */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-emerald-100 text-emerald-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              ESG Framework Methodologies
            </h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Carbon Reduction Levers</h3>
                  <p className="text-gray-600 mt-2">
                    Comprehensive framework covering 10 key carbon reduction 
                    levers across different emission scopes.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Stationary & mobile combustion</li>
                    <li>• Purchased electricity & goods</li>
                    <li>• Transportation & distribution</li>
                    <li>• Business travel & product use</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Banking Sector Framework</h3>
                  <p className="text-gray-600 mt-2">
                    Specialized metrics for financial institutions covering 
                    financed emissions and operational impacts.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Financed emissions (F1, F2, F3)</li>
                    <li>• Operational scope 3 (O1, O2, O3)</li>
                    <li>• Client & market influence (C1, C2, C3)</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Apparel Industry KPIs</h3>
                  <p className="text-gray-600 mt-2">
                    Fashion industry-specific environmental metrics covering 
                    the entire supply chain and product lifecycle.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• GHG emissions & water management</li>
                    <li>• Chemical & waste management</li>
                    <li>• Supply chain transparency</li>
                    <li>• Biodiversity & nature impact</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Waste Management Framework</h3>
                  <p className="text-gray-600 mt-2">
                    Advanced waste management analysis with governance 
                    intelligence and regulatory compliance tracking.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Zero waste design principles</li>
                    <li>• Material recovery & energy conversion</li>
                    <li>• Regulatory compliance monitoring</li>
                    <li>• Governance intelligence systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices & Standards */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-teal-100 text-teal-800 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              Best Practices & Standards
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Code Quality</h3>
                  <p className="text-gray-600 mt-2">
                    Strict TypeScript configuration and coding standards 
                    for maintainable and reliable code.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Strict type checking</li>
                    <li>• Unused variable detection</li>
                    <li>• Consistent code formatting</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Security</h3>
                  <p className="text-gray-600 mt-2">
                    Secure API key management and CORS configuration 
                    for production-ready applications.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Environment variable protection</li>
                    <li>• CORS policy implementation</li>
                    <li>• Input validation & sanitization</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Performance</h3>
                  <p className="text-gray-600 mt-2">
                    Optimized build configuration and development tools 
                    for fast development and production performance.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Vite build optimization</li>
                    <li>• Hot module replacement</li>
                    <li>• Efficient bundling</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Data Standards</h3>
                  <p className="text-gray-600 mt-2">
                    Consistent JSON data structures and standardized 
                    ESG metrics for interoperability.
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Standardized KPI formats</li>
                    <li>• Consistent data types</li>
                    <li>• Reference tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Explore the ESG Extractor?
            </h3>
            <p className="text-blue-100 mb-6">
              This comprehensive technology stack enables powerful ESG data extraction 
              across multiple industries with AI-driven insights and standardized reporting.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Back to Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage; 