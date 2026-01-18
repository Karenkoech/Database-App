import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUpload from '../components/FileUpload';
import ErrorModal from '../components/ErrorModal';

function Dashboard() {
  const { user } = useAuth();
  const {
    history,
    loading: historyLoading,
    error: historyError,
    stats,
    dbFilter,
    setDbFilter,
    refresh
  } = useDashboard();

  const {
    selectedFile,
    selectedDbType,
    error: uploadError,
    analyzing,
    handleFileSelect,
    handleAnalyze,
    clearSelection,
    clearError
  } = useFileUpload();

  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [showOtherDbMenu, setShowOtherDbMenu] = useState(false);
  const [otherDbType, setOtherDbType] = useState('');

  const handleFileSelectWithValidation = async (file, dbType) => {
    // Skip validation for Excel files
    const fileExt = file.name.toLowerCase();
    const isExcelFile = fileExt.endsWith('.xlsx') || fileExt.endsWith('.xls');
    
    if (!isExcelFile) {
      // For text files, we could add validation here if needed
      // For now, let server handle it
    }
    
    handleFileSelect(file, dbType);
  };

  const handleAnalyzeClick = async () => {
    const result = await handleAnalyze();
    if (result.success) {
      // Refresh history after successful analysis
      setTimeout(() => {
        refresh();
        clearSelection();
      }, 1000);
    } else if (result.error) {
      setErrorModal({
        open: true,
        message: result.error
      });
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Welcome back, {user?.fullName || user?.username || 'User'}!</h1>
        <p>Upload and analyze database scripts, then view your analysis history</p>
      </header>

      <div className="dashboard-controls">
        <div className="filter-section">
          <label htmlFor="dbFilter">Filter by Database:</label>
          <select
            id="dbFilter"
            className="db-filter"
            value={dbFilter}
            onChange={(e) => setDbFilter(e.target.value)}
          >
            <option value="">All Databases</option>
            <option value="MS SQL Server">MS SQL Server</option>
            <option value="SAP HANA">SAP HANA</option>
            <option value="Oracle">Oracle</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MySQL">MySQL</option>
            <option value="MongoDB">MongoDB</option>
            <option value="DB2">IBM DB2</option>
            <option value="Sybase">Sybase</option>
            <option value="Teradata">Teradata</option>
            <option value="Snowflake">Snowflake</option>
            <option value="Other">Other</option>
          </select>
          <button className="refresh-btn" onClick={refresh}>🔄 Refresh</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalAnalyses}</h3>
            <p>Total Analyses</p>
          </div>
        </div>
        <div className="stat-card high-risk">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>{stats.highRiskCount}</h3>
            <p>High Risk Issues</p>
          </div>
        </div>
        <div className="stat-card medium-risk">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <h3>{stats.mediumRiskCount}</h3>
            <p>Medium Risk Issues</p>
          </div>
        </div>
        <div className="stat-card low-risk">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.lowRiskCount}</h3>
            <p>Low Risk Issues</p>
          </div>
        </div>
      </div>

      <FileUpload
        onFileSelect={handleFileSelectWithValidation}
        selectedFile={selectedFile}
        selectedDbType={selectedDbType}
        onClear={clearSelection}
        onAnalyze={handleAnalyzeClick}
        analyzing={analyzing}
        error={uploadError}
        onErrorClose={clearError}
      />

      <div className="history-section">
        <h2>Analysis History</h2>
        <div className="history-container">
          {historyLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : historyError ? (
            <div className="error-state">
              <p>❌ {historyError}</p>
              <button
                onClick={refresh}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Retry
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Analysis History</h3>
              <p>Upload your first database script to see analysis results here.</p>
              <button
                onClick={() => document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="upload-link-btn"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '15px'
                }}
              >
                📁 Upload Script
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <div className="history-title">
                      <span className="history-filename">{item.filename}</span>
                      <span className="history-db-badge">{item.db_type || 'Unknown'}</span>
                    </div>
                    <div className="history-date">
                      {new Date(item.created_at || item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  {item.riskAssessment && (
                    <div className="history-risk">
                      <span className={`risk-badge risk-${(item.riskAssessment.overallRisk || 'low').toLowerCase()}`}>
                        {item.riskAssessment.overallRisk || 'Low'} Risk
                      </span>
                      <span className="risk-counts">
                        High: {item.riskAssessment.high || 0} | 
                        Medium: {item.riskAssessment.medium || 0} | 
                        Low: {item.riskAssessment.low || 0}
                      </span>
                    </div>
                  )}
                  {item.aiAnalysis?.overview && (
                    <p className="history-overview">{item.aiAnalysis.overview.substring(0, 150)}...</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ErrorModal
        isOpen={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
      />
    </div>
  );
}

export default Dashboard;
