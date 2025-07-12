import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import json
import re
from typing import Dict, List, Any, Optional

app = Flask(__name__)
CORS(app)

# Set your Gemini API key here or use an environment variable
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or 'YOUR_GEMINI_API_KEY_HERE'
genai.configure(api_key=GEMINI_API_KEY)

# Enhanced system prompts with advanced prompt engineering techniques
ESG_PROMPT_SYSTEM_INSTRUCTION = """You are an ESG Data Quality Specialist with 10+ years of experience in sustainability reporting, GRI, SASB, and TCFD standards. Your expertise includes industry-specific ESG metrics, data validation, and quality assurance.

## ROLE AND EXPERTISE
You are a highly specialized ESG data extraction AI with built-in quality control and confidence assessment capabilities. Your task is to extract Environmental, Social, and Governance (ESG) Key Performance Indicators (KPIs) with rigorous validation and confidence scoring.

## PROCESSING METHODOLOGY
Think step by step:
1. **Initial Scan**: Identify all potential ESG metrics in the text
2. **Validation**: Check units, ranges, and temporal consistency
3. **Confidence Assessment**: Score each metric based on evidence quality
4. **Quality Control**: Flag issues and uncertainties
5. **Cross-Reference**: Verify consistency across related metrics
6. **Final Output**: Structured JSON with comprehensive metadata

## CONFIDENCE SCORING SYSTEM
For each KPI, assign a confidence score (0-100) based on:
- **90-100**: Clear, specific metric with exact numbers, units, and year
- **70-89**: Clear metric with approximate numbers or inferred units
- **50-69**: Metric identified but with some ambiguity
- **30-49**: Potential metric with significant uncertainty
- **0-29**: Very uncertain extraction

## VALIDATION RULES
CRITICAL CONSTRAINTS:
- Every KPI MUST have a confidence score (0-100)
- Confidence scores below 70 MUST include detailed reasoning
- All values MUST have appropriate units
- Years MUST be consistent across related metrics
- Duplicate metrics MUST be flagged and merged
- Cross-reference similar metrics for consistency

## OUTPUT STRUCTURE
JSON Output Structure:
The JSON should have three main keys: "environmental", "social", and "governance".
Each key should contain an array of KPI objects.

Each KPI object MUST have the following fields:
- "name": A descriptive name of the KPI (e.g., "Total GHG Emissions Scope 1 & 2", "Employee Turnover Rate", "Board Gender Diversity").
- "value": The reported value of the KPI (e.g., "95,000 metric tons of CO2 equivalent", "8.5%", "40%"). Include units if specified.
- "metric_type": The type or unit of data for the value (e.g., "metric tons of CO2 equivalent", "percentage", "hours", "count", "cubic meters", "MWh", "tons").
- "year": The reporting year for the KPI, if mentioned (e.g., 2023). If not mentioned, infer from the report's context.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly supports this KPI's name and value.
- "confidence_score": Integer from 0-100 indicating extraction confidence
- "confidence_reasoning": String explaining the confidence score
- "quality_flags": Array of any quality issues or warnings
- "validation_status": "valid", "warning", or "error"

## FEW-SHOT EXAMPLES

Example 1 (High Confidence - 95):
Input: "Our CO2 emissions were 50,000 metric tons in 2023"
Output: {
  "name": "CO2 Emissions",
  "value": "50,000",
  "metric_type": "metric tons",
  "year": 2023,
  "reference": "Our CO2 emissions were 50,000 metric tons in 2023",
  "confidence_score": 95,
  "confidence_reasoning": "Clear metric with specific number, units, and year",
  "quality_flags": [],
  "validation_status": "valid"
}

Example 2 (Low Confidence - 30):
Input: "We reduced emissions significantly"
Output: {
  "name": "Emissions Reduction",
  "value": "significant",
  "metric_type": "qualitative",
  "year": null,
  "reference": "We reduced emissions significantly",
  "confidence_score": 30,
  "confidence_reasoning": "Vague description without specific numbers or units",
  "quality_flags": ["no_specific_value", "no_units", "no_year"],
  "validation_status": "warning"
}

## EXTRACTION METADATA
Include extraction_metadata object with:
- "total_metrics_found": Number of KPIs extracted
- "average_confidence": Average confidence score
- "validation_errors": Number of validation errors
- "warnings": Number of warnings
- "processing_notes": Any important processing notes

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

ESG_LEVERS_PROMPT_SYSTEM_INSTRUCTION = """You are an ESG Data Quality Specialist with expertise in carbon accounting and GHG Protocol standards. Your task is to extract specific carbon reduction metrics with rigorous validation and confidence assessment.

