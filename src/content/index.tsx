import React from 'react';
import ReactDOM from 'react-dom/client';
import { Sidebar } from '../sidebar/Sidebar';
import { GroovePageDetector } from './detector';
import { SidebarInjector } from './injector';
import { sendToBackground } from '../shared/utils/messaging';
import { MessageType } from '../shared/types';
import { logger } from '../shared/utils/logger';
import './content.css';

class ContentScript {
  private injector: SidebarInjector;
  private reactRoot: ReactDOM.Root | null = null;
  
  constructor() {
    this.injector = new SidebarInjector();
  }
  
  // Initialize content script
  async initialize() {
    try {
      logger.log(' GrooveMate initializing...');
      
      // Detect page type
      const pageInfo = GroovePageDetector.detect();
      
      // Notify background about page
      await sendToBackground({
        type: MessageType.PAGE_DETECTED,
        payload: pageInfo
      });
      
      // Only proceed if it's a ticket page
      if (!pageInfo.isTicketPage) {
        logger.log('ℹ️ Not a ticket page, skipping initialization');
        return;
      }
      
      logger.success(' Ticket page detected! ID:', pageInfo.ticketId);
      
      // Wait for Groove UI to fully load
      await GroovePageDetector.waitForGrooveUI();
      
      // Inject sidebar
      await this.injectSidebar(pageInfo);
      
      logger.success(' Initialization complete!');
      
    } catch (error) {
      logger.error(' Initialization failed:', error);
    }
  }
  
  // Inject and render sidebar
  private async injectSidebar(pageInfo: any) {
    logger.log(' Rendering sidebar...');
    
    // Inject sidebar container
    const container = this.injector.inject();
    
    // Render React component
    this.reactRoot = ReactDOM.createRoot(container);
    this.reactRoot.render(
      <React.StrictMode>
        <Sidebar 
          ticketId={pageInfo.ticketId}
          customerEmail={pageInfo.customerEmail}
        />
      </React.StrictMode>
    );
    
    logger.success(' Sidebar rendered successfully!');
  }
  
  // Cleanup
  cleanup() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.injector.remove();
    logger.log(' Cleanup complete');
  }
}

// Initialize content script
const contentScript = new ContentScript();

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    contentScript.initialize();
  });
} else {
  contentScript.initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  contentScript.cleanup();
});

// Watch for URL changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    logger.log('🔄 URL changed, re-initializing...');
    contentScript.cleanup();
    setTimeout(() => contentScript.initialize(), 1000);
  }
}).observe(document, { subtree: true, childList: true });

logger.success(' Content script loaded!');
