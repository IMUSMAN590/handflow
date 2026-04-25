import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import type { LandmarkFrame, GestureEvent } from '@shared/types/gesture';
import { MessageType } from '@shared/types/message';
import type {
  TogglePayload,
  GestureRecognizedPayload,
  SettingsUpdatedPayload,
} from '@shared/types/message';
import { sendMessage, onMessage } from '@shared/utils/messaging';
import { DEFAULT_SETTINGS } from '@shared/constants/defaults';
import type { Settings } from '@shared/types/settings';
import { HandTracker } from './tracking/hand-tracker';
import { GestureClassifier } from './tracking/gesture-classifier';
import { OverlayApp } from './overlay/OverlayApp';

class GestureFlowContentScript {
  private container: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private root: Root | null = null;
  private tracker: HandTracker | null = null;
  private classifier: GestureClassifier | null = null;
  private videoRef = React.createRef<HTMLVideoElement>();
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private frames: LandmarkFrame[] = [];
  private gestureEvent: GestureEvent | null = null;
  private actionValue: string | undefined;
  private fps = 0;
  private isInitialized = false;
  private messageListeners: Array<() => void> = [];
  private frameListener: ((frames: LandmarkFrame[]) => void) | null = null;
  private renderScheduled = false;
  private lastRenderTime = 0;
  private readonly MIN_RENDER_INTERVAL_MS = 16;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadSettings();
    this.injectOverlay();
    this.setupMessageListeners();
    this.setupStorageListener();

    if (this.settings.isEnabled) {
      await this.startTracking();
    }

