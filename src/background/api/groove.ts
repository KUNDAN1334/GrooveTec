import { logger } from '../../shared/utils/logger';

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer: Customer;
  messages: Message[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  body: string;
  author: string;
  author_type: 'agent' | 'customer' | 'system';
  created_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

export class GrooveAPI {
  private apiKey: string;
  private baseURL = 'https://api.groovehq.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Fetch ticket details
  async getTicket(ticketId: string): Promise<Ticket> {
    logger.log('Fetching ticket:', ticketId);
    
    try {
      const response = await fetch(
        `${this.baseURL}/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.success('Ticket fetched:', data);
      return data.ticket;
      
    } catch (error) {
      logger.error('Fetch ticket error:', error);
      throw error;
    }
  }
  
  // Fetch customer details
  async getCustomer(customerId: string): Promise<Customer> {
    logger.log('👤 Fetching customer:', customerId);
    
    try {
      const response = await fetch(
        `${this.baseURL}/customers/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.success('Customer fetched:', data);
      return data.customer;
      
    } catch (error) {
      logger.error('Fetch customer error:', error);
      throw error;
    }
  }
  
  // Get customer's previous tickets
  async getCustomerTickets(customerId: string, limit: number = 5): Promise<Ticket[]> {
    logger.log('Fetching customer tickets:', customerId);
    
    try {
      const response = await fetch(
        `${this.baseURL}/tickets?customer_id=${customerId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.success('Customer tickets fetched:', data);
      return data.tickets || [];
      
    } catch (error) {
      logger.error('Fetch tickets error:', error);
      return [];
    }
  }
  
  // Add note to ticket
  async addNote(ticketId: string, noteText: string): Promise<void> {
    logger.log('Adding note to ticket:', ticketId);
    
    try {
      const response = await fetch(
        `${this.baseURL}/tickets/${ticketId}/notes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            body: noteText
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to add note: ${response.statusText}`);
      }
      
      logger.success('Note added successfully');
      
    } catch (error) {
      logger.error('Add note error:', error);
      throw error;
    }
  }
  
  // Update ticket status
  async updateTicketStatus(ticketId: string, status: 'active' | 'closed' | 'spam'): Promise<void> {
    logger.log('Updating ticket status:', ticketId, status);
    
    try {
      const response = await fetch(
        `${this.baseURL}/tickets/${ticketId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: status
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
      
      logger.success('Status updated');
      
    } catch (error) {
      logger.error('Update status error:', error);
      throw error;
    }
  }
  
  // Get knowledge base articles
  async searchArticles(query: string, limit: number = 5): Promise<Article[]> {
    logger.log('Searching articles:', query);
    
    try {
      const response = await fetch(
        `${this.baseURL}/articles?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        logger.warn('Articles not available');
        return [];
      }
      
      const data = await response.json();
      logger.success('Articles found:', data);
      return data.articles || [];
      
    } catch (error) {
      logger.warn('Search articles error (optional feature):', error);
      return [];
    }
  }
}