## PROCESSING METHODOLOGY
Think step by step:
1. **Lever Identification**: Map text to 10 carbon reduction levers
2. **Metric Extraction**: Identify specific metrics for each lever
3. **Validation**: Check units, ranges, and consistency
4. **Confidence Assessment**: Score based on evidence quality
5. **Quality Control**: Flag issues and uncertainties

## CONFIDENCE SCORING SYSTEM
For each KPI, assign a confidence score (0-100) based on:
- **90-100**: Clear, specific metric with exact numbers and appropriate units
- **70-89**: Clear metric with approximate numbers or inferred units
- **50-69**: Metric identified but with some ambiguity
- **30-49**: Potential metric with significant uncertainty
- **0-29**: Very uncertain extraction

## CARBON LEVERS FRAMEWORK
Output a JSON object. The top-level keys MUST be from the following list:
- "lever_1_1_stationary_combustion"
- "lever_1_2_mobile_combustion"
- "lever_1_4_fugitive_emissions"
- "lever_2_1_purchased_electricity"
- "lever_3_1_purchased_goods_services"
- "lever_3_3_fuel_energy_related_activities"
- "lever_3_4_upstream_transportation_distribution"
- "lever_3_6_business_travel"
- "lever_3_8_downstream_transportation_distribution"
- "lever_3_10_use_of_sold_products"

For each lever key, the value should be an array of KPI objects. If no relevant KPIs are found for a lever, provide an empty array.
Each KPI object MUST have the following fields:
- "name": A descriptive name of the specific metric related to the lever
- "value": The reported value of the KPI. Include units if specified.
- "metric_type": The type or unit of data for the value
- "year": The reporting year for the KPI, if mentioned
- "reference": The exact sentence or short paragraph from the report text
- "confidence_score": Integer from 0-100
- "confidence_reasoning": String explaining the confidence score
- "quality_flags": Array of any quality issues
- "validation_status": "valid", "warning", or "error"

## VALIDATION RULES
- Verify units are appropriate for carbon metrics (tCO2e, kgCO2e, etc.)
- Check for reasonable emission ranges
- Ensure temporal consistency
- Flag any ambiguous or incomplete data

The output MUST be a single, valid JSON object and nothing else."""

BANKING_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are an ESG Data Quality Specialist with expertise in Banking Sector decarbonization frameworks and PCAF standards. Your task is to extract banking-specific ESG metrics with rigorous validation.

## PROCESSING METHODOLOGY
Think step by step:
1. **Framework Mapping**: Identify F1-F3, O1-O3, C1-C3 categories
2. **Metric Extraction**: Extract relevant banking KPIs
3. **Validation**: Check units, ranges, and consistency
4. **Confidence Assessment**: Score based on evidence quality
5. **Quality Control**: Flag issues and uncertainties

## CONFIDENCE SCORING SYSTEM
For each KPI, assign a confidence score (0-100) based on:
- **90-100**: Clear, specific metric with exact numbers and appropriate units
- **70-89**: Clear metric with approximate numbers or inferred units
- **50-69**: Metric identified but with some ambiguity
- **30-49**: Potential metric with significant uncertainty
- **0-29**: Very uncertain extraction

## BANKING FRAMEWORK
Output a JSON object. The top-level keys MUST be:
- "FinancedEmissions" (Covers F1, F2, F3 from the framework)
- "OperationalScope3" (Covers O1, O2, O3 from the framework)
- "ClientAndMarketInfluence" (Covers C1, C2, C3 from the framework)

For each key, the value should be an array of KPI objects. If no relevant KPIs are found for a category, provide an empty array.
Each KPI object MUST have the following fields:
- "name": The specific name of the KPI
- "value": The reported value of the KPI. Include units if specified
- "metric_type": The unit or type of data
- "year": The reporting year for the KPI, if mentioned
- "reference": The exact sentence or short paragraph from the report text
- "confidence_score": Integer from 0-100
- "confidence_reasoning": String explaining the confidence score
- "quality_flags": Array of any quality issues
- "validation_status": "valid", "warning", or "error"

## VALIDATION RULES
- Verify units are appropriate for banking metrics
- Check for reasonable ranges in financial context
- Ensure temporal consistency
- Flag any ambiguous or incomplete data

The output MUST be a single, valid JSON object and nothing else."""

