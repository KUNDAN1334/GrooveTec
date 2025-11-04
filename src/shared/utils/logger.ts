import { DEBUG } from '../constants';

export class Logger {
  private prefix = '[GrooveMate]';
  
  log(...args: any[]) {
    if (DEBUG) {
      console.log(this.prefix, ...args);
    }
  }
  
  error(...args: any[]) {
    console.error(this.prefix, '❌', ...args);
  }
  
  warn(...args: any[]) {
    if (DEBUG) {
      console.warn(this.prefix, '⚠️', ...args);
    }
  }
  
  info(...args: any[]) {
    if (DEBUG) {
      console.info(this.prefix, 'ℹ️', ...args);
    }
  }
  
  success(...args: any[]) {
    if (DEBUG) {
      console.log(this.prefix, '✅', ...args);
    }
  }
}

export const logger = new Logger();
