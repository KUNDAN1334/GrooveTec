// Groove page selectors
export const GROOVE_SELECTORS = {
    TICKET_URL_PATTERN: /groovehq\.com\/conversations\/(\d+)/,
    REPLY_TEXTAREA: 'textarea[name="body"], .conversation-reply textarea, [data-testid="reply-textarea"]',
    CUSTOMER_EMAIL: '.customer-email, [data-customer-email], .contact-email',
    TICKET_SUBJECT: '.conversation-subject, h1.subject, .ticket-subject',
    MAIN_CONTENT: '.main-content, .conversation-container, .app-main',
    CONVERSATION_VIEW: '.conversation-view, .ticket-details, .conversation-messages'
  };
  
  // Extension configuration
  export const CONFIG = {
    SIDEBAR_WIDTH: '400px',
    SIDEBAR_ID: 'groovemate-sidebar',
    INIT_TIMEOUT: 10000,
    CHECK_INTERVAL: 500
  };
  
  // API endpoints
  export const API_ENDPOINTS = {
    GROQ_CHAT: 'https://api.groq.com/openai/v1/chat/completions',
    GROOVE_BASE: 'https://api.groovehq.com/v1'
  };
  
  // Groq models
  export const GROQ_MODELS = {
    FAST: 'llama-3.1-8b-instant',
    BALANCED: 'llama-3.1-70b-versatile',
    QUALITY: 'mixtral-8x7b-32768'
  };
  
  // Debug mode
  export const DEBUG = true;
  