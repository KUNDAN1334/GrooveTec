// Message types for Chrome messaging
export interface Message {
    type: MessageType;
    payload?: any;
  }
  
  export enum MessageType {
    // Phase 1 - Basic
    INIT_SIDEBAR = 'INIT_SIDEBAR',
    SIDEBAR_READY = 'SIDEBAR_READY',
    PAGE_DETECTED = 'PAGE_DETECTED',
    
    // Phase 2 - Data fetching
    FETCH_TICKET_DATA = 'FETCH_TICKET_DATA',
    TICKET_DATA_RESPONSE = 'TICKET_DATA_RESPONSE',
    
    // Phase 3 - AI features
    CHECK_QUALITY = 'CHECK_QUALITY',
    QUALITY_RESPONSE = 'QUALITY_RESPONSE',
    GENERATE_SUGGESTION = 'GENERATE_SUGGESTION',
    SUGGESTION_RESPONSE = 'SUGGESTION_RESPONSE'
  }
  
  // Page detection result
  export interface PageInfo {
    isTicketPage: boolean;
    ticketId: string | null;
    customerEmail: string | null;
    url: string;
  }
  
  // Ticket data structure
  export interface TicketData {
    id: string;
    subject: string;
    status: string;
    customer: {
      email: string;
      name: string;
    };
    messages: TicketMessage[];
  }
  
  export interface TicketMessage {
    id: string;
    body: string;
    author: string;
    timestamp: string;
  }
  
  // AI Quality check response
  export interface QualityCheckResult {
    score: number;
    issues: string[];
    suggestions: string[];
  }
  