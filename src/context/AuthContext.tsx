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
  fetchUserFavorites,
  toggleFavoriteScenario,
  syncLocalToFirestore,
} from '@/lib/userProgress';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProgress: Record<string, ScenarioProgress>;
  userFavorites: Record<string, boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  toggleFavorite: (scenarioId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProgress: {},
  userFavorites: {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProgress: async () => {},
  toggleFavorite: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, ScenarioProgress>>({});
  const [userFavorites, setUserFavorites] = useState<Record<string, boolean>>({});

  const reloadData = async (u: User | null) => {
    const [progress, favorites] = await Promise.all([
      fetchUserProgress(u?.uid),
      fetchUserFavorites(u?.uid),
    ]);
    setUserProgress(progress);
    setUserFavorites(favorites);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync local progress & favorites to Firestore on login
        await syncLocalToFirestore(currentUser.uid);
      }
      await reloadData(currentUser);
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
      await reloadData(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = async () => {
    await reloadData(user);
  };

  const toggleFavorite = async (scenarioId: string) => {
    const updatedFavs = await toggleFavoriteScenario(user?.uid, scenarioId);
    setUserFavorites({ ...updatedFavs });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProgress,
        userFavorites,
        loginWithGoogle,
        logout,
        refreshProgress,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
