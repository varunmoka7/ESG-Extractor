# German Banks Report Scraper

A comprehensive web scraper designed to find German banks (with focus on Berlin), scrape their websites, and locate annual and sustainability reports.

## 🎯 Features

- **German Bank Discovery**: Curated list of major German banks, prioritizing Berlin-based institutions
- **Intelligent Web Scraping**: Finds annual reports, sustainability reports, ESG reports, and integrated reports
- **PDF Processing**: Downloads and extracts text content from PDF reports using PyMuPDF and PyPDF2
- **HTML Processing**: Extracts text content from web-based reports
- **Comprehensive Output**: Saves both structured JSON data and individual text files
- **Respectful Crawling**: Implements delays and proper user agents to be respectful to websites

## 🏦 Banks Covered

### Berlin-Based Banks (Priority)
- **Berliner Sparkasse** - Berlin's largest savings bank
- **Berliner Volksbank** - Berlin's largest cooperative bank  
- **Berlin Hyp** - Real estate financing bank
- **Deutsche Kreditbank (DKB)** - Online bank subsidiary
- **N26** - Digital bank headquartered in Berlin

### Major German Banks
- **Deutsche Bank** - Germany's largest bank
- **Commerzbank** - Second largest German bank
- **DZ Bank** - Central cooperative bank institution
- **KfW Bankengruppe** - Government development bank
- **Landesbank Baden-Württemberg (LBBW)** - State bank

## 📋 Requirements

```bash
pip install -r requirements.txt
```

### Dependencies
- `requests>=2.28.0` - HTTP requests
- `beautifulsoup4>=4.11.0` - HTML parsing
- `lxml>=4.9.0` - XML/HTML parser
- `urllib3>=1.26.0` - HTTP client
- `PyPDF2>=3.0.0` - PDF processing (fallback)
- `PyMuPDF>=1.23.0` - Advanced PDF processing

## 🚀 Quick Start

### Option 1: Run the Simple Script
```bash
cd data_ingestion
python run_german_banks_scraper.py
```

### Option 2: Use the Enhanced Scraper Directly
```python
from enhanced_german_banks_scraper import EnhancedGermanBanksScraper

# Create scraper instance
scraper = EnhancedGermanBanksScraper()

# Scrape 5 banks and download their reports
results = scraper.scrape_and_download_reports(max_banks=5, download_reports=True)

# Save results
scraper.save_results(results)
```

### Option 3: Basic Scraper (Links Only)
```python
from german_banks_scraper import GermanBanksScraper

# Create basic scraper instance
scraper = GermanBanksScraper()

# Scrape for report links only
results = scraper.scrape_german_banks_reports(max_banks=5)

# Save results
scraper.save_results(results)
```

## 📊 Output Structure

### JSON Results File
```json
{
  "Bank Name": {
    "bank_info": {
      "name": "Bank Name",
      "website": "https://bank-website.de",
      "location": "Berlin",
      "type": "Commercial Bank",
      "description": "Bank description"
    },
    "reports_found": 5,
    "report_links": [
      {
        "title": "Annual Report 2023",
        "url": "https://bank-website.de/reports/annual-2023.pdf",
        "report_type": "annual",
        "year": 2023,
        "file_type": "pdf"
      }
    ],
    "downloaded_content": [
      {
        "title": "Annual Report 2023",
        "url": "https://bank-website.de/reports/annual-2023.pdf",
        "report_type": "annual",
        "year": 2023,
        "content_preview": "Extracted text preview...",
        "word_count": 15000,
        "extraction_method": "PyMuPDF"
      }
    ]
  }
}
```

### Individual Text Files
Each downloaded report is saved as a separate text file in the `german_banks_data/` directory with the format:
```
BankName_ReportTitle_Year.txt
```

## 🔍 Report Types Detected

The scraper automatically detects and classifies the following report types:

- **Annual Reports**: `annual report`, `jahresbericht`, `geschäftsbericht`, `financial report`
- **Sustainability Reports**: `sustainability report`, `nachhaltigkeitsbericht`, `esg report`, `csr report`
- **ESG Reports**: `esg report`, `environmental social governance`, `nachhaltigkeit`
- **Integrated Reports**: `integrated report`, `integrierter bericht`

## 🛠️ Configuration

### Customizing Bank List
Edit the `get_german_banks_list()` method in the scraper to add or modify banks:

```python
def get_german_banks_list(self) -> List[GermanBank]:
    banks = [
        GermanBank(
            name="Your Bank Name",
            website="https://your-bank-website.de",
            location="Berlin",
            type="Commercial Bank",
            description="Bank description"
        ),
        # Add more banks...
    ]
    return banks
```

### Adjusting Scraping Parameters
```python
# Scrape more banks
results = scraper.scrape_and_download_reports(max_banks=10)

# Only find links, don't download content
results = scraper.scrape_and_download_reports(max_banks=5, download_reports=False)

# Custom output directory
scraper.output_dir = "custom_output_directory"
```

## 📈 Performance Tips

1. **Respectful Crawling**: The scraper includes built-in delays to be respectful to websites
2. **Error Handling**: Comprehensive error handling ensures the scraper continues even if individual banks fail
3. **Duplicate Prevention**: Automatically removes duplicate report links
4. **Content Validation**: Validates URLs and file types before processing

## 🔧 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
   ```bash
   pip install -r requirements.txt
   ```

2. **PDF Processing Issues**: If PyMuPDF fails, the scraper falls back to PyPDF2

3. **Network Timeouts**: The scraper includes timeout handling and retry logic

4. **Rate Limiting**: Built-in delays prevent rate limiting issues

### Debug Mode
Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 Integration with ESG Metrics Extractor

The scraped reports can be directly used with the ESG Metrics Extractor:

1. **Extract Reports**: Run the scraper to download report content
2. **Process Content**: Use the ESG Metrics Extractor to analyze the downloaded text files
3. **Generate Insights**: Create comprehensive ESG performance reports

### Example Integration
```python
from enhanced_german_banks_scraper import EnhancedGermanBanksScraper
from services.extractorService import extractESGMetrics

# Scrape German banks
scraper = EnhancedGermanBanksScraper()
results = scraper.scrape_and_download_reports(max_banks=3, download_reports=True)

# Process each downloaded report
for bank_name, bank_data in results.items():
    for content in bank_data['downloaded_content']:
        # Extract ESG metrics
        esg_metrics = extractESGMetrics(content['content'], 'banking')
        print(f"ESG metrics for {bank_name}: {esg_metrics}")
```

## 🤝 Contributing

To add new banks or improve the scraper:

1. Add new banks to the `get_german_banks_list()` method
2. Enhance report detection keywords in `report_keywords`
3. Improve PDF processing with additional libraries
4. Add support for more file formats

## 📄 License

This scraper is part of the ESG Metrics Extractor project and follows the same licensing terms.

## ⚠️ Legal Notice

- This scraper is for educational and research purposes
- Always respect website terms of service and robots.txt files
- Implement appropriate delays and rate limiting
- Only scrape publicly available information
- Consider obtaining permission for commercial use