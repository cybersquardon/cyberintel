
import React from 'react';
import type { RssArticle } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { CloseIcon, BriefcaseIcon } from './icons';

interface ExecutiveReportModalProps {
  title: string;
  report: string | null;
  isLoading: boolean;
  error: string | null;
  sourceArticles: RssArticle[];
  onClose: () => void;
}

const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({ title, report, isLoading, error, sourceArticles, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface w-full max-w-3xl rounded-lg shadow-2xl p-6 md:p-8 relative border border-brand-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          aria-label="Close report modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          {title === 'Executive Intelligence Briefing' && <BriefcaseIcon className="w-8 h-8 text-brand-accent" />}
          <h2 className="text-2xl font-bold text-brand-text-primary">{title}</h2>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="border-t border-brand-border pt-4">
            <h3 className="font-semibold text-lg text-brand-text-primary mb-3">AI Generated Report</h3>
            {isLoading && (
              <div className="flex items-center gap-3 text-brand-text-secondary" aria-label="Generating executive report">
                <LoadingSpinner size="h-6 w-6" />
                <p>Synthesizing intel from {sourceArticles.length} articles...</p>
              </div>
            )}
            {error && <p className="text-red-400" role="alert">{error}</p>}
            {report && <p className="text-brand-text-secondary whitespace-pre-wrap leading-relaxed">{report}</p>}
          </div>

          {!isLoading && (report || error) && (
            <div className="mt-6 border-t border-brand-border pt-4">
                <h3 className="font-semibold text-lg text-brand-text-primary mb-3">References</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-brand-text-secondary">
                    {sourceArticles.map(article => (
                        <li key={article.guid}>
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">
                                {article.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveReportModal;
