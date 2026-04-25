export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkFrame {
  landmarks: Landmark[];
  timestamp: number;
  handedness: 'Left' | 'Right';
}

export enum GestureType {
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  PINCH = 'pinch',
  SPREAD = 'spread',
  FIST = 'fist',
  OPEN_PALM = 'open_palm',
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
  POINT = 'point',
  PEACE = 'peace',
  WAVE = 'wave',
  ROTATE = 'rotate',
  OK_SIGN = 'ok_sign',
  ROCK = 'rock',
  HEART = 'heart',
}

export enum ActionType {
  CHROME = 'chrome',
  URL = 'url',
  SHORTCUT = 'shortcut',
  SCRIPT = 'script',
}

export interface GestureAction {
  type: ActionType;
  value: string;
}

export interface GestureFeedback {
  sound?: boolean;
  visual?: boolean;
  haptic?: boolean;
}

export interface Gesture {
  id: string;
  name: string;
  type: 'swipe' | 'static' | 'dynamic';
  direction?: 'left' | 'right' | 'up' | 'down' | 'clockwise' | 'counter-clockwise';
  handPose?: GestureType;
  action: GestureAction;
  isEnabled: boolean;
  isPreset: boolean;
  confidence?: number;
  cooldown?: number;
  feedback?: GestureFeedback;
}

export interface GestureEvent {
  gestureId: string;
  confidence: number;
  timestamp: number;
  zone?: string;
  landmarks?: Landmark[];
}

export interface GestureRecording {
  samples: LandmarkFrame[];
  createdAt: number;
}
