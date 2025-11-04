import { logger } from '../../shared/utils/logger';

export class StorageHelper {
  
  // Get value from chrome storage
  static async get(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          logger.error('Storage get error:', chrome.runtime.lastError);
          resolve(null);
        } else {
          logger.log(`Storage get [${key}]:`, result[key]);
          resolve(result[key]);
        }
      });
    });
  }
  
  // Set value in chrome storage
  static async set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          logger.error('Storage set error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          logger.success(`Storage set [${key}]`);
          resolve();
        }
      });
    });
  }
  
  // Remove value from storage
  static async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          logger.error('Storage remove error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          logger.success(`Storage removed [${key}]`);
          resolve();
        }
      });
    });
  }
  
  // Clear all storage
  static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          logger.error('Storage clear error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          logger.success('Storage cleared');
          resolve();
        }
      });
    });
  }
}
