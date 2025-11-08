import { useState, useCallback } from 'react';
import { setAccessToken } from '../api/client';
import { AuthContext } from './AuthContextInstance.ts';
import type { AuthUser } from './AuthContextInstance.ts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((token: string, u: AuthUser) => {
    setAccessToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// useAuth hook moved to hooks/useAuth.ts to satisfy fast-refresh constraints
