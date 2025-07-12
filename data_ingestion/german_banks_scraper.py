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

class GermanBanksScraper:
    """Scraper for German banks and their ESG/sustainability reports"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.report_keywords = {
            'annual': ['annual report', 'jahresbericht', 'geschäftsbericht', 'financial report'],
            'sustainability': ['sustainability report', 'nachhaltigkeitsbericht', 'esg report', 'csr report'],
            'esg': ['esg report', 'environmental social governance', 'nachhaltigkeit'],
            'integrated': ['integrated report', 'integrierter bericht']
        }
        
    def get_german_banks_list(self) -> List[GermanBank]:
        """
        Get a list of major German banks, focusing on Berlin and major cities
        Returns a curated list of German banks with their websites
        """
        banks = [
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
            ),
            GermanBank(
                name="Bayerische Landesbank (BayernLB)",
                website="https://www.bayernlb.de",
                location="Munich",
                type="Landesbank",
                description="State bank of Bavaria"
            ),
            GermanBank(
                name="Norddeutsche Landesbank (NordLB)",
                website="https://www.nordlb.de",
                location="Hanover",
                type="Landesbank",
                description="State bank of Lower Saxony and Saxony-Anhalt"
            ),
            GermanBank(
                name="Berliner Sparkasse",
                website="https://www.berliner-sparkasse.de",
                location="Berlin",
                type="Savings Bank",
                description="Berlin's largest savings bank"
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
                description="Real estate financing bank"
            ),
            GermanBank(
                name="Deutsche Kreditbank (DKB)",
                website="https://www.dkb.de",
                location="Berlin",
                type="Direct Bank",
                description="Online bank subsidiary of BayernLB"
            ),
            GermanBank(
                name="N26",
                website="https://www.n26.com",
                location="Berlin",
                type="Digital Bank",
                description="Digital bank headquartered in Berlin"
            ),
            GermanBank(
                name="Solarisbank",
                website="https://www.solarisbank.com",
                location="Berlin",
                type="Digital Bank",
                description="Digital banking platform"
            ),
            GermanBank(
                name="Vivid Money",
                website="https://www.vivid.money",
                location="Berlin",
                type="Digital Bank",
                description="Digital banking and investment platform"
            ),
            GermanBank(
                name="Deutsche Pfandbriefbank (PBB)",
                website="https://www.pfandbriefbank.com",
                location="Munich",
                type="Specialized Bank",
                description="Real estate and public sector financing"
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
            response = self.session.get(bank.website, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for investor relations, reports, or sustainability sections
            potential_sections = [
                'investor', 'investoren', 'investor relations',
                'reports', 'berichte', 'publikationen',
                'sustainability', 'nachhaltigkeit', 'esg',
                'about', 'über uns', 'unternehmen'
            ]
            
            # Find links to potential report sections
            report_section_urls = []
            for link in soup.find_all('a', href=True):
                link_text = link.get_text().lower()
                href = link['href'].lower()
                
                for section in potential_sections:
                    if section in link_text or section in href:
                        full_url = urljoin(bank.website, link['href'])
                        if full_url not in report_section_urls:
                            report_section_urls.append(full_url)
            
            # Scrape each potential section
            for section_url in report_section_urls[:5]:  # Limit to first 5 sections
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
            
        except Exception as e:
            logger.error(f"Error scraping {bank.name}: {e}")
        
        return report_links
    
    def _scrape_section_for_reports(self, url: str, bank_name: str) -> List[ReportLink]:
        """Scrape a specific section for report links"""
        report_links = []
        
        try:
            response = self.session.get(url, timeout=10)
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
    
    def download_report_content(self, report_link: ReportLink) -> Optional[str]:
        """
        Download and extract text content from a report
        """
        try:
            logger.info(f"Downloading report: {report_link.title}")
            
            if report_link.file_type == 'pdf':
                return self._download_pdf_content(report_link.url)
            elif report_link.file_type in ['html', 'webpage']:
                return self._download_html_content(report_link.url)
            else:
                logger.warning(f"Unsupported file type: {report_link.file_type}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading report {report_link.url}: {e}")
            return None
    
    def _download_pdf_content(self, url: str) -> Optional[str]:
        """Download and extract text from PDF"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # For now, return a placeholder - in production you'd use PyPDF2 or pdfplumber
            return f"PDF content from {url} - Text extraction would be implemented here"
            
        except Exception as e:
            logger.error(f"Error downloading PDF {url}: {e}")
            return None
    
    def _download_html_content(self, url: str) -> Optional[str]:
        """Download and extract text from HTML"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
            
        except Exception as e:
            logger.error(f"Error downloading HTML {url}: {e}")
            return None
    
    def scrape_german_banks_reports(self, max_banks: int = 5) -> Dict[str, List[ReportLink]]:
        """
        Main method to scrape German banks and find their reports
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
                report_links = self.scrape_bank_website(bank)
                results[bank.name] = report_links
                
                logger.info(f"Found {len(report_links)} reports for {bank.name}")
                
                # Be respectful with delays
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error processing {bank.name}: {e}")
                results[bank.name] = []
        
        return results
    
    def save_results(self, results: Dict[str, List[ReportLink]], filename: str = "german_banks_reports.json"):
        """Save results to JSON file"""
        try:
            # Convert ReportLink objects to dictionaries
            serializable_results = {}
            for bank_name, reports in results.items():
                serializable_results[bank_name] = [
                    {
                        'title': report.title,
                        'url': report.url,
                        'report_type': report.report_type,
                        'year': report.year,
                        'file_type': report.file_type
                    }
                    for report in reports
                ]
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(serializable_results, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Results saved to {filename}")
            
        except Exception as e:
            logger.error(f"Error saving results: {e}")

def main():
    """Main function to run the German banks scraper"""
    scraper = GermanBanksScraper()
    
    print("🔍 Starting German Banks Report Scraper")
    print("=" * 50)
    
    # Scrape German banks for reports
    results = scraper.scrape_german_banks_reports(max_banks=5)
    
    # Print summary
    print("\n📊 Scraping Results Summary:")
    print("=" * 50)
    
    total_reports = 0
    for bank_name, reports in results.items():
        print(f"\n🏦 {bank_name}:")
        print(f"   Found {len(reports)} reports")
        
        # Group by report type
        by_type = {}
        for report in reports:
            report_type = report.report_type
            if report_type not in by_type:
                by_type[report_type] = []
            by_type[report_type].append(report)
        
        for report_type, type_reports in by_type.items():
            print(f"   - {report_type.title()} Reports: {len(type_reports)}")
            for report in type_reports[:3]:  # Show first 3
                year_str = f" ({report.year})" if report.year else ""
                print(f"     * {report.title}{year_str} - {report.file_type.upper()}")
            if len(type_reports) > 3:
                print(f"     ... and {len(type_reports) - 3} more")
        
        total_reports += len(reports)
    
    print(f"\n📈 Total Reports Found: {total_reports}")
    
    # Save results
    scraper.save_results(results)
    
    print(f"\n💾 Results saved to german_banks_reports.json")
    print("\n✅ Scraping completed!")

if __name__ == "__main__":
    main()