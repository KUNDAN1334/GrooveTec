import React, { useState, useEffect } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import { MessageType } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import '../styles/tabs.css';

interface HistoryTabProps {
  customerId?: string;
  ticketId?: string | null;
}

interface HistoryTicket {
  id: string;
  number?: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ customerId, ticketId }) => {
  const [tickets, setTickets] = useState<HistoryTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchMethod, setFetchMethod] = useState<'api' | 'demo'>('demo');
  
  useEffect(() => {
    fetchHistory();
  }, [customerId, ticketId]);
  
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    console.log('HISTORY: Starting fetch with:', { customerId, ticketId });
    
    try {
      // Method 1: Try to fetch using customer ID
      if (customerId && customerId !== '0') {
        console.log('HISTORY: Attempting fetch with customerId:', customerId);
        
        try {
          const response = await sendToBackground({
            type: MessageType.FETCH_CUSTOMER_HISTORY,
            payload: {
              customerId: customerId,
              limit: 10
            }
          });
          
          console.log('HISTORY: API Response:', response);
          
          if (response.success && response.tickets && response.tickets.length > 0) {
            // Filter out current ticket if it exists in the list
            const filteredTickets = response.tickets
              .filter((t: any) => t.number?.toString() !== ticketId)
              .slice(0, 10);
            
            setTickets(filteredTickets);
            setFetchMethod('api');
            logger.success('HISTORY: Real customer history loaded:', filteredTickets.length);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('HISTORY: Customer ID fetch failed:', apiError);
        }
      }
      
      // Method 2: Try to fetch current ticket first, then get customer history
      if (ticketId && ticketId !== '0') {
        console.log('HISTORY: Attempting fetch via ticket ID:', ticketId);
        
        try {
          const ticketResponse = await sendToBackground({
            type: MessageType.FETCH_TICKET_DATA,
            payload: { ticketId }
          });
          
          console.log('HISTORY: Ticket Response:', ticketResponse);
          
          if (ticketResponse.success && ticketResponse.ticket?.customer?.id) {
            const extractedCustomerId = ticketResponse.ticket.customer.id;
            console.log('HISTORY: Extracted customer ID:', extractedCustomerId);
            
            const historyResponse = await sendToBackground({
              type: MessageType.FETCH_CUSTOMER_HISTORY,
              payload: {
                customerId: extractedCustomerId,
                limit: 10
              }
            });
            
            console.log('HISTORY: Customer history response:', historyResponse);
            
            if (historyResponse.success && historyResponse.tickets) {
              const filteredTickets = historyResponse.tickets
                .filter((t: any) => t.number?.toString() !== ticketId)
                .slice(0, 10);
              
              setTickets(filteredTickets);
              setFetchMethod('api');
              logger.success('HISTORY: Real history loaded via ticket');
              setLoading(false);
              return;
            }
          }
        } catch (ticketError) {
          console.error('HISTORY: Ticket fetch failed:', ticketError);
        }
      }
      
      // Fallback: Use demo data
      console.warn('HISTORY: All API methods failed, using demo data');
      setFetchMethod('demo');
      setError('Showing demo history (API unavailable)');
      setTickets(getDemoTickets());
      
    } catch (err: any) {
      console.error('HISTORY: Fetch error:', err);
      setFetchMethod('demo');
      setError('Using demo history (error occurred)');
      setTickets(getDemoTickets());
    } finally {
      setLoading(false);
    }
  };
  
  // Demo tickets for fallback
  const getDemoTickets = (): HistoryTicket[] => {
    return [
      {
        id: '15',
        number: 15,
        subject: 'Previous Order Tracking Issue',
        status: 'closed',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '14',
        number: 14,
        subject: 'Payment Inquiry',
        status: 'closed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '13',
        number: 13,
        subject: 'Shipping Information Request',
        status: 'closed',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '12',
        number: 12,
        subject: 'Account Setup Help',
        status: 'closed',
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '11',
        number: 11,
        subject: 'Product Return Request',
        status: 'closed',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <div className="tab-loading" style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        Loading customer history...
      </div>
    );
  }
  
  if (tickets.length === 0 && !error) {
    return (
      <div className="tab-empty" style={{
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <div style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>
          No previous tickets found
        </div>
      </div>
    );
  }
  
  return (
    <div className="history-tab" style={{ padding: '24px' }}>
      {/* Status Indicator */}
      {fetchMethod === 'demo' && error && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          color: '#856404',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {fetchMethod === 'api' && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '11px',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          Real-time history from Groove API
        </div>
      )}
      
      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            style={{
              background: '#fafafa',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              padding: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#120036';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#120036',
                fontSize: '13px'
              }}>
                #{ticket.number || ticket.id}
              </span>
              <span style={{
                padding: '4px 10px',
                background: ticket.status === 'closed' ? '#f5f5f5' : '#d1fae5',
                color: ticket.status === 'closed' ? '#666' : '#065f46',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {ticket.status}
              </span>
            </div>
            
            {/* Subject */}
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#000',
              marginBottom: '12px',
              lineHeight: 1.5
            }}>
              {ticket.subject}
            </div>
            
            {/* Dates */}
            <div style={{
              display: 'flex',
              gap: '16px',
              fontSize: '11px',
              color: '#999',
              fontWeight: 500
            }}>
              <span>
                <strong style={{ color: '#666' }}>Created:</strong> {formatDate(ticket.created_at)}
              </span>
              <span>
                <strong style={{ color: '#666' }}>Updated:</strong> {formatDate(ticket.updated_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

