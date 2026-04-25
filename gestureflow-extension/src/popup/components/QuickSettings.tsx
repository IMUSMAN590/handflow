import { useSettingsStore } from '@shared/store/settings-store';
import { PRESET_PROFILES } from '@shared/constants/profiles';

export function QuickSettings() {
  const settingsStore = useSettingsStore();
  const settings = settingsStore.settings;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Sensitivity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) => settingsStore.updateSetting('confidenceThreshold', parseFloat(e.target.value))}
            className="w-20 accent-primary"
          />
          <span className="text-[10px] text-text-muted w-8">{Math.round(settings.confidenceThreshold * 100)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Profile</span>
        <select
          value={settings.selectedProfileId}
          onChange={(e) => settingsStore.setProfile(e.target.value)}
          className="px-2 py-1 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
        >
          {PRESET_PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Sound</span>
        <button
          onClick={() => settingsStore.updateSetting('playSound', !settings.playSound)}
          className={`px-2 py-0.5 text-[10px] font-medium rounded-button transition-colors ${
            settings.playSound ? 'bg-primary/10 text-primary' : 'bg-dark-bg text-text-muted'
          }`}
        >
          {settings.playSound ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Low Power</span>
        <button
          onClick={() => settingsStore.updateSetting('lowPowerMode', !settings.lowPowerMode)}
          className={`px-2 py-0.5 text-[10px] font-medium rounded-button transition-colors ${
            settings.lowPowerMode ? 'bg-warning/10 text-warning' : 'bg-dark-bg text-text-muted'
          }`}
        >
          {settings.lowPowerMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Night Mode</span>
        <button
          onClick={() => settingsStore.updateSetting('nightMode', !settings.nightMode)}
          className={`px-2 py-0.5 text-[10px] font-medium rounded-button transition-colors ${
            settings.nightMode ? 'bg-primary/10 text-primary' : 'bg-dark-bg text-text-muted'
          }`}
        >
          {settings.nightMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
