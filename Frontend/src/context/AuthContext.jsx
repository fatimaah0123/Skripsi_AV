import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { authService } from '../features/auth/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: userData, accessToken: tokenData } = await authService.refreshToken();

        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        if (tokenData) {
          setAccessToken(tokenData);
          localStorage.setItem('accessToken', tokenData);
        }
      } catch (err) {
        // Jika refresh token gagal/expired dari server, baru bersihkan storage
        if (!localStorage.getItem('user')) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { user: userData, accessToken: tokenData } = await authService.login(email, password);

      // 📌 2. Simpan ke State React DAN LocalStorage bersamaan!
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      if (tokenData) {
        setAccessToken(tokenData);
        localStorage.setItem('accessToken', tokenData);
      }

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const isAdmin = useMemo(() => user?.role === 'Admin', [user]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAdmin, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);