import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser, AuthContextType, LoginCredentials } from '../types';
import { loginAdmin as apiLogin, logoutAdmin as apiLogout, getAdminProfile } from '../api/authApi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getAdminProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('user_info', JSON.stringify(profile));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!localStorage.getItem('access_token'),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
