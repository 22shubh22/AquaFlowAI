
import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "admin" | "citizen" | null;

interface AuthContextType {
  role: UserRole;
  login: (role: UserRole) => void;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    }
  };

  const loginWithCredentials = async (username: string, password: string, expectedRole?: "admin" | "citizen") => {
    const { api } = await import("@/lib/api");
    try {
      const response = await api.login(username, password, expectedRole);
      setRole(response.role);
      localStorage.setItem("userRole", response.role);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("userRole");
  };

  return (
    <AuthContext.Provider value={{ role, login, loginWithCredentials, logout, isAuthenticated: role !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
