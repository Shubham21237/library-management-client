import React, { createContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getProfileApi } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('library_user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('library_user_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync profile data on initial mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getProfileApi();
          if (res.status === 'success') {
            setUser(res.data);
            localStorage.setItem('library_user_data', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('❌ Error verifying user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    if (res.status === 'success') {
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('library_user_token', userData.token);
      localStorage.setItem('library_user_data', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res.status === 'success') {
      const newUser = res.data;
      setUser(newUser);
      setToken(newUser.token);
      localStorage.setItem('library_user_token', newUser.token);
      localStorage.setItem('library_user_data', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('library_user_token');
    localStorage.removeItem('library_user_data');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
