import type { Settings } from '../types/settings';
import type { AnalyticsData } from '../types/analytics';

export const DEFAULT_SETTINGS: Settings = {
  isEnabled: true,
  autoStart: false,
  showOverlay: true,
  showGestureName: true,
  playSound: true,
  confidenceThreshold: 0.75,
  cooldownMs: 500,
  cameraId: undefined,
  lowPowerMode: false,
  overlayPosition: 'bottom-right',
  overlaySize: 'medium',
  overlayOpacity: 0.8,
  nightMode: false,
  nightModeAutoStart: false,
  drawingMode: false,
  proximityActions: false,
  hapticEnabled: true,
  speechFeedback: false,
  speechVolume: 0.5,
  soundVolume: 0.5,
  hapticIntensity: 0.5,
  selectedProfileId: 'profile-home',
  gesturePasswordEnabled: false,
};

export const DEFAULT_ANALYTICS: AnalyticsData = {
  dailyCounts: [],
  gestureCounts: [],
  accuracyLog: [],
  totalGestures: 0,
  averageAccuracy: 0,
  averageResponseTime: 0,
  falsePositiveRate: 0,
  streakDays: 0,
  badges: [],
  heatmap: [],
};

export const STORAGE_KEYS = {
  SETTINGS: 'gestureflow_settings',
  GESTURES: 'gestureflow_gestures',
  PROFILES: 'gestureflow_profiles',
  ANALYTICS: 'gestureflow_analytics',
  MACROS: 'gestureflow_macros',
  INITIALIZED: 'gestureflow_initialized',
} as const;
