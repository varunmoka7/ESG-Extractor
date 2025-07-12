// Demo script for German Banks Data Collection System
// This script demonstrates the complete workflow

const { GermanBanksOrchestrator } = require('./services/germanBanksOrchestrator.ts');

async function runGermanBanksDemo() {
  console.log('🚀 Starting German Banks Data Collection Demo\n');

  try {
    // Initialize the orchestrator
    console.log('📋 Initializing German Banks Data Collection System...');
    const orchestrator = new GermanBanksOrchestrator({
      enableAutoCollection: true,
      enableParallelProcessing: true,
      maxConcurrentJobs: 3,
      retryFailedJobs: true,
      maxRetries: 3,
      backupAfterCollection: true,
      cleanupOldData: true,
      daysToKeep: 30
    });

    await orchestrator.initialize();
    console.log('✅ System initialized successfully\n');

    // Display initial statistics
    console.log('📊 Initial System Statistics:');
    const initialStats = orchestrator.getCollectionStatistics();
    console.log(`- Total German Banks: ${initialStats.summary.totalGermanBanks}`);
    console.log(`- Total Jobs Created: ${initialStats.summary.totalJobsCreated}`);
    console.log(`- Total Jobs Completed: ${initialStats.summary.totalJobsCompleted}`);
    console.log(`- Success Rate: ${initialStats.summary.successRate.toFixed(1)}%`);
    console.log(`- Storage Size: ${(initialStats.summary.totalStorageSize / 1024).toFixed(2)} KB\n`);

    // Display all German banks
    console.log('🏦 German Banks in Database:');
    const banks = orchestrator.getAllGermanBanks();
    banks.forEach((bank, index) => {
      console.log(`${index + 1}. ${bank.name}`);
      console.log(`   Type: ${bank.bankType}`);
      console.log(`   Headquarters: ${bank.headquarters}`);
      console.log(`   Assets: ${(bank.assets / 1000000000).toFixed(1)} billion EUR`);
      console.log(`   Employees: ${bank.employees?.toLocaleString() || 'N/A'}`);
      console.log(`   Report Access: ${bank.reportAccessMethod || 'Unknown'}`);
      console.log(`   Report Year: ${bank.reportYear || 'N/A'}`);
      console.log(`   Language: ${bank.reportLanguage || 'N/A'}`);
      console.log('');
    });

    // Start data collection process
    console.log('🔄 Starting Data Collection Process...');
    const startTime = Date.now();
    
    const result = await orchestrator.startDataCollection();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('\n📈 Collection Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Total Jobs: ${result.totalJobs}`);
    console.log(`✅ Completed Jobs: ${result.completedJobs}`);
    console.log(`❌ Failed Jobs: ${result.failedJobs}`);
    console.log(`⏱️  Total Processing Time: ${totalTime}ms`);
    console.log(`📈 Average Processing Time: ${result.averageProcessingTime.toFixed(2)}ms`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    // Display final statistics
    console.log('\n📊 Final System Statistics:');
    const finalStats = orchestrator.getCollectionStatistics();
    console.log(`- Total German Banks: ${finalStats.summary.totalGermanBanks}`);
    console.log(`- Total Jobs Created: ${finalStats.summary.totalJobsCreated}`);
    console.log(`- Total Jobs Completed: ${finalStats.summary.totalJobsCompleted}`);
    console.log(`- Success Rate: ${finalStats.summary.successRate.toFixed(1)}%`);
    console.log(`- Companies with Extracted Data: ${finalStats.summary.companiesWithExtractedData}`);
    console.log(`- Storage Size: ${(finalStats.summary.totalStorageSize / 1024).toFixed(2)} KB`);

    // Display companies with extracted data
    console.log('\n📋 Companies with Extracted ESG Data:');
    const companiesWithData = orchestrator.getCompaniesWithExtractedData();
    if (companiesWithData.length > 0) {
      companiesWithData.forEach((company, index) => {
        console.log(`${index + 1}. ${company.company.name}`);
        console.log(`   Last Extraction: ${company.lastExtractionDate?.toLocaleDateString()}`);
        console.log(`   Data Available: ${company.extractedData ? 'Yes' : 'No'}`);
        if (company.extractedData?.overallConfidence) {
          console.log(`   Confidence: ${company.extractedData.overallConfidence.toFixed(1)}%`);
        }
        console.log('');
      });
    } else {
      console.log('No companies have extracted data yet.');
    }

    // Display job details
    console.log('📋 Job Details:');
    const allJobs = orchestrator.getAllJobs();
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.companyName}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Created: ${job.createdAt.toLocaleDateString()}`);
      console.log(`   Completed: ${job.completedAt ? job.completedAt.toLocaleDateString() : 'N/A'}`);
      if (job.downloadResult?.fileSize) {
        console.log(`   File Size: ${(job.downloadResult.fileSize / 1024 / 1024).toFixed(2)} MB`);
      }
      if (job.extractionResult?.confidence) {
        console.log(`   Confidence: ${job.extractionResult.confidence.toFixed(1)}%`);
      }
      console.log('');
    });

    console.log('🎉 Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('- ✅ German banks database with 10 major banks');
    console.log('- ✅ Sustainability report URL collection');
    console.log('- ✅ Automated data collection workflow');
    console.log('- ✅ ESG data extraction using AI');
    console.log('- ✅ Backend storage and management');
    console.log('- ✅ Progress tracking and statistics');
    console.log('- ✅ Error handling and reporting');
    console.log('- ✅ Data backup and cleanup');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  runGermanBanksDemo();
}

module.exports = { runGermanBanksDemo };