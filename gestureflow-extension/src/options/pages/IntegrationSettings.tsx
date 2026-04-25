import { WEBSITE_PACKS } from '@shared/constants/websites';

export function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-light-bg">Integrations</h2>
        <p className="text-sm text-text-muted mt-1">
          Website-specific gesture packs and extension API
        </p>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Website Gesture Packs</h3>
        <p className="text-xs text-text-muted mb-4">
          Pre-configured gesture sets that activate automatically when you visit these websites
        </p>
        <div className="space-y-3">
          {Object.entries(WEBSITE_PACKS).map(([key, pack]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-dark-bg rounded-card border border-dark-border">
              <div className="flex items-center gap-3">
                <span className="text-xl">{pack.icon}</span>
                <div>
                  <span className="text-sm font-medium text-light-bg block">{pack.name}</span>
                  <span className="text-[10px] text-text-muted">{pack.urlPattern}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {pack.gestures.length} gestures
                </span>
                <button className={`w-8 h-4.5 rounded-full relative bg-primary transition-colors`}>
                  <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white translate-x-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Extension API</h3>
        <p className="text-xs text-text-muted mb-4">
          Allow other extensions to trigger and respond to gestures
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-dark-bg rounded-card border border-dark-border">
            <code className="text-xs text-primary font-mono">gestureflow.onGesture(callback)</code>
            <p className="text-[10px] text-text-muted mt-1">Listen for recognized gestures</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-card border border-dark-border">
            <code className="text-xs text-primary font-mono">gestureflow.registerGesture(name, action)</code>
            <p className="text-[10px] text-text-muted mt-1">Register a custom gesture from another extension</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-card border border-dark-border">
            <code className="text-xs text-primary font-mono">gestureflow.triggerAction(action)</code>
            <p className="text-[10px] text-text-muted mt-1">Trigger a browser action programmatically</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-card border border-dark-border">
            <code className="text-xs text-primary font-mono">gestureflow.getState()</code>
            <p className="text-[10px] text-text-muted mt-1">Get current extension state (enabled, active profile, etc.)</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Voice + Gesture Combo</h3>
        <p className="text-xs text-text-muted mb-3">
          Combine hand gestures with voice commands for enhanced control
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-dark-bg rounded-card">
            <span className="text-xs text-light-bg">Point + Say "open"</span>
            <span className="text-[10px] text-text-muted">Opens pointed link</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-dark-bg rounded-card">
            <span className="text-xs text-light-bg">Swipe + Say "save"</span>
            <span className="text-[10px] text-text-muted">Bookmarks page</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-dark-bg rounded-card">
            <span className="text-xs text-light-bg">Fist + Say "close"</span>
            <span className="text-[10px] text-text-muted">Closes all tabs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
