// src/components/AuthProvider.tsx
import React, { createContext, useEffect, ReactNode } from "react";
import useBaseStore from "../../stores/baseStore";
import { User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  userLoading: boolean;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, getUser, userLoading, signOut } = useBaseStore();

  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <AuthContext.Provider value={{ user, userLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
