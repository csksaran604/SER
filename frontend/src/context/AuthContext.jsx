import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ser_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ser_token'));
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (_e) {
      console.warn('Logout API error:', _e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ser_token');
      localStorage.removeItem('ser_user');
    }
  };

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('ser_token', receivedToken);
    localStorage.setItem('ser_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('ser_token', receivedToken);
    localStorage.setItem('ser_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ser_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data.user);
          localStorage.setItem('ser_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isOperator = user?.role === 'EMERGENCY_OPERATOR' || isAdmin;
  const isViewer = user?.role === 'VIEWER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
        isAdmin,
        isOperator,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
