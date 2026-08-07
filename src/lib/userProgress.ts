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

    const mergedFavs: Record<string, boolean> = { ...localFavs, ...firestoreFavs };
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

      if (!localItem) {
        mergedMap[id] = cloudItem;
      } else {
        mergedMap[id] = {
          scenarioId: id,
          scenarioTitle: cloudItem.scenarioTitle || localItem.scenarioTitle,
          bestScore: Math.max(cloudItem.bestScore || 0, localItem.bestScore || 0),
          lastScore: cloudItem.lastScore || localItem.lastScore,
          completedAt:
            new Date(cloudItem.completedAt) > new Date(localItem.completedAt)
              ? cloudItem.completedAt
              : localItem.completedAt,
          attemptsCount: Math.max(cloudItem.attemptsCount || 0, localItem.attemptsCount || 0),
        };
      }
    });

    saveLocalProgress(mergedMap);
    return mergedMap;
  } catch (err) {
    console.error('Error fetching progress from Firestore:', err);
    return localMap;
  }
};

/**
 * Sync offline LocalStorage data (progress & favorites) to Firestore after Google login
 */
export const syncLocalToFirestore = async (userId: string) => {
  const localMap = getLocalProgress();
  const progressKeys = Object.keys(localMap);

  const localFavs = getLocalFavorites();
  const favoriteKeys = Object.keys(localFavs);

  try {
    const promises: Promise<void>[] = [];

    progressKeys.forEach((scenarioId) => {
      const docRef = doc(db, 'users', userId, 'scenarios', scenarioId);
      promises.push(setDoc(docRef, localMap[scenarioId], { merge: true }));
    });

    favoriteKeys.forEach((scenarioId) => {
      if (localFavs[scenarioId]) {
        const favDocRef = doc(db, 'users', userId, 'favorites', scenarioId);
        promises.push(setDoc(favDocRef, { scenarioId, favoritedAt: new Date().toISOString() }));
      }
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('Error syncing local data to Firestore on login:', err);
  }
};
