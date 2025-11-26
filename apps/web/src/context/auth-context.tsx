"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const login = async (email: string, password: string) => {
    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (ctx) => {
        throw new Error(ctx.error.message || 'Login failed');
      },
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    await authClient.signUp.email({
      email,
      password,
      name,
    }, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (ctx) => {
        throw new Error(ctx.error.message || 'Signup failed');
      },
    });
  };

  const logout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user: session?.user as User | null, 
      loading: isPending, 
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
