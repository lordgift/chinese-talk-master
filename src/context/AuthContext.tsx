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
  SavedWord,
  fetchUserProgress,
  fetchUserFavorites,
  fetchUserSavedWords,
  toggleFavoriteScenario,
  toggleSaveUserWord,
  getSavedWordId,
  syncLocalToFirestore,
  releaseLocalUserData,
} from '@/lib/userProgress';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProgress: Record<string, ScenarioProgress>;
  userFavorites: Record<string, boolean>;
  userSavedWords: Record<string, SavedWord>;
  savedWordsCount: number;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  toggleFavorite: (scenarioId: string) => Promise<void>;
  toggleSaveWord: (word: {
    hanzi: string;
    pinyin: string;
    thai: string;
    tones?: number[];
    scenarioId?: string;
    scenarioTitle?: string;
  }) => Promise<boolean>;
  isWordSaved: (hanzi: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProgress: {},
  userFavorites: {},
  userSavedWords: {},
  savedWordsCount: 0,
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProgress: async () => {},
  toggleFavorite: async () => {},
  toggleSaveWord: async () => false,
  isWordSaved: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, ScenarioProgress>>({});
  const [userFavorites, setUserFavorites] = useState<Record<string, boolean>>({});
  const [userSavedWords, setUserSavedWords] = useState<Record<string, SavedWord>>({});

  const reloadData = async (u: User | null) => {
    const [progress, favorites, savedWords] = await Promise.all([
      fetchUserProgress(u?.uid),
      fetchUserFavorites(u?.uid),
      fetchUserSavedWords(u?.uid),
    ]);
    setUserProgress(progress);
    setUserFavorites(favorites);
    setUserSavedWords(savedWords);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync local progress, favorites & saved words to Firestore on login
        await syncLocalToFirestore(currentUser.uid);
      } else {
        // Signed out (or session ended): drop the previous account's cached data
        releaseLocalUserData();
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
      releaseLocalUserData();
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

  const toggleSaveWord = async (word: {
    hanzi: string;
    pinyin: string;
    thai: string;
    tones?: number[];
    scenarioId?: string;
    scenarioTitle?: string;
  }): Promise<boolean> => {
    const { savedWords, isSaved } = await toggleSaveUserWord(user?.uid, word);
    setUserSavedWords({ ...savedWords });
    return isSaved;
  };

  const isWordSaved = (hanzi: string): boolean => {
    const wordId = getSavedWordId(hanzi);
    return !!userSavedWords[wordId];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProgress,
        userFavorites,
        userSavedWords,
        savedWordsCount: Object.keys(userSavedWords).length,
        loginWithGoogle,
        logout,
        refreshProgress,
        toggleFavorite,
        toggleSaveWord,
        isWordSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
