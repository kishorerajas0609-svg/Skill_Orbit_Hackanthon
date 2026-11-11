import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { User, AuthResponse, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<User>;
  googleLogin: (credentialOrToken: string, roleIfNew?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('skillorbit_access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      localStorage.removeItem('skillorbit_access_token');
      localStorage.removeItem('skillorbit_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, refresh_token, user: loggedUser } = res.data;
    localStorage.setItem('skillorbit_access_token', access_token);
    localStorage.setItem('skillorbit_refresh_token', refresh_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    const { access_token, refresh_token, user: newUser } = res.data;
    localStorage.setItem('skillorbit_access_token', access_token);
    localStorage.setItem('skillorbit_refresh_token', refresh_token);
    setUser(newUser);
    return newUser;
  };

  const googleLogin = async (credentialOrToken: string, roleIfNew: string = 'student'): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/google', {
      credential_or_token: credentialOrToken,
      role_if_new: roleIfNew,
    });
    const { access_token, refresh_token, user: loggedUser } = res.data;
    localStorage.setItem('skillorbit_access_token', access_token);
    localStorage.setItem('skillorbit_refresh_token', refresh_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('skillorbit_access_token');
      localStorage.removeItem('skillorbit_refresh_token');
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
