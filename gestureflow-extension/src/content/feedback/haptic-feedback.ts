import { GestureType } from '../../shared/types/gesture';

type Intensity = 'low' | 'medium' | 'high';

const INTENSITY_MULTIPLIER: Record<Intensity, number> = {
  low: 0.5,
  medium: 1.0,
  high: 1.5,
};

const SWIPE_GESTURES = new Set([
  GestureType.SWIPE_LEFT,
  GestureType.SWIPE_RIGHT,
  GestureType.SWIPE_UP,
  GestureType.SWIPE_DOWN,
]);

const TOGGLE_GESTURES = new Set([
  GestureType.OK_SIGN,
]);

const DESTRUCTIVE_ACTIONS = new Set([
  GestureType.FIST,
]);

const GESTURE_VIBRATION_MAP: Record<string, number[]> = {
  swipe: [50],
  static: [30, 30, 30],
  toggle: [100],
  destructive: [50, 50, 50, 50, 50],
};

function isSwipe(gestureType: string): boolean {
  return SWIPE_GESTURES.has(gestureType as GestureType);
}

function isToggle(gestureType: string): boolean {
  return TOGGLE_GESTURES.has(gestureType as GestureType);
}

function isDestructive(gestureType: string): boolean {
  return DESTRUCTIVE_ACTIONS.has(gestureType as GestureType);
}

function classifyGesture(gestureType: string): string {
  if (isSwipe(gestureType)) return 'swipe';
  if (isToggle(gestureType)) return 'toggle';
  if (isDestructive(gestureType)) return 'destructive';
  return 'static';
}

function scalePattern(pattern: number[], multiplier: number): number[] {
  return pattern.map((d) => Math.round(d * multiplier));
}

export class HapticFeedback {
  private enabled = true;
  private intensity: Intensity = 'medium';

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  vibrate(pattern: number | number[]): boolean {
    if (!this.enabled || !this.isSupported()) return false;

    const multiplier = INTENSITY_MULTIPLIER[this.intensity];

    let scaled: number | number[];
    if (Array.isArray(pattern)) {
      scaled = scalePattern(pattern, multiplier);
    } else {
      scaled = Math.round(pattern * multiplier);
    }

    return navigator.vibrate(scaled);
  }

  gestureVibrate(gestureType: string): boolean {
    const category = classifyGesture(gestureType);
    const pattern = GESTURE_VIBRATION_MAP[category] ?? GESTURE_VIBRATION_MAP.static;
    return this.vibrate(pattern);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && this.isSupported()) {
      navigator.vibrate(0);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setIntensity(intensity: Intensity): void {
    this.intensity = intensity;
  }

  getIntensity(): Intensity {
    return this.intensity;
  }

  cancel(): void {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  }
}
