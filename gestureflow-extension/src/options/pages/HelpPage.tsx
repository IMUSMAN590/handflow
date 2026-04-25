export function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-light-bg">Help & About</h2>
        <p className="text-sm text-text-muted mt-1">
          Get started with GestureFlow and learn how to use hand gestures
        </p>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Getting Started</h3>
        <div className="space-y-3">
          <Step number={1} title="Enable Camera Access" description="Click the GestureFlow icon and allow camera access when prompted. Your camera feed stays 100% local." />
          <Step number={2} title="Try a Gesture" description="Hold your open palm 🖐 in front of the camera. You should see the hand skeleton overlay appear." />
          <Step number={3} title="Navigate with Gestures" description="Swipe left to go back, swipe right to go forward, make a fist to close a tab, or give a thumbs up to bookmark." />
          <Step number={4} title="Customize" description="Go to Settings to adjust sensitivity, create custom gestures, switch profiles, and configure gesture zones." />
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Gesture Reference</h3>
        <div className="grid grid-cols-2 gap-2">
          <GestureRef icon="←" name="Swipe Left" action="Go Back" />
          <GestureRef icon="→" name="Swipe Right" action="Go Forward" />
          <GestureRef icon="↑" name="Swipe Up" action="Scroll Up" />
          <GestureRef icon="↓" name="Swipe Down" action="Scroll Down" />
          <GestureRef icon="🖐" name="Open Palm" action="Refresh / New Tab" />
          <GestureRef icon="✊" name="Fist" action="Close Tab" />
          <GestureRef icon="✌️" name="Peace Sign" action="New Tab / Refresh" />
          <GestureRef icon="👍" name="Thumbs Up" action="Bookmark" />
          <GestureRef icon="☝️" name="Point" action="Move Cursor" />
          <GestureRef icon="🤏" name="Pinch" action="Zoom In" />
          <GestureRef icon="👌" name="OK Sign" action="Toggle On/Off" />
          <GestureRef icon="👋" name="Wave" action="Toggle Extension" />
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          <Shortcut keys="Ctrl+Shift+G" description="Toggle GestureFlow on/off" />
          <Shortcut keys="Ctrl+Shift+X" description="Quick disable gesture detection" />
          <Shortcut keys="Ctrl+Shift+," description="Open settings page" />
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Privacy</h3>
        <div className="space-y-1.5">
          <PrivacyItem text="Camera feed NEVER leaves your device" />
          <PrivacyItem text="All processing happens locally (WebAssembly)" />
          <PrivacyItem text="No data sent to external servers" />
          <PrivacyItem text="Gesture recordings stored locally only" />
          <PrivacyItem text="Analytics are local-only (no telemetry)" />
          <PrivacyItem text="Camera indicator always visible when active" />
          <PrivacyItem text="Auto-disable after 30 minutes of inactivity" />
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card text-center">
        <h3 className="text-sm font-semibold text-light-bg mb-1">GestureFlow v1.0.0</h3>
        <p className="text-xs text-text-muted">Hand gesture control for Chrome</p>
        <p className="text-[10px] text-text-muted mt-2">Built with MediaPipe • React • TypeScript</p>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <span className="text-sm font-medium text-light-bg block">{title}</span>
        <span className="text-xs text-text-muted">{description}</span>
      </div>
    </div>
  );
}

function GestureRef({ icon, name, action }: { icon: string; name: string; action: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-card">
      <span className="text-lg">{icon}</span>
      <div>
        <span className="text-xs font-medium text-light-bg block">{name}</span>
        <span className="text-[10px] text-text-muted">{action}</span>
      </div>
    </div>
  );
}

function Shortcut({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-dark-bg rounded-card">
      <span className="text-xs text-text-muted">{description}</span>
      <kbd className="text-[10px] px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-text-secondary font-mono">
        {keys}
      </kbd>
    </div>
  );
}

function PrivacyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 flex items-center justify-center text-accent text-xs">✓</div>
      <span className="text-xs text-text-secondary">{text}</span>
    </div>
  );
}
