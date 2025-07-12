


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
    GEMINI_MODEL_NAME, 
    ESG_PROMPT_SYSTEM_INSTRUCTION, 
    ESG_LEVERS_PROMPT_SYSTEM_INSTRUCTION,
    BANKING_ESG_PROMPT_SYSTEM_INSTRUCTION,
    APPAREL_ESG_PROMPT_SYSTEM_INSTRUCTION,
    WASTE_ESG_PROMPT_SYSTEM_INSTRUCTION,
    PERFORMANCE_REPORT_SYSTEM_INSTRUCTION,
    LEVER_DETAILS, 
    BANKING_LEVER_CATEGORIES, 
    APPAREL_CATEGORY_DETAILS,
    ENHANCED_WASTE_FRAMEWORK_DETAILS
} from '../constants';
import { 
    ExtractedESGData, 
    GeminiESGResponse, 
    GeminiKPI, 
    KPI,
    ExtractedLeverData,
    GeminiLeverResponse,
    GeminiLeverKPI,
    LeverKPI,
    LeverKey,
    ExtractedBankingData,
    GeminiBankingResponse,
    GeminiBankingKPI,
    BankingKPI,
    BankingLeverCategory,
    ExtractedApparelData, 
    GeminiApparelResponse, 
    GeminiApparelKPI, 
    ApparelKPI, 
    ApparelCategoryKey,
    ExtractedWasteData,
    GeminiWasteResponse,
    EnhancedWasteMetric,
    EnhancedWasteCoreCDPMetric,
    EnhancedWasteCarbonIntegratedMetric,
    EnhancedWasteScopeEmissionMetric,
    EnhancedPolicyFramework,
    EnhancedGovernanceStructure,
    PerformanceReportData
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// REMOVE ALL CODE except for generatePerformanceReport export if it does not use Gemini SDK
// If generatePerformanceReport uses Gemini SDK, move it to a new file for backend/serverless use


export const generatePerformanceReport = async (
  kpis: ExtractedESGData | ExtractedLeverData | ExtractedBankingData | ExtractedApparelData | ExtractedWasteData,
  industry: string,
  companyName: string
): Promise<PerformanceReportData> => {
  
  const promptPayload = {
    kpis: kpis,
    industry: industry || "Generic", 
    companyName: companyName || "The Company" 
  };

  const promptContent = JSON.stringify(promptPayload);

  const response = await generateContentWithRetry(
    GEMINI_MODEL_NAME,
    promptContent,
    PERFORMANCE_REPORT_SYSTEM_INSTRUCTION 
  );
  return parsePerformanceReportResponse(response.text);
};