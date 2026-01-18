import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Navbar />
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <ProtectedRoute>
            <Navbar />
            <Contact />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
