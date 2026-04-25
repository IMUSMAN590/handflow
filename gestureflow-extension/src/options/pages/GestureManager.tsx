import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestureStore } from '@shared/store/gesture-store';
import type { Gesture, GestureAction } from '@shared/types/gesture';
import { ActionType, GestureType } from '@shared/types/gesture';
import { CHROME_ACTIONS } from '@shared/constants/actions';

type GestureTab = 'presets' | 'custom' | 'macros' | 'import-export';

const GESTURE_TYPE_LABELS: Record<string, string> = {
  swipe: 'Swipe',
  static: 'Static',
  dynamic: 'Dynamic',
};

const GESTURE_ICON_MAP: Record<string, string> = {
  swipe_left: '←',
  swipe_right: '→',
  swipe_up: '↑',
  swipe_down: '↓',
  pinch: '🤏',
  fist: '✊',
  open_palm: '🖐',
  thumbs_up: '👍',
  point: '☝️',
  peace: '✌️',
  rotate: '🔄',
  ok_sign: '👌',
  rock: '🤘',
};

function GestureCard({
  gesture,
  onToggle,
  onEdit,
  onDelete,
  isCustom,
}: {
  gesture: Gesture;
  onToggle: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  isCustom: boolean;
}) {
  const icon = GESTURE_ICON_MAP[gesture.handPose ?? ''] ?? gesture.type === 'swipe' ? '↔' : '✋';
  const actionLabel = getActionLabel(gesture.action);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 p-3 rounded-card border transition-colors ${
        gesture.isEnabled
          ? 'bg-dark-surface border-dark-border hover:border-primary/40'
          : 'bg-dark-bg border-dark-border opacity-60'
      }`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-light-bg truncate">
            {gesture.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
            {GESTURE_TYPE_LABELS[gesture.type]}
          </span>
        </div>
        <span className="text-xs text-text-muted truncate block">{actionLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggle}
          className={`w-8 h-4.5 rounded-full relative transition-colors ${
            gesture.isEnabled ? 'bg-primary' : 'bg-dark-border'
          }`}
          title={gesture.isEnabled ? 'Disable' : 'Enable'}
        >
          <div
            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
              gesture.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-dark-border/50 text-text-secondary hover:text-primary transition-colors"
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        {isCustom && onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function getActionLabel(action: GestureAction): string {
  switch (action.type) {
    case ActionType.CHROME:
      return CHROME_ACTIONS[action.value]?.name ?? action.value;
    case ActionType.URL:
      return `Open ${action.value}`;
    case ActionType.SHORTCUT:
      return `Shortcut: ${action.value}`;
    case ActionType.SCRIPT:
      return 'Run Script';
    default:
      return action.value;
  }
}

function EditGestureModal({
  gesture,
  onSave,
  onClose,
}: {
  gesture: Gesture;
  onSave: (updated: Gesture) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(gesture.name);
  const [actionType, setActionType] = useState<ActionType>(gesture.action.type);
  const [actionValue, setActionValue] = useState(gesture.action.value);
  const [confidence, setConfidence] = useState(gesture.confidence ?? 0.75);
  const [cooldown, setCooldown] = useState(gesture.cooldown ?? 300);

  const handleSave = () => {
    onSave({
      ...gesture,
      name,
      action: { type: actionType, value: actionValue },
      confidence,
      cooldown,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-dark-surface border border-dark-border rounded-modal p-6 w-[440px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-light-bg mb-4">Edit Gesture</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
            >
              <option value={ActionType.CHROME}>Chrome Action</option>
              <option value={ActionType.URL}>Open URL</option>
              <option value={ActionType.SHORTCUT}>Keyboard Shortcut</option>
              <option value={ActionType.SCRIPT}>JavaScript Snippet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              {actionType === ActionType.CHROME ? 'Chrome Action' : actionType === ActionType.URL ? 'URL' : actionType === ActionType.SHORTCUT ? 'Shortcut Keys' : 'Script Code'}
            </label>
            {actionType === ActionType.CHROME ? (
              <select
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
              >
                {Object.entries(CHROME_ACTIONS).map(([key, action]) => (
                  <option key={key} value={key}>
                    {action.icon} {action.name} - {action.description}
                  </option>
                ))}
              </select>
            ) : actionType === ActionType.SCRIPT ? (
              <textarea
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg font-mono focus:outline-none focus:border-primary"
                placeholder="console.log('Hello from GestureFlow')"
              />
            ) : (
              <input
                type="text"
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
                placeholder={actionType === ActionType.URL ? 'https://example.com' : 'Ctrl+Shift+T'}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Confidence Threshold: {confidence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Cooldown: {cooldown}ms
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={cooldown}
              onChange={(e) => setCooldown(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-light-bg rounded-button hover:bg-dark-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary text-white rounded-button hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddGestureModal({
  onSave,
  onClose,
}: {
  onSave: (gesture: Gesture) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [gestureType, setGestureType] = useState<'swipe' | 'static' | 'dynamic'>('static');
  const [handPose, setHandPose] = useState<GestureType>(GestureType.OPEN_PALM);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('left');
  const [actionType, setActionType] = useState<ActionType>(ActionType.CHROME);
  const [actionValue, setActionValue] = useState('goBack');

  const handleSave = () => {
    if (!name.trim()) return;
    const gesture: Gesture = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      type: gestureType,
      direction: gestureType === 'swipe' ? direction : undefined,
      handPose: gestureType !== 'swipe' ? handPose : undefined,
      action: { type: actionType, value: actionValue },
      isEnabled: true,
      isPreset: false,
      confidence: 0.75,
      cooldown: 500,
      feedback: { sound: true, visual: true },
    };
    onSave(gesture);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-dark-surface border border-dark-border rounded-modal p-6 w-[440px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-light-bg mb-4">Add Custom Gesture</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Gesture Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
              placeholder="My Custom Gesture"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Gesture Type</label>
            <div className="flex gap-2">
              {(['static', 'swipe', 'dynamic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGestureType(t)}
                  className={`flex-1 py-2 text-xs font-medium rounded-button transition-colors ${
                    gestureType === t
                      ? 'bg-primary text-white'
                      : 'bg-dark-bg text-text-secondary border border-dark-border hover:border-primary/40'
                  }`}
                >
                  {GESTURE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {gestureType === 'swipe' && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Direction</label>
              <div className="flex gap-2">
                {(['left', 'right', 'up', 'down'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={`flex-1 py-2 text-xs font-medium rounded-button transition-colors ${
                      direction === d
                        ? 'bg-primary text-white'
                        : 'bg-dark-bg text-text-secondary border border-dark-border hover:border-primary/40'
                    }`}
                  >
                    {d === 'left' ? '←' : d === 'right' ? '→' : d === 'up' ? '↑' : '↓'} {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gestureType !== 'swipe' && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Hand Pose</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(GestureType).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setHandPose(value)}
                    className={`py-2 text-xs rounded-button transition-colors ${
                      handPose === value
                        ? 'bg-primary text-white'
                        : 'bg-dark-bg text-text-secondary border border-dark-border hover:border-primary/40'
                    }`}
                  >
                    {GESTURE_ICON_MAP[value] ?? '✋'} {key.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
            >
              <option value={ActionType.CHROME}>Chrome Action</option>
              <option value={ActionType.URL}>Open URL</option>
              <option value={ActionType.SHORTCUT}>Keyboard Shortcut</option>
              <option value={ActionType.SCRIPT}>JavaScript Snippet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Action Value</label>
            {actionType === ActionType.CHROME ? (
              <select
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
              >
                {Object.entries(CHROME_ACTIONS).map(([key, action]) => (
                  <option key={key} value={key}>
                    {action.icon} {action.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
                placeholder={actionType === ActionType.URL ? 'https://example.com' : 'Ctrl+Shift+T'}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-light-bg rounded-button hover:bg-dark-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-primary text-white rounded-button hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Gesture
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GestureManager() {
  const [activeTab, setActiveTab] = useState<GestureTab>('presets');
  const [editingGesture, setEditingGesture] = useState<Gesture | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gestureStore = useGestureStore();

  useEffect(() => {
    gestureStore.loadGestures();
  }, []);

  const presetGestures = gestureStore.gestures.filter((g) => g.isPreset);
  const customGestures = gestureStore.gestures.filter((g) => !g.isPreset);

  const filteredPresets = searchQuery
    ? presetGestures.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.action.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : presetGestures;

  const filteredCustom = searchQuery
    ? customGestures.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.action.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : customGestures;

  const handleToggle = async (gestureId: string) => {
    await gestureStore.toggleGesture(gestureId);
  };

  const handleEdit = (gesture: Gesture) => {
    setEditingGesture(gesture);
  };

  const handleSaveEdit = async (updated: Gesture) => {
    await gestureStore.updateGesture(updated.id, updated);
    setEditingGesture(null);
  };

  const handleDelete = async (gestureId: string) => {
    await gestureStore.removeCustomGesture(gestureId);
  };

  const handleAddGesture = async (gesture: Gesture) => {
    await gestureStore.addCustomGesture(gesture);
    setShowAddModal(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(gestureStore.gestures, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestureflow-gestures-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as Gesture[];
      await gestureStore.importGestures(imported);
    } catch {
      console.error('Failed to import gestures');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = async () => {
    await gestureStore.loadGestures();
  };

  const tabs: { key: GestureTab; label: string }[] = [
    { key: 'presets', label: 'Preset Gestures' },
    { key: 'custom', label: 'Custom Gestures' },
    { key: 'macros', label: 'Gesture Macros' },
    { key: 'import-export', label: 'Import / Export' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-light-bg">Gesture Manager</h2>
          <p className="text-sm text-text-muted mt-1">
            Configure gesture-to-action mappings and create custom gestures
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-dark transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Gesture
        </button>
      </div>

      <div className="flex gap-1 bg-dark-bg p-1 rounded-button">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-button transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-light-bg hover:bg-dark-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'macros' && activeTab !== 'import-export' && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gestures..."
            className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredPresets.map((gesture) => (
              <GestureCard
                key={gesture.id}
                gesture={gesture}
                onToggle={() => handleToggle(gesture.id)}
                onEdit={() => handleEdit(gesture)}
                isCustom={false}
              />
            ))}
          </AnimatePresence>
          {filteredPresets.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">No preset gestures found</div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredCustom.map((gesture) => (
              <GestureCard
                key={gesture.id}
                gesture={gesture}
                onToggle={() => handleToggle(gesture.id)}
                onEdit={() => handleEdit(gesture)}
                onDelete={() => handleDelete(gesture.id)}
                isCustom
              />
            ))}
          </AnimatePresence>
          {filteredCustom.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm mb-3">No custom gestures yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-button hover:bg-primary/20 transition-colors"
              >
                Create Your First Gesture
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'macros' && (
        <MacroBuilder />
      )}

      {activeTab === 'import-export' && (
        <div className="space-y-4">
          <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
            <h3 className="text-sm font-semibold text-light-bg mb-2">Export Gestures</h3>
            <p className="text-xs text-text-muted mb-3">
              Download all your gesture configurations as a JSON file
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary text-white text-sm rounded-button hover:bg-primary-dark transition-colors"
            >
              Export as JSON
            </button>
          </div>
          <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
            <h3 className="text-sm font-semibold text-light-bg mb-2">Import Gestures</h3>
            <p className="text-xs text-text-muted mb-3">
              Load gesture configurations from a previously exported JSON file
            </p>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-accent text-white text-sm rounded-button hover:bg-accent-dark transition-colors"
            >
              Import from JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
            <h3 className="text-sm font-semibold text-light-bg mb-2">Reset to Defaults</h3>
            <p className="text-xs text-text-muted mb-3">
              Restore all gestures to their original preset configuration
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-error/10 text-error text-sm rounded-button hover:bg-error/20 transition-colors"
            >
              Reset All Gestures
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingGesture && (
          <EditGestureModal
            gesture={editingGesture}
            onSave={handleSaveEdit}
            onClose={() => setEditingGesture(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddGestureModal
            onSave={handleAddGesture}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface MacroStep {
  gestureId: string;
  timeout: number;
}

interface Macro {
  id: string;
  name: string;
  sequence: MacroStep[];
  action: GestureAction;
  isEnabled: boolean;
}

function MacroBuilder() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newMacroName, setNewMacroName] = useState('');
  const [newSteps, setNewSteps] = useState<MacroStep[]>([]);
  const [newActionType, setNewActionType] = useState<ActionType>(ActionType.CHROME);
  const [newActionValue, setNewActionValue] = useState('goBack');

  const addStep = () => {
    setNewSteps([...newSteps, { gestureId: 'open_palm', timeout: 500 }]);
  };

  const removeStep = (index: number) => {
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof MacroStep, value: string | number) => {
    const updated = [...newSteps];
    updated[index] = { ...updated[index], [field]: value };
    setNewSteps(updated);
  };

  const createMacro = () => {
    if (!newMacroName.trim() || newSteps.length === 0) return;
    const macro: Macro = {
      id: `macro-${Date.now()}`,
      name: newMacroName.trim(),
      sequence: newSteps,
      action: { type: newActionType, value: newActionValue },
      isEnabled: true,
    };
    setMacros([...macros, macro]);
    setNewMacroName('');
    setNewSteps([]);
    setShowCreate(false);
  };

  const deleteMacro = (id: string) => {
    setMacros(macros.filter((m) => m.id !== id));
  };

  const toggleMacro = (id: string) => {
    setMacros(macros.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Chain multiple gestures for complex actions (max 5 per macro)</p>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-button hover:bg-primary-dark transition-colors"
        >
          + New Macro
        </button>
      </div>

      {macros.length === 0 && !showCreate && (
        <div className="text-center py-8 text-text-muted text-sm">
          No macros created yet. Chain gestures together for complex actions.
        </div>
      )}

      {macros.map((macro) => (
        <div key={macro.id} className="p-3 bg-dark-surface border border-dark-border rounded-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-light-bg">{macro.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleMacro(macro.id)}
                className={`w-8 h-4.5 rounded-full relative transition-colors ${
                  macro.isEnabled ? 'bg-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    macro.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <button
                onClick={() => deleteMacro(macro.id)}
                className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {macro.sequence.map((step, i) => (
              <React.Fragment key={i}>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  {GESTURE_ICON_MAP[step.gestureId] ?? step.gestureId}
                </span>
                {i < macro.sequence.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </React.Fragment>
            ))}
            <span className="text-xs text-text-muted ml-1">→ {getActionLabel(macro.action)}</span>
          </div>
        </div>
      ))}

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-dark-surface border border-primary/30 rounded-card space-y-4"
        >
          <h4 className="text-sm font-semibold text-light-bg">Create Macro</h4>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Macro Name</label>
            <input
              type="text"
              value={newMacroName}
              onChange={(e) => setNewMacroName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-sm text-light-bg focus:outline-none focus:border-primary"
              placeholder="My Macro"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Gesture Sequence</label>
            <div className="space-y-2">
              {newSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={step.gestureId}
                    onChange={(e) => updateStep(i, 'gestureId', e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
                  >
                    {Object.entries(GestureType).map(([key, value]) => (
                      <option key={key} value={value}>
                        {GESTURE_ICON_MAP[value] ?? ''} {key.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={step.timeout}
                    onChange={(e) => updateStep(i, 'timeout', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
                    placeholder="ms"
                  />
                  <span className="text-xs text-text-muted">ms</span>
                  <button
                    onClick={() => removeStep(i)}
                    className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              {newSteps.length < 5 && (
                <button
                  onClick={addStep}
                  className="w-full py-2 text-xs text-primary border border-dashed border-primary/30 rounded-button hover:bg-primary/5 transition-colors"
                >
                  + Add Step
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Result Action</label>
            <div className="flex gap-2">
              <select
                value={newActionType}
                onChange={(e) => setNewActionType(e.target.value as ActionType)}
                className="px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
              >
                <option value={ActionType.CHROME}>Chrome</option>
                <option value={ActionType.URL}>URL</option>
                <option value={ActionType.SHORTCUT}>Shortcut</option>
              </select>
              {newActionType === ActionType.CHROME ? (
                <select
                  value={newActionValue}
                  onChange={(e) => setNewActionValue(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
                >
                  {Object.entries(CHROME_ACTIONS).map(([key, action]) => (
                    <option key={key} value={key}>{action.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newActionValue}
                  onChange={(e) => setNewActionValue(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-dark-bg border border-dark-border rounded-button text-xs text-light-bg focus:outline-none focus:border-primary"
                  placeholder={newActionType === ActionType.URL ? 'https://...' : 'Ctrl+...'}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowCreate(false); setNewSteps([]); }}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-light-bg rounded-button hover:bg-dark-border/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createMacro}
              disabled={!newMacroName.trim() || newSteps.length === 0}
              className="px-3 py-1.5 text-xs bg-primary text-white rounded-button hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              Create Macro
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
