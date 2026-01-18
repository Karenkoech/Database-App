import React, { useRef, useState, useEffect } from 'react';
import ErrorModal from './ErrorModal';

function FileUpload({ onFileSelect, selectedFile, selectedDbType, onClear, onAnalyze, analyzing, error, onErrorClose }) {
  const fileInputRefs = useRef({});
  const otherDbFileInputRef = useRef(null);
  const [showOtherDbMenu, setShowOtherDbMenu] = useState(false);
  const [otherDbType, setOtherDbType] = useState('');
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  useEffect(() => {
    if (error) {
      setErrorModal({ open: true, message: error });
    } else {
      setErrorModal({ open: false, message: '' });
    }
  }, [error]);

  const handleCloseError = () => {
    setErrorModal({ open: false, message: '' });
    if (onErrorClose) {
      onErrorClose();
    }
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (showOtherDbMenu && !e.target.closest('.other-db-dropdown')) {
        setShowOtherDbMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOtherDbMenu]);

  const dbTypes = [
    { id: 'MS SQL Server', icon: '🗄️', name: 'MS SQL Server', desc: 'Upload SQL Server scripts' },
    { id: 'SAP HANA', icon: '💾', name: 'SAP HANA', desc: 'Upload HANA scripts' },
    { id: 'Oracle', icon: '🗃️', name: 'Oracle', desc: 'Upload Oracle scripts' }
  ];

  const otherDbTypes = [
    'PostgreSQL', 'MySQL', 'MongoDB', 'DB2', 'Sybase', 'Teradata', 'Snowflake', 'Other'
  ];

  const handleDbCardClick = (dbType) => {
    if (!fileInputRefs.current[dbType]) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.sql,.txt,.js,.py,.xlsx,.xls';
      input.style.display = 'none';
      input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          onFileSelect(e.target.files[0], dbType);
        }
      });
      fileInputRefs.current[dbType] = input;
      document.body.appendChild(input);
    }
    fileInputRefs.current[dbType].click();
  };

  const handleOtherDbSelect = (dbType) => {
    setOtherDbType(dbType);
    setShowOtherDbMenu(false);
    if (otherDbFileInputRef.current) {
      otherDbFileInputRef.current.click();
    }
  };

  const handleOtherDbFileChange = (e) => {
    if (e.target.files.length > 0 && otherDbType) {
      onFileSelect(e.target.files[0], otherDbType);
    }
  };

  return (
    <section className="upload-section">
      <h2>Upload Database Script</h2>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9em' }}>
        <strong>Step 1:</strong> Click "Choose File" on your database type below<br />
        <strong>Step 2:</strong> Select your script file (.sql, .txt, .xlsx, etc.)<br />
        <strong>Step 3:</strong> Click "Analyze Script" button that appears after file selection<br /><br />
        The AI will analyze and report security issues, compliance problems, and provide recommendations.
      </p>

      <div className="db-upload-grid">
        {dbTypes.map(db => (
          <div
            key={db.id}
            className={`db-upload-card ${selectedDbType === db.id ? 'active' : ''}`}
            data-db={db.id}
          >
            <div className="db-icon">{db.icon}</div>
            <h3>{db.name}</h3>
            <p>{db.desc}</p>
            <button
              type="button"
              className="db-upload-btn"
              onClick={() => handleDbCardClick(db.id)}
            >
              📁 Choose File
            </button>
          </div>
        ))}

        <div className="db-upload-card other-db-card">
          <div className="db-icon">📊</div>
          <h3>Other DBs</h3>
          <p>Select database first</p>
          <div className="other-db-dropdown">
            <button
              type="button"
              className="other-db-toggle"
              onClick={() => setShowOtherDbMenu(!showOtherDbMenu)}
            >
              {otherDbType ? `Selected: ${otherDbType} ⬇️` : 'Select Database ⬇️'}
            </button>
            {showOtherDbMenu && (
              <div className="other-db-menu" style={{ display: 'block' }}>
                {otherDbTypes.map(db => (
                  <button
                    key={db}
                    type="button"
                    className="other-db-option"
                    onClick={() => handleOtherDbSelect(db)}
                  >
                    {db}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={otherDbFileInputRef}
            type="file"
            className="db-file-input"
            accept=".sql,.txt,.js,.py,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleOtherDbFileChange}
          />
          {otherDbType && (
            <button
              type="button"
              className="db-upload-btn"
              onClick={() => otherDbFileInputRef.current?.click()}
            >
              📁 Choose File
            </button>
          )}
          {!otherDbType && (
            <p className="other-db-hint" style={{ fontSize: '0.85em', color: '#999', marginTop: '10px' }}>
              Select a database from dropdown above
            </p>
          )}
        </div>
      </div>

      {selectedFile && (
        <>
          <div className="selected-file-info" style={{ display: 'block' }}>
            <div className="selected-file-content">
              <span className="selected-db-badge">{selectedDbType}</span>
              <span className="selected-file-name">{selectedFile.name}</span>
              <button type="button" className="clear-btn" onClick={onClear}>✕</button>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              className="analyze-button"
              onClick={onAnalyze}
              disabled={analyzing}
            >
              {analyzing ? '⏳ Analyzing...' : '🔍 Analyze Script'}
            </button>
          </div>
        </>
      )}

      {analyzing && (
        <div id="loading" style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
          <div className="spinner"></div>
          <p>Analyzing script... This may take a moment.</p>
        </div>
      )}

      {errorModal.open && (
        <ErrorModal
          isOpen={errorModal.open}
          message={errorModal.message}
          onClose={handleCloseError}
        />
      )}
    </section>
  );
}

export default FileUpload;
