import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import StorageService from '../utils/storage';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await StorageService.getAuthToken();
      const userData = await StorageService.getUserData();

      if (token && userData) {
        // Validate token with server
        const response = await ApiService.validateToken(token);
        if (response.data) {
          setUser(userData);
        } else {
          // Token is invalid, clear storage
          await StorageService.clearAllStorage();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await StorageService.clearAllStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(identifier, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData = response.data as AuthResponse;
      
      // Store auth data
      await StorageService.setAuthToken(authData.token);
      await StorageService.setUserData(authData);

      setUser(authData as User);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await ApiService.signup(userData);

      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData = response.data as AuthResponse;
      
      // Store auth data
      await StorageService.setAuthToken(authData.token);
      await StorageService.setUserData(authData);

      setUser(authData as User);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await StorageService.clearAllStorage();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if storage clearing fails
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        const response = await ApiService.validateToken(token);
        if (response.error) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
