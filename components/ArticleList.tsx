
import React from 'react';
import type { RssArticle } from '../types';
import ArticleCard from './ArticleCard';
import LoadingSpinner from './LoadingSpinner';
import { InfoIcon, BriefcaseIcon } from './icons';

interface ArticleListProps {
  articles: RssArticle[];
  isLoading: boolean;
  isAutoRefreshing: boolean;
  error: string | null;
  sourceName?: string;
  onSummarize: (article: RssArticle) => void;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, isLoading, isAutoRefreshing, error, sourceName, onSummarize, onGenerateReport, isGeneratingReport }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <LoadingSpinner />
        <p className="mt-4 text-brand-text-secondary">Fetching latest articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 bg-red-900/20 border border-red-500/50 rounded-lg p-8">
        <p className="text-red-400 font-semibold">Error</p>
        <p className="mt-2 text-brand-text-secondary text-center">{error}</p>
      </div>
    );
  }

  if (!sourceName) {
     return (
      <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
        <InfoIcon className="w-16 h-16 text-brand-border" />
        <h2 className="mt-4 text-2xl font-bold">Welcome to your Intel Feed</h2>
        <p className="mt-2 text-brand-text-secondary">Select a source from the left to view the latest articles.</p>
      </div>
    );
  }

  const canGenerateReport = articles.length >= 5;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-brand-text-primary flex items-center gap-3">
          <span>Latest from <span className="text-brand-accent">{sourceName}</span></span>
          {isAutoRefreshing && <LoadingSpinner size="h-6 w-6" />}
        </h2>
        {sourceName && (
          <button
            onClick={onGenerateReport}
            disabled={!canGenerateReport || isGeneratingReport}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-accent text-brand-bg hover:bg-brand-accent-hover transition-all duration-200 disabled:bg-brand-border disabled:cursor-not-allowed disabled:text-brand-text-secondary"
            title={!canGenerateReport ? 'Need at least 5 articles to generate a report' : 'Generate an AI-powered executive summary'}
          >
            {isGeneratingReport ? (
              <>
                <LoadingSpinner size="h-5 w-5" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <BriefcaseIcon className="w-5 h-5" />
                <span>Generate Executive Report</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.guid} article={article} onSummarize={onSummarize} />
        ))}
      </div>
    </div>
  );
};

export default ArticleList;
