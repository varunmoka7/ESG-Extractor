#!/usr/bin/env python3
"""
Test script for enhanced ESG extractor
Tests the new confidence scoring, validation, and error handling features
"""

import json
import requests
import time

def test_enhanced_extractor():
    """Test the enhanced ESG extractor with sample data"""
    
    # Sample ESG report text
    test_text = """
    In 2023, our company achieved significant sustainability milestones. 
    Our total greenhouse gas emissions were 95,000 metric tons of CO2 equivalent, 
    representing a 15% reduction from our 2022 baseline of 112,000 metric tons. 
    We increased our renewable energy usage to 40% of total energy consumption. 
    Our board of directors now includes 45% women, up from 30% in 2022. 
    Employee satisfaction scores reached 85% in our annual survey. 
    We diverted 85% of our waste from landfills through recycling and composting programs.
    """
    
    # Test data
    test_cases = [
        {
            'name': 'Standard ESG Extraction',
            'extractor_type': 'standard',
            'text': test_text
        },
        {
            'name': 'Carbon Levers Extraction',
            'extractor_type': 'levers',
            'text': test_text
        }
    ]
    
    print("🧪 Testing Enhanced ESG Extractor")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n📋 Testing: {test_case['name']}")
        print("-" * 30)
        
        try:
            # Make API request
            response = requests.post(
                'http://localhost:5005/generate',
                json={
                    'prompt': test_case['text'],
                    'extractor_type': test_case['extractor_type']
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Parse the result
                try:
                    data = json.loads(result['result'])
                    print(f"✅ Success: {len(data.get('environmental', []))} environmental metrics")
                    print(f"✅ Success: {len(data.get('social', []))} social metrics")
                    print(f"✅ Success: {len(data.get('governance', []))} governance metrics")
                    
                    # Check for enhanced features
                    if 'extraction_metadata' in data:
                        metadata = data['extraction_metadata']
                        print(f"📊 Metadata: {metadata.get('total_metrics_found', 0)} total metrics")
                        print(f"📊 Average Confidence: {metadata.get('average_confidence', 0)}%")
                        print(f"📊 Validation Errors: {metadata.get('validation_errors', 0)}")
                        print(f"📊 Warnings: {metadata.get('warnings', 0)}")
                    
                    # Check for confidence scores
                    all_kpis = []
                    for category in ['environmental', 'social', 'governance']:
                        all_kpis.extend(data.get(category, []))
                    
                    confidence_scores = [kpi.get('confidence_score', 0) for kpi in all_kpis]
                    if confidence_scores:
                        print(f"🎯 Confidence Scores: {min(confidence_scores)}-{max(confidence_scores)}%")
                    
                    # Check for quality flags
                    quality_flags = []
                    for kpi in all_kpis:
                        quality_flags.extend(kpi.get('quality_flags', []))
                    if quality_flags:
                        print(f"⚠️  Quality Flags: {set(quality_flags)}")
                    
                except json.JSONDecodeError as e:
                    print(f"❌ JSON Parse Error: {e}")
                    print(f"Raw response: {result['result'][:200]}...")
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
        
        time.sleep(1)  # Rate limiting
    
    print("\n" + "=" * 50)
    print("🏁 Testing Complete!")

if __name__ == "__main__":
    test_enhanced_extractor()