    this.isInitialized = true;
  }

  private async loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get('gestureflow_settings', (result) => {
        if (result.gestureflow_settings) {
          this.settings = { ...DEFAULT_SETTINGS, ...result.gestureflow_settings };
        }
        resolve();
      });
    });
  }

  private injectOverlay(): void {
    this.container = document.createElement('div');
    this.container.id = 'gestureflow-overlay';
    this.container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(this.container);

    this.shadow = this.container.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = this.getOverlayStyles();
    this.shadow.appendChild(styleEl);

    const mountPoint = document.createElement('div');
    mountPoint.id = 'gestureflow-mount';
    this.shadow.appendChild(mountPoint);

    this.root = createRoot(mountPoint);
    this.renderOverlay();
  }

  private getOverlayStyles(): string {
    return `
      :host {
        all: initial;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      #gestureflow-mount {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2147483647;
      }
    `;
  }

  private renderOverlay(): void {
    if (!this.root) return;
    if (this.renderScheduled) return;
    this.renderScheduled = true;

    requestAnimationFrame(() => {
      const now = performance.now();
      if (now - this.lastRenderTime < this.MIN_RENDER_INTERVAL_MS) {
        this.renderScheduled = false;
        this.renderOverlay();
        return;
      }

      this.lastRenderTime = now;
      this.renderScheduled = false;
      this.root!.render(
        <OverlayApp
          settings={this.settings}
          videoRef={this.videoRef}
          frames={this.frames}
          gestureEvent={this.gestureEvent}
          actionValue={this.actionValue}
          fps={this.fps}
          onGestureClear={() => {
            this.gestureEvent = null;
            this.actionValue = undefined;
            this.renderOverlay();
          }}
        />,
      );
    });
  }

  private setupMessageListeners(): void {
    const toggleUnsub = onMessage<TogglePayload>(MessageType.TOGGLE, (payload) => {
      this.settings.isEnabled = payload.isEnabled;
      if (payload.isEnabled) {
        this.startTracking();
      } else {
        this.stopTracking();
      }
      this.renderOverlay();
    });
    this.messageListeners.push(toggleUnsub);

    const gestureUnsub = onMessage<GestureRecognizedPayload>(
      MessageType.GESTURE_RECOGNIZED,
      (payload) => {
        this.gestureEvent = {
          gestureId: payload.gestureId,
          confidence: payload.confidence,
          timestamp: Date.now(),
          zone: payload.zone,
        };
        this.renderOverlay();
      },
    );
    this.messageListeners.push(gestureUnsub);

    const settingsUnsub = onMessage<SettingsUpdatedPayload>(
      MessageType.SETTINGS_UPDATED,
      (payload) => {
        this.settings = { ...DEFAULT_SETTINGS, ...payload.settings as Partial<Settings> };
        if (this.tracker) {
          this.tracker.setLowPowerMode(this.settings.lowPowerMode);
        }
        if (this.classifier) {
          this.classifier.setThreshold(this.settings.confidenceThreshold);
          this.classifier.setCooldown(this.settings.cooldownMs);
        }
        this.renderOverlay();
      },
    );
    this.messageListeners.push(settingsUnsub);
  }

  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.gestureflow_settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...changes.gestureflow_settings.newValue };
        if (this.tracker) {
          this.tracker.setLowPowerMode(this.settings.lowPowerMode);
        }
        if (this.classifier) {
          this.classifier.setThreshold(this.settings.confidenceThreshold);
          this.classifier.setCooldown(this.settings.cooldownMs);
        }
        this.renderOverlay();
      }
      if (changes.gestureflow_enabled) {
        this.settings.isEnabled = changes.gestureflow_enabled.newValue;
        if (this.settings.isEnabled) {
          this.startTracking();
        } else {
          this.stopTracking();
        }
        this.renderOverlay();
      }
    });
  }

  private async startTracking(): Promise<void> {
    if (this.tracker) return;

    try {
      this.tracker = new HandTracker();
      this.classifier = new GestureClassifier();

      this.classifier.setThreshold(this.settings.confidenceThreshold);
      this.classifier.setCooldown(this.settings.cooldownMs);

      this.tracker.setLowPowerMode(this.settings.lowPowerMode);

      this.frameListener = (frames: LandmarkFrame[]) => {
        this.frames = frames;
        this.fps = this.tracker?.getFPS() ?? 0;

        if (this.classifier && frames.length > 0) {
          for (const frame of frames) {
            const event = this.classifier.classify(
              frame.landmarks,
              frame.handedness,
              frame.timestamp,
            );
            if (event) {
              this.gestureEvent = event;
              this.forwardGestureToServiceWorker(event);
            }
          }
        }

        this.renderOverlay();
      };

      this.tracker.onResults(this.frameListener);

      await this.tracker.init(this.settings.cameraId);
      this.tracker.startTracking();
    } catch (err) {
      console.error('[GestureFlow] Failed to start tracking:', err);
      this.tracker = null;
      this.classifier = null;
    }
  }

  private stopTracking(): void {
    if (this.frameListener && this.tracker) {
      this.tracker.stopTracking();
    }

    this.frames = [];
    this.gestureEvent = null;
    this.actionValue = undefined;
    this.fps = 0;
    this.renderOverlay();
  }

  private forwardGestureToServiceWorker(event: GestureEvent): void {
    const payload: GestureRecognizedPayload = {
      gestureId: event.gestureId,
      confidence: event.confidence,
      zone: event.zone,
    };
    sendMessage(MessageType.GESTURE_RECOGNIZED, payload).catch(() => {});
  }

  destroy(): void {
    this.stopTracking();

    if (this.tracker) {
      this.tracker.destroy();
      this.tracker = null;
    }

    if (this.classifier) {
      this.classifier.reset();
      this.classifier = null;
    }

    this.frameListener = null;

    for (const unsub of this.messageListeners) {
      unsub();
    }
    this.messageListeners = [];

    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.shadow = null;

    this.isInitialized = false;
  }
}

const instance = new GestureFlowContentScript();

instance.init().catch((err) => {
  console.error('[GestureFlow] Initialization failed:', err);
});

window.addEventListener('unload', () => {
  instance.destroy();
});
