'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '@/lib/firebase';
import {
  ScenarioProgress,
  fetchUserProgress,
  syncLocalToFirestore,
} from '@/lib/userProgress';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProgress: Record<string, ScenarioProgress>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProgress: {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProgress: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, ScenarioProgress>>({});

  const reloadProgress = async (u: User | null) => {
    const progress = await fetchUserProgress(u?.uid);
    setUserProgress(progress);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync any local progress made before logging in
        await syncLocalToFirestore(currentUser.uid);
      }
      await reloadProgress(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-in error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      await reloadProgress(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = async () => {
    await reloadProgress(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProgress,
        loginWithGoogle,
        logout,
        refreshProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
