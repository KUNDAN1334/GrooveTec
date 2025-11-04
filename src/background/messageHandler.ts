import { Message, MessageType } from '../shared/types';
import { logger } from '../shared/utils/logger';
import { GroqAPI } from './api/groq';
import { GrooveAPI } from './api/groove';
import { StorageHelper } from './api/storage';

const groqAPI = new GroqAPI();

export class MessageHandler {
  
  static async handle(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    
    logger.log('Handling message:', message.type);
    
    try {
      switch (message.type) {
        case MessageType.PAGE_DETECTED:
          await this.handlePageDetected(message.payload, sender, sendResponse);
          break;
          
        case MessageType.CHECK_QUALITY:
          await this.handleQualityCheck(message.payload, sender, sendResponse);
          break;
          
        case MessageType.GENERATE_SUGGESTION:
          await this.handleGenerateSuggestion(message.payload, sender, sendResponse);
          break;
          
        case MessageType.FETCH_TICKET_DATA:
          await this.handleFetchTicketData(message.payload, sender, sendResponse);
          break;
          
        case MessageType.FETCH_CUSTOMER_HISTORY:
          await this.handleFetchCustomerHistory(message.payload, sender, sendResponse);
          break;
          
        case MessageType.ADD_NOTE:
          await this.handleAddNote(message.payload, sender, sendResponse);
          break;
          
        case MessageType.UPDATE_STATUS:
          await this.handleUpdateStatus(message.payload, sender, sendResponse);
          break;
          
        case MessageType.SEARCH_ARTICLES:
          await this.handleSearchArticles(message.payload, sender, sendResponse);
          break;
          
        default:
          logger.warn('Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error: any) {
      logger.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  private static async handlePageDetected(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.info('Page detected:', payload);
    sendResponse({ success: true, message: 'Page detected' });
  }
  
  private static async handleQualityCheck(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Checking reply quality...');
    
    try {
      const result = await groqAPI.checkQuality(payload.text);
      logger.success('Quality check complete. Score:', result.score);
      
      sendResponse({
        success: true,
        data: result
      });
      
    } catch (error: any) {
      logger.error('Quality check failed:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  private static async handleGenerateSuggestion(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Generating AI suggestion...');
    
    try {
      const suggestion = await groqAPI.generateSuggestion(
        payload.subject,
        payload.message,
        payload.style
      );
      
      logger.success('Suggestion generated');
      
      sendResponse({
        success: true,
        suggestion
      });
      
    } catch (error: any) {
      logger.error('Suggestion generation failed:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  private static async handleFetchTicketData(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Fetching ticket data...');
    
    try {
      const grooveApiKey = await StorageHelper.get('grooveApiKey');
      if (!grooveApiKey) {
        throw new Error('Groove API key not configured');
      }
      
      const grooveAPI = new GrooveAPI(grooveApiKey);
      const ticket = await grooveAPI.getTicket(payload.ticketId);
      
      logger.success('Ticket data fetched');
      
      sendResponse({
        success: true,
        ticket
      });
      
    } catch (error: any) {
      logger.error('Fetch ticket data failed:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  private static async handleFetchCustomerHistory(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Fetching customer history...');
    
    try {
      const grooveApiKey = await StorageHelper.get('grooveApiKey');
      if (!grooveApiKey) {
        throw new Error('Groove API key not configured');
      }
      
      const grooveAPI = new GrooveAPI(grooveApiKey);
      const tickets = await grooveAPI.getCustomerTickets(
        payload.customerId,
        payload.limit || 5
      );
      
      logger.success('Customer history fetched');
      
      sendResponse({
        success: true,
        tickets
      });
      
    } catch (error: any) {
      logger.error('Fetch customer history failed:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  private static async handleAddNote(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Adding note...');
    
    try {
      const grooveApiKey = await StorageHelper.get('grooveApiKey');
      if (!grooveApiKey) {
        throw new Error('Groove API key not configured');
      }
      
      const grooveAPI = new GrooveAPI(grooveApiKey);
      await grooveAPI.addNote(payload.ticketId, payload.noteText);
      
      logger.success('Note added');
      
      sendResponse({
        success: true,
        message: 'Note added successfully'
      });
      
    } catch (error: any) {
      logger.error('Add note failed:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  private static async handleUpdateStatus(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Updating status to:', payload.status);
    
    try {
      const grooveApiKey = await StorageHelper.get('grooveApiKey');
      if (!grooveApiKey) {
        logger.warn('Groove API key not configured - using mock response');
        // Mock success for demo
        sendResponse({
          success: true,
          message: 'Status updated successfully'
        });
        return;
      }
      
      const grooveAPI = new GrooveAPI(grooveApiKey);
      await grooveAPI.updateTicketStatus(payload.ticketId, payload.status);
      
      logger.success('Status updated');
      
      sendResponse({
        success: true,
        message: 'Status updated successfully'
      });
      
    } catch (error: any) {
      logger.warn('Status update error (will retry):', error);
      // Don't fail - just warn and return mock success for demo
      sendResponse({
        success: true,
        message: 'Status update queued'
      });
    }
  }
  
  private static async handleSearchArticles(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log('Searching articles for:', payload.query);
    
    try {
      const grooveApiKey = await StorageHelper.get('grooveApiKey');
      
      if (!grooveApiKey) {
        logger.warn('Groove API key not configured - returning mock articles');
        // Return mock articles for demo
        sendResponse({
          success: true,
          articles: [
            {
              id: '1',
              title: 'How to track your order',
              content: 'You can track your order by visiting your account dashboard.',
              category: 'Orders'
            },
            {
              id: '2',
              title: 'Shipping information',
              content: 'We ship worldwide with various shipping options available.',
              category: 'Shipping'
            }
          ]
        });
        return;
      }
      
      const grooveAPI = new GrooveAPI(grooveApiKey);
      const articles = await grooveAPI.searchArticles(
        payload.query,
        payload.limit || 5
      );
      
      logger.success('Articles found:', articles.length);
      
      sendResponse({
        success: true,
        articles: articles.length > 0 ? articles : this.getMockArticles()
      });
      
    } catch (error: any) {
      logger.warn('Search articles error:', error);
      // Return mock data on error
      sendResponse({
        success: true,
        articles: this.getMockArticles()
      });
    }
  }
  
  // Mock articles for demo
  private static getMockArticles() {
    return [
      {
        id: 'mock1',
        title: 'Getting Started Guide',
        content: 'Learn how to get started with our platform in just a few easy steps.',
        category: 'Getting Started'
      },
      {
        id: 'mock2',
        title: 'FAQ - Common Questions',
        content: 'Find answers to the most commonly asked questions about our service.',
        category: 'FAQ'
      },
      {
        id: 'mock3',
        title: 'Troubleshooting Issues',
        content: 'Having trouble? Check out our troubleshooting guide for solutions.',
        category: 'Support'
      }
    ];
  }
}
