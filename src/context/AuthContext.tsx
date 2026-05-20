import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any; // replace with proper UserProfile type if needed
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const refresh = async () => {
    setLoading(true);
    const ok = await AuthService.checkSession();
    setIsAuthenticated(ok);
    setUser(AuthService.getUser());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const signOut = async () => {
    await AuthService.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
