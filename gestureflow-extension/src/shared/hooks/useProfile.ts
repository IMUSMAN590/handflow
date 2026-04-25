import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settings-store';
import { useGestureStore } from '../store/gesture-store';
import { PRESET_PROFILES } from '../constants/profiles';
import { PROFILE_MAPPINGS } from '../constants/profiles';
import type { Profile, GestureMapping } from '../types/profile';

export function useProfile() {
  const settingsStore = useSettingsStore();
  const gestureStore = useGestureStore();

  useEffect(() => {
    gestureStore.loadGestures();
  }, []);

  const activeProfileId = settingsStore.settings.selectedProfileId;

  const getActiveProfile = useCallback((): Profile | undefined => {
    return PRESET_PROFILES.find((p) => p.id === activeProfileId);
  }, [activeProfileId]);

  const getActiveMappings = useCallback((): GestureMapping[] => {
    return PROFILE_MAPPINGS[activeProfileId] ?? [];
  }, [activeProfileId]);

  const switchProfile = useCallback(
    async (profileId: string) => {
      await settingsStore.setProfile(profileId);
    },
    [settingsStore],
  );

  return {
    activeProfileId,
    activeProfile: getActiveProfile(),
    activeMappings: getActiveMappings(),
    profiles: PRESET_PROFILES,
    switchProfile,
  };
}
