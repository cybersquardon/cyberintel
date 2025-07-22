
import React, { useState, useEffect } from 'react';
import type { RssArticle } from '../types';
import { summarizeArticle } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CloseIcon, LinkIcon } from './icons';

interface SummaryModalProps {
  article: RssArticle;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ article, onClose }) => {
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      setIsSummarizing(true);
      setError(null);
      setSummary('');
      try {
        const textToSummarize = `${article.title}\n\n${article.description.replace(/<[^>]*>?/gm, '')}`;
        const result = await summarizeArticle(textToSummarize);
        setSummary(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while generating the summary.');
        }
        console.error(err);
      } finally {
        setIsSummarizing(false);
      }
    };

    generateSummary();
  }, [article]);

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface w-full max-w-2xl rounded-lg shadow-2xl p-6 md:p-8 relative border border-brand-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          aria-label="Close summary modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-brand-text-primary mb-2">{article.title}</h2>
        
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent-hover mb-6"
        >
          <LinkIcon className="w-4 h-4" />
          Read Original Article
        </a>
        
        <div className="mt-4 border-t border-brand-border pt-4">
          <h3 className="font-semibold text-lg text-brand-text-primary mb-3">AI Summary</h3>
          {isSummarizing && (
            <div className="flex items-center gap-3 text-brand-text-secondary" aria-label="Generating summary">
              <LoadingSpinner size="h-6 w-6" />
              <p>Generating summary...</p>
            </div>
          )}
          {error && <p className="text-red-400" role="alert">{error}</p>}
          {summary && <p className="text-brand-text-secondary whitespace-pre-wrap">{summary}</p>}
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
