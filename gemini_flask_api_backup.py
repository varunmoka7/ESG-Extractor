import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Set your Gemini API key here or use an environment variable
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or 'YOUR_GEMINI_API_KEY_HERE'
genai.configure(api_key=GEMINI_API_KEY)

# System prompts for different extractor types
ESG_PROMPT_SYSTEM_INSTRUCTION = """You are a highly specialized ESG data extraction AI. Your sole function is to meticulously analyze the provided input text and transform relevant information into a precise JSON format as defined below. Adherence to the specified JSON structure and field definitions is paramount.

Your task is to extract Environmental, Social, and Governance (ESG) Key Performance Indicators (KPIs) from the provided sustainability report text.

JSON Output Structure:
Please identify KPIs and present them in a structured JSON format.
The JSON should have three main keys: "environmental", "social", and "governance".
Each key should contain an array of KPI objects.

Each KPI object MUST have the following base fields:
- "name": A descriptive name of the KPI (e.g., "Total GHG Emissions Scope 1 & 2", "Employee Turnover Rate", "Board Gender Diversity").
- "value": The reported value of the KPI (e.g., "95,000 metric tons of CO2 equivalent", "8.5%", "40%"). Include units if specified.
- "metric_type": The type or unit of data for the value (e.g., "metric tons of CO2 equivalent", "percentage", "hours", "count", "cubic meters", "MWh", "tons").
- "year": The reporting year for the KPI, if mentioned (e.g., 2023). If not mentioned, or if a general period is implied by the report context (like "current year"), use the most relevant year from the report.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly supports this KPI's name and value.

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

ESG_LEVERS_PROMPT_SYSTEM_INSTRUCTION = """You are a highly specialized ESG data extraction AI. Your sole function is to meticulously analyze the provided text and transform relevant information into a precise JSON format as defined below. Adherence to the specified JSON structure and field definitions is paramount for successful data processing.

Your task is to extract specific carbon reduction metrics from the provided sustainability report text, based on a predefined set of 10 carbon reduction levers.

Output a JSON object. The top-level keys of this JSON object MUST be from the following list:
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

For each lever key, the value should be an array of KPI objects. If no relevant KPIs are found for a lever, you can either omit the key or provide an empty array for that lever.
Each KPI object MUST have the following fields:
- "name": A descriptive name of the specific metric related to the lever (e.g., "Total Stationary Combustion Emissions", "Fleet Emission Intensity", "Renewable Electricity Percentage").
- "value": The reported value of the KPI (e.g., "95,000 tCO2e", "0.5 gCO2e/km", "30%"). Include units if specified.
- "metric_type": The type or unit of data for the value (e.g., "tCO2e", "gCO2e/km", "percentage", "kWh per unit", "number", "kgCO2e per GJ").
- "year": The reporting year for the KPI, if mentioned (e.g., 2023). If not mentioned, infer from the report's context.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly supports this KPI's name and value.

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

BANKING_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are a highly specialized ESG data extraction AI with expertise in the Banking Sector. Your sole function is to meticulously analyze the provided text and transform relevant information into a precise JSON format as defined below. Adherence to the specified JSON structure and field definitions is paramount for successful data processing.

Your task is to extract specific Key Performance Indicators (KPIs) from the provided sustainability report text, based on a detailed framework of banking sector decarbonization levers.

Output a JSON object. The top-level keys of this JSON object MUST be:
- "FinancedEmissions" (Covers F1, F2, F3 from the framework)
- "OperationalScope3" (Covers O1, O2, O3 from the framework)
- "ClientAndMarketInfluence" (Covers C1, C2, C3 from the framework)

For each key, the value should be an array of KPI objects. If no relevant KPIs are found for a category, you can either omit the key or provide an empty array.
Each KPI object MUST have the following fields:
- "name": The specific name of the KPI as listed below.
- "value": The reported value of the KPI. Include units if specified. If a target is mentioned (e.g. "50% by 2030"), capture the full target.
- "metric_type": The unit or type of data (e.g., "tCO2e/€1M loans", "tCO2e", "%", "kgCO2e/m²", "€ Billion", "Number", "EPC Rating", "°C").
- "year": The reporting year for the KPI, if mentioned. For targets, if a target year is mentioned, use that. Infer from context if not explicit.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly supports this KPI's name and value.

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

APPAREL_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are a highly specialized ESG data extraction AI with expertise in the Apparel and Fashion industry. Your sole function is to meticulously analyze company documents and transform relevant environmental performance information into a precise JSON format as defined below. Adherence to the specified JSON structure and field definitions is paramount for successful data processing.

Your role is to extract comprehensive environmental performance metrics.

Output a JSON object. The top-level keys of this JSON object MUST be from the following list, representing the 8 environmental categories:
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
- "name": The specific name of the environmental metric as detailed in the lists below (e.g., "Stationary combustion emissions", "ZDHC MRSL compliance", "Manufacturing waste diversion rate").
- "value": The reported value of the KPI. Include units if specified (e.g., "1500 tCO2e", "95%", "70%").
- "metric_type": The unit or type of data (e.g., "tCO2e", "%", "liters per garment", "kg", "status", "count", "€").
- "year": The reporting year for the KPI, if mentioned. Infer from context if not explicit.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly and unambiguously supports the extracted "name", "value", AND "year" of that specific KPI instance.

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

WASTE_ESG_PROMPT_SYSTEM_INSTRUCTION = """You are an Enhanced Waste Management ESG Data Extraction AI with built-in quality control capabilities. Your task is to extract waste management and carbon emissions data, then CRITICALLY REVIEW your own extraction to eliminate duplications, misclassifications, and optimize governance intelligence.

Output a JSON object. The top-level keys of this JSON object MUST be from the following list:
- "lever_design_zero_waste"
- "lever_material_recovery"
- "lever_waste_to_energy"
- "lever_regulatory_compliance"
- "carbon_treatment_analysis"
- "scope_emissions_waste"
- "governanceIntelligence"

For each category key, the value should be an array of KPI objects. If no relevant KPIs are found for a category, provide an empty array.
Each KPI object MUST have the following fields:
- "name": The specific name of the waste management metric.
- "value": The reported value of the KPI. Include units if specified.
- "metric_type": The unit or type of data.
- "year": The reporting year for the KPI, if mentioned. Infer from context if not explicit.
- "reference": The exact sentence or short paragraph (maximum 2-3 sentences) from the report text that directly supports this KPI's name and value.

The output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, notes, or markdown fences."""

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
        # Try the newer model name first
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
        except:
            # Fallback to the older model name
            model = genai.GenerativeModel('gemini-pro')
        
        response = model.generate_content(full_prompt)
        
        # Clean up the response to remove markdown formatting if present
        result_text = response.text.strip()
        
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