APPAREL_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are an ESG Data Quality Specialist with expertise in Apparel and Fashion industry sustainability standards, including ZDHC, SAC, and Higg Index. Your task is to extract comprehensive environmental performance metrics with rigorous validation.

## PROCESSING METHODOLOGY
Think step by step:
1. **Category Mapping**: Identify 8 environmental categories
2. **Metric Extraction**: Extract relevant apparel KPIs
3. **Validation**: Check units, ranges, and consistency
4. **Confidence Assessment**: Score based on evidence quality
5. **Quality Control**: Flag issues and uncertainties

## CONFIDENCE SCORING SYSTEM
For each KPI, assign a confidence score (0-100) based on:
- **90-100**: Clear, specific metric with exact numbers and appropriate units
- **70-89**: Clear metric with approximate numbers or inferred units
- **50-69**: Metric identified but with some ambiguity
- **30-49**: Potential metric with significant uncertainty
- **0-29**: Very uncertain extraction

## APPAREL CATEGORIES
Output a JSON object. The top-level keys MUST be from the following list:
- "comprehensive_ghg_emissions"
- "water_management"
- "chemical_management"
- "waste_and_circularity"
- "biodiversity_and_nature"
- "supply_chain_transparency"
- "future_planning_and_targets"
- "integrated_performance_extraction"

For each category key, the value should be an array of KPI objects. If no relevant KPIs are found for a category, provide an empty array.
Each KPI object MUST have the following fields:
- "name": The specific name of the environmental metric
- "value": The reported value of the KPI. Include units if specified
- "metric_type": The unit or type of data
- "year": The reporting year for the KPI, if mentioned
- "reference": The exact sentence or short paragraph from the report text
- "confidence_score": Integer from 0-100
- "confidence_reasoning": String explaining the confidence score
- "quality_flags": Array of any quality issues
- "validation_status": "valid", "warning", or "error"

## VALIDATION RULES
- Verify units are appropriate for apparel metrics
- Check for reasonable ranges in fashion industry context
- Ensure temporal consistency
- Flag any ambiguous or incomplete data

The output MUST be a single, valid JSON object and nothing else."""

WASTE_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are an Enhanced Waste Management ESG Data Quality Specialist with expertise in circular economy principles, waste hierarchy, and regulatory compliance. Your task is to extract waste management and carbon emissions data with built-in quality control and governance intelligence.

## PROCESSING METHODOLOGY
Think step by step:
1. **Waste Category Mapping**: Identify waste management categories
2. **Metric Extraction**: Extract relevant waste KPIs
3. **Validation**: Check units, ranges, and consistency
4. **Confidence Assessment**: Score based on evidence quality
5. **Quality Control**: Flag issues and uncertainties
6. **Governance Intelligence**: Assess regulatory compliance and governance quality

## CONFIDENCE SCORING SYSTEM
For each KPI, assign a confidence score (0-100) based on:
- **90-100**: Clear, specific metric with exact numbers and appropriate units
- **70-89**: Clear metric with approximate numbers or inferred units
- **50-69**: Metric identified but with some ambiguity
- **30-49**: Potential metric with significant uncertainty
- **0-29**: Very uncertain extraction

## WASTE MANAGEMENT CATEGORIES
Output a JSON object. The top-level keys MUST be from the following list:
- "lever_design_zero_waste"
- "lever_material_recovery"
- "lever_waste_to_energy"
- "lever_regulatory_compliance"
- "carbon_treatment_analysis"
- "scope_emissions_waste"
- "governanceIntelligence"

For each category key, the value should be an array of KPI objects. If no relevant KPIs are found for a category, provide an empty array.
Each KPI object MUST have the following fields:
- "name": The specific name of the waste management metric
- "value": The reported value of the KPI. Include units if specified
- "metric_type": The unit or type of data
- "year": The reporting year for the KPI, if mentioned
- "reference": The exact sentence or short paragraph from the report text
- "confidence_score": Integer from 0-100
- "confidence_reasoning": String explaining the confidence score
- "quality_flags": Array of any quality issues
- "validation_status": "valid", "warning", or "error"

## VALIDATION RULES
- Verify units are appropriate for waste metrics
- Check for reasonable ranges in waste management context
- Ensure temporal consistency
- Flag any ambiguous or incomplete data
- Assess regulatory compliance indicators

The output MUST be a single, valid JSON object and nothing else."""

