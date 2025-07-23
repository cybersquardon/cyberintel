
import React from 'react';
import type { RssSource } from '../types';
import { AlertTriangleIcon, FireIcon, BuildingOfficeIcon, DocumentTextIcon, ArrowPathIcon, CogIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { ALL_SOURCES_OBJECT } from '../constants';


interface SourceSelectorProps {
  sources: RssSource[];
  selectedSource: RssSource | null;
  onSelectSource: (source: RssSource) => void;
  articleCount: number;
  isGeneratingReport: boolean;
  onGenerateFocusedReport: (reportType: string) => void;
  onGenerateFullReport: () => void;
  onGenerateCustomReport: () => void;
  onFetchAll: () => void;
  isLoading: boolean;
  customSelection: string[];
  onToggleCustomSource: (sourceUrl: string) => void;
}

const reportTypes = [
    { name: 'Key Security Alerts', icon: AlertTriangleIcon, type: 'Key Security Alerts' },
    { name: 'Major Cyber Incidents', icon: FireIcon, type: 'Major Cyber Incidents' },
    { name: 'Impact to Conglomerate', icon: BuildingOfficeIcon, type: 'Impact to Conglomerate' },
];

const SourceSelector: React.FC<SourceSelectorProps> = ({ 
    sources, 
    selectedSource, 
    onSelectSource, 
    articleCount, 
    isGeneratingReport, 
    onGenerateFocusedReport, 
    onGenerateFullReport,
    onGenerateCustomReport, 
    onFetchAll, 
    isLoading,
    customSelection,
    onToggleCustomSource
}) => {
  const canGenerate = articleCount >= 5 && customSelection.length === 0;
  const canGenerateCustom = customSelection.length > 0;
  const isFetchingAll = isLoading && selectedSource?.url === ALL_SOURCES_OBJECT.url;
  
  return (
    <nav className="flex flex-col h-full">
      <div>
        <button
          onClick={onFetchAll}
          disabled={isLoading || isGeneratingReport}
          className="w-full flex items-center justify-between mb-3 px-2 py-1 rounded-md hover:bg-brand-surface group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fetch latest from all sources"
        >
          <h2 className="text-lg font-semibold text-brand-text-secondary group-hover:text-brand-text-primary transition-colors">
            Sources
          </h2>
          {isFetchingAll ? (
            <LoadingSpinner size="w-5 h-5" />
          ) : (
            <ArrowPathIcon className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
          )}
        </button>

        <ul className="space-y-1">
          {sources.map((source) => (
            <li key={source.url} className="flex items-center gap-2 pr-2">
              <input
                type="checkbox"
                id={`source-check-${source.url}`}
                checked={customSelection.includes(source.url)}
                onChange={() => onToggleCustomSource(source.url)}
                disabled={isGeneratingReport || isLoading}
                className="ml-2 h-4 w-4 rounded bg-brand-surface border-brand-border text-brand-accent focus:ring-brand-accent focus:ring-2 disabled:opacity-50"
                aria-label={`Select ${source.name} for custom report`}
              />
              <button
                onClick={() => onSelectSource(source)}
                disabled={isGeneratingReport || isLoading}
                className={`flex-grow text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm ${
                  selectedSource?.url === source.url
                    ? 'bg-brand-accent text-brand-bg font-semibold'
                    : 'text-brand-text-primary hover:bg-brand-surface'
                } disabled:opacity-50 disabled:hover:bg-transparent`}
              >
                {source.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 pt-4 border-t border-brand-border">
        <h2 className="text-lg font-semibold mb-3 text-brand-text-secondary px-2">Quick Reports</h2>
        <div className="space-y-2">
            {reportTypes.map(report => {
                const Icon = report.icon;
                return (
                    <button
                        key={report.type}
                        onClick={() => onGenerateFocusedReport(report.type)}
                        disabled={!canGenerate || isGeneratingReport}
                        title={!canGenerate ? 'Select a single source with at least 5 articles' : `Generate ${report.name} Report`}
                        className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm text-brand-text-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                       <Icon className="w-5 h-5 flex-shrink-0" />
                       <span className="flex-grow">{report.name}</span>
                    </button>
                );
            })}
             <button
                onClick={onGenerateFullReport}
                disabled={!canGenerate || isGeneratingReport}
                title={!canGenerate ? 'Select a single source with at least 5 articles' : 'Generate Full Report'}
                className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm text-brand-text-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent mt-2 pt-3 border-t border-brand-border"
            >
               <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
               <span className="flex-grow font-semibold">Full Report</span>
            </button>
            <button
                onClick={onGenerateCustomReport}
                disabled={!canGenerateCustom || isGeneratingReport}
                title={!canGenerateCustom ? 'Select one or more sources using the checkboxes' : 'Generate a report from selected sources'}
                className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm text-brand-text-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent mt-2"
            >
               <CogIcon className="w-5 h-5 flex-shrink-0" />
               <span className="flex-grow font-semibold">Custom Report</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default SourceSelector;
