import type { Landmark } from '../../shared/types/gesture';
import { GestureType } from '../../shared/types/gesture';

export interface DynamicGestureResult {
  gestureType: GestureType | null;
  confidence: number;
  direction?: string;
}

interface FrameEntry {
  landmarks: Landmark[];
  timestamp: number;
}

type Direction8 =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right';

const MAX_BUFFER_SIZE = 30;
const SWIPE_MIN_VELOCITY = 0.015;
const SWIPE_MIN_FRAMES = 5;
const SWIPE_MAX_DURATION_MS = 500;
const WAVE_MIN_DIRECTION_CHANGES = 3;
const WAVE_MIN_AMPLITUDE = 0.03;

export class DynamicGestureDetector {
  private buffer: FrameEntry[] = [];

  addFrame(landmarks: Landmark[], timestamp: number): void {
    this.buffer.push({ landmarks, timestamp });
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  detectSwipe(landmarks: Landmark[], timestamp: number): DynamicGestureResult {
    this.addFrame(landmarks, timestamp);

    if (this.buffer.length < SWIPE_MIN_FRAMES) {
      return { gestureType: null, confidence: 0 };
    }

    const trajectory = this.calculateTrajectory(this.buffer);
    if (trajectory.length < 2) {
      return { gestureType: null, confidence: 0 };
    }

    const start = trajectory[0];
    const end = trajectory[trajectory.length - 1];
    const duration = this.buffer[this.buffer.length - 1].timestamp - this.buffer[0].timestamp;

    if (duration > SWIPE_MAX_DURATION_MS || duration === 0) {
      return { gestureType: null, confidence: 0 };
    }

    const velocity = this.calculateVelocity(
      this.buffer.map((f) => f.landmarks),
      this.buffer.map((f) => f.timestamp),
    );

    if (velocity < SWIPE_MIN_VELOCITY) {
      return { gestureType: null, confidence: 0 };
    }

    const direction = this.getDirection(start, end);
    const displacement = Math.sqrt(
      (end.x - start.x) ** 2 + (end.y - start.y) ** 2,
    );
    const confidence = Math.min(1, 0.6 + displacement * 2 + velocity * 0.5);

    const gestureMap: Record<string, GestureType> = {
      left: GestureType.SWIPE_LEFT,
      right: GestureType.SWIPE_RIGHT,
      up: GestureType.SWIPE_UP,
      down: GestureType.SWIPE_DOWN,
    };

    const gestureType = gestureMap[direction] ?? null;

    if (gestureType) {
      this.buffer = [];
      return { gestureType, confidence, direction };
    }

    return { gestureType: null, confidence: 0 };
  }

  detectWave(landmarks: Landmark[], timestamp: number): DynamicGestureResult {
    this.addFrame(landmarks, timestamp);

    if (this.buffer.length < 8) {
      return { gestureType: null, confidence: 0 };
    }

    const wristPositions = this.buffer.map((f) => ({
      x: f.landmarks[0].x,
      y: f.landmarks[0].y,
    }));

    let directionChanges = 0;
    for (let i = 2; i < wristPositions.length; i++) {
      const prev = wristPositions[i - 2].x;
      const mid = wristPositions[i - 1].x;
      const curr = wristPositions[i].x;

      const diff1 = mid - prev;
      const diff2 = curr - mid;

      if (Math.abs(diff1) > WAVE_MIN_AMPLITUDE && Math.abs(diff2) > WAVE_MIN_AMPLITUDE) {
        if (diff1 * diff2 < 0) {
          directionChanges++;
        }
      }
    }

    if (directionChanges >= WAVE_MIN_DIRECTION_CHANGES) {
      const confidence = Math.min(1, 0.6 + directionChanges * 0.08);
      this.buffer = [];
      return { gestureType: GestureType.WAVE, confidence, direction: 'wave' };
    }

    return { gestureType: null, confidence: 0 };
  }

  calculateVelocity(
    landmarks: Landmark[][],
    timestamps: number[],
  ): number {
    if (landmarks.length < 2 || timestamps.length < 2) return 0;

    let totalDisplacement = 0;
    for (let i = 1; i < landmarks.length; i++) {
      const prev = landmarks[i - 1][0];
      const curr = landmarks[i][0];
      totalDisplacement += Math.sqrt(
        (curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2,
      );
    }

    const totalTime = timestamps[timestamps.length - 1] - timestamps[0];
    if (totalTime === 0) return 0;

    return totalDisplacement / totalTime;
  }

  calculateTrajectory(entries: FrameEntry[]): Landmark[] {
    return entries.map((entry) => {
      const wrist = entry.landmarks[0];
      return { x: wrist.x, y: wrist.y, z: wrist.z };
    });
  }

  getDirection(
    start: Landmark,
    end: Landmark,
  ): Direction8 {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const threshold = 0.3;

    if (absDx > absDy * (1 + threshold)) {
      return dx > 0 ? 'right' : 'left';
    }
    if (absDy > absDx * (1 + threshold)) {
      return dy > 0 ? 'down' : 'up';
    }

    if (dx > 0 && dy < 0) return 'up-right';
    if (dx < 0 && dy < 0) return 'up-left';
    if (dx > 0 && dy > 0) return 'down-right';
    return 'down-left';
  }

  getGestureDuration(): number {
    if (this.buffer.length < 2) return 0;
    return this.buffer[this.buffer.length - 1].timestamp - this.buffer[0].timestamp;
  }

  clearBuffer(): void {
    this.buffer = [];
  }
}
