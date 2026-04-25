export type OverlayPosition = 'bottom-left' | 'bottom-right' | 'top-right';

export type OverlaySize = 'small' | 'medium' | 'large';

export interface Settings {
  isEnabled: boolean;
  autoStart: boolean;
  showOverlay: boolean;
  showGestureName: boolean;
  playSound: boolean;
  confidenceThreshold: number;
  cooldownMs: number;
  cameraId?: string;
  lowPowerMode: boolean;
  overlayPosition: OverlayPosition;
  overlaySize: OverlaySize;
  overlayOpacity: number;
  nightMode: boolean;
  nightModeAutoStart: boolean;
  drawingMode: boolean;
  proximityActions: boolean;
  hapticEnabled: boolean;
  speechFeedback: boolean;
  speechVolume: number;
  soundVolume: number;
  hapticIntensity: number;
  selectedProfileId: string;
  gesturePasswordEnabled: boolean;
}
