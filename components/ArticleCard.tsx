
import React from 'react';
import type { RssArticle } from '../types';
import { DocumentSummarizeIcon, CalendarIcon, CheckIcon } from './icons';

interface ArticleCardProps {
  article: RssArticle;
  onSummarize: (article: RssArticle) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (guid: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSummarize, isSelectionMode, isSelected, onSelect }) => {
  const cleanDescription = article.description.replace(/<[^>]*>?/gm, '').substring(0, 150);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      onSelect(article.guid);
    }
  };

  const handleSummarizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSummarize(article);
  }

  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={handleCardClick}
      className={`relative bg-brand-surface border rounded-lg p-5 flex flex-col justify-between transition-all duration-300 ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-brand-accent ring-2 ring-brand-accent' : 'border-brand-border hover:shadow-lg hover:border-brand-accent hover:-translate-y-1'}`}
      aria-selected={isSelected}
    >
      {isSelectionMode && (
        <div className="absolute top-3 right-3 z-10 p-1 bg-brand-surface/80 rounded-full pointer-events-none">
          <div className={`w-5 h-5 rounded-md border-2 ${isSelected ? 'bg-brand-accent border-brand-accent' : 'border-brand-text-secondary/50'} flex items-center justify-center transition-all`}>
            {isSelected && <CheckIcon className="w-4 h-4 text-brand-bg" />}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-brand-text-primary mb-2 line-clamp-3">{article.title}</h3>
        <div className="flex items-center text-xs text-brand-text-secondary mb-3">
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            <span>{new Date(article.pubDate).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-brand-text-secondary line-clamp-3">{cleanDescription}...</p>
      </div>
      <div className="mt-4 pt-4 border-t border-brand-border">
        <button
          onClick={handleSummarizeClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-colors duration-200"
        >
          <DocumentSummarizeIcon className="w-5 h-5" />
          <span>Summarize with AI</span>
        </button>
      </div>
    </a>
  );
};

export default ArticleCard;
