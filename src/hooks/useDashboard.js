import { useState, useEffect } from 'react';

export function useDashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbFilter, setDbFilter] = useState('');
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0
  });

  const loadHistory = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/history', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load history');
      }

      const data = await response.json();
      if (data.success) {
        const historyData = data.history || [];
        setHistory(historyData);
        updateStats(historyData);
        return historyData;
      } else {
        throw new Error('Failed to load history');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const updateStats = (historyData) => {
    let high = 0, medium = 0, low = 0;
    
    historyData.forEach(item => {
      const risk = item.riskAssessment || {};
      // Handle both formats: risk.high vs risk.highRisk
      high += risk.high || risk.highRisk || 0;
      medium += risk.medium || risk.mediumRisk || 0;
      low += risk.low || risk.lowRisk || 0;
    });

    setStats({
      totalAnalyses: historyData.length,
      highRiskCount: high,
      mediumRiskCount: medium,
      lowRiskCount: low
    });
  };

  const filteredHistory = dbFilter
    ? history.filter(item => item.db_type === dbFilter)
    : history;

  useEffect(() => {
    loadHistory(false); // Silent load on mount
  }, []);

  return {
    history: filteredHistory,
    allHistory: history,
    loading,
    error,
    stats,
    dbFilter,
    setDbFilter,
    loadHistory,
    refresh: () => loadHistory(true)
  };
}
