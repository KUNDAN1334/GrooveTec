import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { logger } from '../shared/utils/logger';
import { sendToBackground } from '../shared/utils/messaging';
import { MessageType } from '../shared/types';
import './sidebar.css';

interface SidebarProps {
  ticketId: string | null;
  customerEmail: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ ticketId, customerEmail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'ai' | 'settings'>('info');
  const [replyText, setReplyText] = useState('');
  const [qualityResult, setQualityResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    logger.log('🎨 Sidebar mounted with ticket:', ticketId);
    
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [ticketId]);
  
  // Check quality function
  const handleCheckQuality = async () => {
    if (!replyText.trim()) {
      alert('Please enter some text to check quality');
      return;
    }
    
    setIsChecking(true);
    setQualityResult(null);
    
    try {
      const response = await sendToBackground({
        type: MessageType.CHECK_QUALITY,
        payload: { text: replyText }
      });
      
      if (response.success) {
        setQualityResult(response.data);
        logger.success('Quality check completed:', response.data);
      } else {
        alert('Quality check failed: ' + response.error);
      }
    } catch (error) {
      logger.error('Quality check error:', error);
      alert('Quality check failed. Check console for details.');
    } finally {
      setIsChecking(false);
    }
  };
  
  // Generate suggestion
  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    setSuggestion('');
    
    try {
      const response = await sendToBackground({
        type: MessageType.GENERATE_SUGGESTION,
        payload: {
          subject: 'Customer Support Request',
          message: 'Customer needs help with their account',
          style: 'professional and friendly'
        }
      });
      
      if (response.success) {
        setSuggestion(response.suggestion);
        logger.success('Suggestion generated');
      } else {
        alert('Suggestion generation failed: ' + response.error);
      }
    } catch (error) {
      logger.error('Suggestion error:', error);
      alert('Failed to generate suggestion. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="sidebar-container">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="sidebar-container">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-content">
          <h2 className="sidebar-title">GrooveMate</h2>
          <span className="ticket-badge">#{ticketId}</span>
        </div>
        <p className="header-subtitle">AI Support Assistant</p>
      </div>
      
      {/* Tabs */}
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Info
        </button>
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Tools
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>
      
      {/* Content */}
      <div className="sidebar-content">
        
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="tab-content">
            <h3 className="section-title">Ticket Information</h3>
            
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">Ticket ID</span>
                <span className="info-value">#{ticketId}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Customer</span>
                <span className="info-value">{customerEmail || 'Not available'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="status-badge success">Active</span>
              </div>
            </div>
            
            <div className="status-message success">
              ✓ GrooveMate is active and ready to help!
            </div>
            
            <div className="info-box">
              <h4>🚀 Quick Start</h4>
              <ul className="feature-list">
                <li>✓ Ticket page detected</li>
                <li>✓ AI tools ready</li>
                <li>✓ Quality checker active</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* AI Tools Tab */}
        {activeTab === 'ai' && (
          <div className="tab-content">
            <h3 className="section-title">AI-Powered Tools</h3>
            
            {/* Quality Checker */}
            <div className="tool-section">
              <h4>✅ Quality Checker</h4>
              <p className="tool-description">
                Check your reply for clarity, empathy, and professionalism
              </p>
              
              <textarea
                className="reply-input"
                placeholder="Paste your reply here to check quality..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
              
              <button 
                className="btn-primary"
                onClick={handleCheckQuality}
                disabled={isChecking}
              >
                {isChecking ? '🔍 Checking...' : '🔍 Check Quality'}
              </button>
              
              {qualityResult && (
                <div className="quality-result">
                  <div className={`score-badge score-${qualityResult.score >= 80 ? 'good' : qualityResult.score >= 60 ? 'ok' : 'poor'}`}>
                    Score: {qualityResult.score}/100
                  </div>
                  
                  {qualityResult.issues.length > 0 && (
                    <div className="issues-section">
                      <strong>⚠️ Issues:</strong>
                      <ul>
                        {qualityResult.issues.map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {qualityResult.suggestions.length > 0 && (
                    <div className="suggestions-section">
                      <strong>💡 Suggestions:</strong>
                      <ul>
                        {qualityResult.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* AI Suggestion Generator */}
            <div className="tool-section">
              <h4>✨ AI Reply Generator</h4>
              <p className="tool-description">
                Generate professional reply suggestions
              </p>
              
              <button 
                className="btn-secondary"
                onClick={handleGenerateSuggestion}
                disabled={isGenerating}
              >
                {isGenerating ? '✨ Generating...' : '✨ Generate Reply'}
              </button>
              
              {suggestion && (
                <div className="suggestion-result">
                  <strong>Suggested Reply:</strong>
                  <p>{suggestion}</p>
                  <button 
                    className="btn-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(suggestion);
                      alert('Copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <h3 className="section-title">Settings</h3>
            
            <div className="settings-section">
              <h4>🔑 API Configuration</h4>
              <p className="settings-description">
                Configure your Groq API key for AI features
              </p>
              
              <div className="settings-notice">
                <strong>ℹ️ Setup Instructions:</strong>
                <ol>
                  <li>Get free API key from <a href="https://console.groq.com" target="_blank">console.groq.com</a></li>
                  <li>Open Chrome Extension settings</li>
                  <li>Enter your API key</li>
                  <li>Save and reload</li>
                </ol>
              </div>
              
              <button 
                className="btn-settings"
                onClick={() => chrome.runtime.openOptionsPage()}
              >
                ⚙️ Open Settings Page
              </button>
            </div>
            
            <div className="settings-section">
              <h4>📖 About</h4>
              <p>GrooveMate v1.0.0</p>
              <p className="about-text">
                AI-powered assistant for Groove customer support agents.
                Built with ❤️ to empower support teams.
              </p>
            </div>
          </div>
        )}
        
      </div>
      
      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Help</a>
          <span className="footer-separator">•</span>
          <a href="#" className="footer-link">Feedback</a>
        </div>
        <p className="footer-version">v1.0.0 - Phase 1</p>
      </div>
    </div>
  );
};
