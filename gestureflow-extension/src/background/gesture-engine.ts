import type { Landmark, GestureEvent, LandmarkFrame } from '../shared/types/gesture';
import { GestureType } from '../shared/types/gesture';
import type { Gesture } from '../shared/types/gesture';
import { PRESET_GESTURES } from '../shared/constants/gestures';

type Zone = 'top' | 'left' | 'center' | 'right' | 'bottom';

interface CooldownState {
  lastTriggered: Record<string, number>;
  lastGestureTime: number;
}

interface MacroCheckResult {
  isMacroProgress: boolean;
  macroId: string | null;
  isComplete: boolean;
}

type GestureEventCallback = (event: GestureEvent) => void;
type MacroCheckCallback = (gestureId: string) => MacroCheckResult;

export class GestureEngine {
  private gestures: Gesture[];
  private confidenceThreshold: number;
  private cooldownDuration: number;
  private debounceMs: number;
  private cooldownState: CooldownState;
  private frameBuffer: LandmarkFrame[];
  private readonly FRAME_BUFFER_SIZE = 10;
  private onGestureEvent: GestureEventCallback | null;
  private onMacroCheck: MacroCheckCallback | null;

  constructor() {
    this.gestures = [...PRESET_GESTURES];
    this.confidenceThreshold = 0.7;
    this.cooldownDuration = 500;
    this.debounceMs = 150;
    this.cooldownState = { lastTriggered: {}, lastGestureTime: 0 };
    this.frameBuffer = [];
    this.onGestureEvent = null;
    this.onMacroCheck = null;
  }

  setGestures(gestures: Gesture[]): void {
    this.gestures = gestures.filter((g) => g.isEnabled);
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  setCooldownDuration(ms: number): void {
    this.cooldownDuration = Math.max(0, ms);
  }

  setDebounceMs(ms: number): void {
    this.debounceMs = Math.max(0, ms);
  }

  setGestureCallback(callback: GestureEventCallback): void {
    this.onGestureEvent = callback;
  }

  setMacroCheckCallback(callback: MacroCheckCallback): void {
    this.onMacroCheck = callback;
  }

  processLandmarks(landmarks: Landmark[], handedness: 'Left' | 'Right'): GestureEvent | null {
    const frame: LandmarkFrame = {
      landmarks,
      timestamp: Date.now(),
      handedness,
    };

    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.FRAME_BUFFER_SIZE) {
      this.frameBuffer.shift();
    }

    const classification = this.classifyGesture(landmarks);
    if (!classification) {
      return null;
    }

    const confidence = this.calculateConfidence(classification);
    if (confidence < this.confidenceThreshold) {
      return null;
    }

    if (!this.applyCooldown(classification.id)) {
      return null;
    }

    if (!this.applyDebounce()) {
      return null;
    }

    const zone = this.determineZone(landmarks);

    if (this.onMacroCheck) {
      const macroResult = this.onMacroCheck(classification.id);
      if (macroResult.isMacroProgress && !macroResult.isComplete) {
        return null;
      }
    }

    const event: GestureEvent = {
      gestureId: classification.id,
      confidence,
      timestamp: Date.now(),
      zone,
      landmarks,
    };

    this.cooldownState.lastTriggered[classification.id] = Date.now();
    this.cooldownState.lastGestureTime = Date.now();

    if (this.onGestureEvent) {
      this.onGestureEvent(event);
    }

    return event;
  }

  classifyGesture(landmarks: Landmark[]): Gesture | null {
    if (landmarks.length < 21) return null;

    const staticGesture = this.classifyStaticGesture(landmarks);
    if (staticGesture) return staticGesture;

    if (this.frameBuffer.length >= 3) {
      const dynamicGesture = this.classifyDynamicGesture();
      if (dynamicGesture) return dynamicGesture;
    }

    return null;
  }

  calculateConfidence(gesture: Gesture): number {
    const baseConfidence = gesture.confidence ?? 0.7;
    const landmarkCount = this.frameBuffer.length;
    const bufferFactor = Math.min(landmarkCount / this.FRAME_BUFFER_SIZE, 1);
    const adjustedConfidence = baseConfidence * (0.7 + 0.3 * bufferFactor);
    return Math.min(adjustedConfidence, 1);
  }

  applyCooldown(gestureId: string): boolean {
    const lastTriggered = this.cooldownState.lastTriggered[gestureId];
    if (lastTriggered === undefined) return true;

    const gesture = this.gestures.find((g) => g.id === gestureId);
    const cooldownMs = gesture?.cooldown ?? this.cooldownDuration;
    return Date.now() - lastTriggered >= cooldownMs;
  }

  applyDebounce(): boolean {
    return Date.now() - this.cooldownState.lastGestureTime >= this.debounceMs;
  }

  emitGestureEvent(gesture: Gesture, confidence: number): GestureEvent {
    const event: GestureEvent = {
      gestureId: gesture.id,
      confidence,
      timestamp: Date.now(),
    };

    if (this.onGestureEvent) {
      this.onGestureEvent(event);
    }

    return event;
  }

