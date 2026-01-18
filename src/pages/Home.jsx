import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetch('/api/dashboard/history', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.history) {
          const history = data.history;
          let high = 0, medium = 0, low = 0;
          
          history.forEach(item => {
            const risk = item.riskAssessment || {};
            high += risk.high || 0;
            medium += risk.medium || 0;
            low += risk.low || 0;
          });

          setStats({
            totalAnalyses: history.length,
            highRiskCount: high,
            mediumRiskCount: medium,
            lowRiskCount: low
          });
        }
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="container">
      <div className="home-hero" style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          Welcome back, {user?.fullName || user?.username || 'User'}! 👋
        </h1>
        <p style={{ fontSize: '1.2em', opacity: 0.95, marginBottom: '30px' }}>
          Your AI-Powered Database Security Analysis Platform
        </p>
      </div>

      <div className="welcome-section" style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>🔍 What is Database Audit Tool?</h2>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          Database Audit Tool is a comprehensive security analysis platform designed for IT auditors. 
          It helps you analyze database scripts to identify security vulnerabilities, compliance issues, 
          and potential risks. Our AI-powered engine scans your scripts and provides detailed risk 
          assessments with actionable recommendations.
        </p>
      </div>

      <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
      <div className="quick-actions" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <Link to="/dashboard" className="action-card" style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div className="action-icon" style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3em' }}>Upload & Analyze</h3>
          <p style={{ color: '#666', fontSize: '0.95em' }}>Upload database scripts and get instant AI-powered security analysis</p>
        </Link>
        
        <Link to="/dashboard" className="action-card" style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div className="action-icon" style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3em' }}>View Dashboard</h3>
          <p style={{ color: '#666', fontSize: '0.95em' }}>Check your analysis history, risk statistics, and track issues over time</p>
        </Link>
        
        <Link to="/contact" className="action-card" style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div className="action-icon" style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3em' }}>Get Support</h3>
          <p style={{ color: '#666', fontSize: '0.95em' }}>Contact our team for help, questions, or feedback about the platform</p>
        </Link>
      </div>

      <div className="welcome-section" style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>📋 Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {[
            { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Advanced AI algorithms automatically detect security vulnerabilities and compliance issues in your database scripts.' },
            { icon: '⚠️', title: 'Risk Assessment', desc: 'Get detailed risk classifications (high, medium, low) to prioritize critical security issues.' },
            { icon: '🗄️', title: 'Multi-Database Support', desc: 'Supports MS SQL Server, SAP HANA, Oracle, PostgreSQL, MySQL, MongoDB, and more.' },
            { icon: '📜', title: 'Analysis History', desc: 'Track all your analyses with detailed history and filter by database type.' }
          ].map((feature, idx) => (
            <div key={idx}>
              <h3 style={{ color: '#667eea', marginBottom: '10px' }}>{feature.icon} {feature.title}</h3>
              <p style={{ color: '#666', fontSize: '0.95em' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-preview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        {[
          { label: 'Total Analyses', value: stats.totalAnalyses },
          { label: 'High Risk Issues', value: stats.highRiskCount },
          { label: 'Medium Risk Issues', value: stats.mediumRiskCount },
          { label: 'Low Risk Issues', value: stats.lowRiskCount }
        ].map((stat, idx) => (
          <div key={idx} className="stat-preview" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div className="number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
              {stat.value}
            </div>
            <div className="label" style={{ color: '#666', fontSize: '0.9em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
