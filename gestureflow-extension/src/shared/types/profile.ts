import type { Gesture } from './gesture';

export enum ProfileType {
  HOME = 'home',
  PRESENTATION = 'presentation',
  GAMING = 'gaming',
  ACCESSIBILITY = 'accessibility',
  MEDIA = 'media',
  CUSTOM = 'custom',
}

export interface GestureMapping {
  gestureId: string;
  actionId: string;
  zone?: string;
  isEnabled: boolean;
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  gestures: Gesture[];
  isActive: boolean;
  autoSwitchUrls?: string[];
  type: ProfileType;
}
