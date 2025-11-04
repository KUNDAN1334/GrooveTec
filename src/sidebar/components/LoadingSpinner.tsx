import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #f3f4f6',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Loading GrooveMate...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
