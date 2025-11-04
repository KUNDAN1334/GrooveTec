import React, { useState, useEffect } from 'react';
import './popup.css';

export const Popup: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  useEffect(() => {
    // Check if on Groove page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.url?.includes('groovehq.com')) {
        setIsActive(true);
      }
    });
    
    // Check if API key is configured
    chrome.storage.local.get(['groqApiKey'], (result) => {
      setHasApiKey(!!result.groqApiKey);
    });
  }, []);
  
  // Configure API Key Handler
  const configureApiKey = () => {
    const groqKey = prompt('Enter your Groq API key (gsk_...)');
    if (!groqKey) return;
    
    const grooveKey = prompt('Enter your Groove API key');
    if (!grooveKey) return;
    
    // Save to Chrome storage
    chrome.storage.local.set({
      groqApiKey: groqKey,
      grooveApiKey: grooveKey
    }, () => {
      alert('✅ API keys saved successfully!');
      setHasApiKey(true);
      chrome.runtime.reload();
    });
  };
  
  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <h1>GrooveMate</h1>
        <span className="version-badge">v1.0.0</span>
      </div>
      
      {/* Content */}
      <div className="popup-content">
        {isActive ? (
          <div className="status-card active">
            <div className="status-icon">✓</div>
            <div className="status-text">
              <strong>Active & Running</strong>
              <p>Extension is working on this page</p>
            </div>
          </div>
        ) : (
          <div className="status-card inactive">
            <div className="status-icon">ℹ</div>
            <div className="status-text">
              <strong>Inactive</strong>
              <p>Navigate to a Groove ticket to activate</p>
            </div>
          </div>
        )}
        
        {!hasApiKey && (
          <div className="warning-card">
            <strong>⚠️ Setup Required</strong>
            <p>Add your API keys to enable AI features</p>
            <button className="btn-setup" onClick={configureApiKey}>
              Configure API Keys
            </button>
          </div>
        )}
        
        {hasApiKey && (
          <div className="success-card">
            <strong>✓ API Keys Configured</strong>
            <p>All AI features are ready to use</p>
          </div>
        )}
        
        {/* Features */}
        <div className="features-section">
          <h3>Features</h3>
          <ul className="features-list">
            <li>
              <span className="feature-icon">🤖</span>
              <span>AI Quality Checker</span>
            </li>
            <li>
              <span className="feature-icon">✨</span>
              <span>Reply Suggestions</span>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <span>Ticket Analytics</span>
            </li>
            <li>
              <span className="feature-icon">⚡</span>
              <span>Quick Actions</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Footer */}
      <div className="popup-footer">
        <button className="footer-btn" onClick={() => window.open('https://github.com')}>
          📖 Help
        </button>
      </div>
    </div>
  );
};
