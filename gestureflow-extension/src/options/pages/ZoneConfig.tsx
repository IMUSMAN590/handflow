import { useState } from 'react';
import { motion } from 'framer-motion';

type ZoneId = 'top' | 'left' | 'center' | 'right' | 'bottom';

interface ZoneConfig {
  id: ZoneId;
  label: string;
  description: string;
  actions: string[];
  color: string;
}

const DEFAULT_ZONES: ZoneConfig[] = [
  { id: 'top', label: 'Top Zone', description: 'Tab Management Actions', actions: ['newTab', 'closeTab', 'toggleExtension'], color: '#0EA5E9' },
  { id: 'left', label: 'Left Zone', description: 'Navigation Actions', actions: ['goBack', 'goForward'], color: '#10B981' },
  { id: 'center', label: 'Center Zone', description: 'Scroll & Zoom', actions: ['scrollUp', 'scrollDown', 'zoomIn', 'zoomOut'], color: '#F97316' },
  { id: 'right', label: 'Right Zone', description: 'Quick Actions', actions: ['bookmark', 'refresh', 'moveCursor'], color: '#0EA5E9' },
  { id: 'bottom', label: 'Bottom Zone', description: 'Page Content Actions', actions: ['scrollDown', 'scrollUp'], color: '#10B981' },
];

export function ZoneConfig() {
  const [zones, setZones] = useState<ZoneConfig[]>(DEFAULT_ZONES);
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(null);
  const [enabled, setEnabled] = useState(true);

  const updateZoneAction = (zoneId: ZoneId, actionIndex: number, newAction: string) => {
    setZones(zones.map((z) => {
      if (z.id !== zoneId) return z;
      const actions = [...z.actions];
      actions[actionIndex] = newAction;
      return { ...z, actions };
    }));
  };

  const addActionToZone = (zoneId: ZoneId) => {
    setZones(zones.map((z) => {
      if (z.id !== zoneId) return z;
      return { ...z, actions: [...z.actions, 'goBack'] };
    }));
  };

  const removeActionFromZone = (zoneId: ZoneId, actionIndex: number) => {
    setZones(zones.map((z) => {
      if (z.id !== zoneId) return z;
      return { ...z, actions: z.actions.filter((_, i) => i !== actionIndex) };
    }));
  };

  const ALL_ACTIONS = ['goBack', 'goForward', 'scrollUp', 'scrollDown', 'refresh', 'closeTab', 'newTab', 'bookmark', 'removeBookmark', 'zoomIn', 'zoomOut', 'moveCursor', 'toggleExtension'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-light-bg">Gesture Zones</h2>
          <p className="text-sm text-text-muted mt-1">
            Divide camera view into zones for context-aware gestures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Enable Zones</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-dark-border'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] bg-dark-bg rounded-card border border-dark-border overflow-hidden">
        <div className="absolute inset-0 grid grid-rows-[1fr_2fr_1fr] grid-cols-[1fr_2fr_1fr] gap-0.5 p-0.5">
          <div className="col-span-3 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/10" style={{ borderColor: zones[0].color, borderWidth: 1, borderStyle: 'dashed' }} onClick={() => setSelectedZone('top')}>
            <span className="text-xs text-text-muted">Top: Tab Management</span>
          </div>
          <div className="rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-accent/10" style={{ borderColor: zones[1].color, borderWidth: 1, borderStyle: 'dashed' }} onClick={() => setSelectedZone('left')}>
            <span className="text-[10px] text-text-muted">Navigate</span>
          </div>
          <div className="rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary/10" style={{ borderColor: zones[2].color, borderWidth: 1, borderStyle: 'dashed' }} onClick={() => setSelectedZone('center')}>
            <span className="text-[10px] text-text-muted">Scroll/Zoom</span>
          </div>
          <div className="rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/10" style={{ borderColor: zones[3].color, borderWidth: 1, borderStyle: 'dashed' }} onClick={() => setSelectedZone('right')}>
            <span className="text-[10px] text-text-muted">Actions</span>
          </div>
          <div className="col-span-3 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-accent/10" style={{ borderColor: zones[4].color, borderWidth: 1, borderStyle: 'dashed' }} onClick={() => setSelectedZone('bottom')}>
            <span className="text-xs text-text-muted">Bottom: Content Actions</span>
          </div>
        </div>
      </div>

      {selectedZone && (() => {
        const zone = zones.find((z) => z.id === selectedZone);
        if (!zone) return null;
        return (
          <motion.div
            key={selectedZone}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-dark-surface border border-dark-border rounded-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-light-bg">{zone.label}</h3>
              <span className="text-[10px] text-text-muted">{zone.description}</span>
            </div>
            <div className="space-y-2">
              {zone.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={action}
                    onChange={(e) => updateZoneAction(zone.id, i, e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
                  >
                    {ALL_ACTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeActionFromZone(zone.id, i)}
                    className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              {zone.actions.length < 5 && (
                <button
                  onClick={() => addActionToZone(zone.id)}
                  className="w-full py-1.5 text-xs text-primary border border-dashed border-primary/30 rounded-button hover:bg-primary/5 transition-colors"
                >
                  + Add Action
                </button>
              )}
            </div>
          </motion.div>
        );
      })()}

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-2">How Zones Work</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          When gesture zones are enabled, the same gesture can trigger different actions depending on where your hand is in the camera view.
          For example, swiping left in the Left Zone goes back one page, while swiping left in the Right Zone switches to the previous tab.
        </p>
      </div>
    </div>
  );
}
