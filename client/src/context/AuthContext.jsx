import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const savedUser = localStorage.getItem('nuva_user');
    const savedToken = localStorage.getItem('nuva_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('nuva_user');
      }
    }
    setLoading(false);
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nuva_user', JSON.stringify(data.user));
        localStorage.setItem('nuva_token', data.user.token);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Try admin@thenuva.com / admin123' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nuva_user', JSON.stringify(data.user));
        localStorage.setItem('nuva_token', data.user.token);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nuva_user');
    localStorage.removeItem('nuva_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      isAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

