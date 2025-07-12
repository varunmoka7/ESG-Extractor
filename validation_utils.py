"""
Validation utilities for ESG data extraction
Provides functions for data validation, confidence scoring, and quality control
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple

def validate_metric_units(metric_type: str, category: str) -> bool:
    """Validate if metric units are appropriate for the category"""
    valid_units = {
        'environmental': ['metric tons', 'tCO2e', 'kgCO2e', 'percentage', '%', 'MWh', 'kWh', 'liters', 'cubic meters', 'tons', 'kg', 'g'],
        'social': ['percentage', '%', 'count', 'number', 'hours', 'days', 'employees', 'people', 'persons'],
        'governance': ['percentage', '%', 'count', 'number', 'ratio', 'members', 'directors']
    }
    return any(unit in metric_type.lower() for unit in valid_units.get(category, []))

def validate_value_range(value: str, metric_type: str) -> bool:
    """Validate if value is within reasonable range"""
    try:
        # Extract numeric value
        numeric_values = re.findall(r'[\d.]+', value)
        if not numeric_values:
            return True  # Non-numeric values are valid
        
        numeric_value = float(numeric_values[0])
        
        # Define reasonable ranges
        ranges = {
            'percentage': (0, 100),
            'metric tons': (0, 1000000),
            'tCO2e': (0, 1000000),
            'kgCO2e': (0, 1000000),
            'tons': (0, 1000000),
            'kg': (0, 1000000),
            'employees': (0, 1000000),
            'count': (0, 1000000)
        }
        
        for unit, (min_val, max_val) in ranges.items():
            if unit in metric_type.lower():
                return min_val <= numeric_value <= max_val
        
        return True  # Default to valid if no specific range defined
    except:
        return True  # If can't parse, assume valid

def calculate_confidence_score(name: str, value: str, metric_type: str, reference: str) -> Tuple[int, str]:
    """Calculate confidence score and reasoning"""
    score = 50  # Base score
    reasoning = []
    
    # Check for specific numbers
    if re.search(r'\d+', value):
        score += 20
        reasoning.append("Specific numeric value found")
    else:
        reasoning.append("No specific numeric value")
    
    # Check for units
    if any(unit in metric_type.lower() for unit in ['tons', 'kg', 'percentage', '%', 'count', 'number', 'employees', 'directors']):
        score += 15
        reasoning.append("Appropriate units specified")
    else:
        reasoning.append("Units may be unclear")
    
    # Check for year
    if re.search(r'20\d{2}', reference):
        score += 10
        reasoning.append("Year specified in reference")
    else:
        reasoning.append("No year specified")
    
    # Check for clarity
    if len(reference.split()) > 5:
        score += 5
        reasoning.append("Detailed reference provided")
    else:
        reasoning.append("Brief reference")
    
    return min(score, 100), "; ".join(reasoning)

def validate_response_quality(response_text: str) -> bool:
    """Validate if AI response is of good quality"""
    try:
        # Check if response is valid JSON
        data = json.loads(response_text)
        
        # Check if response contains expected structure
        if isinstance(data, dict):
            # Check for at least one ESG category
            categories = ['environmental', 'social', 'governance']
            if any(cat in data for cat in categories):
                return True
        return False
    except:
        return False

def detect_duplicate_metrics(kpis: List[Dict]) -> List[Dict]:
    """Detect and flag duplicate metrics"""
    seen = set()
    duplicates = []
    
    for kpi in kpis:
        # Create a key for comparison
        key = f"{kpi.get('name', '').lower()}_{kpi.get('year', '')}"
        
        if key in seen:
            duplicates.append(kpi)
        else:
            seen.add(key)
    
    return duplicates

def validate_temporal_consistency(kpis: List[Dict]) -> List[str]:
    """Validate temporal consistency across KPIs"""
    warnings = []
    years = [kpi.get('year') for kpi in kpis if kpi.get('year')]
    
    if len(set(years)) > 3:
        warnings.append("Multiple reporting years detected - verify temporal consistency")
    
    return warnings

def enhance_kpi_with_validation(kpi: Dict) -> Dict:
    """Enhance KPI with validation and confidence scoring"""
    # Calculate confidence score if not present
    if 'confidence_score' not in kpi:
        confidence_score, reasoning = calculate_confidence_score(
            kpi.get('name', ''),
            kpi.get('value', ''),
            kpi.get('metric_type', ''),
            kpi.get('reference', '')
        )
        kpi['confidence_score'] = confidence_score
        kpi['confidence_reasoning'] = reasoning
    
    # Add quality flags
    quality_flags = []
    
    # Validate units
    category = 'environmental'  # Default, could be enhanced to detect category
    if not validate_metric_units(kpi.get('metric_type', ''), category):
        quality_flags.append("unclear_units")
    
    # Validate value range
    if not validate_value_range(kpi.get('value', ''), kpi.get('metric_type', '')):
        quality_flags.append("unreasonable_value")
    
    # Check for missing year
    if not kpi.get('year'):
        quality_flags.append("missing_year")
    
    # Check for low confidence
    if kpi.get('confidence_score', 0) < 50:
        quality_flags.append("low_confidence")
    
    kpi['quality_flags'] = quality_flags
    
    # Set validation status
    if quality_flags:
        if any(flag in ['unreasonable_value'] for flag in quality_flags):
            kpi['validation_status'] = 'error'
        else:
            kpi['validation_status'] = 'warning'
    else:
        kpi['validation_status'] = 'valid'
    
    return kpi

def generate_extraction_metadata(kpis: List[Dict]) -> Dict:
    """Generate metadata about the extraction process"""
    if not kpis:
        return {
            "total_metrics_found": 0,
            "average_confidence": 0,
            "validation_errors": 0,
            "warnings": 0,
            "processing_notes": "No metrics found"
        }
    
    confidence_scores = [kpi.get('confidence_score', 0) for kpi in kpis]
    validation_errors = sum(1 for kpi in kpis if kpi.get('validation_status') == 'error')
    warnings = sum(1 for kpi in kpis if kpi.get('validation_status') == 'warning')
    
    return {
        "total_metrics_found": len(kpis),
        "average_confidence": round(sum(confidence_scores) / len(confidence_scores), 1),
        "validation_errors": validation_errors,
        "warnings": warnings,
        "processing_notes": f"Extracted {len(kpis)} metrics with {validation_errors} errors and {warnings} warnings"
    }
