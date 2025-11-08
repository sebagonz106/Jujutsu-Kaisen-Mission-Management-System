import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

export const RoleGuard: React.FC<{ roles: Array<'sorcerer' | 'support' | 'observer'>; children: React.ReactNode }> = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <>{children}</>;
};
