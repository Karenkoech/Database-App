import { useState } from 'react';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDbType, setSelectedDbType] = useState('');
  const [otherDbSelected, setOtherDbSelected] = useState(false);
  const [otherDbType, setOtherDbType] = useState('');
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileSelect = (file, dbType) => {
    setSelectedFile(file);
    setSelectedDbType(dbType);
    setError(null);
    
    // Skip validation for Excel files
    const fileExt = file.name.toLowerCase();
    const isExcelFile = fileExt.endsWith('.xlsx') || fileExt.endsWith('.xls');
    if (isExcelFile) {
      return; // Server will validate Excel files
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedDbType) {
      setError('Please select a database type and file');
      return { success: false, error: 'Please select a database type and file' };
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('script', selectedFile);
      formData.append('dbType', selectedDbType);

      const response = await fetch('/api/analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.analysis);
        return { success: true, analysis: data.analysis };
      } else {
        const errorMsg = data.message || data.error || 'Analysis failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMsg = err.message || 'Failed to analyze script. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setSelectedDbType('');
    setOtherDbSelected(false);
    setOtherDbType('');
    setError(null);
    setAnalysisResult(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    selectedFile,
    selectedDbType,
    otherDbSelected,
    otherDbType,
    error,
    analyzing,
    analysisResult,
    handleFileSelect,
    handleAnalyze,
    clearSelection,
    clearError,
    setOtherDbSelected,
    setOtherDbType
  };
}
