import type { GestureAction } from '../shared/types/gesture';
import { ActionType } from '../shared/types/gesture';

export interface ActionResult {
  success: boolean;
  error?: string;
}

type ConfirmationCallback = (actionName: string) => Promise<boolean>;

let confirmationHandler: ConfirmationCallback | null = null;

export function setConfirmationHandler(handler: ConfirmationCallback): void {
  confirmationHandler = handler;
}

async function requireConfirmation(actionName: string): Promise<boolean> {
  if (!confirmationHandler) return true;
  return confirmationHandler(actionName);
}

export async function executeAction(action: GestureAction): Promise<ActionResult> {
  switch (action.type) {
    case ActionType.CHROME:
      return executeChromeAction(action.value);
    case ActionType.URL:
      return openUrl(action.value);
    case ActionType.SHORTCUT:
      return executeShortcut(action.value);
    case ActionType.SCRIPT:
      return executeScript(action.value);
    default:
      return { success: false, error: `Unknown action type: ${action.type}` };
  }
}

async function executeChromeAction(actionId: string): Promise<ActionResult> {
  switch (actionId) {
    case 'goBack':
      return goBack();
    case 'goForward':
      return goForward();
    case 'scrollUp':
      return scrollUp();
    case 'scrollDown':
      return scrollDown();
    case 'refresh':
      return refresh();
    case 'closeTab':
      return closeTab();
    case 'newTab':
      return newTab();
    case 'bookmark':
      return bookmark();
    case 'removeBookmark':
      return removeBookmark();
    case 'zoomIn':
      return zoomIn();
    case 'zoomOut':
      return zoomOut();
    case 'moveCursor':
      return moveCursor();
    case 'toggleExtension':
      return toggleExtension();
    case 'closeAllOtherTabs':
      return closeAllOtherTabs();
    case 'screenshot':
      return screenshot();
    case 'splitScreen':
      return splitScreen();
    default:
      return { success: false, error: `Unknown Chrome action: ${actionId}` };
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

export async function goBack(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.tabs.goBack(tab.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function goForward(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.tabs.goForward(tab.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function scrollUp(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.scrollBy(0, -300),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function scrollDown(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.scrollBy(0, 300),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function refresh(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.tabs.reload(tab.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function closeTab(): Promise<ActionResult> {
  try {
    const confirmed = await requireConfirmation('Close Tab');
    if (!confirmed) return { success: false, error: 'Action cancelled' };

    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    await chrome.tabs.remove(tab.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function newTab(): Promise<ActionResult> {
  try {
    await chrome.tabs.create({ url: 'chrome://newtab' });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function bookmark(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id || !tab.url) return { success: false, error: 'No active tab with URL' };
    await chrome.bookmarks.create({
      title: tab.title ?? 'Untitled',
      url: tab.url,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function removeBookmark(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.url) return { success: false, error: 'No active tab with URL' };

    const existing = await chrome.bookmarks.search({ url: tab.url });
    for (const bm of existing) {
      await chrome.bookmarks.remove(bm.id);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function zoomIn(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    const currentZoom = await chrome.tabs.getZoom(tab.id);
    await chrome.tabs.setZoom(tab.id, Math.min(currentZoom + 0.1, 3));
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function zoomOut(): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };
    const currentZoom = await chrome.tabs.getZoom(tab.id);
    await chrome.tabs.setZoom(tab.id, Math.max(currentZoom - 0.1, 0.25));
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function moveCursor(): Promise<ActionResult> {
  return { success: true };
}

export async function openUrl(url: string): Promise<ActionResult> {
  try {
    await chrome.tabs.create({ url });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function executeShortcut(shortcut: string): Promise<ActionResult> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };

    const parts = shortcut.split('+');
    const key = parts[parts.length - 1];
    const modifiers: string[] = [];
    for (let i = 0; i < parts.length - 1; i++) {
      const mod = parts[i].toLowerCase();
      if (mod === 'ctrl') modifiers.push('Control');
      else if (mod === 'alt') modifiers.push('Alt');
      else if (mod === 'shift') modifiers.push('Shift');
      else if (mod === 'meta' || mod === 'command') modifiers.push('Meta');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (k: string, mods: string[]) => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: k,
            ctrlKey: mods.includes('Control'),
            altKey: mods.includes('Alt'),
            shiftKey: mods.includes('Shift'),
            metaKey: mods.includes('Meta'),
            bubbles: true,
          }),
        );
      },
      args: [key, modifiers],
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

const ALLOWED_SCRIPT_IDS = new Set<string>([
  'togglePlayPause',
  'toggleMute',
  'toggleFullscreen',
  'toggleSubtitles',
  'seekForward10',
  'seekBackward10',
  'nextTrack',
  'previousTrack',
  'volumeUp',
  'volumeDown',
]);

const SCRIPT_REGISTRY: Record<string, () => void> = {
  togglePlayPause: () => {
    const video = document.querySelector('video');
    if (video) video.paused ? video.play() : video.pause();
  },
  toggleMute: () => {
    const video = document.querySelector('video');
    if (video) video.muted = !video.muted;
  },
  toggleFullscreen: () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  },
  toggleSubtitles: () => {
    const video = document.querySelector('video');
    if (!video) return;
    const tracks = video.textTracks;
    if (tracks.length > 0) {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].mode === 'showing' ? 'hidden' : 'showing';
      }
    }
  },
  seekForward10: () => {
    const video = document.querySelector('video');
    if (video) video.currentTime = Math.min(video.duration, video.currentTime + 10);
  },
  seekBackward10: () => {
    const video = document.querySelector('video');
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  },
  nextTrack: () => {
    const next = document.querySelector('[data-testid="control-button-skip-forward"], .next-button, [aria-label="Next"]');
    if (next) (next as HTMLElement).click();
  },
  previousTrack: () => {
    const prev = document.querySelector('[data-testid="control-button-skip-back"], .previous-button, [aria-label="Previous"]');
    if (prev) (prev as HTMLElement).click();
  },
  volumeUp: () => {
    const video = document.querySelector('video');
    if (video) video.volume = Math.min(1, video.volume + 0.1);
  },
  volumeDown: () => {
    const video = document.querySelector('video');
    if (video) video.volume = Math.max(0, video.volume - 0.1);
  },
};

export async function executeScript(scriptId: string): Promise<ActionResult> {
  try {
    if (!ALLOWED_SCRIPT_IDS.has(scriptId)) {
      return { success: false, error: `Script not allowed: ${scriptId}` };
    }

    const tab = await getActiveTab();
    if (!tab?.id) return { success: false, error: 'No active tab' };

    const scriptFn = SCRIPT_REGISTRY[scriptId];
    if (!scriptFn) return { success: false, error: `Script not found: ${scriptId}` };

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scriptFn,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function toggleExtension(): Promise<ActionResult> {
  try {
    const result = await chrome.storage.local.get('gestureflow_settings');
    const settings = result.gestureflow_settings;
    if (settings) {
      settings.isEnabled = !settings.isEnabled;
      await chrome.storage.local.set({ gestureflow_settings: settings });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function closeAllOtherTabs(): Promise<ActionResult> {
  try {
    const confirmed = await requireConfirmation('Close All Other Tabs');
    if (!confirmed) return { success: false, error: 'Action cancelled' };

    const [activeTab, ...otherTabs] = await chrome.tabs.query({ currentWindow: true });
    if (!activeTab?.id) return { success: false, error: 'No active tab' };

    const tabIds = otherTabs
      .map((t) => t.id)
      .filter((id): id is number => id !== undefined);
    if (tabIds.length > 0) {
      await chrome.tabs.remove(tabIds);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function screenshot(): Promise<ActionResult> {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: 'png' });
    const tab = await getActiveTab();
    const timestamp = Date.now();
    const title = tab?.title ?? 'screenshot';

    await chrome.downloads.download({
      url: dataUrl,
      filename: `gestureflow_${title}_${timestamp}.png`,
      saveAs: false,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function splitScreen(): Promise<ActionResult> {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) return { success: false, error: 'No active tab' };

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    if (allTabs.length < 2) return { success: false, error: 'Need at least 2 tabs' };

    const otherTab = allTabs.find((t) => t.id !== activeTab.id && t.id !== undefined);
    if (!otherTab?.id) return { success: false, error: 'No other tab available' };

    const { width, height } = await chrome.windows.getCurrent();
    const w = width ?? 1920;
    const h = height ?? 1080;

    await chrome.windows.create({
      tabId: activeTab.id,
      left: 0,
      top: 0,
      width: Math.floor(w / 2),
      height: h,
    });

    await chrome.windows.create({
      tabId: otherTab.id,
      left: Math.floor(w / 2),
      top: 0,
      width: Math.floor(w / 2),
      height: h,
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
