import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
import type { UserProfile } from '../services/auth';
import { NeonDB } from '../services/db';

type AuthContextType = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const refresh = async () => {
    setLoading(true);
    const ok    = await AuthService.checkSession();
    setIsAuthenticated(ok);
    const profile = AuthService.getUser();
    setUser(profile);

    // After a successful session check, upsert the user profile row in Neon DB
    if (ok && profile && typeof profile.id === 'string') {
      try {
        await NeonDB.getOrCreateProfile(profile.id, profile.name, profile.email);
      } catch {
        // Profile upsert is best-effort — never block the UI
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(t);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
