import { Message, MessageType } from '../types';
import { logger } from './logger';

// Send message to background script with retry logic
export function sendToBackground(message: Message, retries = 3): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const send = () => {
      attempts++;
      logger.log('Sending to background (attempt ' + attempts + '):', message.type);
      
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError?.message || 'Unknown error';
            logger.warn('Message error:', error);
            
            // Retry on context invalidation
            if (error.includes('context invalidated') && attempts < retries) {
              logger.log('Retrying...');
              setTimeout(send, 500);
            } else {
              reject(new Error(error));
            }
          } else if (response) {
            logger.log('Response from background:', response);
            resolve(response);
          } else {
            reject(new Error('No response from background script'));
          }
        });
      } catch (error: any) {
        if (attempts < retries) {
          logger.log('Retrying after catch...');
          setTimeout(send, 500);
        } else {
          reject(error);
        }
      }
    };
    
    send();
  });
}

// Send message to content script
export function sendToContent(tabId: number, message: Message): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.log('Sending to content:', message.type);
    
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        const error = chrome.runtime.lastError?.message || 'Unknown error';
        logger.error('Message error:', error);
        reject(new Error(error));
      } else if (response) {
        logger.log('Response from content:', response);
        resolve(response);
      } else {
        reject(new Error('No response from content script'));
      }
    });
  });
}

// Listen for messages
export function onMessage(
  callback: (
    message: Message, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: any) => void
  ) => void
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.log('Received message:', message.type);
    callback(message, sender, sendResponse);
    return true; // Keep channel open for async
  });
}
