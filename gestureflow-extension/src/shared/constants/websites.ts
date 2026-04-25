import { ActionType } from '../types/gesture';

export interface WebsiteGesture {
  gestureId: string;
  action: { type: ActionType; value: string };
}

export interface WebsitePack {
  urlPattern: string;
  name: string;
  icon: string;
  gestures: WebsiteGesture[];
}

export const WEBSITE_PACKS: Record<string, WebsitePack> = {
  youtube: {
    urlPattern: 'youtube.com',
    name: 'YouTube',
    icon: '▶️',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.SHORTCUT, value: 'Shift+N' } },
      { gestureId: 'swipe-right', action: { type: ActionType.SHORTCUT, value: 'Shift+P' } },
      { gestureId: 'swipe-up', action: { type: ActionType.SHORTCUT, value: 'ArrowUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.SHORTCUT, value: 'ArrowDown' } },
      { gestureId: 'open-palm', action: { type: ActionType.SHORTCUT, value: 'KeyK' } },
      { gestureId: 'fist', action: { type: ActionType.SHORTCUT, value: 'KeyM' } },
      { gestureId: 'thumbs-up', action: { type: ActionType.SHORTCUT, value: 'KeyL' } },
    ],
  },
  spotify: {
    urlPattern: 'spotify.com',
    name: 'Spotify',
    icon: '🎵',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.SHORTCUT, value: 'Shift+ArrowLeft' } },
      { gestureId: 'swipe-right', action: { type: ActionType.SHORTCUT, value: 'Shift+ArrowRight' } },
      { gestureId: 'swipe-up', action: { type: ActionType.SHORTCUT, value: 'ArrowUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.SHORTCUT, value: 'ArrowDown' } },
      { gestureId: 'open-palm', action: { type: ActionType.SHORTCUT, value: 'Space' } },
    ],
  },
  netflix: {
    urlPattern: 'netflix.com',
    name: 'Netflix',
    icon: '🎬',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.SHORTCUT, value: 'ArrowLeft' } },
      { gestureId: 'swipe-right', action: { type: ActionType.SHORTCUT, value: 'ArrowRight' } },
      { gestureId: 'swipe-up', action: { type: ActionType.SHORTCUT, value: 'ArrowUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.SHORTCUT, value: 'ArrowDown' } },
      { gestureId: 'open-palm', action: { type: ActionType.SHORTCUT, value: 'Space' } },
      { gestureId: 'fist', action: { type: ActionType.SHORTCUT, value: 'Escape' } },
    ],
  },
  googleDocs: {
    urlPattern: 'docs.google.com',
    name: 'Google Docs',
    icon: '📄',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.SHORTCUT, value: 'Ctrl+Z' } },
      { gestureId: 'swipe-right', action: { type: ActionType.SHORTCUT, value: 'Ctrl+Y' } },
      { gestureId: 'swipe-up', action: { type: ActionType.SHORTCUT, value: 'ArrowUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.SHORTCUT, value: 'ArrowDown' } },
      { gestureId: 'point', action: { type: ActionType.CHROME, value: 'moveCursor' } },
      { gestureId: 'pinch', action: { type: ActionType.SHORTCUT, value: 'Ctrl+Plus' } },
      { gestureId: 'rotate', action: { type: ActionType.SHORTCUT, value: 'Ctrl+Minus' } },
    ],
  },
  gmail: {
    urlPattern: 'mail.google.com',
    name: 'Gmail',
    icon: '📧',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.SHORTCUT, value: 'J' } },
      { gestureId: 'swipe-right', action: { type: ActionType.SHORTCUT, value: 'K' } },
      { gestureId: 'swipe-up', action: { type: ActionType.SHORTCUT, value: 'ArrowUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.SHORTCUT, value: 'ArrowDown' } },
      { gestureId: 'open-palm', action: { type: ActionType.SHORTCUT, value: 'C' } },
      { gestureId: 'fist', action: { type: ActionType.SHORTCUT, value: 'E' } },
    ],
  },
  twitter: {
    urlPattern: 'twitter.com',
    name: 'Twitter / X',
    icon: '🐦',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.CHROME, value: 'goBack' } },
      { gestureId: 'swipe-right', action: { type: ActionType.CHROME, value: 'goForward' } },
      { gestureId: 'swipe-up', action: { type: ActionType.CHROME, value: 'scrollUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.CHROME, value: 'scrollDown' } },
      { gestureId: 'thumbs-up', action: { type: ActionType.SHORTCUT, value: 'L' } },
      { gestureId: 'peace', action: { type: ActionType.SHORTCUT, value: 'R' } },
    ],
  },
  github: {
    urlPattern: 'github.com',
    name: 'GitHub',
    icon: '🐙',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.CHROME, value: 'goBack' } },
      { gestureId: 'swipe-right', action: { type: ActionType.CHROME, value: 'goForward' } },
      { gestureId: 'swipe-up', action: { type: ActionType.CHROME, value: 'scrollUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.CHROME, value: 'scrollDown' } },
      { gestureId: 'thumbs-up', action: { type: ActionType.SHORTCUT, value: 'L' } },
      { gestureId: 'point', action: { type: ActionType.CHROME, value: 'moveCursor' } },
    ],
  },
  chatgpt: {
    urlPattern: 'chatgpt.com',
    name: 'ChatGPT',
    icon: '🤖',
    gestures: [
      { gestureId: 'swipe-left', action: { type: ActionType.CHROME, value: 'goBack' } },
      { gestureId: 'swipe-right', action: { type: ActionType.CHROME, value: 'goForward' } },
      { gestureId: 'swipe-up', action: { type: ActionType.CHROME, value: 'scrollUp' } },
      { gestureId: 'swipe-down', action: { type: ActionType.CHROME, value: 'scrollDown' } },
      { gestureId: 'open-palm', action: { type: ActionType.SHORTCUT, value: 'Enter' } },
      { gestureId: 'fist', action: { type: ActionType.SHORTCUT, value: 'Escape' } },
    ],
  },
};
