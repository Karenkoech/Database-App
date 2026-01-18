import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, redirect: data.redirect || '/home' };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      // Always try to parse JSON first - even for error responses
      let data;
      const contentType = response.headers.get('content-type') || '';
      
      // Try to parse JSON regardless of status code
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError, 'Status:', response.status);
          // Try to get text as fallback
          const text = await response.clone().text().catch(() => 'Unable to read response');
          console.error('Response text:', text);
          return { 
            success: false, 
            message: `Server error (${response.status}). ${data?.message || 'Please try again.'}` 
          };
        }
      } else {
        // Non-JSON response - read as text
        const text = await response.text();
        console.error('Non-JSON response:', text, 'Status:', response.status);
        return { 
          success: false, 
          message: `Server error (${response.status}). ${text || 'Please check server logs.'}` 
        };
      }

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, redirect: data.redirect || '/home' };
      } else {
        return { success: false, message: data.message || data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      // Check if it's a network/connection error
      if (error.message === 'Failed to fetch' || 
          error.message.includes('fetch') || 
          error.name === 'TypeError') {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please ensure the backend server is running on port 3000.' 
        };
      }
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
