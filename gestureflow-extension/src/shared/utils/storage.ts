import type { Settings } from '../types/settings';
import type { Gesture } from '../types/gesture';
import type { Profile } from '../types/profile';
import type { AnalyticsData } from '../types/analytics';
import { PRESET_GESTURES } from '../constants/gestures';
import { PRESET_PROFILES } from '../constants/profiles';
import { DEFAULT_SETTINGS, DEFAULT_ANALYTICS, STORAGE_KEYS } from '../constants/defaults';

function getStorage(): chrome.storage.StorageArea {
  return chrome.storage.local;
}

export async function getSettings(): Promise<Settings> {
  const result = await getStorage().get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS];
  if (!stored) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await getStorage().set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getGestures(): Promise<Gesture[]> {
  const result = await getStorage().get(STORAGE_KEYS.GESTURES);
  const stored = result[STORAGE_KEYS.GESTURES];
  if (!stored) return [...PRESET_GESTURES];
  return stored as Gesture[];
}

export async function saveGestures(gestures: Gesture[]): Promise<void> {
  await getStorage().set({ [STORAGE_KEYS.GESTURES]: gestures });
}

export async function getProfiles(): Promise<Profile[]> {
  const result = await getStorage().get(STORAGE_KEYS.PROFILES);
  const stored = result[STORAGE_KEYS.PROFILES];
  if (!stored) return [...PRESET_PROFILES];
  return stored as Profile[];
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await getStorage().set({ [STORAGE_KEYS.PROFILES]: profiles });
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const result = await getStorage().get(STORAGE_KEYS.ANALYTICS);
  const stored = result[STORAGE_KEYS.ANALYTICS];
  if (!stored) return { ...DEFAULT_ANALYTICS };
  return { ...DEFAULT_ANALYTICS, ...stored };
}

export async function saveAnalytics(analytics: AnalyticsData): Promise<void> {
  await getStorage().set({ [STORAGE_KEYS.ANALYTICS]: analytics });
}

export async function clearAllData(): Promise<void> {
  await getStorage().remove(Object.values(STORAGE_KEYS));
}
