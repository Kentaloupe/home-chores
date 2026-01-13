import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import pb from '../services/pocketbase';
import type { AuthUser } from '../types';
import { isAdminEmail } from '../config/admin';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      const email = pb.authStore.model.email;
      setUser({
        id: pb.authStore.model.id,
        email,
        isAdmin: isAdminEmail(email),
      });
    }
    setIsLoading(false);

    const unsubscribe = pb.authStore.onChange(() => {
      if (pb.authStore.isValid && pb.authStore.model) {
        const email = pb.authStore.model.email;
        setUser({
          id: pb.authStore.model.id,
          email,
          isAdmin: isAdminEmail(email),
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await pb.collection('users').authWithPassword(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    setError(null);
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
      });
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
