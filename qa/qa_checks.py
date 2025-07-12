from typing import List, Dict, Any
import numpy as np

def detect_outliers(metrics: List[Dict[str, Any]], key: str = 'value', threshold: float = 2.5) -> List[int]:
    """
    Detect outliers in a list of metrics using z-score method.
    Args:
        metrics (List[Dict]): List of metric dicts.
        key (str): Key to check for outliers (default: 'value').
        threshold (float): Z-score threshold for outlier detection.
    Returns:
        List[int]: Indices of outlier metrics.
    """
    values = []
    for m in metrics:
        try:
            values.append(float(m.get(key, 0)))
        except Exception:
            values.append(0)
    if not values:
        return []
    z_scores = np.abs((values - np.mean(values)) / (np.std(values) if np.std(values) else 1))
    return [i for i, z in enumerate(z_scores) if z > threshold]

def check_unit_consistency(metrics: List[Dict[str, Any]], unit_key: str = 'metric_type') -> List[int]:
    """
    Check for inconsistent units in a list of metrics.
    Args:
        metrics (List[Dict]): List of metric dicts.
        unit_key (str): Key for unit type.
    Returns:
        List[int]: Indices of metrics with inconsistent units.
    """
    units = [m.get(unit_key, '').lower() for m in metrics]
    if not units:
        return []
    most_common = max(set(units), key=units.count)
    return [i for i, u in enumerate(units) if u != most_common]

def check_year_consistency(metrics: List[Dict[str, Any]], year_key: str = 'year') -> List[int]:
    """
    Check for inconsistent years in a list of metrics.
    Args:
        metrics (List[Dict]): List of metric dicts.
        year_key (str): Key for year.
    Returns:
        List[int]: Indices of metrics with inconsistent years.
    """
    years = [m.get(year_key) for m in metrics if m.get(year_key)]
    if not years:
        return []
    most_common = max(set(years), key=years.count)
    return [i for i, y in enumerate(years) if y != most_common]

def detect_duplicates(metrics: List[Dict[str, Any]], name_key: str = 'name', year_key: str = 'year') -> List[int]:
    """
    Detect duplicate metrics by name and year.
    Args:
        metrics (List[Dict]): List of metric dicts.
        name_key (str): Key for metric name.
        year_key (str): Key for year.
    Returns:
        List[int]: Indices of duplicate metrics.
    """
    seen = set()
    duplicates = []
    for i, m in enumerate(metrics):
        key = (m.get(name_key, '').lower(), m.get(year_key))
        if key in seen:
            duplicates.append(i)
        else:
            seen.add(key)
    return duplicates
