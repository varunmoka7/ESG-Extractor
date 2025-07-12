
import React from 'react';
import { ExtractedESGData, KPICategory, KPI } from '../types';
import KpiCard from './KpiCard';
import { exportV1KpisToCsv } from '../utils/csvExporter'; 

// SVG Icons (retained)
const LeafIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className || "w-6 h-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className || "w-6 h-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.026M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const BriefcaseIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className || "w-6 h-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V3m-18 0h18M12 6.75h.008v.008H12V6.75Zm-.375 0h.008v.008h-.008V6.75Zm.75 0h.008v.008h-.008V6.75Zm-.375 3h.008v.008h-.008V9.75Zm.75 0h.008v.008h-.008V9.75Zm-.375 3h.008v.008h-.008v-0.008Zm.75 0h.008v.008h-.008v-0.008Zm-3.75-3h.008v.008H9V9.75Zm.75 0h.008v.008h-.008V9.75Zm-.375 3h.008v.008H9v-0.008Zm.75 0h.008v.008h-.008v-0.008Zm-3.75-3h.008v.008H6V9.75Zm.75 0h.008v.008H6.75V9.75Z" />
  </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className || "w-5 h-5"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const GENERAL_SUB_CATEGORY_KEY = "General Metrics"; // Used if category_detail is not present

interface CategorySectionProps {
  title: string; 
  kpis: KPI[]; 
  icon: React.ReactNode; 
  colorClass: string; 
  darkColorClass: string; 
  borderColorClass: string; 
  darkBorderColorClass: string; 
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, kpis, icon, colorClass, darkColorClass, borderColorClass, darkBorderColorClass }) => {
  if (!kpis || kpis.length === 0) {
    return (
      <div className={`mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-700/50 border-l-4 ${borderColorClass} ${darkBorderColorClass}`}>
        <div className={`flex items-center text-2xl font-semibold mb-3 ${colorClass} ${darkColorClass}`}>
          {icon}
          <h3 className="ml-3">{title}</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400">No KPIs extracted for this category from the provided text.</p>
      </div>
    );
  }

  // Group KPIs by their primary 'name' first
  const groupedByMetricName = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.name]) {
      acc[kpi.name] = [];
    }
    acc[kpi.name].push(kpi);
    return acc;
  }, {} as Record<string, KPI[]>);

  // Then, organize these groups by sub-category ('category_detail')
  const organizedBySubCategory: Record<string, Record<string, KPI[]>> = {};
  for (const metricName in groupedByMetricName) {
    const kpiItems = groupedByMetricName[metricName];
    // Use the category_detail of the first item in the group (assuming it's consistent for the same metric name)
    const subCategoryKey = kpiItems[0]?.category_detail?.trim() || GENERAL_SUB_CATEGORY_KEY;
    if (!organizedBySubCategory[subCategoryKey]) {
      organizedBySubCategory[subCategoryKey] = {};
    }
    organizedBySubCategory[subCategoryKey][metricName] = kpiItems;
  }
  
  const subCategoryKeys = Object.keys(organizedBySubCategory).sort((a, b) => {
    if (a === GENERAL_SUB_CATEGORY_KEY) return 1;
    if (b === GENERAL_SUB_CATEGORY_KEY) return -1;
    return a.localeCompare(b);
  });

  const hasMultipleSubCategories = subCategoryKeys.length > 1 || (subCategoryKeys.length === 1 && subCategoryKeys[0] !== GENERAL_SUB_CATEGORY_KEY);

  return (
    <section className="mb-12">
      <div className={`flex items-center text-3xl font-bold mb-6 pb-2 border-b-2 ${borderColorClass} ${darkBorderColorClass} ${colorClass} ${darkColorClass}`}>
        {icon}
        <h2 className="ml-3">{title}</h2>
      </div>
      
      {subCategoryKeys.map(subCategoryKey => (
        <div key={subCategoryKey} className="mb-8">
          {hasMultipleSubCategories && (
             <h3 className={`text-xl font-semibold mb-4 ml-1 ${colorClass} ${darkColorClass}`}>
              {subCategoryKey}
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6"> {/* Adjusted grid for wider cards */}
            {Object.entries(organizedBySubCategory[subCategoryKey])
              .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)) // Sort metrics by name within sub-category
              .map(([metricName, kpiItems]) => (
                <KpiCard key={metricName} metricName={metricName} kpiItems={kpiItems} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

interface KpiDisplayProps {
  data: ExtractedESGData | null;
}

const KpiDisplay: React.FC<KpiDisplayProps> = ({ data }) => {
  if (!data) {
    return null; 
  }

  const hasData = data.environmental.length > 0 || data.social.length > 0 || data.governance.length > 0;

  const handleDownloadCsv = () => {
    exportV1KpisToCsv(data);
  };

  if (!hasData) {
    return (
      <div className="mt-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl dark:shadow-slate-700/50 text-center">
        <svg className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-2">No Specific KPIs Found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          The AI analyzed the report but could not identify specific ESG Key Performance Indicators matching the defined structure, or the relevant sections might be missing. 
          Consider revising the input text or ensure it contains clear, quantifiable ESG data.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-medium rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:ring-opacity-75 flex items-center space-x-2"
          aria-label="Download standard ESG KPIs as CSV"
        >
          <DownloadIcon />
          <span>Download CSV</span>
        </button>
      </div>

      <CategorySection 
        title={KPICategory.ENVIRONMENTAL} 
        kpis={data.environmental} 
        icon={<LeafIcon className="w-8 h-8"/>}
        colorClass="text-green-600"
        darkColorClass="dark:text-green-400"
        borderColorClass="border-green-500"
        darkBorderColorClass="dark:border-green-500"
      />
      <CategorySection 
        title={KPICategory.SOCIAL} 
        kpis={data.social} 
        icon={<UsersIcon className="w-8 h-8"/>}
        colorClass="text-sky-600"
        darkColorClass="dark:text-sky-400"
        borderColorClass="border-sky-500"
        darkBorderColorClass="dark:border-sky-500"
      />
      <CategorySection 
        title={KPICategory.GOVERNANCE} 
        kpis={data.governance} 
        icon={<BriefcaseIcon className="w-8 h-8"/>}
        colorClass="text-indigo-600"
        darkColorClass="dark:text-indigo-400"
        borderColorClass="border-indigo-500"
        darkBorderColorClass="dark:border-indigo-500"
      />
    </div>
  );
};

export default KpiDisplay;
