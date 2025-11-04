import { MessageHandler } from './messageHandler';
import { onMessage } from '../shared/utils/messaging';
import { logger } from '../shared/utils/logger';

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  logger.log(' Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    logger.success('Welcome to GrooveMate! First time installation.');
  } else if (details.reason === 'update') {
    logger.info('GrooveMate updated to latest version');
  }
});

// Listen for messages from content scripts
onMessage((message, sender, sendResponse) => {
  // Handle message asynchronously
  MessageHandler.handle(message, sender, sendResponse);
});

// CRITICAL: Keep service worker alive (Manifest V3 requirement)
// Service workers are unloaded after 5 minutes of inactivity
// This keeps it alive by pinging every 20 seconds
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {
    logger.log('Service worker keepalive ping');
  });
}, 20000); // Every 20 seconds

// Also keep alive with onMessage listener
chrome.runtime.onMessage.addListener(() => {
  return true;
});

logger.success('Background script loaded and ready!');
