import { db } from './firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

export interface ScenarioProgress {
  scenarioId: string;
  scenarioTitle: string;
  bestScore: number;
  lastScore: number;
  completedAt: string;
  attemptsCount: number;
}

const LOCAL_STORAGE_KEY = 'chinese_talk_user_progress';

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

    // Merge: prefer higher bestScore / latest completedAt between local and cloud
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

    // Save merged result back to LocalStorage
    saveLocalProgress(mergedMap);
    return mergedMap;
  } catch (err) {
    console.error('Error fetching progress from Firestore:', err);
    return localMap;
  }
};

/**
 * Sync offline LocalStorage progress to Firestore after Google login
 */
export const syncLocalToFirestore = async (userId: string) => {
  const localMap = getLocalProgress();
  const keys = Object.keys(localMap);
  if (keys.length === 0) return;

  try {
    const batchPromises = keys.map((scenarioId) => {
      const docRef = doc(db, 'users', userId, 'scenarios', scenarioId);
      return setDoc(docRef, localMap[scenarioId], { merge: true });
    });

    await Promise.all(batchPromises);
  } catch (err) {
    console.error('Error syncing local progress to Firestore on login:', err);
  }
};
