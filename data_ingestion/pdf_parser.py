import pdfplumber

def parse_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file using pdfplumber.
    Args:
        file_path (str): Path to the PDF file.
    Returns:
        str: Extracted text from the PDF.
    """
    text = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
    return '\n'.join(text)
