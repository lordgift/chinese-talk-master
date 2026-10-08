import { db } from './firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

export interface ScenarioProgress {
  scenarioId: string;
  scenarioTitle: string;
  bestScore: number;
  lastScore: number;
  completedAt: string;
  attemptsCount: number;
}

const LOCAL_STORAGE_KEY = 'chinese_talk_user_progress';
const LOCAL_FAVORITES_KEY = 'chinese_talk_user_favorites';
const LOCAL_SAVED_WORDS_KEY = 'chinese_talk_saved_words';
// uid of the account the local data belongs to; absent = guest data not yet uploaded
const LOCAL_OWNER_KEY = 'chinese_talk_local_owner';

const getLocalOwner = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LOCAL_OWNER_KEY);
  } catch {
    return null;
  }
};

const setLocalOwner = (userId: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_OWNER_KEY, userId);
  } catch (err) {
    console.error('Error saving local owner:', err);
  }
};

const clearLocalUserData = () => {
  if (typeof window === 'undefined') return;
  try {
    [LOCAL_STORAGE_KEY, LOCAL_FAVORITES_KEY, LOCAL_SAVED_WORDS_KEY, LOCAL_OWNER_KEY].forEach((key) =>
      localStorage.removeItem(key)
    );
  } catch (err) {
    console.error('Error clearing local user data:', err);
  }
};

/**
 * Clear locally cached data that belongs to a signed-in account (on logout / session end),
 * so it isn't shown to — or synced into — whoever uses this browser next. Guest data is kept.
 */
export const releaseLocalUserData = () => {
  if (getLocalOwner()) {
    clearLocalUserData();
  }
};

/**
 * Merge two progress records for the same scenario without ever lowering the best score
 */
const mergeProgressItem = (a: ScenarioProgress, b: ScenarioProgress): ScenarioProgress => {
  const newer = new Date(a.completedAt) >= new Date(b.completedAt) ? a : b;
  return {
    scenarioId: a.scenarioId || b.scenarioId,
    scenarioTitle: newer.scenarioTitle || a.scenarioTitle || b.scenarioTitle,
    bestScore: Math.max(a.bestScore || 0, b.bestScore || 0),
    lastScore: newer.lastScore ?? 0,
    completedAt: newer.completedAt,
    attemptsCount: Math.max(a.attemptsCount || 0, b.attemptsCount || 0),
  };
};

const isSameProgress = (a: ScenarioProgress, b: ScenarioProgress): boolean =>
  a.bestScore === b.bestScore &&
  a.lastScore === b.lastScore &&
  a.completedAt === b.completedAt &&
  a.attemptsCount === b.attemptsCount &&
  a.scenarioTitle === b.scenarioTitle;

/**
 * Get all progress saved in LocalStorage
 */
export const getLocalProgress = (): Record<string, ScenarioProgress> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading local progress:', err);
    return {};
  }
};

/**
 * Save progress to LocalStorage
 */
export const saveLocalProgress = (progressMap: Record<string, ScenarioProgress>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progressMap));
  } catch (err) {
    console.error('Error saving local progress:', err);
  }
};

/**
 * Get all favorites saved in LocalStorage
 */
export const getLocalFavorites = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading local favorites:', err);
    return {};
  }
};

/**
 * Save favorites to LocalStorage
 */
export const saveLocalFavorites = (favoritesMap: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favoritesMap));
  } catch (err) {
    console.error('Error saving local favorites:', err);
  }
};

/**
 * Toggle favorite status for a scenario
 */
export const toggleFavoriteScenario = async (
  userId: string | null | undefined,
  scenarioId: string
): Promise<Record<string, boolean>> => {
  const localFavs = getLocalFavorites();
  const currentFavState = !!localFavs[scenarioId];
  const newFavState = !currentFavState;

  if (newFavState) {
    localFavs[scenarioId] = true;
  } else {
    delete localFavs[scenarioId];
  }

  saveLocalFavorites(localFavs);

  if (userId) {
    try {
      const favDocRef = doc(db, 'users', userId, 'favorites', scenarioId);
      if (newFavState) {
        await setDoc(favDocRef, { scenarioId, favoritedAt: new Date().toISOString() });
      } else {
        await deleteDoc(favDocRef);
      }
    } catch (err) {
      console.error('Failed to sync favorite to Firestore:', err);
    }
  }

  return localFavs;
};

/**
 * Fetch all user favorites (merges Firestore and LocalStorage)
 */
