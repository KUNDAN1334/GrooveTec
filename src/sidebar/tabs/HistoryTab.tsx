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
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ customerId, ticketId }) => {
  const [tickets, setTickets] = useState<HistoryTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchMethod, setFetchMethod] = useState<'api' | 'demo'>('api');
  
  useEffect(() => {
    fetchHistory();
  }, [customerId, ticketId]);
  
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    setFetchMethod('api');
    
    try {
      // Try to fetch from Groove API first
      if (customerId && customerId !== '0') {
        logger.log('Fetching REAL history for customer:', customerId);
        
        try {
          const response = await sendToBackground({
            type: MessageType.FETCH_CUSTOMER_HISTORY,
            payload: {
              customerId: customerId,
              limit: 10
            }
          });
          
          if (response.success && response.tickets && response.tickets.length > 0) {
            setTickets(response.tickets);
            logger.success('REAL history loaded:', response.tickets.length);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          logger.warn('API fetch failed, will try alternative methods');
        }
      }
      
      // If ticket ID exists, fetch related tickets
      if (ticketId && ticketId !== '0') {
        logger.log('Fetching tickets for ticket ID:', ticketId);
        
        try {
          const response = await sendToBackground({
            type: MessageType.FETCH_TICKET_DATA,
            payload: { ticketId }
          });
          
          if (response.success && response.ticket) {
            const ticketData = response.ticket;
            
            // If ticket has customer info, fetch their history
            if (ticketData.customer?.id) {
              logger.log('👤 Found customer ID from ticket:', ticketData.customer.id);
              
              const historyResponse = await sendToBackground({
                type: MessageType.FETCH_CUSTOMER_HISTORY,
                payload: {
                  customerId: ticketData.customer.id,
                  limit: 10
                }
              });
              
              if (historyResponse.success && historyResponse.tickets) {
                const otherTickets = historyResponse.tickets
                  .filter((t: any) => t.id !== ticketId)
                  .slice(0, 10);
                
                setTickets(otherTickets);
                logger.success('REAL customer history loaded from ticket');
                setLoading(false);
                return;
              }
            }
          }
        } catch (ticketError) {
          logger.warn('Ticket fetch failed');
        }
      }
      
      // Fallback: Use demo data
      logger.log('Using DEMO data (API not available)');
      setFetchMethod('demo');
      setError('Showing demo history (API connection issue)');
      setTickets(getDemoTickets());
      
    } catch (err: any) {
      logger.error('History fetch error:', err);
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
        id: '#15',
        subject: 'Order Tracking Issue',
        status: 'closed',
        created_at: '2025-11-03',
        updated_at: '2025-11-04'
      },
      {
        id: '#14',
        subject: 'Payment Problem',
        status: 'closed',
        created_at: '2025-11-02',
        updated_at: '2025-11-03'
      },
      {
        id: '#13',
        subject: 'Shipping Information',
        status: 'closed',
        created_at: '2025-11-01',
        updated_at: '2025-11-02'
      },
      {
        id: '#12',
        subject: 'Account Setup Help',
        status: 'closed',
        created_at: '2025-10-31',
        updated_at: '2025-11-01'
      },
      {
        id: '#11',
        subject: 'Product Return Request',
        status: 'closed',
        created_at: '2025-10-30',
        updated_at: '2025-10-31'
      }
    ];
  };
  
  if (loading) {
    return <div className="tab-loading">Loading history...</div>;
  }
  
  if (tickets.length === 0) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">📭</div>
        <div className="empty-text">No previous tickets found</div>
        {error && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="history-tab">
      {error && fetchMethod === 'demo' && (
        <div style={{
          background: '#d1f3ff',
          color: '#0066cc',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          ℹ️ {error}
        </div>
      )}
      
      {fetchMethod === 'api' && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '8px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '11px',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          Real-time history from Groove API
        </div>
      )}
      
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-item">
            <div className="ticket-header">
              <span className="ticket-id">{ticket.id}</span>
              <span className={`ticket-status ${ticket.status}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="ticket-subject">{ticket.subject}</div>
            
            <div className="ticket-dates">
              <span>
                <span className="date-label">Created:</span>
                <span className="date-value"> {new Date(ticket.created_at).toLocaleDateString()}</span>
              </span>
            </div>
            
            <div className="ticket-dates">
              <span>
                <span className="date-label">Updated:</span>
                <span className="date-value"> {new Date(ticket.updated_at).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

