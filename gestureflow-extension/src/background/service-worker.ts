import { MessageType } from '../shared/types/message';
import type {
  Message,
  TogglePayload,
  GestureRecognizedPayload,
  SettingsUpdatedPayload,
  ProfileSwitchedPayload,
  RecordGesturePayload,
  ExecuteActionPayload,
  StatePayload,
  AnalyticsUpdatePayload,
  MacroExecutePayload,
  ContextUpdatePayload,
} from '../shared/types/message';
import type { GestureEvent } from '../shared/types/gesture';
import { initDefaults, getSettings, saveSettings, getGestures, getAnalytics, saveAnalytics } from './storage-manager';
import { GestureEngine } from './gesture-engine';
import { executeAction, setConfirmationHandler } from './action-executor';
import {
  getActiveProfile,
  switchProfile,
  autoSwitchProfile,
  resolveGestureAction,
} from './profile-manager';
import {
  initMacroEngine,
  checkMacroProgress,
  resetMacroProgress,
  executeMacro,
  recordGestureStep,
  getIsRecording,
} from './macro-engine';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const ANALYTICS_BATCH_INTERVAL_MS = 5000;

const gestureEngine = new GestureEngine();
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let analyticsBatch: Array<{ gestureId: string; confidence: number }> = [];
let analyticsBatchTimer: ReturnType<typeof setInterval> | null = null;

async function flushAnalyticsBatch(): Promise<void> {
  if (analyticsBatch.length === 0) return;

  const batch = [...analyticsBatch];
  analyticsBatch = [];

  const analytics = await getAnalytics();
  const today = new Date().toISOString().split('T')[0];

  const dailyCounts = [...analytics.dailyCounts];
  const todayEntry = dailyCounts.find((d) => d.date === today);
  if (todayEntry) {
    todayEntry.count += batch.length;
  } else {
    dailyCounts.push({ date: today, count: batch.length });
  }

  const gestureCounts = [...analytics.gestureCounts];
  for (const item of batch) {
    const gestureEntry = gestureCounts.find((g) => g.gestureId === item.gestureId);
    if (gestureEntry) {
      gestureEntry.count += 1;
      gestureEntry.lastUsed = Date.now();
    } else {
      gestureCounts.push({ gestureId: item.gestureId, count: 1, lastUsed: Date.now() });
    }
  }

  const totalGestures = analytics.totalGestures + batch.length;
  const avgConfidence = batch.reduce((sum, b) => sum + b.confidence, 0) / batch.length;
  const averageAccuracy =
    (analytics.averageAccuracy * analytics.totalGestures + avgConfidence * batch.length) / totalGestures;
  const averageResponseTime =
    (analytics.averageResponseTime * analytics.totalGestures + 50 * batch.length) / totalGestures;

  await saveAnalytics({
    ...analytics,
    dailyCounts,
    gestureCounts,
    totalGestures,
    averageAccuracy,
    averageResponseTime,
  });
}

async function updateBadge(): Promise<void> {
  const settings = await getSettings();
  const text = settings.isEnabled ? '' : 'OFF';
  const color = settings.isEnabled ? '#4CAF50' : '#F44336';

  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

function resetInactivityTimer(): void {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  inactivityTimer = setTimeout(async () => {
    const settings = await getSettings();
    if (settings.isEnabled) {
      settings.isEnabled = false;
      await saveSettings(settings);
      await updateBadge();
      console.log('[GestureFlow] Auto-disabled after 30 minutes of inactivity');
    }
  }, INACTIVITY_TIMEOUT_MS);
}

async function handleGestureEvent(event: GestureEvent): Promise<void> {
  resetInactivityTimer();

  const action = await resolveGestureAction(event.gestureId, event.zone);
  if (!action) return;

  if (getIsRecording()) {
    recordGestureStep(event.gestureId, action);
    return;
  }

  const macroResult = checkMacroProgress(event.gestureId);
  if (macroResult.isMacroProgress && macroResult.isComplete && macroResult.macroId) {
    await executeMacro(macroResult.macroId);
    resetMacroProgress();
    return;
  }
  if (macroResult.isMacroProgress && !macroResult.isComplete) {
    return;
  }

  const result = await executeAction(action);
  if (result.success) {
    analyticsBatch.push({ gestureId: event.gestureId, confidence: event.confidence });

    if (!analyticsBatchTimer) {
      analyticsBatchTimer = setInterval(flushAnalyticsBatch, ANALYTICS_BATCH_INTERVAL_MS);
    }
  }
}

async function handleToggle(payload: TogglePayload): Promise<void> {
  const settings = await getSettings();
  settings.isEnabled = payload.isEnabled;
  await saveSettings(settings);
  await updateBadge();
  resetInactivityTimer();
}

async function handleSettingsUpdated(payload: SettingsUpdatedPayload): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...payload.settings };
  await saveSettings(updated as typeof current);

  if (payload.settings.confidenceThreshold !== undefined) {
    gestureEngine.setConfidenceThreshold(updated.confidenceThreshold);
  }
  if (payload.settings.cooldownMs !== undefined) {
    gestureEngine.setCooldownDuration(updated.cooldownMs);
  }

  await updateBadge();
}

async function handleProfileSwitched(payload: ProfileSwitchedPayload): Promise<void> {
  await switchProfile(payload.profileId);
  await updateBadge();
}

async function handleRecordGesture(payload: RecordGesturePayload): Promise<void> {
  console.log('[GestureFlow] Recording gesture:', payload.gestureId);
}

