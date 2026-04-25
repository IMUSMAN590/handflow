import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@shared/store/settings-store';
import type { OverlayPosition, OverlaySize } from '@shared/types/settings';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-[#94A3B8]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-dark-border'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-[#94A3B8]">{label}</span>
        <span className="text-sm font-medium text-primary">{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-dark-border accent-primary"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-[#94A3B8]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-dark-border bg-dark-bg px-3 py-1.5 text-sm text-[#F8FAFC] outline-none focus:border-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm text-[#94A3B8]">{label}</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-primary text-white'
                : 'bg-dark-border text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-dark-border bg-dark-surface p-5"
    >
      <h2 className="mb-4 text-base font-semibold text-[#F8FAFC]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

export function GeneralSettings() {
  const { settings, updateSetting, resetSettings } = useSettingsStore();
  const [cameras, setCameras] = useState<{ deviceId: string; label: string }[]>([]);

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const videoDevices = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }));
      setCameras(videoDevices);
    }).catch(() => {});
  }, []);

  const handleSave = () => {};

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Section title="Startup & Display">
        <Toggle
          label="Auto-start on browser open"
          checked={settings.autoStart}
          onChange={(v) => updateSetting('autoStart', v)}
        />
        <Toggle
          label="Show hand overlay"
          checked={settings.showOverlay}
          onChange={(v) => updateSetting('showOverlay', v)}
        />
        <Toggle
          label="Show gesture name popup"
          checked={settings.showGestureName}
          onChange={(v) => updateSetting('showGestureName', v)}
        />
        <Toggle
          label="Play sound on gesture"
          checked={settings.playSound}
          onChange={(v) => updateSetting('playSound', v)}
        />
      </Section>

      <Section title="Recognition">
        <Slider
          label="Confidence threshold"
          value={settings.confidenceThreshold}
          min={0.5}
          max={1.0}
          step={0.05}
          onChange={(v) => updateSetting('confidenceThreshold', v)}
          displayValue={settings.confidenceThreshold.toFixed(2)}
        />
        <Select
          label="Cooldown duration"
          value={settings.cooldownMs}
          options={[
            { value: 300, label: '300ms' },
            { value: 500, label: '500ms' },
            { value: 750, label: '750ms' },
            { value: 1000, label: '1000ms' },
          ]}
          onChange={(v) => updateSetting('cooldownMs', parseInt(v, 10))}
        />
        <Select
          label="Camera"
          value={settings.cameraId ?? ''}
          options={[
            { value: '', label: 'Default' },
            ...cameras.map((c) => ({ value: c.deviceId, label: c.label })),
          ]}
          onChange={(v) => updateSetting('cameraId', v || undefined)}
        />
        <Toggle
          label="Low power mode"
          checked={settings.lowPowerMode}
          onChange={(v) => updateSetting('lowPowerMode', v)}
        />
      </Section>

      <Section title="Overlay">
        <RadioGroup
          label="Overlay position"
          value={settings.overlayPosition}
          options={[
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
            { value: 'top-right', label: 'Top Right' },
          ]}
          onChange={(v) => updateSetting('overlayPosition', v as OverlayPosition)}
        />
        <RadioGroup
          label="Overlay size"
          value={settings.overlaySize}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
          onChange={(v) => updateSetting('overlaySize', v as OverlaySize)}
        />
        <Slider
          label="Overlay opacity"
          value={settings.overlayOpacity}
          min={0.3}
          max={1.0}
          step={0.05}
          onChange={(v) => updateSetting('overlayOpacity', v)}
          displayValue={settings.overlayOpacity.toFixed(2)}
        />
      </Section>

      <Section title="Modes">
        <div>
          <Toggle
            label="Night mode"
            checked={settings.nightMode}
            onChange={(v) => updateSetting('nightMode', v)}
          />
          {settings.nightMode && (
            <Toggle
              label="Auto-detect night mode"
              checked={settings.nightModeAutoStart}
              onChange={(v) => updateSetting('nightModeAutoStart', v)}
            />
          )}
        </div>
        <Toggle
          label="Drawing mode"
          checked={settings.drawingMode}
          onChange={(v) => updateSetting('drawingMode', v)}
        />
        <Toggle
          label="Proximity actions"
          checked={settings.proximityActions}
          onChange={(v) => updateSetting('proximityActions', v)}
        />
      </Section>

      <Section title="Keyboard Shortcuts">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#94A3B8]">Toggle Extension</span>
            <kbd className="rounded border border-dark-border bg-dark-bg px-2 py-0.5 font-mono text-xs text-[#94A3B8]">
              Ctrl+Shift+G
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#94A3B8]">Quick Disable</span>
            <kbd className="rounded border border-dark-border bg-dark-bg px-2 py-0.5 font-mono text-xs text-[#94A3B8]">
              Ctrl+Shift+X
            </kbd>
          </div>
        </div>
      </Section>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Save Settings
        </button>
        <button
          onClick={() => resetSettings()}
          className="rounded-md border border-dark-border bg-transparent px-5 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-error hover:text-error"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
