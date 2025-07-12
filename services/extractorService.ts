/// <reference types="vite/client" />

export async function extractESGMetrics(reportText: string, extractorType: string = 'standard'): Promise<any> {
  const response = await fetch('http://localhost:5005/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt: reportText,
      extractor_type: extractorType
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();
  
  // Handle markdown code blocks if present
  let jsonText = data.result;
  
  // Remove markdown code blocks if present
  if (jsonText.includes('```json')) {
    jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.includes('```')) {
    jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Trim whitespace
  jsonText = jsonText.trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Raw response:', data.result);
    console.error('Cleaned response:', jsonText);
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
    throw new Error(`Failed to parse JSON response: ${errorMessage}`);
  }
} 