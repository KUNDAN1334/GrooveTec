import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { logger } from '../shared/utils/logger';
import { sendToBackground } from '../shared/utils/messaging';
import { MessageType } from '../shared/types';
import { HistoryTab } from './tabs/HistoryTab';
import { QuickActionsTab } from './tabs/QuickActionsTab';
import { KnowledgeBaseTab } from './tabs/KnowledgeBaseTab';
import './sidebar.css';

interface SidebarProps {
  ticketId: string | null;
  customerEmail: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ ticketId, customerEmail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'ai' | 'kb' | 'actions' | 'settings'>('info');
  const [ticketData, setTicketData] = useState<any>(null);
  const [ticketStatus, setTicketStatus] = useState('active');
  const [replyText, setReplyText] = useState('');
  const [qualityResult, setQualityResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  

const extractTicketBody = (): string => {
  try {
    logger.log('Attempting to extract ticket body from DOM...');
    
    // Try multiple selectors to find ticket content
    const selectors = [
      '.conversation-message-body',
      '.ticket-message-body', 
      '.message-content',
      '.message-body',
      '[data-testid="message-body"]',
      '.ticket-body',
      '.conversation-body',
      '.message-text',
      '[class*="message-content"]',
      '[class*="ticket-body"]',
      '[class*="conversation"]'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      // Try each matching element
      for (const element of Array.from(elements)) {
        if (element?.textContent) {
          const text = element.textContent.trim();
          // Must be longer than 10 chars and not look like navigation text
          if (text.length > 10 && !text.includes('Inbox') && !text.includes('Settings')) {
            logger.success(`Extracted ${text.length} chars from: ${selector}`);
            console.log('Extracted text preview:', text.substring(0, 100) + '...');
            return text;
          }
        }
      }
    }
    
    logger.warn('Could not extract ticket body from page - no matching elements found');
    return 'Customer inquiry'; 
    
  } catch (error) {
    logger.error('Error extracting ticket body:', error);
    return 'Customer needs assistance';
  }
};


  useEffect(() => {
    logger.log('Sidebar mounted with ticket:', ticketId);
    
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
      
      // Fetch ticket data if available
      if (ticketId) {
        fetchTicketData();
      }
    }, 800);
  }, [ticketId]);
  
  const fetchTicketData = async () => {
    if (!ticketId) return;
    
    try {
      logger.log('Fetching ticket data...');
      
      const response = await sendToBackground({
        type: MessageType.FETCH_TICKET_DATA,
        payload: { ticketId }
      });
      
      if (response.success) {
        setTicketData(response.ticket);
        setTicketStatus(response.ticket.status);
        logger.success('Ticket data loaded');
      } else {
        logger.warn('Failed to fetch ticket data:', response.error);
      }
      
    } catch (error) {
      logger.error('Fetch ticket error:', error);
    }
  };
  
  // Quality check handler
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
  
  
const handleGenerateSuggestion = async () => {
  setIsGenerating(true);
  setSuggestion('');
  
  try {
   
    let currentTicketData = ticketData;
    
    
    if ((!currentTicketData?.body || !currentTicketData?.subject) && ticketId) {
      logger.log('Fetching fresh ticket data...');
      try {
        const response = await sendToBackground({
          type: MessageType.FETCH_TICKET_DATA,
          payload: { ticketId }
        });
        
        if (response.success && response.ticket) {
          currentTicketData = response.ticket;
          setTicketData(response.ticket);
          logger.log('Fresh ticket data loaded');
        }
      } catch (err) {
        logger.warn('Could not fetch ticket data:', err);
      }
    }
    
  
    let ticketBody = currentTicketData?.body || 
                     currentTicketData?.message ||
                     currentTicketData?.summary ||
                     '';
    
  
    if (!ticketBody || ticketBody.length < 10) {
      logger.log('Attempting to extract body from page DOM...');
      ticketBody = extractTicketBody();
    }
    
   
    if (!ticketBody || ticketBody.length < 10) {
      ticketBody = `Customer inquiry regarding: ${currentTicketData?.subject || 'support request'}`;
    }
    
    const ticketSubject = currentTicketData?.subject || 'Customer Support Request';
 
    const customerName = currentTicketData?.customer?.name || 
                        currentTicketData?.customer?.email?.split('@')[0] || 
                        customerEmail?.split('@')[0] ||
                        'Customer';
    
    const customerEmailValue = customerEmail || 
                               currentTicketData?.customer?.email || 
                               'customer@example.com';
    
  
    const contextPayload = {
      subject: ticketSubject,
      message: ticketBody, 
      customerName: customerName,
      customerEmail: customerEmailValue,
      category: currentTicketData?.category || 
                currentTicketData?.tags?.[0] || 
                'General Support',
      priority: currentTicketData?.priority || 'Normal',
      style: 'professional, empathetic, and solution-focused'
    };
  
    console.log('=== GENERATING SUGGESTION WITH CONTEXT ===');
    console.log('Subject:', contextPayload.subject);
    console.log('Message (first 150 chars):', contextPayload.message.substring(0, 150) + '...');
    console.log('Customer Name:', contextPayload.customerName);
    console.log('Customer Email:', contextPayload.customerEmail);
    console.log('Category:', contextPayload.category);
    console.log('Priority:', contextPayload.priority);
    console.log('===========================================');
    
  
    logger.log('Sending suggestion request to background...');
    const response = await sendToBackground({
      type: MessageType.GENERATE_SUGGESTION,
      payload: contextPayload
    });
    
   
    if (response.success) {
      setSuggestion(response.suggestion);
      logger.success('Unique contextual suggestion generated!');
      console.log('Generated suggestion length:', response.suggestion.length);
    } else {
      logger.error('Suggestion generation failed:', response.error);
      alert('Suggestion generation failed: ' + response.error);
    }
    
  } catch (error) {
    logger.error('Suggestion error:', error);
    console.error('Full error:', error);
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
  
  // Extract customer ID from ticket data
  const customerId = ticketData?.customer?.id || '0';
  const ticketSubject = ticketData?.subject || 'Support Request';
  
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
          Info
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Tools
        </button>
        <button 
          className={`tab ${activeTab === 'kb' ? 'active' : ''}`}
          onClick={() => setActiveTab('kb')}
        >
          KB
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
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
                <span className="info-value">{customerEmail || ticketData?.customer?.email || 'Not available'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`status-badge ${ticketStatus}`}>
                  {ticketStatus}
                </span>
              </div>
              
              {ticketData?.subject && (
                <div className="info-item">
                  <span className="info-label">Subject</span>
                  <span className="info-value">{ticketData.subject}</span>
                </div>
              )}
            </div>
            
            <div className="status-message success">
              GrooveMate is active and ready to help!
            </div>
            
            <div className="info-box">
              <h4>Quick Start</h4>
              <ul className="feature-list">
                <li>Ticket page detected</li>
                <li>AI tools ready</li>
                <li>Quality checker active</li>
                <li>Customer history available</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* History Tab - REAL-TIME FROM TICKET ID */}
        {activeTab === 'history' && (
          <HistoryTab 
            customerId={customerId}
            ticketId={ticketId}
          />
        )}
        
        {/* AI Tools Tab */}
        {activeTab === 'ai' && (
          <div className="tab-content">
            <h3 className="section-title">AI-Powered Tools</h3>
            
            {/* Quality Checker */}
            <div className="tool-section">
              <h4>Quality Checker</h4>
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
                {isChecking ? 'Checking...' : 'Check Quality'}
              </button>
              
              {qualityResult && (
                <div className="quality-result">
                  <div className={`score-badge score-${qualityResult.score >= 80 ? 'good' : qualityResult.score >= 60 ? 'ok' : 'poor'}`}>
                    Score: {qualityResult.score}/100
                  </div>
                  
                  {qualityResult.issues.length > 0 && (
                    <div className="issues-section">
                      <strong>Issues:</strong>
                      <ul>
                        {qualityResult.issues.map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {qualityResult.suggestions.length > 0 && (
                    <div className="suggestions-section">
                      <strong>Suggestions:</strong>
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
                {isGenerating ? 'Generating...' : 'Generate Reply'}
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
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Knowledge Base Tab */}
        {activeTab === 'kb' && (
          <KnowledgeBaseTab ticketSubject={ticketSubject} />
        )}
        
        {/* Quick Actions Tab */}
        {activeTab === 'actions' && (
          <QuickActionsTab 
            ticketId={ticketId || '0'}
            currentStatus={ticketStatus}
            onStatusChange={setTicketStatus}
          />
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <h3 className="section-title">Settings</h3>
            
            <div style={{
              background: 'linear-gradient(135deg, #f5f8fc 0%, #e8f3ff 100%)',
              border: '2px solid #d0e0ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#120036',
                marginBottom: '12px'
              }}>API Configuration</h4>
              <p style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '18px',
                lineHeight: 1.6
              }}>
                Configure your API keys for full functionality
              </p>
              
              <button 
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: '#19B4FF',
                  color: '#120036',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => chrome.runtime.openOptionsPage()}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#0a9ed9';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#19B4FF';
                }}
              >
                Open Settings Page
              </button>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f5f8fc 0%, #e8f3ff 100%)',
              border: '2px solid #d0e0ff',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#120036',
                marginBottom: '14px'
              }}>📖 About</h4>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#120036',
                marginBottom: '8px'
              }}>GrooveMate v1.0.0 - Phase 2</p>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: 1.7
              }}>
                🤖 AI-powered assistant for Groove customer support agents.
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
        <p className="footer-version">v1.0.0 - Phase 2</p>
      </div>
    </div>
  );
};