async function handleExecuteAction(payload: ExecuteActionPayload): Promise<void> {
  const action = {
    type: payload.actionType as import('../shared/types/gesture').ActionType,
    value: payload.actionValue,
  };
  await executeAction(action);
}

async function handleGetState(
  sendResponse: (response: StatePayload) => void,
): Promise<void> {
  const settings = await getSettings();
  const profile = await getActiveProfile();
  sendResponse({
    isEnabled: settings.isEnabled,
    activeProfileId: profile.id,
    cameraActive: false,
  });
}

async function handleAnalyticsUpdate(payload: AnalyticsUpdatePayload): Promise<void> {
  const analytics = await getAnalytics();
  const totalGestures = analytics.totalGestures + 1;
  const averageAccuracy = payload.isCorrect
    ? (analytics.averageAccuracy * analytics.totalGestures + payload.confidence) / totalGestures
    : (analytics.averageAccuracy * analytics.totalGestures) / totalGestures;
  const averageResponseTime =
    (analytics.averageResponseTime * analytics.totalGestures + payload.responseTime) / totalGestures;
  const falsePositiveRate = !payload.isCorrect
    ? (analytics.falsePositiveRate * analytics.totalGestures + 1) / totalGestures
    : (analytics.falsePositiveRate * analytics.totalGestures) / totalGestures;

  await saveAnalytics({
    ...analytics,
    totalGestures,
    averageAccuracy,
    averageResponseTime,
    falsePositiveRate,
  });
}

async function handleMacroExecute(payload: MacroExecutePayload): Promise<void> {
  await executeMacro(payload.macroId);
}

function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean {
  switch (message.type) {
    case MessageType.TOGGLE:
      handleToggle(message.payload as TogglePayload);
      break;

    case MessageType.GESTURE_RECOGNIZED:
      handleGestureEvent({
        gestureId: (message.payload as GestureRecognizedPayload).gestureId,
        confidence: (message.payload as GestureRecognizedPayload).confidence,
        timestamp: message.timestamp,
        zone: (message.payload as GestureRecognizedPayload).zone,
      });
      break;

    case MessageType.SETTINGS_UPDATED:
      handleSettingsUpdated(message.payload as SettingsUpdatedPayload);
      break;

    case MessageType.PROFILE_SWITCHED:
      handleProfileSwitched(message.payload as ProfileSwitchedPayload);
      break;

    case MessageType.RECORD_GESTURE:
      handleRecordGesture(message.payload as RecordGesturePayload);
      break;

    case MessageType.EXECUTE_ACTION:
      handleExecuteAction(message.payload as ExecuteActionPayload);
      break;

    case MessageType.GET_STATE:
      handleGetState((response) => sendResponse(response));
      return true;

    case MessageType.ANALYTICS_UPDATE:
      handleAnalyticsUpdate(message.payload as AnalyticsUpdatePayload);
      break;

    case MessageType.MACRO_EXECUTE:
      handleMacroExecute(message.payload as MacroExecutePayload);
      break;

    case MessageType.ZONE_UPDATE:
      break;

    case MessageType.CONTEXT_UPDATE: {
      const ctx = message.payload as ContextUpdatePayload;
      if (ctx.url) {
        autoSwitchProfile(ctx.url);
      }
      break;
    }

    default:
      break;
  }

  return false;
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[GestureFlow] Extension installed');
    await initDefaults();
    await initMacroEngine();
    await updateBadge();
    resetInactivityTimer();
  } else if (details.reason === 'update') {
    console.log('[GestureFlow] Extension updated to version', chrome.runtime.getManifest().version);
    await initDefaults();
    await initMacroEngine();
    await updateBadge();
  }
});

chrome.commands?.onCommand.addListener(async (command) => {
  if (command === 'toggle-extension') {
    const settings = await getSettings();
    settings.isEnabled = !settings.isEnabled;
    await saveSettings(settings);
    await updateBadge();
    if (settings.isEnabled) resetInactivityTimer();
  } else if (command === 'quick-disable') {
    const settings = await getSettings();
    settings.isEnabled = false;
    await saveSettings(settings);
    await updateBadge();
  }
});

chrome.runtime.onMessage.addListener(handleMessage);

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    const switched = await autoSwitchProfile(changeInfo.url);
    if (switched) {
      console.log('[GestureFlow] Auto-switched to profile:', switched.name);
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const switched = await autoSwitchProfile(tab.url);
      if (switched) {
        console.log('[GestureFlow] Auto-switched to profile:', switched.name);
      }
    }
  } catch {
    // Tab may have been closed
  }
  resetInactivityTimer();
});

chrome.action?.onClicked.addListener(async () => {
  const settings = await getSettings();
  settings.isEnabled = !settings.isEnabled;
  await saveSettings(settings);
  await updateBadge();
  if (settings.isEnabled) resetInactivityTimer();
});

gestureEngine.setGestureCallback(handleGestureEvent);

gestureEngine.setMacroCheckCallback((gestureId: string) => {
  return checkMacroProgress(gestureId);
});

setConfirmationHandler(async (_actionName: string): Promise<boolean> => {
  return true;
});

(async () => {
  await initDefaults();
  await initMacroEngine();

  const settings = await getSettings();
  gestureEngine.setConfidenceThreshold(settings.confidenceThreshold);
  gestureEngine.setCooldownDuration(settings.cooldownMs);

  const gestures = await getGestures();
  gestureEngine.setGestures(gestures);

  await updateBadge();
  resetInactivityTimer();
})();
