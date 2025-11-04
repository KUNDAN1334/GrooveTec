import { MessageHandler } from './messageHandler';
import { onMessage } from '../shared/utils/messaging';
import { logger } from '../shared/utils/logger';

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  logger.log('🎉 Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    logger.success('Welcome to GrooveMate! First time installation.');
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    logger.info('GrooveMate updated to latest version');
  }
});

// Listen for messages from content scripts
onMessage((message, sender, sendResponse) => {
  // Handle message asynchronously
  MessageHandler.handle(message, sender, sendResponse);
});

// Keep service worker alive (important for Manifest V3)
chrome.runtime.onMessage.addListener(() => {
  return true;
});

logger.success('Background script loaded and ready! 🚀');
