import React, { useState, useEffect } from 'react';
import { GermanBanksOrchestrator, OrchestrationResult } from '../services/germanBanksOrchestrator';
import { GermanBank } from '../services/companyDataService';
import { CollectionJob } from '../services/dataCollectionService';
import { StoredCompanyData } from '../services/backendStorageService';

interface GermanBanksCollectionProps {
  className?: string;
}

const GermanBanksCollection: React.FC<GermanBanksCollectionProps> = ({ className }) => {
  const [orchestrator, setOrchestrator] = useState<GermanBanksOrchestrator | null>(null);
  const [banks, setBanks] = useState<GermanBank[]>([]);
  const [storedCompanies, setStoredCompanies] = useState<StoredCompanyData[]>([]);
  const [jobs, setJobs] = useState<CollectionJob[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'banks' | 'jobs' | 'data' | 'settings'>('overview');

  useEffect(() => {
    initializeOrchestrator();
  }, []);

  const initializeOrchestrator = async () => {
    try {
      const newOrchestrator = new GermanBanksOrchestrator();
      await newOrchestrator.initialize();
      
      setOrchestrator(newOrchestrator);
      setBanks(newOrchestrator.getAllGermanBanks());
      setStoredCompanies(newOrchestrator.getAllStoredCompanies());
      setJobs(newOrchestrator.getAllJobs());
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize orchestrator:', error);
    }
  };

  const startDataCollection = async () => {
    if (!orchestrator || isRunning) return;

    setIsRunning(true);
    try {
      const collectionResult = await orchestrator.startDataCollection();
      setResult(collectionResult);
      
      // Refresh data
      setStoredCompanies(orchestrator.getAllStoredCompanies());
      setJobs(orchestrator.getAllJobs());
    } catch (error) {
      console.error('Data collection failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const processSingleBank = async (bankId: string) => {
    if (!orchestrator || isRunning) return;

    setIsRunning(true);
    try {
      const result = await orchestrator.processBank(bankId);
      setResult(result);
      
      // Refresh data
      setStoredCompanies(orchestrator.getAllStoredCompanies());
      setJobs(orchestrator.getAllJobs());
    } catch (error) {
      console.error('Bank processing failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.bankType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.headquarters.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStoredCompanies = storedCompanies.filter(company =>
    company.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing German Banks Data Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">German Banks ESG Data Collection</h1>
              <p className="mt-1 text-sm text-gray-500">
                Collecting and analyzing sustainability reports from German banks
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startDataCollection}
                disabled={isRunning}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Processing...' : 'Start Collection'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'banks', label: 'Banks' },
              { id: 'jobs', label: 'Jobs' },
              { id: 'data', label: 'Extracted Data' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Banks</p>
                    <p className="text-2xl font-semibold text-gray-900">{banks.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.filter(job => job.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.filter(job => job.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.length > 0 
                        ? Math.round((jobs.filter(job => job.status === 'completed').length / jobs.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{job.companyName}</p>
                          <p className="text-sm text-gray-500">
                            {job.createdAt.toLocaleDateString()} at {job.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No jobs created yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Banks Tab */}
        {activeTab === 'banks' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search banks by name, type, or headquarters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Banks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanks.map((bank) => (
                <div key={bank.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{bank.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bank.reportAccessMethod === 'direct' ? 'bg-green-100 text-green-800' :
                        bank.reportAccessMethod === 'login_required' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bank.reportAccessMethod?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Type:</span> {bank.bankType}</p>
                      <p><span className="font-medium">Headquarters:</span> {bank.headquarters}</p>
                      {bank.assets && (
                        <p><span className="font-medium">Assets:</span> {formatCurrency(bank.assets)}</p>
                      )}
                      {bank.employees && (
                        <p><span className="font-medium">Employees:</span> {bank.employees.toLocaleString()}</p>
                      )}
                      <p><span className="font-medium">Report Year:</span> {bank.reportYear || 'N/A'}</p>
                      <p><span className="font-medium">Language:</span> {bank.reportLanguage || 'N/A'}</p>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => processSingleBank(bank.id)}
                        disabled={isRunning}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Process
                      </button>
                      {bank.sustainabilityReportPdfUrl && (
                        <a
                          href={bank.sustainabilityReportPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          View Report
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Collection Jobs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.completedAt ? job.completedAt.toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.downloadResult?.fileSize ? formatFileSize(job.downloadResult.fileSize) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted ESG Data</h3>
              {storedCompanies.filter(company => company.extractionStatus === 'completed').length > 0 ? (
                <div className="space-y-4">
                  {storedCompanies
                    .filter(company => company.extractionStatus === 'completed')
                    .map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{company.company.name}</h4>
                          <span className="text-sm text-gray-500">
                            Last extracted: {company.lastExtractionDate?.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Data available: {company.extractedData ? 'Yes' : 'No'}</p>
                          {company.extractedData && (
                            <p>Confidence: {company.extractedData.overallConfidence?.toFixed(1)}%</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No extracted data available yet</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto Collection</label>
                <p className="text-sm text-gray-500">Automatically start data collection on initialization</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parallel Processing</label>
                <p className="text-sm text-gray-500">Process multiple jobs simultaneously</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Backup After Collection</label>
                <p className="text-sm text-gray-500">Create backup after each collection cycle</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {result.success ? 'Collection Completed' : 'Collection Failed'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <div className="text-sm text-gray-500 space-y-2">
                    <p>Total Jobs: {result.totalJobs}</p>
                    <p>Completed: {result.completedJobs}</p>
                    <p>Failed: {result.failedJobs}</p>
                    <p>Processing Time: {result.totalProcessingTime}ms</p>
                    {result.errors.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600">Errors:</p>
                        <ul className="text-xs text-red-500">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GermanBanksCollection;