import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import type { Landmark, LandmarkFrame } from '../../shared/types/gesture';

type ResultsCallback = (frames: LandmarkFrame[]) => void;
type ErrorCallback = (error: Error) => void;

const NORMAL_FPS = 24;
const LOW_POWER_FPS = 15;
const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const FPS_COUNTER_INTERVAL_MS = 1000;

export class HandTracker {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private resultsCallbacks: ResultsCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private isTracking = false;
  private targetFPS = NORMAL_FPS;
  private currentFPS = 0;
  private frameCount = 0;
  private lastFPSTime = 0;
  private lastFrameTime = 0;
  private fpsIntervalId: ReturnType<typeof setInterval> | null = null;
  private visibilityHandler: (() => void) | null = null;
  private wasTrackingBeforeHidden = false;
  private isLowPower = false;
  private isDestroyed = false;

  async init(cameraId?: string): Promise<void> {
    if (this.isDestroyed) return;

    this.hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: this.isLowPower ? 0 : 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults((results: Results) => this.handleResults(results));

    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.style.display = 'none';
    document.body.appendChild(this.videoElement);

    const stream = await this.requestCamera(cameraId);
    this.videoElement.srcObject = stream;
    await this.videoElement.play();

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.isTracking && this.hands && !this.isDestroyed) {
          const now = performance.now();
          const minInterval = 1000 / this.targetFPS;
          if (now - this.lastFrameTime >= minInterval) {
            this.lastFrameTime = now;
            await this.hands.send({ image: this.videoElement! });
          }
        }
      },
      width: CAMERA_WIDTH,
      height: CAMERA_HEIGHT,
    });

    this.setupVisibilityHandler();
    this.startFPSCounter();
  }

  private async requestCamera(cameraId?: string): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: cameraId
          ? { deviceId: { exact: cameraId } }
          : { facingMode: 'user' },
      };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Camera access denied');
      this.errorCallbacks.forEach((cb) => cb(error));
      throw error;
    }
  }

  private handleResults(results: Results): void {
    if (this.isDestroyed) return;
    this.frameCount++;
    const timestamp = performance.now();

    const frames: LandmarkFrame[] = [];

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks: Landmark[] = results.multiHandLandmarks[i].map(
          (lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }),
        );
        const handedness =
          results.multiHandedness[i].label === 'Left' ? 'Left' : 'Right';
        frames.push({ landmarks, timestamp, handedness });
      }
    }

    this.resultsCallbacks.forEach((cb) => cb(frames));
  }

  startTracking(): void {
    this.isTracking = true;
  }

  stopTracking(): void {
    this.isTracking = false;
  }

  setFPS(fps: number): void {
    this.targetFPS = fps;
  }

  setLowPowerMode(enabled: boolean): void {
    this.isLowPower = enabled;
    this.targetFPS = enabled ? LOW_POWER_FPS : NORMAL_FPS;
    if (this.hands) {
      this.hands.setOptions({
        modelComplexity: enabled ? 0 : 1,
      });
    }
  }

  onResults(callback: ResultsCallback): void {
    this.resultsCallbacks.push(callback);
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  async getCameraList(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput');
    } catch {
      return [];
    }
  }

  async switchCamera(cameraId: string): Promise<void> {
    if (this.isDestroyed) return;

    const wasTracking = this.isTracking;
    this.stopTracking();

    if (this.camera) {
      this.camera.stop();
    }

    if (this.videoElement) {
      const oldStream = this.videoElement.srcObject as MediaStream | null;
      if (oldStream) {
        oldStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await this.requestCamera(cameraId);
      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          if (this.isTracking && this.hands && !this.isDestroyed) {
            const now = performance.now();
            const minInterval = 1000 / this.targetFPS;
            if (now - this.lastFrameTime >= minInterval) {
              this.lastFrameTime = now;
              await this.hands.send({ image: this.videoElement! });
            }
          }
        },
        width: CAMERA_WIDTH,
        height: CAMERA_HEIGHT,
      });

      await this.camera.start();
    }

    if (wasTracking) {
      this.startTracking();
    }
  }

  getFPS(): number {
    return this.currentFPS;
  }

  private startFPSCounter(): void {
    this.lastFPSTime = performance.now();
    this.fpsIntervalId = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - this.lastFPSTime) / 1000;
      this.currentFPS = Math.round(this.frameCount / elapsed);
      this.frameCount = 0;
      this.lastFPSTime = now;
    }, FPS_COUNTER_INTERVAL_MS);
  }

  private setupVisibilityHandler(): void {
    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        this.wasTrackingBeforeHidden = this.isTracking;
        this.stopTracking();
      } else if (this.wasTrackingBeforeHidden) {
        this.startTracking();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  destroy(): void {
    this.isDestroyed = true;
    this.stopTracking();

    if (this.fpsIntervalId !== null) {
      clearInterval(this.fpsIntervalId);
      this.fpsIntervalId = null;
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    if (this.videoElement) {
      const stream = this.videoElement.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      this.videoElement.srcObject = null;
      if (this.videoElement.parentNode) {
        this.videoElement.parentNode.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }

    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }

    this.resultsCallbacks = [];
    this.errorCallbacks = [];
  }
}
