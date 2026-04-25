import type { Profile, GestureMapping } from '../shared/types/profile';
import { ProfileType } from '../shared/types/profile';
import type { GestureAction } from '../shared/types/gesture';
import { ActionType } from '../shared/types/gesture';
import { PROFILE_MAPPINGS } from '../shared/constants/profiles';
import { PRESET_PROFILES } from '../shared/constants/profiles';
import { CHROME_ACTIONS } from '../shared/constants/actions';
import {
  getProfiles,
  saveProfiles,
  getSettings,
  saveSettings,
} from './storage-manager';

export async function getActiveProfile(): Promise<Profile> {
  const [profiles, settings] = await Promise.all([getProfiles(), getSettings()]);
  const active = profiles.find((p) => p.id === settings.selectedProfileId);
  return active ?? profiles.find((p) => p.type === ProfileType.HOME) ?? profiles[0];
}

export async function switchProfile(profileId: string): Promise<void> {
  const profiles = await getProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) throw new Error(`Profile not found: ${profileId}`);

  const updated = profiles.map((p) => ({
    ...p,
    isActive: p.id === profileId,
  }));

  await saveProfiles(updated);
  await saveSettings({ ...(await getSettings()), selectedProfileId: profileId });
}

export async function createProfile(profile: Profile): Promise<void> {
  const profiles = await getProfiles();
  if (profiles.some((p) => p.id === profile.id)) {
    throw new Error(`Profile already exists: ${profile.id}`);
  }
  await saveProfiles([...profiles, { ...profile, type: ProfileType.CUSTOM }]);
}

export async function updateProfile(
  profileId: string,
  updates: Partial<Profile>,
): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) throw new Error(`Profile not found: ${profileId}`);

  profiles[idx] = { ...profiles[idx], ...updates, id: profileId };
  await saveProfiles(profiles);
}

export async function deleteProfile(profileId: string): Promise<void> {
  const profiles = await getProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) throw new Error(`Profile not found: ${profileId}`);

  if (target.type !== ProfileType.CUSTOM) {
    throw new Error('Cannot delete preset profiles');
  }

  const settings = await getSettings();
  if (settings.selectedProfileId === profileId) {
    settings.selectedProfileId = 'profile-home';
    await saveSettings(settings);
  }

  await saveProfiles(profiles.filter((p) => p.id !== profileId));
}

export async function autoSwitchProfile(url: string): Promise<Profile | null> {
  const profiles = await getProfiles();

  for (const profile of profiles) {
    const urls = profile.autoSwitchUrls ?? [];
    if (urls.some((pattern) => url.includes(pattern))) {
      await switchProfile(profile.id);
      return profile;
    }
  }

  return null;
}

export async function getGestureMappings(profileId: string): Promise<GestureMapping[]> {
  const mappings = PROFILE_MAPPINGS[profileId];
  if (mappings) return [...mappings];

  const profiles = await getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  return profile?.gestures?.length ? [] : [];
}

export async function resolveGestureAction(
  gestureId: string,
  zone?: string,
): Promise<GestureAction | null> {
  const activeProfile = await getActiveProfile();
  const mappings = await getGestureMappings(activeProfile.id);

  const mapping = mappings.find(
    (m) =>
      m.gestureId === gestureId &&
      m.isEnabled &&
      (m.zone === undefined || m.zone === zone),
  );

  if (!mapping) return null;

  if (CHROME_ACTIONS[mapping.actionId]) {
    return { type: ActionType.CHROME, value: mapping.actionId };
  }

  if (mapping.actionId.startsWith('http://') || mapping.actionId.startsWith('https://')) {
    return { type: ActionType.URL, value: mapping.actionId };
  }

  if (mapping.actionId.includes('+')) {
    return { type: ActionType.SHORTCUT, value: mapping.actionId };
  }

  return { type: ActionType.SCRIPT, value: mapping.actionId };
}

export async function getAllProfiles(): Promise<Profile[]> {
  return getProfiles();
}

export function isPresetProfile(profile: Profile): boolean {
  return profile.type !== ProfileType.CUSTOM;
}

export function getPresetProfileIds(): string[] {
  return PRESET_PROFILES.map((p) => p.id);
}
