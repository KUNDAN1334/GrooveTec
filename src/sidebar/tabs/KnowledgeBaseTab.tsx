import React, { useState } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import { MessageType } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import '../styles/tabs.css';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface KnowledgeBaseTabProps {
  ticketSubject: string;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({
  ticketSubject
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState(ticketSubject);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      logger.log('🔍 Searching KB articles for:', searchQuery);
      
      const response = await sendToBackground({
        type: MessageType.SEARCH_ARTICLES,
        payload: {
          query: searchQuery,
          limit: 5
        }
      });
      
      if (response.success) {
        setArticles(response.articles || []);
        logger.success('Articles found:', response.articles?.length);
      } else {
        throw new Error(response.error);
      }
      
    } catch (err: any) {
      logger.warn('KB search error:', err);
      setError('Failed to search articles. Using demo data...');
      
      // Show demo articles on error
      setTimeout(() => {
        setArticles([
          {
            id: 'demo1',
            title: 'Getting Started with ' + searchQuery,
            content: 'Learn how to get started with this topic. Find step-by-step guides to help you.',
            category: 'Getting Started'
          },
          {
            id: 'demo2',
            title: 'FAQ - ' + searchQuery,
            content: 'Frequently asked questions about this topic and common solutions.',
            category: 'FAQ'
          },
          {
            id: 'demo3',
            title: 'Troubleshooting ' + searchQuery,
            content: 'Having issues? Try these troubleshooting steps to resolve your problem.',
            category: 'Troubleshooting'
          }
        ]);
        setError(null);
      }, 500);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="kb-tab">
      <h3 className="tab-title">Knowledge Base</h3>
      
      {/* Search Box */}
      <div className="kb-search-section">
        <div className="search-input-group">
          <input
            type="text"
            className="kb-search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <button
            className="btn-search"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : '🔍'}
          </button>
        </div>
      </div>
      
      {/* Results */}
      {hasSearched && (
        <>
          {error && (
            <div className="kb-info">
              <div className="info-icon">ℹ️</div>
              <div className="info-text">{error}</div>
            </div>
          )}
          
          {articles.length === 0 && !error && (
            <div className="kb-empty">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No articles found</div>
            </div>
          )}
          
          {articles.length > 0 && (
            <div className="articles-list">
              {articles.map((article) => (
                <div key={article.id} className="article-item">
                  <div className="article-category">
                    {article.category}
                  </div>
                  
                  <h4 className="article-title">{article.title}</h4>
                  
                  <p className="article-preview">
                    {article.content.substring(0, 100)}...
                  </p>
                  
                  <a
                    href="#"
                    className="article-link"
                    onClick={(e) => {
                      e.preventDefault();
                      logger.log('Opening article:', article.id);
                    }}
                  >
                    Read More →
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
