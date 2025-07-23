
import React, { useState, useEffect, useCallback } from 'react';
import { RSS_SOURCES, ALL_SOURCES_OBJECT } from './constants';
import type { RssSource, RssArticle, RssFeed } from './types';
import { fetchFeed } from './services/rssService';
import { generateExecutiveReport, generateFocusedReport, generateFullReport, generateCustomReport, generateReportFromSelection } from './services/geminiService';
import Header from './components/Header';
import SourceSelector from './components/SourceSelector';
import ArticleList from './components/ArticleList';
import SummaryModal from './components/SummaryModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';

const REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
const MAX_ALL_ARTICLES = 50; // Limit total articles when fetching all sources

const App: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<RssSource | null>(null);
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<RssArticle | null>(null);
  const [customSelection, setCustomSelection] = useState<string[]>([]);
  const [isArticleSelectionMode, setIsArticleSelectionMode] = useState<boolean>(false);
  const [selectedArticleGuids, setSelectedArticleGuids] = useState<string[]>([]);


  // State for reports
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [executiveReport, setExecutiveReport] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSourceArticles, setReportSourceArticles] = useState<RssArticle[]>([]);
  const [reportTitle, setReportTitle] = useState<string>('');


  const loadFeed = useCallback(async (source: RssSource, isAutoRefresh: boolean = false) => {
    if (isAutoRefresh) {
      setIsAutoRefreshing(true);
    } else {
      setIsLoading(true);
      setArticles([]);
      setIsArticleSelectionMode(false);
      setSelectedArticleGuids([]);
    }
    setError(null);
    
    try {
      const feedData: RssFeed = await fetchFeed(source.url);
      if (feedData.status === 'ok') {
        setArticles(feedData.items);
      } else {
        throw new Error(feedData.message || 'Failed to fetch RSS feed.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to load feed from ${source.name}: ${err.message}`);
      } else {
        setError(`An unknown error occurred while loading feed from ${source.name}.`);
      }
    } finally {
      if (isAutoRefresh) {
        setIsAutoRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSource && selectedSource.url !== ALL_SOURCES_OBJECT.url) {
      loadFeed(selectedSource);
    }
  }, [selectedSource, loadFeed]);
  
  // Set up interval for auto-refreshing
  useEffect(() => {
    // Do not auto-refresh if no source is selected or "All Sources" is selected
    if (!selectedSource || selectedSource.url === ALL_SOURCES_OBJECT.url) return;

    const intervalId = setInterval(() => {
      console.log(`Auto-refreshing feed for ${selectedSource.name}`);
      loadFeed(selectedSource, true);
    }, REFRESH_INTERVAL);

    // Cleanup on component unmount or when source changes
    return () => clearInterval(intervalId);
  }, [selectedSource, loadFeed]);

  const handleSelectSource = (source: RssSource) => {
    setSelectedSource(source);
    setCustomSelection([]);
  };

  const handleSummarize = (article: RssArticle) => {
    setSelectedArticle(article);
  };
  
  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  const handleGenerateExecutiveReport = async () => {
    if (articles.length < 5) return;

    const newestArticles = articles.slice(0, 5);
    setReportSourceArticles(newestArticles);
    setIsGeneratingReport(true);
    setExecutiveReport(null);
    setReportError(null);
    setReportTitle('Executive Intelligence Briefing');
    setShowReportModal(true);

    try {
      const report = await generateExecutiveReport(newestArticles);
      setExecutiveReport(report);
    } catch (err) {
      if (err instanceof Error) {
        setReportError(err.message);
      } else {
        setReportError('An unknown error occurred while generating the report.');
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  const handleGenerateFocusedReport = async (reportType: string) => {
    if (articles.length < 5) return;
    
    const newestArticles = articles.slice(0, 5);
    setReportSourceArticles(newestArticles);
    setIsGeneratingReport(true);
    setExecutiveReport(null);
    setReportError(null);
    setReportTitle(reportType);
    setShowReportModal(true);
    
    try {
        const report = await generateFocusedReport(newestArticles, reportType);
        setExecutiveReport(report);
    } catch (err) {
        if (err instanceof Error) {
            setReportError(err.message);
        } else {
            setReportError('An unknown error occurred while generating the report.');
        }
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleGenerateFullReport = async () => {
    if (articles.length < 5) return;
    
    const newestArticles = articles.slice(0, 5);
    setReportSourceArticles(newestArticles);
    setIsGeneratingReport(true);
    setExecutiveReport(null);
    setReportError(null);
    setReportTitle('Full Intelligence Report');
    setShowReportModal(true);
    
    try {
        const report = await generateFullReport(newestArticles);
        setExecutiveReport(report);
    } catch (err) {
        if (err instanceof Error) {
            setReportError(err.message);
        } else {
            setReportError('An unknown error occurred while generating the report.');
        }
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
  };

  const handleFetchAllSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setArticles([]);
    setSelectedSource(ALL_SOURCES_OBJECT);
    setCustomSelection([]);
    setIsArticleSelectionMode(false);
    setSelectedArticleGuids([]);

    try {
      const results = await Promise.allSettled(
        RSS_SOURCES.map(source => fetchFeed(source.url))
      );

      const allArticles: RssArticle[] = [];
      const uniqueLinks = new Set<string>();
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.status === 'ok') {
          result.value.items.forEach(article => {
            if (article.link && !uniqueLinks.has(article.link)) {
              allArticles.push(article);
              uniqueLinks.add(article.link);
            }
          });
        } else if (result.status === 'rejected') {
          console.error("A feed failed to load:", result.reason);
        }
      });

      allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      
      setArticles(allArticles.slice(0, MAX_ALL_ARTICLES));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to load all feeds: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleCustomSource = (sourceUrl: string) => {
    setCustomSelection(prev => 
      prev.includes(sourceUrl)
        ? prev.filter(url => url !== sourceUrl)
        : [...prev, sourceUrl]
    );
    setSelectedSource(null); // Deselect single source view
    setArticles([]);
  };
  
  const handleGenerateCustomReport = async () => {
      if (customSelection.length === 0) return;

      setIsGeneratingReport(true);
      setReportError(null);
      setExecutiveReport(null);
      setReportTitle('Custom Intelligence Report');
      setShowReportModal(true);

      try {
          const selectedSources = RSS_SOURCES.filter(s => customSelection.includes(s.url));
          const results = await Promise.allSettled(
            selectedSources.map(source => fetchFeed(source.url))
          );

          const allArticles: RssArticle[] = [];
          const uniqueLinks = new Set<string>();

          results.forEach(result => {
              if (result.status === 'fulfilled' && result.value.status === 'ok') {
                  result.value.items.forEach(article => {
                      if (article.link && !uniqueLinks.has(article.link)) {
                          allArticles.push(article);
                          uniqueLinks.add(article.link);
                      }
                  });
              }
          });

          allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

          if (allArticles.length < 5) {
              throw new Error(`A minimum of 5 articles are required across selected feeds. Found only ${allArticles.length}.`);
          }

          const newestArticles = allArticles.slice(0, 5);
          const sourceNames = selectedSources.map(s => s.name);

          setReportSourceArticles(newestArticles);
          const report = await generateCustomReport(newestArticles, sourceNames);
          setExecutiveReport(report);
      } catch (err) {
          if (err instanceof Error) {
              setReportError(err.message);
          } else {
              setReportError('An unknown error occurred while generating the custom report.');
          }
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const handleToggleArticleSelectionMode = () => {
    setIsArticleSelectionMode(prev => !prev);
    setSelectedArticleGuids([]); // Reset selection when toggling mode
  };

  const handleToggleArticleForReport = (articleGuid: string) => {
    setSelectedArticleGuids(prev => 
      prev.includes(articleGuid) 
        ? prev.filter(g => g !== articleGuid) 
        : [...prev, articleGuid]
    );
  };

  const handleGenerateReportFromSelection = async () => {
    if (selectedArticleGuids.length === 0) return;

    const selectedArticlesForReport = articles.filter(a => selectedArticleGuids.includes(a.guid));
    
    setReportSourceArticles(selectedArticlesForReport);
    setIsGeneratingReport(true);
    setExecutiveReport(null);
    setReportError(null);
    setReportTitle('Report from Selected Articles');
    setShowReportModal(true);

    try {
        const report = await generateReportFromSelection(selectedArticlesForReport);
        setExecutiveReport(report);
    } catch (err) {
        if (err instanceof Error) {
            setReportError(err.message);
        } else {
            setReportError('An unknown error occurred while generating the report from your selection.');
        }
    } finally {
        setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary font-sans">
      <Header />
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 lg:w-72 xl:w-80 p-4 border-b md:border-b-0 md:border-r border-brand-border flex-shrink-0">
          <SourceSelector 
            sources={RSS_SOURCES}
            selectedSource={selectedSource}
            onSelectSource={handleSelectSource}
            articleCount={articles.length}
            isGeneratingReport={isGeneratingReport}
            onGenerateFocusedReport={handleGenerateFocusedReport}
            onGenerateFullReport={handleGenerateFullReport}
            onGenerateCustomReport={handleGenerateCustomReport}
            onFetchAll={handleFetchAllSources}
            isLoading={isLoading}
            customSelection={customSelection}
            onToggleCustomSource={handleToggleCustomSource}
          />
        </aside>
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <ArticleList
            articles={articles}
            isLoading={isLoading}
            isAutoRefreshing={isAutoRefreshing}
            error={error}
            sourceName={selectedSource?.name}
            onSummarize={handleSummarize}
            onGenerateReport={handleGenerateExecutiveReport}
            isGeneratingReport={isGeneratingReport}
            isCustomSelectionActive={customSelection.length > 0}
            isArticleSelectionMode={isArticleSelectionMode}
            onToggleArticleSelectionMode={handleToggleArticleSelectionMode}
            selectedArticleGuids={selectedArticleGuids}
            onToggleArticleForReport={handleToggleArticleForReport}
            onGenerateReportFromSelection={handleGenerateReportFromSelection}
          />
        </main>
      </div>
      {selectedArticle && (
        <SummaryModal 
          article={selectedArticle}
          onClose={handleCloseModal}
        />
      )}
      {showReportModal && (
        <ExecutiveReportModal
          title={reportTitle}
          report={executiveReport}
          isLoading={isGeneratingReport}
          error={reportError}
          sourceArticles={reportSourceArticles}
          onClose={handleCloseReportModal}
        />
      )}
    </div>
  );
};

export default App;
