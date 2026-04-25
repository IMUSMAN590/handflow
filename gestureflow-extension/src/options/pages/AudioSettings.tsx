import { useSettingsStore } from '@shared/store/settings-store';

export function AudioSettings() {
  const settingsStore = useSettingsStore();
  const settings = settingsStore.settings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-light-bg">Audio & Feedback</h2>
        <p className="text-sm text-text-muted mt-1">
          Configure sound, speech, and haptic feedback for gesture recognition
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-dark-surface border border-dark-border rounded-card space-y-4">
          <h3 className="text-sm font-semibold text-light-bg">Sound Effects</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-light-bg">Play Sound on Gesture</span>
              <p className="text-xs text-text-muted">Audio feedback when a gesture is recognized</p>
            </div>
            <button
              onClick={() => settingsStore.updateSetting('playSound', !settings.playSound)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.playSound ? 'bg-primary' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.playSound ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-secondary">Sound Volume</span>
              <span className="text-xs text-text-muted">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => settingsStore.updateSetting('soundVolume', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="p-4 bg-dark-surface border border-dark-border rounded-card space-y-4">
          <h3 className="text-sm font-semibold text-light-bg">Speech Feedback</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-light-bg">Speech Announcements</span>
              <p className="text-xs text-text-muted">Announce gesture actions via speech synthesis</p>
            </div>
            <button
              onClick={() => settingsStore.updateSetting('speechFeedback', !settings.speechFeedback)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.speechFeedback ? 'bg-primary' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.speechFeedback ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-secondary">Speech Volume</span>
              <span className="text-xs text-text-muted">{Math.round(settings.speechVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.speechVolume}
              onChange={(e) => settingsStore.updateSetting('speechVolume', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="p-4 bg-dark-surface border border-dark-border rounded-card space-y-4">
          <h3 className="text-sm font-semibold text-light-bg">Haptic Feedback</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-light-bg">Vibration</span>
              <p className="text-xs text-text-muted">Haptic feedback on supported devices</p>
            </div>
            <button
              onClick={() => settingsStore.updateSetting('hapticEnabled', !settings.hapticEnabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.hapticEnabled ? 'bg-primary' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.hapticEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-secondary">Haptic Intensity</span>
              <span className="text-xs text-text-muted">{Math.round(settings.hapticIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={settings.hapticIntensity}
              onChange={(e) => settingsStore.updateSetting('hapticIntensity', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="p-4 bg-dark-surface border border-dark-border rounded-card space-y-4">
          <h3 className="text-sm font-semibold text-light-bg">Visual Feedback</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-light-bg">Show Hand Overlay</span>
              <p className="text-xs text-text-muted">Display hand skeleton on camera preview</p>
            </div>
            <button
              onClick={() => settingsStore.updateSetting('showOverlay', !settings.showOverlay)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.showOverlay ? 'bg-primary' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.showOverlay ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-light-bg">Show Gesture Name</span>
              <p className="text-xs text-text-muted">Display gesture name popup when recognized</p>
            </div>
            <button
              onClick={() => settingsStore.updateSetting('showGestureName', !settings.showGestureName)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.showGestureName ? 'bg-primary' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.showGestureName ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
