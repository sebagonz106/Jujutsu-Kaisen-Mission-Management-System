import { createContext } from 'react';

export interface AuthUser {
  id: number;
  role: 'sorcerer' | 'support' | 'observer';
  rank?: string;
  name?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
