import { create } from 'zustand';
import type { Gesture } from '../types/gesture';
import { getGestures, saveGestures } from '../utils/storage';

interface GestureState {
  gestures: Gesture[];
  isLoading: boolean;
}

interface GestureActions {
  loadGestures: () => Promise<void>;
  addCustomGesture: (gesture: Gesture) => Promise<void>;
  removeCustomGesture: (gestureId: string) => Promise<void>;
  updateGesture: (gestureId: string, updates: Partial<Gesture>) => Promise<void>;
  toggleGesture: (gestureId: string) => Promise<void>;
  importGestures: (gestures: Gesture[]) => Promise<void>;
  exportGestures: () => Gesture[];
}

export const useGestureStore = create<GestureState & GestureActions>((set, get) => ({
  gestures: [],
  isLoading: true,

  loadGestures: async () => {
    set({ isLoading: true });
    const gestures = await getGestures();
    set({ gestures, isLoading: false });
  },

  addCustomGesture: async (gesture: Gesture) => {
    const gestures = [...get().gestures, gesture];
    set({ gestures });
    await saveGestures(gestures);
  },

  removeCustomGesture: async (gestureId: string) => {
    const gestures = get().gestures.filter(
      (g) => g.id !== gestureId || g.isPreset,
    );
    set({ gestures });
    await saveGestures(gestures);
  },

  updateGesture: async (gestureId: string, updates: Partial<Gesture>) => {
    const gestures = get().gestures.map((g) =>
      g.id === gestureId ? { ...g, ...updates } : g,
    );
    set({ gestures });
    await saveGestures(gestures);
  },

  toggleGesture: async (gestureId: string) => {
    const gestures = get().gestures.map((g) =>
      g.id === gestureId ? { ...g, isEnabled: !g.isEnabled } : g,
    );
    set({ gestures });
    await saveGestures(gestures);
  },

  importGestures: async (newGestures: Gesture[]) => {
    const existingIds = new Set(get().gestures.map((g) => g.id));
    const merged = [
      ...get().gestures,
      ...newGestures.filter((g) => !existingIds.has(g.id)),
    ];
    set({ gestures: merged });
    await saveGestures(merged);
  },

  exportGestures: () => {
    return get().gestures;
  },
}));
