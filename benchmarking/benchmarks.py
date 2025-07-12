from typing import Dict, Any

# Example industry benchmarks (expand as needed)
INDUSTRY_BENCHMARKS = {
    'banking': {
        'emissions_intensity': 150,  # tCO2e/€1M
        'renewable_energy': 45,      # %
        'board_diversity': 35        # % women
    },
    'apparel': {
        'water_intensity': 500,      # liters/garment
        'carbon_footprint': 8,      # kgCO2e/garment
        'recycled_materials': 25    # %
    }
}

def compare_to_benchmark(metric_name: str, value: float, industry: str) -> Dict[str, Any]:
    """
    Compare a metric value to the industry benchmark.
    Args:
        metric_name (str): Name of the metric (e.g., 'emissions_intensity').
        value (float): Value to compare.
        industry (str): Industry sector (e.g., 'banking').
    Returns:
        dict: Comparison result with benchmark, difference, and outlier flag.
    """
    benchmark = INDUSTRY_BENCHMARKS.get(industry, {}).get(metric_name)
    if benchmark is None:
        return {'benchmark': None, 'difference': None, 'is_outlier': False, 'note': 'No benchmark available'}
    difference = value - benchmark
    is_outlier = abs(difference) > 0.5 * benchmark  # Flag if >50% deviation
    return {
        'benchmark': benchmark,
        'difference': difference,
        'is_outlier': is_outlier,
        'note': 'Outlier' if is_outlier else 'Within expected range'
    }