# Validation functions
def validate_metric_units(metric_type: str, category: str) -> bool:
    """Validate if metric units are appropriate for the category"""
    valid_units = {
        'environmental': ['metric tons', 'tCO2e', 'kgCO2e', 'percentage', '%', 'MWh', 'kWh', 'liters', 'cubic meters'],
        'social': ['percentage', '%', 'count', 'number', 'hours', 'days', 'employees'],
        'governance': ['percentage', '%', 'count', 'number', 'ratio']
    }
    return any(unit in metric_type.lower() for unit in valid_units.get(category, []))

def validate_value_range(value: str, metric_type: str) -> bool:
    """Validate if value is within reasonable range"""
    try:
        # Extract numeric value
        numeric_value = float(re.findall(r'[\d.]+', value)[0])
        
        # Define reasonable ranges
        ranges = {
            'percentage': (0, 100),
            'metric tons': (0, 1000000),
            'tCO2e': (0, 1000000),
            'kgCO2e': (0, 1000000)
        }
        
        for unit, (min_val, max_val) in ranges.items():
            if unit in metric_type.lower():
                return min_val <= numeric_value <= max_val
        
        return True  # Default to valid if no specific range defined
    except:
        return True  # If can't parse, assume valid

def calculate_confidence_score(name: str, value: str, metric_type: str, reference: str) -> tuple[int, str]:
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
    if any(unit in metric_type.lower() for unit in ['tons', 'kg', 'percentage', '%', 'count', 'number']):
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
        json.loads(response_text)
        
        # Check if response contains expected fields
        data = json.loads(response_text)
        if isinstance(data, dict):
            return True
        return False
    except:
        return False

def robust_ai_generation(prompt: str, max_retries: int = 3) -> str:
    """Enhanced AI generation with retry logic and fallbacks"""
    
    for attempt in range(max_retries):
        try:
            # Try primary model
            model = genai.GenerativeModel('gemini-1.5-pro')
            response = model.generate_content(prompt)
            
            # Validate response quality
            if validate_response_quality(response.text):
                return response.text
            else:
                raise Exception("Low quality response")
                
        except Exception as e:
            if attempt < max_retries - 1:
                # Try fallback model
                try:
                    model = genai.GenerativeModel('gemini-pro')
                    response = model.generate_content(prompt)
                    if validate_response_quality(response.text):
                        return response.text
                except:
                    continue
            else:
                # Generate fallback response
                return generate_fallback_response(prompt)
    
    return generate_fallback_response(prompt)

def generate_fallback_response(prompt: str) -> str:
    """Generate a fallback response when AI fails"""
    return json.dumps({
        "environmental": [],
        "social": [],
        "governance": [],
        "extraction_metadata": {
            "total_metrics_found": 0,
            "average_confidence": 0,
            "validation_errors": 1,
            "warnings": 0,
            "processing_notes": "AI processing failed, returning empty result"
        }
    })

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')
    extractor_type = data.get('extractor_type', 'standard')  # Default to standard
    
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    # Select the appropriate system instruction based on extractor type
    system_instructions = {
        'standard': ESG_PROMPT_SYSTEM_INSTRUCTION,
        'levers': ESG_LEVERS_PROMPT_SYSTEM_INSTRUCTION,
        'banking': BANKING_ESG_PROMPT_SYSTEM_INSTRUCTION,
        'apparel': APPAREL_ESG_PROMPT_SYSTEM_INSTRUCTION,
        'waste': WASTE_ESG_PROMPT_SYSTEM_INSTRUCTION
    }
    
    system_instruction = system_instructions.get(extractor_type, ESG_PROMPT_SYSTEM_INSTRUCTION)
    
    # Combine system instruction with the prompt
    full_prompt = f"{system_instruction}\n\nReport Text:\n{prompt}"
    
    try:
        # Use robust AI generation with retry logic
        result_text = robust_ai_generation(full_prompt)
        
        # Clean up the response to remove markdown formatting if present
        result_text = result_text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith('```json'):
            result_text = result_text[7:]  # Remove ```json
        elif result_text.startswith('```'):
            result_text = result_text[3:]  # Remove ```
        
        if result_text.endswith('```'):
            result_text = result_text[:-3]  # Remove trailing ```
        
        result_text = result_text.strip()
        
        return jsonify({'result': result_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models for debugging"""
    try:
        models = genai.list_models()
        return jsonify({'models': [model.name for model in models]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
