import { useContext } from "react";
import { AuthContext } from "../components/auth/AuthProvider";
import { AuthContextType } from "../components/auth/AuthProvider";

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
