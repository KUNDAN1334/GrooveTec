import { GROOVE_SELECTORS } from '../shared/constants';
import { PageInfo } from '../shared/types';
import { logger } from '../shared/utils/logger';

export class GroovePageDetector {
  
  // Detect current page type
  static detect(): PageInfo {
    const url = window.location.href;
    const isTicketPage = this.isTicketPage(url);
    
    const pageInfo: PageInfo = {
      isTicketPage,
      ticketId: isTicketPage ? this.extractTicketId(url) : null,
      customerEmail: isTicketPage ? this.getCustomerEmail() : null,
      url
    };
    
    logger.info('🔍 Page detection result:', pageInfo);
    return pageInfo;
  }
  
  // Check if URL is a ticket page
  private static isTicketPage(url: string): boolean {
    // Match patterns like:
    // /tickets/123
    // /tickets/1?channel=...
    // groovehq.com/tickets/
    return /\/tickets\/\d+/.test(url) || url.includes('groovehq.com/tickets/');
  }
  
  // Extract ticket ID from URL
  private static extractTicketId(url: string): string | null {
    const match = url.match(/\/tickets\/(\d+)/);
    return match ? match[1] : null;
  }
  
  // Get customer email from page
  static getCustomerEmail(): string | null {
    const selectors = GROOVE_SELECTORS.CUSTOMER_EMAIL.split(',');
    
    for (const selector of selectors) {
      const element = document.querySelector(selector.trim());
      if (element?.textContent) {
        const email = element.textContent.trim();
        if (email.includes('@')) return email;
      }
    }
    
    return null;
  }
  
  // Get ticket subject
  static getTicketSubject(): string | null {
    const selectors = GROOVE_SELECTORS.TICKET_SUBJECT.split(',');
    
    for (const selector of selectors) {
      const element = document.querySelector(selector.trim());
      if (element?.textContent) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }
  
  // Get reply textarea
  static getReplyTextarea(): HTMLTextAreaElement | null {
    const selectors = GROOVE_SELECTORS.REPLY_TEXTAREA.split(',');
    
    for (const selector of selectors) {
      const element = document.querySelector(selector.trim());
      if (element instanceof HTMLTextAreaElement) {
        return element;
      }
    }
    
    return null;
  }
  
  // Wait for Groove UI to load
  static waitForGrooveUI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 10000; // 10 seconds
      
      logger.log('⏳ Waiting for Groove UI to load...');
      
      const checkInterval = setInterval(() => {
        // Check if conversation view exists
        const selectors = GROOVE_SELECTORS.CONVERSATION_VIEW.split(',');
        
        for (const selector of selectors) {
          const element = document.querySelector(selector.trim());
          if (element) {
            logger.success('✅ Groove UI loaded!');
            clearInterval(checkInterval);
            resolve();
            return;
          }
        }
        
        // Timeout check
        if (Date.now() - startTime > timeout) {
          logger.warn('⚠️ Groove UI load timeout');
          clearInterval(checkInterval);
          resolve(); // Resolve anyway to continue
        }
      }, 500);
    });
  }
}
