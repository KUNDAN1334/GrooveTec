export interface Message {
    type: MessageType;
    payload?: any;
  }
  
  export enum MessageType {
    // Phase 1
    INIT_SIDEBAR = 'INIT_SIDEBAR',
    SIDEBAR_READY = 'SIDEBAR_READY',
    PAGE_DETECTED = 'PAGE_DETECTED',
    CHECK_QUALITY = 'CHECK_QUALITY',
    QUALITY_RESPONSE = 'QUALITY_RESPONSE',
    GENERATE_SUGGESTION = 'GENERATE_SUGGESTION',
    SUGGESTION_RESPONSE = 'SUGGESTION_RESPONSE',
    
    // Phase 2
    FETCH_TICKET_DATA = 'FETCH_TICKET_DATA',
    TICKET_DATA_RESPONSE = 'TICKET_DATA_RESPONSE',
    FETCH_CUSTOMER_HISTORY = 'FETCH_CUSTOMER_HISTORY',
    CUSTOMER_HISTORY_RESPONSE = 'CUSTOMER_HISTORY_RESPONSE',
    ADD_NOTE = 'ADD_NOTE',
    UPDATE_STATUS = 'UPDATE_STATUS',
    SEARCH_ARTICLES = 'SEARCH_ARTICLES'
  }
  
  export interface PageInfo {
    isTicketPage: boolean;
    ticketId: string | null;
    customerEmail: string | null;
    url: string;
  }
  
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
  
  export interface QualityCheckResult {
    score: number;
    issues: string[];
    suggestions: string[];
  }
  