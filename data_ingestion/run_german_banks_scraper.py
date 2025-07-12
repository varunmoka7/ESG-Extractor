#!/usr/bin/env python3
"""
Simple script to run the German Banks Scraper
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from enhanced_german_banks_scraper import EnhancedGermanBanksScraper
    
    def main():
        """Run the German banks scraper"""
        print("🚀 Starting German Banks Report Scraper")
        print("This will scrape German banks (focusing on Berlin) and find their annual/sustainability reports")
        print("=" * 70)
        
        # Create scraper instance
        scraper = EnhancedGermanBanksScraper()
        
        # Run the scraper
        results = scraper.scrape_and_download_reports(max_banks=5, download_reports=True)
        
        # Print final summary
        print("\n" + "=" * 70)
        print("🎉 SCRAPING COMPLETED!")
        print("=" * 70)
        
        total_banks = len(results)
        total_reports = sum(bank_data['reports_found'] for bank_data in results.values())
        total_downloaded = sum(len(bank_data['downloaded_content']) for bank_data in results.values())
        
        print(f"📊 Final Statistics:")
        print(f"   Banks Processed: {total_banks}")
        print(f"   Reports Found: {total_reports}")
        print(f"   Reports Downloaded: {total_downloaded}")
        
        if total_reports > 0:
            success_rate = (total_downloaded / total_reports) * 100
            print(f"   Success Rate: {success_rate:.1f}%")
        
        print(f"\n📁 Data saved to:")
        print(f"   - german_banks_data/german_banks_comprehensive_results.json")
        print(f"   - Individual report files in german_banks_data/ directory")
        
        print(f"\n🔍 Next Steps:")
        print(f"   1. Review the JSON results file for report links")
        print(f"   2. Check individual text files for extracted content")
        print(f"   3. Use the ESG Metrics Extractor to analyze the downloaded reports")
        
    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Please install required dependencies:")
    print("pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)