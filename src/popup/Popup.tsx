import React, { useState, useEffect } from 'react';
import './popup.css';

export const Popup: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasGroqKey, setHasGroqKey] = useState(false);
  const [hasGrooveKey, setHasGrooveKey] = useState(false);
  
  useEffect(() => {
    // Check if on Groove page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.url?.includes('groovehq.com')) {
        setIsActive(true);
      }
    });
    
    // Check BOTH API keys separately
    chrome.storage.local.get(['groqApiKey', 'grooveApiKey'], (result) => {
      setHasGroqKey(!!result.groqApiKey && result.groqApiKey.length > 10);
      setHasGrooveKey(!!result.grooveApiKey && result.grooveApiKey.length > 10);
      
      console.log('🔑 API Key Status:');
      console.log('Groq:', result.groqApiKey ? '✅' : '❌');
      console.log('Groove:', result.grooveApiKey ? '✅' : '❌');
    });
  }, []);
  
  // Configure API keys handler
  const configureKeys = () => {
    const groqKey = prompt('Enter your Groq API key (gsk_...)');
    if (!groqKey) return;
    
    const grooveKey = prompt('Enter your Groove API key');
    if (!grooveKey) return;
    
    chrome.storage.local.set({
      groqApiKey: groqKey,
      grooveApiKey: grooveKey
    }, () => {
      alert('✅ API keys saved! Please reload the Groove page.');
      setHasGroqKey(true);
      setHasGrooveKey(true);
    });
  };
  
  const bothKeysConfigured = hasGroqKey && hasGrooveKey;
  
  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>GrooveMate</h1>
        <span className="version-badge">v1.0</span>
      </div>
      
      <div className="popup-content">
        {/* Status */}
        <div className={`status-section ${isActive ? 'active' : 'inactive'}`}>
          <div className="status-indicator"></div>
          <div className="status-info">
            <h2>{isActive ? 'Active' : 'Inactive'}</h2>
            <p>{isActive ? 'Extension is running on this page' : 'Navigate to Groove to activate'}</p>
          </div>
        </div>
        
        {/* API Configuration Status */}
        {!bothKeysConfigured ? (
          <div className="api-section warning">
            <h3>Setup Required</h3>
            <p>
              {!hasGroqKey && '❌ Groq API key missing'}
              {!hasGroqKey && !hasGrooveKey && ' • '}
              {!hasGrooveKey && '❌ Groove API key missing'}
            </p>
            <button className="btn-primary" onClick={configureKeys}>
              Configure API Keys
            </button>
          </div>
        ) : (
          <div className="api-section success">
            <h3>Ready to Go</h3>
            <p>✅ All AI features are enabled</p>
            <button 
              style={{
                background: 'transparent',
                border: '1px solid #120036',
                color: '#120036',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              onClick={configureKeys}
            >
              Reconfigure Keys
            </button>
          </div>
        )}
        
        {/* Features */}
        <div className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">Quality Checker</div>
            <div className="feature-item">Reply Generator</div>
            <div className="feature-item">Customer History</div>
            <div className="feature-item">Quick Actions</div>
          </div>
        </div>
      </div>
      
      <div className="popup-footer">
        <a href="https://github.com" target="_blank" className="footer-link">
          Documentation
        </a>
        <span className="footer-divider">•</span>
        <a href="#" className="footer-link">Support</a>
      </div>
    </div>
  );
};
