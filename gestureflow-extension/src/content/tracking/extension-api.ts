import { MessageType } from '../../shared/types/message';
import { sendMessage } from '../../shared/utils/messaging';

type GestureCallback = (gestureId: string, confidence: number) => void;
type StateCallback = (state: { isEnabled: boolean; activeProfileId: string; cameraActive: boolean }) => void;

const listeners: Map<string, Set<GestureCallback>> = new Map();
const stateListeners: Set<StateCallback> = new Set();

class GestureFlowAPI {
  private isInitialized = false;

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === MessageType.GESTURE_RECOGNIZED) {
        const { gestureId, confidence } = message.payload as { gestureId: string; confidence: number };
        const callbacks = listeners.get('onGesture');
        if (callbacks) {
          callbacks.forEach((cb) => cb(gestureId, confidence));
        }
      }

      if (message.type === MessageType.STATE_RESPONSE) {
        const state = message.payload as { isEnabled: boolean; activeProfileId: string; cameraActive: boolean };
        stateListeners.forEach((cb) => cb(state));
      }
    });
  }

  onGesture(callback: GestureCallback): () => void {
    if (!listeners.has('onGesture')) {
      listeners.set('onGesture', new Set());
    }
    listeners.get('onGesture')!.add(callback);
    return () => listeners.get('onGesture')!.delete(callback);
  }

  registerGesture(name: string, action: { type: string; value: string }): void {
    sendMessage(MessageType.RECORD_GESTURE, {
      gestureId: `ext-${Date.now()}`,
      name,
      action,
    });
  }

  triggerAction(actionType: string, actionValue: string): void {
    sendMessage(MessageType.EXECUTE_ACTION, {
      actionType,
      actionValue,
    });
  }

  getState(): Promise<{ isEnabled: boolean; activeProfileId: string; cameraActive: boolean }> {
    return new Promise((resolve) => {
      sendMessage(MessageType.GET_STATE, {});
      const handler = (state: { isEnabled: boolean; activeProfileId: string; cameraActive: boolean }) => {
        resolve(state);
        stateListeners.delete(handler);
      };
      stateListeners.add(handler);
      setTimeout(() => {
        stateListeners.delete(handler);
        resolve({ isEnabled: false, activeProfileId: '', cameraActive: false });
      }, 3000);
    });
  }

  onStateChange(callback: StateCallback): () => void {
    stateListeners.add(callback);
    return () => stateListeners.delete(callback);
  }
}

export const gestureflow = new GestureFlowAPI();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).gestureflow = gestureflow;
}
