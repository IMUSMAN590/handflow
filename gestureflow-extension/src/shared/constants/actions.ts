export interface ChromeAction {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const CHROME_ACTIONS: Record<string, ChromeAction> = {
  goBack: {
    id: 'goBack',
    name: 'Go Back',
    description: 'Navigate to the previous page',
    icon: '←',
  },
  goForward: {
    id: 'goForward',
    name: 'Go Forward',
    description: 'Navigate to the next page',
    icon: '→',
  },
  scrollUp: {
    id: 'scrollUp',
    name: 'Scroll Up',
    description: 'Scroll the page up',
    icon: '↑',
  },
  scrollDown: {
    id: 'scrollDown',
    name: 'Scroll Down',
    description: 'Scroll the page down',
    icon: '↓',
  },
  refresh: {
    id: 'refresh',
    name: 'Refresh',
    description: 'Reload the current page',
    icon: '↻',
  },
  closeTab: {
    id: 'closeTab',
    name: 'Close Tab',
    description: 'Close the current tab',
    icon: '✕',
  },
  newTab: {
    id: 'newTab',
    name: 'New Tab',
    description: 'Open a new tab',
    icon: '+',
  },
  bookmark: {
    id: 'bookmark',
    name: 'Bookmark',
    description: 'Bookmark the current page',
    icon: '★',
  },
  removeBookmark: {
    id: 'removeBookmark',
    name: 'Remove Bookmark',
    description: 'Remove bookmark from current page',
    icon: '☆',
  },
  zoomIn: {
    id: 'zoomIn',
    name: 'Zoom In',
    description: 'Zoom in on the page',
    icon: '🔍+',
  },
  zoomOut: {
    id: 'zoomOut',
    name: 'Zoom Out',
    description: 'Zoom out on the page',
    icon: '🔍−',
  },
  moveCursor: {
    id: 'moveCursor',
    name: 'Move Cursor',
    description: 'Move cursor to hand position',
    icon: '☝',
  },
  toggleExtension: {
    id: 'toggleExtension',
    name: 'Toggle Extension',
    description: 'Toggle GestureFlow on/off',
    icon: '⏻',
  },
};