  determineZone(landmarks: Landmark[]): Zone {
    if (landmarks.length < 9) return 'center';

    const wrist = landmarks[0];
    const middleMcp = landmarks[9];

    const centerX = (wrist.x + middleMcp.x) / 2;
    const centerY = (wrist.y + middleMcp.y) / 2;

    if (centerY < 0.33) return 'top';
    if (centerY > 0.66) return 'bottom';
    if (centerX < 0.33) return 'left';
    if (centerX > 0.66) return 'right';
    return 'center';
  }

  resetState(): void {
    this.cooldownState = { lastTriggered: {}, lastGestureTime: 0 };
    this.frameBuffer = [];
  }

  private classifyStaticGesture(landmarks: Landmark[]): Gesture | null {
    const fingerStates = this.getFingerStates(landmarks);
    const { thumbUp, indexUp, middleUp, ringUp, pinkyUp } = fingerStates;

    const isPinch = this.isPinch(landmarks);
    const isOkSign = this.isOkSign(landmarks);

    if (isOkSign) {
      return this.findGestureByPose(GestureType.OK_SIGN);
    }

    if (isPinch) {
      return this.findGestureByPose(GestureType.PINCH);
    }

    if (!thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) {
      return this.findGestureByPose(GestureType.POINT);
    }

    if (!thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) {
      return this.findGestureByPose(GestureType.PEACE);
    }

    if (indexUp && pinkyUp && !middleUp && !ringUp) {
      return this.findGestureByPose(GestureType.ROCK);
    }

    if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      return this.findGestureByPose(GestureType.FIST);
    }

    if (thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
      const isSpread = this.isSpread(landmarks);
      if (isSpread) {
        return this.findGestureByPose(GestureType.SPREAD);
      }
      return this.findGestureByPose(GestureType.OPEN_PALM);
    }

    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      const thumbTip = landmarks[4];
      const thumbIp = landmarks[3];
      const thumbMcp = landmarks[2];
      if (thumbTip.y > thumbIp.y && thumbIp.y > thumbMcp.y) {
        return this.findGestureByPose(GestureType.THUMBS_DOWN);
      }
      return this.findGestureByPose(GestureType.THUMBS_UP);
    }

    return null;
  }

  private classifyDynamicGesture(): Gesture | null {
    const recent = this.frameBuffer.slice(-5);
    if (recent.length < 3) return null;

    const first = recent[0];
    const last = recent[recent.length - 1];

    const dx = last.landmarks[0].x - first.landmarks[0].x;
    const dy = last.landmarks[0].y - first.landmarks[0].y;
    const dt = last.timestamp - first.timestamp;

    if (dt === 0) return null;

    const velocityX = dx / dt;
    const velocityY = dy / dt;

    const swipeThreshold = 0.0005;

    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      if (velocityX > swipeThreshold) {
        return this.findGestureByPose(GestureType.SWIPE_RIGHT);
      }
      if (velocityX < -swipeThreshold) {
        return this.findGestureByPose(GestureType.SWIPE_LEFT);
      }
    } else {
      if (velocityY > swipeThreshold) {
        return this.findGestureByPose(GestureType.SWIPE_DOWN);
      }
      if (velocityY < -swipeThreshold) {
        return this.findGestureByPose(GestureType.SWIPE_UP);
      }
    }

    if (this.detectRotation(recent)) {
      return this.findGestureByPose(GestureType.ROTATE);
    }

    return null;
  }

  private getFingerStates(landmarks: Landmark[]): {
    thumbUp: boolean;
    indexUp: boolean;
    middleUp: boolean;
    ringUp: boolean;
    pinkyUp: boolean;
  } {
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    return {
      thumbUp: thumbTip.x < thumbIp.x,
      indexUp: indexTip.y < indexPip.y,
      middleUp: middleTip.y < middlePip.y,
      ringUp: ringTip.y < ringPip.y,
      pinkyUp: pinkyTip.y < pinkyPip.y,
    };
  }

  private isPinch(landmarks: Landmark[]): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.hypot(
      thumbTip.x - indexTip.x,
      thumbTip.y - indexTip.y,
      thumbTip.z - indexTip.z,
    );
    return distance < 0.05;
  }

  private isOkSign(landmarks: Landmark[]): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.hypot(
      thumbTip.x - indexTip.x,
      thumbTip.y - indexTip.y,
    );
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    return distance < 0.06 && middleTip.y < middlePip.y;
  }

  private isSpread(landmarks: Landmark[]): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];
    const palmSize = Math.hypot(wrist.x - landmarks[9].x, wrist.y - landmarks[9].y);
    if (palmSize === 0) return false;
    const avgFingerDist = (
      Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y) +
      Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y) +
      Math.hypot(middleTip.x - ringTip.x, middleTip.y - ringTip.y) +
      Math.hypot(ringTip.x - pinkyTip.x, ringTip.y - pinkyTip.y)
    ) / 4 / palmSize;
    return avgFingerDist > 0.5;
  }

  private detectRotation(frames: LandmarkFrame[]): boolean {
    if (frames.length < 4) return false;

    let angleSum = 0;
    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1].landmarks[9];
      const curr = frames[i].landmarks[9];
      const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      angleSum += angle;
    }

    return Math.abs(angleSum) > Math.PI * 0.5;
  }

  private findGestureByPose(pose: GestureType): Gesture | null {
    return this.gestures.find((g) => g.handPose === pose && g.isEnabled) ?? null;
  }
}
