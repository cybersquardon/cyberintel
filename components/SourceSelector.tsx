
import React from 'react';
import type { RssSource } from '../types';
import { AlertTriangleIcon, FireIcon, BuildingOfficeIcon, DocumentTextIcon, ArrowPathIcon } from './icons';
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
  onFetchAll: () => void;
  isLoading: boolean;
}

const reportTypes = [
    { name: 'Key Security Alerts', icon: AlertTriangleIcon, type: 'Key Security Alerts' },
    { name: 'Major Cyber Incidents', icon: FireIcon, type: 'Major Cyber Incidents' },
    { name: 'Impact to Conglomerate', icon: BuildingOfficeIcon, type: 'Impact to Conglomerate' },
];

const SourceSelector: React.FC<SourceSelectorProps> = ({ sources, selectedSource, onSelectSource, articleCount, isGeneratingReport, onGenerateFocusedReport, onGenerateFullReport, onFetchAll, isLoading }) => {
  const canGenerate = articleCount >= 5;
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
            <li key={source.url}>
              <button
                onClick={() => onSelectSource(source)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm ${
                  selectedSource?.url === source.url
                    ? 'bg-brand-accent text-brand-bg font-semibold'
                    : 'text-brand-text-primary hover:bg-brand-surface'
                }`}
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
                        title={!canGenerate ? 'Select a source with at least 5 articles' : `Generate ${report.name} Report`}
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
                title={!canGenerate ? 'Select a source with at least 5 articles' : 'Generate Full Report'}
                className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors duration-200 text-sm text-brand-text-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent mt-2 pt-3 border-t border-brand-border"
            >
               <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
               <span className="flex-grow font-semibold">Full Report</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default SourceSelector;
