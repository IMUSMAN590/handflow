import { useEffect } from 'react';
import { useSettingsStore } from '../store/settings-store';

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    store.loadSettings();
  }, []);

  return {
    settings: store.settings,
    isLoading: store.isLoading,
    updateSetting: store.updateSetting,
    toggleEnabled: store.toggleEnabled,
    setProfile: store.setProfile,
    resetSettings: store.resetSettings,
  };
}
