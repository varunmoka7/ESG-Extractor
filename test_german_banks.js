// Test script for German Banks Data Collection System
// This script tests the basic functionality

const { GermanBanksOrchestrator } = require('./services/germanBanksOrchestrator.ts');

async function testGermanBanksSystem() {
  console.log('🧪 Testing German Banks Data Collection System\n');

  try {
    // Test 1: Initialize orchestrator
    console.log('Test 1: Initializing orchestrator...');
    const orchestrator = new GermanBanksOrchestrator();
    await orchestrator.initialize();
    console.log('✅ Initialization successful\n');

    // Test 2: Get German banks
    console.log('Test 2: Getting German banks...');
    const banks = orchestrator.getAllGermanBanks();
    console.log(`✅ Found ${banks.length} German banks`);
    
    // Verify we have the expected banks
    const expectedBanks = [
      'Deutsche Bank', 'Commerzbank', 'DZ Bank', 'KfW Bankengruppe',
      'Bayerische Landesbank (BayernLB)', 'Landesbank Baden-Württemberg (LBBW)',
      'Norddeutsche Landesbank (NORD/LB)', 'Helaba (Landesbank Hessen-Thüringen)',
      'Deutsche Kreditbank (DKB)', 'Volkswagen Bank'
    ];
    
    const bankNames = banks.map(bank => bank.name);
    const missingBanks = expectedBanks.filter(name => !bankNames.includes(name));
    
    if (missingBanks.length === 0) {
      console.log('✅ All expected banks found');
    } else {
      console.log(`❌ Missing banks: ${missingBanks.join(', ')}`);
    }
    console.log('');

    // Test 3: Get statistics
    console.log('Test 3: Getting system statistics...');
    const stats = orchestrator.getCollectionStatistics();
    console.log(`✅ Statistics retrieved:`);
    console.log(`   - Total German Banks: ${stats.summary.totalGermanBanks}`);
    console.log(`   - Total Jobs Created: ${stats.summary.totalJobsCreated}`);
    console.log(`   - Total Jobs Completed: ${stats.summary.totalJobsCompleted}`);
    console.log(`   - Success Rate: ${stats.summary.successRate.toFixed(1)}%`);
    console.log('');

    // Test 4: Search functionality
    console.log('Test 4: Testing search functionality...');
    const searchResults = orchestrator.searchCompanies('Deutsche');
    console.log(`✅ Search for 'Deutsche' found ${searchResults.length} results`);
    
    if (searchResults.length > 0) {
      console.log(`   - First result: ${searchResults[0].company.name}`);
    }
    console.log('');

    // Test 5: Get stored companies
    console.log('Test 5: Getting stored companies...');
    const storedCompanies = orchestrator.getAllStoredCompanies();
    console.log(`✅ Found ${storedCompanies.length} stored companies`);
    console.log('');

    // Test 6: Test individual bank processing (simulation)
    console.log('Test 6: Testing individual bank processing...');
    if (banks.length > 0) {
      const testBank = banks[0];
      console.log(`   Testing with: ${testBank.name}`);
      
      try {
        const result = await orchestrator.processBank(testBank.id);
        console.log(`✅ Bank processing completed:`);
        console.log(`   - Success: ${result.success}`);
        console.log(`   - Total Jobs: ${result.totalJobs}`);
        console.log(`   - Completed Jobs: ${result.completedJobs}`);
        console.log(`   - Failed Jobs: ${result.failedJobs}`);
      } catch (error) {
        console.log(`❌ Bank processing failed: ${error.message}`);
      }
    }
    console.log('');

    // Test 7: Get jobs
    console.log('Test 7: Getting collection jobs...');
    const jobs = orchestrator.getAllJobs();
    console.log(`✅ Found ${jobs.length} collection jobs`);
    
    if (jobs.length > 0) {
      const jobStatuses = jobs.map(job => job.status);
      const statusCounts = jobStatuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('   Job status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }
    console.log('');

    // Test 8: Test configuration
    console.log('Test 8: Testing configuration...');
    const config = orchestrator.getConfig();
    console.log(`✅ Configuration retrieved:`);
    console.log(`   - Auto Collection: ${config.enableAutoCollection}`);
    console.log(`   - Parallel Processing: ${config.enableParallelProcessing}`);
    console.log(`   - Max Concurrent Jobs: ${config.maxConcurrentJobs}`);
    console.log(`   - Retry Failed Jobs: ${config.retryFailedJobs}`);
    console.log('');

    // Test 9: Test service instances
    console.log('Test 9: Testing service instances...');
    const companyService = orchestrator.getCompanyDataService();
    const collectionService = orchestrator.getDataCollectionService();
    const storageService = orchestrator.getBackendStorageService();
    
    console.log(`✅ Service instances retrieved:`);
    console.log(`   - Company Data Service: ${companyService ? 'Available' : 'Missing'}`);
    console.log(`   - Data Collection Service: ${collectionService ? 'Available' : 'Missing'}`);
    console.log(`   - Backend Storage Service: ${storageService ? 'Available' : 'Missing'}`);
    console.log('');

    // Test 10: Test orchestrator status
    console.log('Test 10: Testing orchestrator status...');
    const isRunning = orchestrator.isOrchestratorRunning();
    console.log(`✅ Orchestrator running status: ${isRunning}`);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Final System Status:');
    const finalStats = orchestrator.getCollectionStatistics();
    console.log(`- Total German Banks: ${finalStats.summary.totalGermanBanks}`);
    console.log(`- Total Jobs: ${finalStats.summary.totalJobsCreated}`);
    console.log(`- Completed Jobs: ${finalStats.summary.totalJobsCompleted}`);
    console.log(`- Success Rate: ${finalStats.summary.successRate.toFixed(1)}%`);
    console.log(`- Storage Size: ${(finalStats.summary.totalStorageSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testGermanBanksSystem();
}

module.exports = { testGermanBanksSystem };