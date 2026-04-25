import type { Settings } from '../shared/types/settings';
import type { Gesture, GestureRecording } from '../shared/types/gesture';
import type { Profile } from '../shared/types/profile';
import type { AnalyticsData } from '../shared/types/analytics';
import { PRESET_GESTURES } from '../shared/constants/gestures';
import { PRESET_PROFILES } from '../shared/constants/profiles';
import { DEFAULT_SETTINGS, DEFAULT_ANALYTICS, STORAGE_KEYS } from '../shared/constants/defaults';

const IDB_NAME = 'gestureflow_recordings';
const IDB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        db.createObjectStore(RECORDINGS_STORE, { keyPath: 'gestureId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDefaults(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.INITIALIZED);
  if (result[STORAGE_KEYS.INITIALIZED]) return;

  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
    [STORAGE_KEYS.GESTURES]: PRESET_GESTURES,
    [STORAGE_KEYS.PROFILES]: PRESET_PROFILES,
    [STORAGE_KEYS.ANALYTICS]: DEFAULT_ANALYTICS,
    [STORAGE_KEYS.INITIALIZED]: true,
  });
}

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS];
  if (!stored) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getGestures(): Promise<Gesture[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GESTURES);
  const stored = result[STORAGE_KEYS.GESTURES];
  if (!stored) return [...PRESET_GESTURES];
  return stored as Gesture[];
}

export async function saveGestures(gestures: Gesture[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GESTURES]: gestures });
}

export async function getProfiles(): Promise<Profile[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILES);
  const stored = result[STORAGE_KEYS.PROFILES];
  if (!stored) return [...PRESET_PROFILES];
  return stored as Profile[];
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: profiles });
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ANALYTICS);
  const stored = result[STORAGE_KEYS.ANALYTICS];
  if (!stored) return { ...DEFAULT_ANALYTICS };
  return { ...DEFAULT_ANALYTICS, ...stored };
}

export async function saveAnalytics(analytics: AnalyticsData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ANALYTICS]: analytics });
}

export async function getCustomRecordings(): Promise<GestureRecording[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readonly');
    const store = tx.objectStore(RECORDINGS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomRecording(
  gestureId: string,
  recording: GestureRecording,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);
    const request = store.put({ gestureId, ...recording });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCustomRecording(gestureId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);
    const request = store.delete(gestureId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData(): Promise<void> {
  await chrome.storage.local.remove(Object.values(STORAGE_KEYS));

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportAllData(): Promise<string> {
  const [settings, gestures, profiles, analytics, recordings] = await Promise.all([
    getSettings(),
    getGestures(),
    getProfiles(),
    getAnalytics(),
    getCustomRecordings(),
  ]);

  return JSON.stringify({ settings, gestures, profiles, analytics, recordings }, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON format');
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid data structure: expected object');
  }

  const MAX_IMPORT_SIZE = 5 * 1024 * 1024;
  if (json.length > MAX_IMPORT_SIZE) {
    throw new Error('Import data exceeds 5MB limit');
  }

  const writes: Promise<void>[] = [];

  if (data.settings && typeof data.settings === 'object') {
    writes.push(saveSettings(data.settings as Settings));
  }
  if (Array.isArray(data.gestures)) {
    writes.push(saveGestures(data.gestures as Gesture[]));
  }
  if (Array.isArray(data.profiles)) {
    writes.push(saveProfiles(data.profiles as Profile[]));
  }
  if (data.analytics && typeof data.analytics === 'object') {
    writes.push(saveAnalytics(data.analytics as AnalyticsData));
  }

  await Promise.all(writes);

  if (Array.isArray(data.recordings)) {
    for (const rec of data.recordings as Array<{ gestureId: string } & GestureRecording>) {
      if (typeof rec.gestureId !== 'string' || rec.gestureId.length > 100) continue;
      const { gestureId, ...recording } = rec;
      await saveCustomRecording(gestureId, recording as GestureRecording);
    }
  }
}
