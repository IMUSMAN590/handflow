import { create } from 'zustand';
import type { Settings } from '../types/settings';
import { getSettings, saveSettings } from '../utils/storage';
import { DEFAULT_SETTINGS } from '../constants/defaults';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  toggleEnabled: () => Promise<void>;
  setProfile: (profileId: string) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await getSettings();
    set({ settings, isLoading: false });
  },

  updateSetting: async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const settings = { ...get().settings, [key]: value };
    set({ settings });
    await saveSettings(settings);
  },

  toggleEnabled: async () => {
    const settings = { ...get().settings, isEnabled: !get().settings.isEnabled };
    set({ settings });
    await saveSettings(settings);
  },

  setProfile: async (profileId: string) => {
    const settings = { ...get().settings, selectedProfileId: profileId };
    set({ settings });
    await saveSettings(settings);
  },

  resetSettings: async () => {
    const settings = { ...DEFAULT_SETTINGS };
    set({ settings });
    await saveSettings(settings);
  },
}));
