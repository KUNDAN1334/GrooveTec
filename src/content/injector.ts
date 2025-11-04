import { CONFIG, GROOVE_SELECTORS } from '../shared/constants';
import { logger } from '../shared/utils/logger';

export class SidebarInjector {
  private sidebarElement: HTMLElement | null = null;
  
  // Inject sidebar into DOM
  inject(): HTMLElement {
    logger.log(' Injecting sidebar...');
    
    // Check if already injected
    const existing = document.getElementById(CONFIG.SIDEBAR_ID);
    if (existing) {
      logger.warn('Sidebar already exists, reusing...');
      return existing;
    }
    
    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = CONFIG.SIDEBAR_ID;
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: ${CONFIG.SIDEBAR_WIDTH};
      height: 100vh;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      transition: transform 0.3s ease-in-out;
    `;
    
    // Append to body
    document.body.appendChild(sidebar);
    
    // Adjust main content area
    this.adjustMainContent(true);
    
    this.sidebarElement = sidebar;
    logger.success(' Sidebar injected successfully!');
    
    return sidebar;
  }
  
  // Remove sidebar
  remove(): void {
    if (this.sidebarElement) {
      this.sidebarElement.remove();
      this.adjustMainContent(false);
      this.sidebarElement = null;
      logger.log(' Sidebar removed');
    }
  }
  
  // Adjust main content to make room for sidebar
  private adjustMainContent(addMargin: boolean): void {
    const selectors = GROOVE_SELECTORS.MAIN_CONTENT.split(',');
    
    for (const selector of selectors) {
      const element = document.querySelector(selector.trim());
      if (element instanceof HTMLElement) {
        element.style.marginRight = addMargin ? CONFIG.SIDEBAR_WIDTH : '0';
        element.style.transition = 'margin-right 0.3s ease-in-out';
        logger.log(' Main content adjusted');
        return;
      }
    }
    
    logger.warn(' Could not find main content to adjust');
  }
  
  // Check if sidebar exists
  exists(): boolean {
    return document.getElementById(CONFIG.SIDEBAR_ID) !== null;
  }
}
