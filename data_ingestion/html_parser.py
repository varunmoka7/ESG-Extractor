from bs4 import BeautifulSoup

def parse_html(file_path: str) -> str:
    """
    Extract all text from an HTML or XML file using BeautifulSoup.
    Args:
        file_path (str): Path to the HTML or XML file.
    Returns:
        str: Extracted text from the file.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    return soup.get_text(separator='\n')
