import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Staff, AuthTokens } from '../types';
import api from '../services/api';

interface RegisterResponse {
  staff: Staff;
  tokens: AuthTokens | null;
  isPending?: boolean;
}

interface AuthContextType {
  user: Staff | null;
  tokens: AuthTokens | null;
  //isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse | undefined>;
  logout: () => void;
  updateUser: (user: Staff) => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Staff | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('tokens');

    if (storedUser && storedTokens) {
      try {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { staff, tokens: newTokens } = response.data.data;

    setUser(staff);
    setTokens(newTokens);

    localStorage.setItem('user', JSON.stringify(staff));
    localStorage.setItem('tokens', JSON.stringify(newTokens));
  };

  const register = async (data: RegisterData): Promise<RegisterResponse | undefined> => {
    const response = await api.post('/auth/register', data);
    const { staff, tokens: newTokens, isPending } = response.data.data;

    // Only set user and tokens if they're provided (not pending)
    if (newTokens && !isPending) {
      setUser(staff);
      setTokens(newTokens);

      localStorage.setItem('user', JSON.stringify(staff));
      localStorage.setItem('tokens', JSON.stringify(newTokens));
    }

    return { staff, tokens: newTokens, isPending };
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  const updateUser = (updatedUser: Staff) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Refresh user data from server (useful after email verification)
  const refreshUser = async () => {
    if (!tokens) return;

    try {
      const response = await api.get('/auth/me');
      const { staff } = response.data.data;
      setUser(staff);
      localStorage.setItem('user', JSON.stringify(staff));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        //isAuthenticated: !!user && !!tokens,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
