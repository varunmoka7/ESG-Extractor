# Data Ingestion Modules

This directory contains modules for automated, multi-format ESG data collection:

- pdf_parser.py: Extracts text and tables from PDF files using pdfplumber or PyMuPDF.
- excel_parser.py: Parses Excel and CSV files using pandas.
- xbrl_parser.py: Extracts data from XBRL files using arelle or similar libraries.
- html_parser.py: Parses HTML/XML documents using BeautifulSoup and lxml.
- web_crawler.py: Crawls and scrapes ESG disclosures from the web using requests, BeautifulSoup, and/or Selenium.

Each module is designed to be modular and reusable, supporting scheduled and on-demand data collection.
