import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smart_attendance_user');
    const token = localStorage.getItem('smart_attendance_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const authData = response.data.data;
        const userData = {
          userId: authData.userId,
          name: authData.name,
          email: authData.email,
          role: authData.role,
          roleEntityId: authData.roleEntityId,
          identifier: authData.identifier,
        };

        localStorage.setItem('smart_attendance_token', authData.token);
        localStorage.setItem('smart_attendance_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials or server unavailable';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('smart_attendance_token');
    localStorage.removeItem('smart_attendance_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
