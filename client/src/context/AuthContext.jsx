import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';

const AuthContext = createContext(null);

const getStoredToken = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem('sgag_token');
    }
  } catch (e) {
    // Ignore storage errors in test environment
  }
  return null;
};

const setStoredToken = (token) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem('sgag_token', token);
    }
  } catch (e) {
    // Ignore storage errors
  }
};

const removeStoredToken = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
      window.localStorage.removeItem('sgag_token');
    }
  } catch (e) {
    // Ignore storage errors
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user);
      } catch (err) {
        removeStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, senha) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      if (data.token) {
        setStoredToken(data.token);
        setToken(data.token);
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
