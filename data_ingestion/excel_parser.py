import pandas as pd
from typing import List, Dict

def parse_excel(file_path: str) -> List[Dict]:
    """
    Parse an Excel or CSV file and return its content as a list of dictionaries (one per row).
    Args:
        file_path (str): Path to the Excel or CSV file.
    Returns:
        List[Dict]: List of rows as dictionaries.
    """
    df = pd.read_excel(file_path) if file_path.endswith(('.xls', '.xlsx')) else pd.read_csv(file_path)
    return df.to_dict(orient='records')