export const fetchUserFavorites = async (
  userId: string | null | undefined
): Promise<Record<string, boolean>> => {
  const localFavs = getLocalFavorites();
  if (!userId) {
    return localFavs;
  }

  try {
    const favsColRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favsColRef);
    const firestoreFavs: Record<string, boolean> = {};

    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        firestoreFavs[docSnap.id] = true;
      }
    });

    // Cloud is the source of truth once guest favorites have been uploaded at login,
    // so removals made on another device aren't resurrected from this device's cache
    const mergedFavs =
      getLocalOwner() === userId ? firestoreFavs : { ...localFavs, ...firestoreFavs };
    saveLocalFavorites(mergedFavs);
    return mergedFavs;
  } catch (err) {
    console.error('Error fetching favorites from Firestore:', err);
    return localFavs;
  }
};

/**
 * Save progress for a scenario (both LocalStorage and Firestore if logged in)
 */
export const saveScenarioProgress = async (
  userId: string | null | undefined,
  scenarioId: string,
  score: number,
  scenarioTitle: string
): Promise<ScenarioProgress> => {
  const localMap = getLocalProgress();
  const existing = localMap[scenarioId];

  const updatedProgress: ScenarioProgress = {
    scenarioId,
    scenarioTitle,
    bestScore: Math.max(existing?.bestScore || 0, score),
    lastScore: score,
    completedAt: new Date().toISOString(),
    attemptsCount: (existing?.attemptsCount || 0) + 1,
  };

  // 1. Update LocalStorage
  localMap[scenarioId] = updatedProgress;
  saveLocalProgress(localMap);

  // 2. Update Firestore if user is authenticated
  if (userId) {
    try {
      const scenarioDocRef = doc(db, 'users', userId, 'scenarios', scenarioId);
      await setDoc(scenarioDocRef, updatedProgress, { merge: true });
    } catch (err) {
      console.error('Failed to sync progress to Firestore:', err);
    }
  }

  return updatedProgress;
};

/**
 * Fetch all user progress (merges Firestore and LocalStorage)
 */
export const fetchUserProgress = async (
  userId: string | null | undefined
): Promise<Record<string, ScenarioProgress>> => {
  const localMap = getLocalProgress();
  if (!userId) {
    return localMap;
  }

  try {
    const scenariosColRef = collection(db, 'users', userId, 'scenarios');
    const snapshot = await getDocs(scenariosColRef);
    const firestoreMap: Record<string, ScenarioProgress> = {};

    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ScenarioProgress;
        firestoreMap[data.scenarioId] = data;
      }
    });

    const mergedMap: Record<string, ScenarioProgress> = { ...localMap };

    Object.keys(firestoreMap).forEach((id) => {
      const cloudItem = firestoreMap[id];
      const localItem = mergedMap[id];
      mergedMap[id] = localItem ? mergeProgressItem(cloudItem, localItem) : cloudItem;
    });

    saveLocalProgress(mergedMap);
    return mergedMap;
  } catch (err) {
    console.error('Error fetching progress from Firestore:', err);
    return localMap;
  }
};

export interface SavedWord {
  id: string; // Hanzi-based unique ID, e.g. "w_你好"
  hanzi: string;
  pinyin: string;
  thai: string;
  tones?: number[];
  scenarioId?: string;
  scenarioTitle?: string;
  savedAt: string;
}

/**
 * Generate standard unique ID for saved words
 */
export const getSavedWordId = (hanzi: string): string => {
  return `w_${encodeURIComponent(hanzi.trim())}`;
};

/**
 * Get all saved words in LocalStorage
 */
export const getLocalSavedWords = (): Record<string, SavedWord> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_WORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading local saved words:', err);
    return {};
  }
};

/**
 * Save all saved words to LocalStorage
 */
export const saveLocalSavedWords = (wordsMap: Record<string, SavedWord>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SAVED_WORDS_KEY, JSON.stringify(wordsMap));
  } catch (err) {
    console.error('Error saving local saved words:', err);
  }
};

/**
 * Fetch all saved words (merges Firestore and LocalStorage)
 */
