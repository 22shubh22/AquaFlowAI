
import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "admin" | "citizen" | null;

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  role: UserRole;
  user: User | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (username: string, password: string, expectedRole?: "admin" | "citizen") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    const savedUser = localStorage.getItem("user");
    if (savedRole) {
      setRole(savedRole);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
      console.log("Login response:", response); // Debug log
      const userData = {
        id: response.id,
        username: response.username,
        role: response.role
      };
      console.log("Setting user data:", userData); // Debug log
      setRole(response.role);
      setUser(userData);
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ role, user, login, loginWithCredentials, logout, isAuthenticated: role !== null }}>
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
