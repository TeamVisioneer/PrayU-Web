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
  const user = useBaseStore((state) => state.user);
  const getUser = useBaseStore((state) => state.getUser);
  const userLoading = useBaseStore((state) => state.userLoading);
  const signOut = useBaseStore((state) => state.signOut);
  const setUserPlan = useBaseStore((state) => state.setUserPlan);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (user) setUserPlan(user.id);
  }, [user, setUserPlan]);

  return (
    <AuthContext.Provider value={{ user, userLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
