import type { Landmark, GestureEvent } from '../../shared/types/gesture';
import { GestureType } from '../../shared/types/gesture';
import { classifyStaticGesture } from './static-gestures';
import { DynamicGestureDetector } from './dynamic-gestures';

type GestureCallback = (event: GestureEvent) => void;
type GestureZone = 'top' | 'left' | 'center' | 'right' | 'bottom';

interface CooldownEntry {
  gestureType: GestureType;
  timestamp: number;
}

const DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
const DEFAULT_COOLDOWN_MS = 500;
const STATIC_WEIGHT = 0.6;
const DYNAMIC_WEIGHT = 0.4;
const MAX_HISTORY = 50;

export class GestureClassifier {
  private dynamicDetector: DynamicGestureDetector;
  private confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD;
  private cooldownMs = DEFAULT_COOLDOWN_MS;
  private cooldowns: CooldownEntry[] = [];
  private gestureHistory: GestureEvent[] = [];
  private callbacks: GestureCallback[] = [];
  private frameHistory: Landmark[][] = [];
  private lastEmittedGesture: GestureType | null = null;
  private lastEmitTime = 0;

  constructor() {
    this.dynamicDetector = new DynamicGestureDetector();
  }

  classify(
    landmarks: Landmark[],
    handedness: string,
    timestamp: number,
  ): GestureEvent | null {
    this.frameHistory.push(landmarks);
    if (this.frameHistory.length > 30) {
      this.frameHistory.shift();
    }

    const staticResult = classifyStaticGesture(landmarks, handedness);
    const dynamicResult = this.dynamicDetector.detectSwipe(landmarks, timestamp);

    if (dynamicResult.gestureType === null) {
      const waveResult = this.dynamicDetector.detectWave(landmarks, timestamp);
      if (waveResult.gestureType !== null) {
        return this.resolveGesture(
          waveResult.gestureType,
          waveResult.confidence,
          landmarks,
          timestamp,
        );
      }
    }

    let gestureType: GestureType | null = null;
    let confidence = 0;

    if (staticResult.gestureType !== null && dynamicResult.gestureType !== null) {
      const staticScore = staticResult.confidence * STATIC_WEIGHT;
      const dynamicScore = dynamicResult.confidence * DYNAMIC_WEIGHT;

      if (dynamicScore > staticScore) {
        gestureType = dynamicResult.gestureType;
        confidence = dynamicResult.confidence;
      } else {
        gestureType = staticResult.gestureType;
        confidence = staticResult.confidence;
      }
    } else if (staticResult.gestureType !== null) {
      gestureType = staticResult.gestureType;
      confidence = staticResult.confidence;
    } else if (dynamicResult.gestureType !== null) {
      gestureType = dynamicResult.gestureType;
      confidence = dynamicResult.confidence;
    }

    if (gestureType === null) {
      return null;
    }

    return this.resolveGesture(gestureType, confidence, landmarks, timestamp);
  }

  private resolveGesture(
    gestureType: GestureType,
    confidence: number,
    landmarks: Landmark[],
    timestamp: number,
  ): GestureEvent | null {
    if (confidence < this.confidenceThreshold) {
      return null;
    }

    if (this.isInCooldown(gestureType, timestamp)) {
      return null;
    }

    if (
      gestureType === this.lastEmittedGesture &&
      timestamp - this.lastEmitTime < 200
    ) {
      return null;
    }

    const zone = this.determineZone(landmarks);

    const event: GestureEvent = {
      gestureId: gestureType,
      confidence,
      timestamp,
      zone,
      landmarks,
    };

    this.cooldowns.push({ gestureType, timestamp });
    this.gestureHistory.push(event);
    if (this.gestureHistory.length > MAX_HISTORY) {
      this.gestureHistory.shift();
    }

    this.lastEmittedGesture = gestureType;
    this.lastEmitTime = timestamp;

    this.callbacks.forEach((cb) => cb(event));

    return event;
  }

  private isInCooldown(gestureType: GestureType, timestamp: number): boolean {
    this.cooldowns = this.cooldowns.filter(
      (entry) => timestamp - entry.timestamp < this.cooldownMs * 2,
    );
    return this.cooldowns.some(
      (entry) =>
        entry.gestureType === gestureType &&
        timestamp - entry.timestamp < this.cooldownMs,
    );
  }

  determineZone(landmarks: Landmark[]): GestureZone {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];

    const centerX = (wrist.x + middleMcp.x) / 2;
    const centerY = (wrist.y + middleMcp.y) / 2;

    const horizontalThirds = 1 / 3;
    const verticalThirds = 1 / 3;

    if (centerY < verticalThirds) {
      return 'top';
    }
    if (centerY > 2 * verticalThirds) {
      return 'bottom';
    }
    if (centerX < horizontalThirds) {
      return 'left';
    }
    if (centerX > 2 * horizontalThirds) {
      return 'right';
    }
    return 'center';
  }

  setThreshold(threshold: number): void {
    this.confidenceThreshold = threshold;
  }

  setCooldown(ms: number): void {
    this.cooldownMs = ms;
  }

  resetCooldown(): void {
    this.cooldowns = [];
    this.lastEmittedGesture = null;
    this.lastEmitTime = 0;
  }

  getGestureHistory(): GestureEvent[] {
    return [...this.gestureHistory];
  }

  onGesture(callback: GestureCallback): void {
    this.callbacks.push(callback);
  }

  removeGestureListener(callback: GestureCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  reset(): void {
    this.dynamicDetector.clearBuffer();
    this.frameHistory = [];
    this.cooldowns = [];
    this.gestureHistory = [];
    this.lastEmittedGesture = null;
    this.lastEmitTime = 0;
  }
}
