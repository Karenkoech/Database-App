import React from 'react';

function ErrorModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div id="errorModal" className="error-modal" style={{ display: 'flex' }}>
      <div className="error-modal-overlay" onClick={onClose}></div>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <span className="error-icon">⚠️</span>
          <h3>DB Mismatch in Scripts Uploaded</h3>
          <button type="button" className="error-close" onClick={onClose}>✕</button>
        </div>
        <div className="error-modal-body">
          <p id="errorMessageText">{message}</p>
        </div>
        <div className="error-modal-footer">
          <button type="button" className="error-ok-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
