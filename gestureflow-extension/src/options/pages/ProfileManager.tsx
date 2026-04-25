import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@shared/store/settings-store';
import { PRESET_PROFILES, PROFILE_MAPPINGS } from '@shared/constants/profiles';
import { WEBSITE_PACKS } from '@shared/constants/websites';
import { ProfileType } from '@shared/types/profile';
import type { Profile } from '@shared/types/profile';

const PROFILE_ICONS: Record<string, string> = {
  home: '🏠',
  presentation: '📽️',
  gaming: '🎮',
  accessibility: '♿',
  media: '🎬',
  custom: '⚡',
};

export function ProfileManager() {
  const settingsStore = useSettingsStore();
  const [profiles, setProfiles] = useState<Profile[]>(PRESET_PROFILES);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('⚡');
  const [newUrls, setNewUrls] = useState('');

  const activeProfileId = settingsStore.settings.selectedProfileId;

  const switchProfile = async (profileId: string) => {
    await settingsStore.setProfile(profileId);
  };

  const createProfile = () => {
    if (!newName.trim()) return;
    const profile: Profile = {
      id: `profile-custom-${Date.now()}`,
      name: newName.trim(),
      icon: newIcon,
      type: ProfileType.CUSTOM,
      isActive: false,
      gestures: [],
      autoSwitchUrls: newUrls.split(',').map((u) => u.trim()).filter(Boolean),
    };
    setProfiles([...profiles, profile]);
    setNewName('');
    setNewUrls('');
    setShowCreate(false);
  };

  const deleteProfile = (id: string) => {
    if (id === activeProfileId) return;
    setProfiles(profiles.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-light-bg">Gesture Profiles</h2>
          <p className="text-sm text-text-muted mt-1">
            Switch between gesture configurations for different use cases
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-dark transition-colors"
        >
          + New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          const mappings = PROFILE_MAPPINGS[profile.id] ?? [];
          const enabledCount = mappings.filter((m) => m.isEnabled).length;

          return (
            <motion.div
              key={profile.id}
              layout
              className={`p-4 rounded-card border transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                  : 'bg-dark-surface border-dark-border hover:border-primary/20'
              }`}
              onClick={() => switchProfile(profile.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-bg text-xl">
                    {profile.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-light-bg">{profile.name}</span>
                      {isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                          Active
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-bg text-text-muted font-medium capitalize">
                        {profile.type}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {enabledCount} gestures enabled
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  )}
                  {profile.type === ProfileType.CUSTOM && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                      className="p-1.5 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {profile.autoSwitchUrls && profile.autoSwitchUrls.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-text-muted">Auto-switch:</span>
                  {profile.autoSwitchUrls.map((url) => (
                    <span key={url} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-bg text-text-secondary">
                      {url}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Website Gesture Packs</h3>
        <p className="text-xs text-text-muted mb-3">
          Pre-configured gesture sets that activate automatically on specific websites
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(WEBSITE_PACKS).map(([key, pack]) => (
            <div key={key} className="p-3 bg-dark-bg rounded-card border border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{pack.icon}</span>
                <span className="text-xs font-semibold text-light-bg">{pack.name}</span>
              </div>
              <span className="text-[10px] text-text-muted">{pack.gestures.length} gestures</span>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-surface border border-dark-border rounded-modal p-6 w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-light-bg mb-4">Create Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Profile Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
                  placeholder="My Custom Profile"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(PROFILE_ICONS).map(([key, icon]) => (
                    <button
                      key={key}
                      onClick={() => setNewIcon(icon)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-colors ${
                        newIcon === icon ? 'bg-primary/20 border border-primary' : 'bg-dark-bg border border-dark-border hover:border-primary/40'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Auto-switch URLs (comma separated)</label>
                <input
                  type="text"
                  value={newUrls}
                  onChange={(e) => setNewUrls(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
                  placeholder="youtube.com, netflix.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-light-bg rounded-button hover:bg-dark-border/50 transition-colors">Cancel</button>
              <button onClick={createProfile} disabled={!newName.trim()} className="px-4 py-2 text-sm bg-primary text-white rounded-button hover:bg-primary-dark transition-colors disabled:opacity-40">Create</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
