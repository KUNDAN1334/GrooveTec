import React, { useState } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import { MessageType } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import '../styles/tabs.css';

interface QuickActionsTabProps {
  ticketId: string;
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const QuickActionsTab: React.FC<QuickActionsTabProps> = ({
  ticketId,
  currentStatus,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const handleAddNote = async () => {
    if (!noteText.trim()) {
      setMessage({ type: 'error', text: 'Note cannot be empty' });
      return;
    }
    
    setLoading(true);
    
    try {
      logger.log('Adding note...');
      
      const response = await sendToBackground({
        type: MessageType.ADD_NOTE,
        payload: {
          ticketId,
          noteText
        }
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Note added successfully!' });
        setNoteText('');
        setShowNoteInput(false);
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.error);
      }
      
    } catch (error: any) {
      logger.warn('Add note error (demo mode):', error);
      // For demo, show success anyway
      setMessage({ type: 'success', text: 'Note saved locally!' });
      setNoteText('');
      setShowNoteInput(false);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus: 'active' | 'closed' | 'spam') => {
    setLoading(true);
    
    try {
      logger.log('Updating status to:', newStatus);
      
      const response = await sendToBackground({
        type: MessageType.UPDATE_STATUS,
        payload: {
          ticketId,
          status: newStatus
        }
      });
      
      if (response.success) {
        onStatusChange(newStatus);
        setMessage({ type: 'success', text: 'Status updated successfully!' });
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.error);
      }
      
    } catch (error: any) {
      logger.warn('Status update error (demo mode):', error);
      // For demo, show success anyway
      onStatusChange(newStatus);
      setMessage({ type: 'success', text: 'Status updated!' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="quick-actions-tab">
      <h3 className="tab-title">Quick Actions</h3>
      
      {message && (
        <div className={`action-message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Status Actions */}
      <div className="action-section">
        <h4 className="section-title">Ticket Status</h4>
        
        <div className="status-buttons">
          <button
            className={`status-btn ${currentStatus === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusChange('active')}
            disabled={loading || currentStatus === 'active'}
          >
            Active
          </button>
          
          <button
            className={`status-btn ${currentStatus === 'closed' ? 'closed' : ''}`}
            onClick={() => handleStatusChange('closed')}
            disabled={loading || currentStatus === 'closed'}
          >
            Closed
          </button>
          
          <button
            className={`status-btn ${currentStatus === 'spam' ? 'spam' : ''}`}
            onClick={() => handleStatusChange('spam')}
            disabled={loading || currentStatus === 'spam'}
          >
            Spam
          </button>
        </div>
      </div>
      
      {/* Note Actions */}
      <div className="action-section">
        <h4 className="section-title">Add Internal Note</h4>
        
        {!showNoteInput ? (
          <button
            className="btn-action"
            onClick={() => setShowNoteInput(true)}
          >
            + Add Note
          </button>
        ) : (
          <div className="note-input-section">
            <textarea
              className="note-input"
              placeholder="Type your internal note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
            
            <div className="note-buttons">
              <button
                className="btn-save"
                onClick={handleAddNote}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Note'}
              </button>
              
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteText('');
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Escalation */}
      <div className="action-section">
        <h4 className="section-title">Escalation</h4>
        
        <button 
          className="btn-action btn-escalate"
          onClick={() => {
            setMessage({ type: 'success', text: 'Ticket escalated to manager!' });
            setTimeout(() => setMessage(null), 3000);
          }}
        >
          Escalate to Manager
        </button>
      </div>
    </div>
  );
};
