import requests
import time
import json
import re
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass
import logging
from bs4 import BeautifulSoup
import os
import io
import PyPDF2
import fitz  # PyMuPDF for better PDF processing

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GermanBank:
    """Data class for German bank information"""
    name: str
    website: str
    location: str
    type: str  # Commercial, Savings, Cooperative, etc.
    description: str = ""

@dataclass
class ReportLink:
    """Data class for report links found on bank websites"""
    title: str
    url: str
    report_type: str  # "annual", "sustainability", "esg", "integrated"
    year: Optional[int] = None
    file_type: str = "pdf"  # pdf, html, etc.

@dataclass
class ReportContent:
    """Data class for extracted report content"""
    title: str
    url: str
    report_type: str
    year: Optional[int]
    content: str
    word_count: int
    extraction_method: str

class EnhancedGermanBanksScraper:
    """Enhanced scraper for German banks and their ESG/sustainability reports with PDF processing"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.report_keywords = {
            'annual': ['annual report', 'jahresbericht', 'geschäftsbericht', 'financial report', 'finanzbericht'],
            'sustainability': ['sustainability report', 'nachhaltigkeitsbericht', 'esg report', 'csr report', 'corporate responsibility'],
            'esg': ['esg report', 'environmental social governance', 'nachhaltigkeit', 'environmental report'],
            'integrated': ['integrated report', 'integrierter bericht', 'combined report']
        }
        
        # Create output directory
        self.output_dir = "german_banks_data"
        os.makedirs(self.output_dir, exist_ok=True)
        
    def get_german_banks_list(self) -> List[GermanBank]:
        """
        Get a curated list of major German banks, focusing on Berlin and major cities
        """
        banks = [
            # Berlin-based Banks (Priority)
            GermanBank(
                name="Berliner Sparkasse",
                website="https://www.berliner-sparkasse.de",
                location="Berlin",
                type="Savings Bank",
                description="Berlin's largest savings bank with extensive local presence"
            ),
            GermanBank(
                name="Berliner Volksbank",
                website="https://www.berliner-volksbank.de",
                location="Berlin",
                type="Cooperative Bank",
                description="Berlin's largest cooperative bank"
            ),
            GermanBank(
                name="Berlin Hyp",
                website="https://www.berlinhyp.de",
                location="Berlin",
                type="Specialized Bank",
                description="Real estate financing bank headquartered in Berlin"
            ),
            GermanBank(
                name="Deutsche Kreditbank (DKB)",
                website="https://www.dkb.de",
                location="Berlin",
                type="Direct Bank",
                description="Online bank subsidiary of BayernLB, headquartered in Berlin"
            ),
            GermanBank(
                name="N26",
                website="https://www.n26.com",
                location="Berlin",
                type="Digital Bank",
                description="Digital bank headquartered in Berlin"
            ),
            
            # Major German Banks
            GermanBank(
                name="Deutsche Bank",
                website="https://www.deutsche-bank.de",
                location="Frankfurt am Main",
                type="Commercial Bank",
                description="Germany's largest bank by total assets"
            ),
            GermanBank(
                name="Commerzbank",
                website="https://www.commerzbank.de",
                location="Frankfurt am Main", 
                type="Commercial Bank",
                description="Second largest German bank"
            ),
            GermanBank(
                name="DZ Bank",
                website="https://www.dzbank.de",
                location="Frankfurt am Main",
                type="Cooperative Bank",
                description="Central institution for German cooperative banks"
            ),
            GermanBank(
                name="KfW Bankengruppe",
                website="https://www.kfw.de",
                location="Frankfurt am Main",
                type="Development Bank",
                description="German government-owned development bank"
            ),
            GermanBank(
                name="Landesbank Baden-Württemberg (LBBW)",
                website="https://www.lbbw.de",
                location="Stuttgart",
                type="Landesbank",
                description="State bank of Baden-Württemberg"
            )
        ]
        
        return banks
    
    def scrape_bank_website(self, bank: GermanBank) -> List[ReportLink]:
        """
        Scrape a bank's website to find annual and sustainability reports
        """
        report_links = []
        
        try:
            logger.info(f"Scraping {bank.name} website: {bank.website}")
            
            # Get main page
            response = self.session.get(bank.website, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for investor relations, reports, or sustainability sections
            potential_sections = [
                'investor', 'investoren', 'investor relations', 'investor-relations',
                'reports', 'berichte', 'publikationen', 'publications',
                'sustainability', 'nachhaltigkeit', 'esg', 'environmental',
                'about', 'über uns', 'unternehmen', 'company',
                'media', 'presse', 'news', 'aktuelles'
            ]
            
            # Find links to potential report sections
            report_section_urls = []
            for link in soup.find_all('a', href=True):
                link_text = link.get_text().lower()
                href = link['href'].lower()
                
                for section in potential_sections:
                    if section in link_text or section in href:
                        full_url = urljoin(bank.website, link['href'])
                        if full_url not in report_section_urls and self._is_valid_url(full_url):
                            report_section_urls.append(full_url)
            
            # Scrape each potential section
            for section_url in report_section_urls[:8]:  # Increased limit
                try:
                    section_links = self._scrape_section_for_reports(section_url, bank.name)
                    report_links.extend(section_links)
                    time.sleep(1)  # Be respectful
                except Exception as e:
                    logger.warning(f"Error scraping section {section_url}: {e}")
                    continue
            
            # Also search the main page directly for report links
            main_page_links = self._extract_report_links_from_page(soup, bank.website, bank.name)
            report_links.extend(main_page_links)
            
            # Remove duplicates based on URL
            unique_links = []
            seen_urls = set()
            for link in report_links:
                if link.url not in seen_urls:
                    unique_links.append(link)
                    seen_urls.add(link.url)
            
            return unique_links
            
        except Exception as e:
            logger.error(f"Error scraping {bank.name}: {e}")
            return []
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid and not a mailto or javascript link"""
        if url.startswith(('mailto:', 'javascript:', 'tel:')):
            return False
        return True
    
    def _scrape_section_for_reports(self, url: str, bank_name: str) -> List[ReportLink]:
        """Scrape a specific section for report links"""
        report_links = []
        
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            section_links = self._extract_report_links_from_page(soup, url, bank_name)
            report_links.extend(section_links)
            
        except Exception as e:
            logger.warning(f"Error scraping section {url}: {e}")
        
        return report_links
    
    def _extract_report_links_from_page(self, soup: BeautifulSoup, base_url: str, bank_name: str) -> List[ReportLink]:
        """Extract report links from a BeautifulSoup object"""
        report_links = []
        
        for link in soup.find_all('a', href=True):
            link_text = link.get_text().strip().lower()
            href = link['href'].lower()
            
            # Check if this looks like a report link
            report_type = self._classify_report_link(link_text, href)
            
            if report_type:
                full_url = urljoin(base_url, link['href'])
                
                # Extract year if present
                year = self._extract_year_from_text(link_text + " " + href)
                
                # Determine file type
                file_type = self._determine_file_type(href)
                
                report_link = ReportLink(
                    title=link.get_text().strip(),
                    url=full_url,
                    report_type=report_type,
                    year=year,
                    file_type=file_type
                )
                
                report_links.append(report_link)
        
        return report_links
    
    def _classify_report_link(self, link_text: str, href: str) -> Optional[str]:
        """Classify a link as a specific type of report"""
        combined_text = f"{link_text} {href}".lower()
        
        for report_type, keywords in self.report_keywords.items():
            for keyword in keywords:
                if keyword in combined_text:
                    return report_type
        
        return None
    
    def _extract_year_from_text(self, text: str) -> Optional[int]:
        """Extract year from text"""
        # Look for 4-digit years (2020-2030)
        year_pattern = r'\b(20[2-3][0-9])\b'
        match = re.search(year_pattern, text)
        if match:
            return int(match.group(1))
        return None
    
    def _determine_file_type(self, href: str) -> str:
        """Determine file type from URL"""
        if href.endswith('.pdf'):
            return 'pdf'
        elif href.endswith('.html') or href.endswith('.htm'):
            return 'html'
        elif href.endswith('.doc') or href.endswith('.docx'):
            return 'word'
        elif href.endswith('.xls') or href.endswith('.xlsx'):
            return 'excel'
        else:
            return 'webpage'
    
    def download_report_content(self, report_link: ReportLink) -> Optional[ReportContent]:
        """
        Download and extract text content from a report
        """
        try:
            logger.info(f"Downloading report: {report_link.title}")
            
            if report_link.file_type == 'pdf':
                return self._download_pdf_content(report_link)
            elif report_link.file_type in ['html', 'webpage']:
                return self._download_html_content(report_link)
            else:
                logger.warning(f"Unsupported file type: {report_link.file_type}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading report {report_link.url}: {e}")
            return None
    
    def _download_pdf_content(self, report_link: ReportLink) -> Optional[ReportContent]:
        """Download and extract text from PDF using PyMuPDF"""
        try:
            response = self.session.get(report_link.url, timeout=30)
            response.raise_for_status()
            
            # Try PyMuPDF first (better text extraction)
            try:
                import fitz
                pdf_document = fitz.open(stream=response.content, filetype="pdf")
                text_content = ""
                
                for page_num in range(len(pdf_document)):
                    page = pdf_document.load_page(page_num)
                    text_content += page.get_text()
                
                pdf_document.close()
                extraction_method = "PyMuPDF"
                
            except ImportError:
                # Fallback to PyPDF2
                pdf_file = io.BytesIO(response.content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                text_content = ""
                
                for page in pdf_reader.pages:
                    text_content += page.extract_text()
                
                extraction_method = "PyPDF2"
            
            # Clean up text
            text_content = self._clean_text_content(text_content)
            word_count = len(text_content.split())
            
            return ReportContent(
                title=report_link.title,
                url=report_link.url,
                report_type=report_link.report_type,
                year=report_link.year,
                content=text_content,
                word_count=word_count,
                extraction_method=extraction_method
            )
            
        except Exception as e:
            logger.error(f"Error downloading PDF {report_link.url}: {e}")
            return None
    
    def _download_html_content(self, report_link: ReportLink) -> Optional[ReportContent]:
        """Download and extract text from HTML"""
        try:
            response = self.session.get(report_link.url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer"]):
                script.decompose()
            
            # Get text content
            text_content = soup.get_text()
            
            # Clean up text
            text_content = self._clean_text_content(text_content)
            word_count = len(text_content.split())
            
            return ReportContent(
                title=report_link.title,
                url=report_link.url,
                report_type=report_link.report_type,
                year=report_link.year,
                content=text_content,
                word_count=word_count,
                extraction_method="BeautifulSoup"
            )
            
        except Exception as e:
            logger.error(f"Error downloading HTML {report_link.url}: {e}")
            return None
    
    def _clean_text_content(self, text: str) -> str:
        """Clean and normalize extracted text content"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep German umlauts
        text = re.sub(r'[^\w\säöüßÄÖÜ.,!?;:()%€$£¥-]', ' ', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def scrape_and_download_reports(self, max_banks: int = 5, download_reports: bool = True) -> Dict[str, Dict]:
        """
        Main method to scrape German banks, find reports, and optionally download content
        """
        banks = self.get_german_banks_list()
        results = {}
        
        # Focus on Berlin banks first, then others
        berlin_banks = [b for b in banks if 'Berlin' in b.location]
        other_banks = [b for b in banks if 'Berlin' not in b.location]
        
        # Combine Berlin banks first, then others
        prioritized_banks = berlin_banks + other_banks
        
        for i, bank in enumerate(prioritized_banks[:max_banks]):
            logger.info(f"Processing bank {i+1}/{min(max_banks, len(prioritized_banks))}: {bank.name}")
            
            try:
                # Scrape for report links
                report_links = self.scrape_bank_website(bank)
                
                bank_results = {
                    'bank_info': {
                        'name': bank.name,
                        'website': bank.website,
                        'location': bank.location,
                        'type': bank.type,
                        'description': bank.description
                    },
                    'reports_found': len(report_links),
                    'report_links': [
                        {
                            'title': report.title,
                            'url': report.url,
                            'report_type': report.report_type,
                            'year': report.year,
                            'file_type': report.file_type
                        }
                        for report in report_links
                    ],
                    'downloaded_content': []
                }
                
                # Download report content if requested
                if download_reports and report_links:
                    logger.info(f"Downloading content for {len(report_links)} reports from {bank.name}")
                    
                    for report_link in report_links[:3]:  # Limit to 3 reports per bank
                        try:
                            content = self.download_report_content(report_link)
                            if content:
                                bank_results['downloaded_content'].append({
                                    'title': content.title,
                                    'url': content.url,
                                    'report_type': content.report_type,
                                    'year': content.year,
                                    'content_preview': content.content[:500] + "..." if len(content.content) > 500 else content.content,
                                    'word_count': content.word_count,
                                    'extraction_method': content.extraction_method
                                })
                                
                                # Save full content to file
                                self._save_report_content_to_file(bank.name, content)
                                
                            time.sleep(2)  # Be respectful
                            
                        except Exception as e:
                            logger.error(f"Error downloading content for {report_link.title}: {e}")
                            continue
                
                results[bank.name] = bank_results
                logger.info(f"Found {len(report_links)} reports for {bank.name}")
                
                # Be respectful with delays
                time.sleep(3)
                
            except Exception as e:
                logger.error(f"Error processing {bank.name}: {e}")
                results[bank.name] = {
                    'bank_info': {
                        'name': bank.name,
                        'website': bank.website,
                        'location': bank.location,
                        'type': bank.type,
                        'description': bank.description
                    },
                    'reports_found': 0,
                    'report_links': [],
                    'downloaded_content': [],
                    'error': str(e)
                }
        
        return results
    
    def _save_report_content_to_file(self, bank_name: str, content: ReportContent):
        """Save report content to a text file"""
        try:
            # Create safe filename
            safe_bank_name = re.sub(r'[^\w\s-]', '', bank_name).strip()
            safe_title = re.sub(r'[^\w\s-]', '', content.title).strip()
            year_str = f"_{content.year}" if content.year else ""
            
            filename = f"{safe_bank_name}_{safe_title}{year_str}.txt"
            filename = filename.replace(' ', '_')[:100]  # Limit length
            
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"Bank: {bank_name}\n")
                f.write(f"Title: {content.title}\n")
                f.write(f"URL: {content.url}\n")
                f.write(f"Report Type: {content.report_type}\n")
                f.write(f"Year: {content.year}\n")
                f.write(f"Word Count: {content.word_count}\n")
                f.write(f"Extraction Method: {content.extraction_method}\n")
                f.write("=" * 80 + "\n\n")
                f.write(content.content)
            
            logger.info(f"Saved report content to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving report content: {e}")
    
    def save_results(self, results: Dict[str, Dict], filename: str = "german_banks_comprehensive_results.json"):
        """Save comprehensive results to JSON file"""
        try:
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Results saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving results: {e}")

def main():
    """Main function to run the enhanced German banks scraper"""
    scraper = EnhancedGermanBanksScraper()
    
    print("🔍 Starting Enhanced German Banks Report Scraper")
    print("=" * 60)
    
    # Scrape German banks for reports and download content
    results = scraper.scrape_and_download_reports(max_banks=5, download_reports=True)
    
    # Print comprehensive summary
    print("\n📊 Comprehensive Scraping Results Summary:")
    print("=" * 60)
    
    total_reports = 0
    total_downloaded = 0
    
    for bank_name, bank_data in results.items():
        print(f"\n🏦 {bank_name}:")
        print(f"   Location: {bank_data['bank_info']['location']}")
        print(f"   Type: {bank_data['bank_info']['type']}")
        print(f"   Reports Found: {bank_data['reports_found']}")
        print(f"   Content Downloaded: {len(bank_data['downloaded_content'])}")
        
        if 'error' in bank_data:
            print(f"   ❌ Error: {bank_data['error']}")
        
        # Group by report type
        by_type = {}
        for report in bank_data['report_links']:
            report_type = report['report_type']
            if report_type not in by_type:
                by_type[report_type] = []
            by_type[report_type].append(report)
        
        for report_type, type_reports in by_type.items():
            print(f"   - {report_type.title()} Reports: {len(type_reports)}")
            for report in type_reports[:2]:  # Show first 2
                year_str = f" ({report['year']})" if report['year'] else ""
                print(f"     * {report['title']}{year_str} - {report['file_type'].upper()}")
            if len(type_reports) > 2:
                print(f"     ... and {len(type_reports) - 2} more")
        
        total_reports += bank_data['reports_found']
        total_downloaded += len(bank_data['downloaded_content'])
    
    print(f"\n📈 Summary Statistics:")
    print(f"   Total Banks Processed: {len(results)}")
    print(f"   Total Reports Found: {total_reports}")
    print(f"   Total Reports Downloaded: {total_downloaded}")
    print(f"   Success Rate: {(total_downloaded/total_reports*100):.1f}%" if total_reports > 0 else "   Success Rate: 0%")
    
    # Save results
    scraper.save_results(results)
    
    print(f"\n💾 Results saved to german_banks_data/german_banks_comprehensive_results.json")
    print(f"📁 Individual report files saved to german_banks_data/ directory")
    print("\n✅ Enhanced scraping completed!")

if __name__ == "__main__":
    main()