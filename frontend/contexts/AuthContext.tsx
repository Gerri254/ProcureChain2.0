'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  user_type?: 'learner' | 'employer' | 'educator';
  company_name?: string;
  department?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    console.log('[AuthContext] Initializing auth, token exists:', !!token);

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('[AuthContext] Loaded user from localStorage:', parsedUser);
        setUser(parsedUser);

        // Fetch fresh user data from API to get latest profile info
        api.getCurrentUser()
          .then((response) => {
            console.log('[AuthContext] Fresh user data from API:', response);
            if (response.success && response.data) {
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          })
          .catch((error) => {
            console.error('Error fetching current user:', error);
            // If token is invalid, clear auth data
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              setUser(null);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        setLoading(false);
      }
    } else {
      console.log('[AuthContext] No stored user or token');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    if (response.success) {
      // Auto-login after registration
      await login(data.email, data.password);
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  };

  const logout = async () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