export const fetchUserSavedWords = async (
  userId: string | null | undefined
): Promise<Record<string, SavedWord>> => {
  const localWords = getLocalSavedWords();
  if (!userId) {
    return localWords;
  }

  try {
    const wordsColRef = collection(db, 'users', userId, 'saved_words');
    const snapshot = await getDocs(wordsColRef);
    const firestoreWords: Record<string, SavedWord> = {};

    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SavedWord;
        firestoreWords[data.id || docSnap.id] = data;
      }
    });

    // Cloud is the source of truth once guest data has been uploaded (see fetchUserFavorites)
    const mergedWords =
      getLocalOwner() === userId ? firestoreWords : { ...localWords, ...firestoreWords };
    saveLocalSavedWords(mergedWords);
    return mergedWords;
  } catch (err) {
    console.error('Error fetching saved words from Firestore:', err);
    return localWords;
  }
};

/**
 * Toggle save status for a vocabulary word (bookmark/un-bookmark)
 */
export const toggleSaveUserWord = async (
  userId: string | null | undefined,
  word: {
    hanzi: string;
    pinyin: string;
    thai: string;
    tones?: number[];
    scenarioId?: string;
    scenarioTitle?: string;
  }
): Promise<{ savedWords: Record<string, SavedWord>; isSaved: boolean }> => {
  const wordId = getSavedWordId(word.hanzi);
  const localWords = getLocalSavedWords();
  const alreadySaved = !!localWords[wordId];

  if (alreadySaved) {
    delete localWords[wordId];
  } else {
    localWords[wordId] = {
      id: wordId,
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      thai: word.thai,
      tones: word.tones,
      scenarioId: word.scenarioId,
      scenarioTitle: word.scenarioTitle,
      savedAt: new Date().toISOString(),
    };
  }

  saveLocalSavedWords(localWords);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'saved_words', wordId);
      if (alreadySaved) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, localWords[wordId], { merge: true });
      }
    } catch (err) {
      console.error('Failed to sync saved word to Firestore:', err);
    }
  }

  return { savedWords: localWords, isSaved: !alreadySaved };
};

/**
 * Upload guest (signed-out) LocalStorage data — progress, favorites & saved words — to Firestore
 * after Google login. Runs once per account: afterwards local data is only a cache of the cloud.
 */
export const syncLocalToFirestore = async (userId: string) => {
  const owner = getLocalOwner();
  if (owner === userId) {
    return; // Local data is already this account's cache
  }
  if (owner) {
    // Local data belongs to a different account — never sync it into this one
    clearLocalUserData();
    setLocalOwner(userId);
    return;
  }

  const localMap = getLocalProgress();
  const localFavs = getLocalFavorites();
  const localSavedWords = getLocalSavedWords();

  try {
    const [progressSnap, favsSnap, wordsSnap] = await Promise.all([
      getDocs(collection(db, 'users', userId, 'scenarios')),
      getDocs(collection(db, 'users', userId, 'favorites')),
      getDocs(collection(db, 'users', userId, 'saved_words')),
    ]);

    const cloudProgress: Record<string, ScenarioProgress> = {};
    progressSnap.forEach((docSnap) => {
      cloudProgress[docSnap.id] = docSnap.data() as ScenarioProgress;
    });
    const cloudFavIds = new Set(favsSnap.docs.map((d) => d.id));
    const cloudWordIds = new Set(wordsSnap.docs.map((d) => d.id));

    const promises: Promise<void>[] = [];

    Object.keys(localMap).forEach((scenarioId) => {
      const cloudItem = cloudProgress[scenarioId];
      const merged = cloudItem ? mergeProgressItem(cloudItem, localMap[scenarioId]) : localMap[scenarioId];
      if (!cloudItem || !isSameProgress(cloudItem, merged)) {
        promises.push(setDoc(doc(db, 'users', userId, 'scenarios', scenarioId), merged));
      }
    });

    Object.keys(localFavs).forEach((scenarioId) => {
      if (localFavs[scenarioId] && !cloudFavIds.has(scenarioId)) {
        const favDocRef = doc(db, 'users', userId, 'favorites', scenarioId);
        promises.push(setDoc(favDocRef, { scenarioId, favoritedAt: new Date().toISOString() }));
      }
    });

    Object.keys(localSavedWords).forEach((wordId) => {
      if (!cloudWordIds.has(wordId)) {
        const wordDocRef = doc(db, 'users', userId, 'saved_words', wordId);
        promises.push(setDoc(wordDocRef, localSavedWords[wordId]));
      }
    });

    await Promise.all(promises);
    setLocalOwner(userId);
  } catch (err) {
    // Owner stays unset so the guest data upload is retried on next login
    console.error('Error syncing local data to Firestore on login:', err);
  }
};
