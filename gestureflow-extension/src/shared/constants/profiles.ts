import { ProfileType } from '../types/profile';
import type { Profile, GestureMapping } from '../types/profile';

const homeMappings: GestureMapping[] = [
  { gestureId: 'swipe-left', actionId: 'goBack', isEnabled: true },
  { gestureId: 'swipe-right', actionId: 'goForward', isEnabled: true },
  { gestureId: 'swipe-up', actionId: 'scrollUp', isEnabled: true },
  { gestureId: 'swipe-down', actionId: 'scrollDown', isEnabled: true },
  { gestureId: 'open-palm', actionId: 'newTab', isEnabled: true },
  { gestureId: 'fist', actionId: 'closeTab', isEnabled: true },
  { gestureId: 'thumbs-up', actionId: 'bookmark', isEnabled: true },
  { gestureId: 'peace', actionId: 'refresh', isEnabled: true },
  { gestureId: 'ok-sign', actionId: 'toggleExtension', isEnabled: true },
];

const presentationMappings: GestureMapping[] = [
  { gestureId: 'swipe-left', actionId: 'goBack', isEnabled: true },
  { gestureId: 'swipe-right', actionId: 'goForward', isEnabled: true },
  { gestureId: 'swipe-up', actionId: 'scrollUp', isEnabled: true },
  { gestureId: 'swipe-down', actionId: 'scrollDown', isEnabled: true },
  { gestureId: 'open-palm', actionId: 'newTab', isEnabled: false },
  { gestureId: 'fist', actionId: 'closeTab', isEnabled: false },
  { gestureId: 'point', actionId: 'moveCursor', isEnabled: true },
];

const gamingMappings: GestureMapping[] = [
  { gestureId: 'swipe-left', actionId: 'goBack', isEnabled: false },
  { gestureId: 'swipe-right', actionId: 'goForward', isEnabled: false },
  { gestureId: 'swipe-up', actionId: 'scrollUp', isEnabled: false },
  { gestureId: 'swipe-down', actionId: 'scrollDown', isEnabled: false },
  { gestureId: 'point', actionId: 'moveCursor', isEnabled: true },
  { gestureId: 'pinch', actionId: 'zoomIn', isEnabled: true },
  { gestureId: 'rotate', actionId: 'zoomOut', isEnabled: true },
  { gestureId: 'rock', actionId: 'toggleExtension', isEnabled: true },
];

const accessibilityMappings: GestureMapping[] = [
  { gestureId: 'swipe-left', actionId: 'goBack', isEnabled: true },
  { gestureId: 'swipe-right', actionId: 'goForward', isEnabled: true },
  { gestureId: 'swipe-up', actionId: 'scrollUp', isEnabled: true },
  { gestureId: 'swipe-down', actionId: 'scrollDown', isEnabled: true },
  { gestureId: 'open-palm', actionId: 'newTab', isEnabled: true },
  { gestureId: 'fist', actionId: 'closeTab', isEnabled: true },
  { gestureId: 'point', actionId: 'moveCursor', isEnabled: true },
  { gestureId: 'thumbs-up', actionId: 'bookmark', isEnabled: true },
  { gestureId: 'peace', actionId: 'refresh', isEnabled: true },
  { gestureId: 'ok-sign', actionId: 'toggleExtension', isEnabled: true },
];

const mediaMappings: GestureMapping[] = [
  { gestureId: 'swipe-left', actionId: 'goBack', isEnabled: true },
  { gestureId: 'swipe-right', actionId: 'goForward', isEnabled: true },
  { gestureId: 'swipe-up', actionId: 'scrollUp', isEnabled: false },
  { gestureId: 'swipe-down', actionId: 'scrollDown', isEnabled: false },
  { gestureId: 'open-palm', actionId: 'newTab', isEnabled: false },
  { gestureId: 'fist', actionId: 'closeTab', isEnabled: true },
  { gestureId: 'thumbs-up', actionId: 'bookmark', isEnabled: true },
  { gestureId: 'peace', actionId: 'refresh', isEnabled: true },
  { gestureId: 'pinch', actionId: 'zoomIn', isEnabled: true },
  { gestureId: 'rotate', actionId: 'zoomOut', isEnabled: true },
];

export const PRESET_PROFILES: Profile[] = [
  {
    id: 'profile-home',
    name: 'Home',
    icon: '🏠',
    type: ProfileType.HOME,
    isActive: true,
    gestures: [],
    autoSwitchUrls: [],
  },
  {
    id: 'profile-presentation',
    name: 'Presentation',
    icon: '📽️',
    type: ProfileType.PRESENTATION,
    isActive: false,
    gestures: [],
    autoSwitchUrls: ['docs.google.com/presentation', 'slides.com'],
  },
  {
    id: 'profile-gaming',
    name: 'Gaming',
    icon: '🎮',
    type: ProfileType.GAMING,
    isActive: false,
    gestures: [],
    autoSwitchUrls: ['twitch.tv', 'play.geforcenow.com'],
  },
  {
    id: 'profile-accessibility',
    name: 'Accessibility',
    icon: '♿',
    type: ProfileType.ACCESSIBILITY,
    isActive: false,
    gestures: [],
    autoSwitchUrls: [],
  },
  {
    id: 'profile-media',
    name: 'Media',
    icon: '🎬',
    type: ProfileType.MEDIA,
    isActive: false,
    gestures: [],
    autoSwitchUrls: ['youtube.com', 'netflix.com', 'spotify.com'],
  },
];

export const PROFILE_MAPPINGS: Record<string, GestureMapping[]> = {
  'profile-home': homeMappings,
  'profile-presentation': presentationMappings,
  'profile-gaming': gamingMappings,
  'profile-accessibility': accessibilityMappings,
  'profile-media': mediaMappings,
};
