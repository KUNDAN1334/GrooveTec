import { Message, MessageType } from '../shared/types';
import { logger } from '../shared/utils/logger';
import { GroqAPI } from './api/groq';

const groqAPI = new GroqAPI();

export class MessageHandler {
  
  // Handle incoming messages
  static async handle(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    
    logger.log(' Handling message:', message.type);
    
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
          
        default:
          logger.warn('Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error: any) {
      logger.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Handle page detection
  private static async handlePageDetected(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.info(' Page detected:', payload);
    
    if (payload.isTicketPage) {
      logger.success('Ticket page confirmed! ID:', payload.ticketId);
    }
    
    sendResponse({ success: true, message: 'Page detected' });
  }
  
  // Handle quality check
  private static async handleQualityCheck(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log(' Checking reply quality...');
    
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
  
  // Handle AI suggestion generation
  private static async handleGenerateSuggestion(
    payload: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    logger.log(' Generating AI suggestion...');
    
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
}
