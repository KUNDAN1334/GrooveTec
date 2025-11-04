import { Message, MessageType } from '../types';
import { logger } from './logger';

// Send message to background script
export function sendToBackground(message: Message): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.log(' Sending to background:', message.type);
    
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        logger.error('Message error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        logger.log(' Response from background:', response);
        resolve(response);
      }
    });
  });
}

// Send message to content script
export function sendToContent(tabId: number, message: Message): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.log(' Sending to content:', message.type);
    
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        logger.error('Message error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        logger.log(' Response from content:', response);
        resolve(response);
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
    logger.log(' Received message:', message.type);
    callback(message, sender, sendResponse);
    return true; 
  });
}
