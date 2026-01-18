import React from 'react';
import { Link } from 'react-router-dom';

function LandingNavbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1002, position: 'relative', pointerEvents: 'auto' }}>
          <span className="nav-icon">🔍</span>
          <span className="nav-title">Database Audit Tool</span>
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
      </div>
    </nav>
  );
}

function Landing() {
  return (
    <>
      <LandingNavbar />
      <div className="container" style={{ maxWidth: '100%', padding: 0, background: 'transparent' }}>
        {/* Hero Section */}
        <section className="hero-section" style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <h1 style={{ fontSize: '3em', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            🔍 AI-Powered Database Audit Tool
          </h1>
          <p style={{ fontSize: '1.3em', marginBottom: '40px', opacity: 0.95 }}>
            Comprehensive security analysis for IT auditors. Detect vulnerabilities, compliance issues, and security risks in your database scripts.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="hero-btn hero-btn-primary" style={{
              padding: '15px 30px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'white',
              color: '#667eea'
            }}>
              Get Started
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary" style={{
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white'
            }}>
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '60px 20px', background: 'white' }}>
          <h2 className="section-title" style={{ fontSize: '2.5em', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Key Features
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Advanced AI algorithms scan your database scripts to identify security vulnerabilities, compliance issues, and potential risks automatically.' },
              { icon: '⚠️', title: 'Risk Assessment', desc: 'Get detailed risk assessments with high, medium, and low priority classifications to help you focus on critical issues first.' },
              { icon: '🗄️', title: 'Multi-Database Support', desc: 'Supports MS SQL Server, SAP HANA, Oracle, PostgreSQL, MySQL, MongoDB, DB2, and many more database systems.' },
              { icon: '📊', title: 'Excel & Script Upload', desc: 'Upload Excel files (.xlsx, .xls) or script files (.sql, .txt, .js, .py) for comprehensive analysis.' },
              { icon: '📜', title: 'Analysis History', desc: 'Track all your analyses with detailed history, filter by database type, and monitor risk trends over time.' },
              { icon: '✅', title: 'Compliance Checking', desc: 'Ensure your database scripts comply with security standards and best practices for data protection.' }
            ].map((feature, idx) => (
              <div key={idx} className="feature-card" style={{
                background: '#f8f9fa',
                padding: '30px',
                borderRadius: '10px',
                textAlign: 'center',
                transition: 'transform 0.3s'
              }}>
                <div className="feature-icon" style={{ fontSize: '48px', marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.5em' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#666', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works" style={{
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 className="section-title" style={{ fontSize: '2.5em', marginBottom: '20px', color: 'white', textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '40px auto 0'
          }}>
            {[
              { num: '1', title: 'Upload Your Scripts', desc: 'Select your database type and upload Excel files or script files containing your database queries and procedures.' },
              { num: '2', title: 'AI Analysis', desc: 'Our AI engine analyzes your scripts for security vulnerabilities, SQL injection risks, permission issues, and compliance problems.' },
              { num: '3', title: 'Get Results', desc: 'Receive detailed reports with risk assessments, issue descriptions, and actionable recommendations to improve security.' },
              { num: '4', title: 'Track & Monitor', desc: 'View your analysis history in the dashboard, filter by database type, and track improvements over time.' }
            ].map((step, idx) => (
              <div key={idx} className="step" style={{ textAlign: 'center' }}>
                <div className="step-number" style={{
                  width: '60px',
                  height: '60px',
                  background: 'white',
                  color: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 auto 20px'
                }}>
                  {step.num}
                </div>
                <h3 style={{ marginBottom: '10px' }}>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" style={{ padding: '60px 20px', textAlign: 'center', background: 'white' }}>
          <h2 className="section-title" style={{ fontSize: '2.5em', marginBottom: '20px', color: '#333' }}>
            Ready to Secure Your Database?
          </h2>
          <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '30px' }}>
            Start analyzing your database scripts today and ensure compliance with security best practices.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="hero-btn hero-btn-primary" style={{
              padding: '15px 30px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'white',
              color: '#667eea'
            }}>
              Create Account
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary" style={{
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white'
            }}>
              Sign In
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default Landing;
