import type { Landmark } from '../../shared/types/gesture';
import { distance } from '../../shared/utils/math';
import {
  detectFingerStates,
  isOpenPalm,
  isFist,
  isPointIndex,
} from './static-gestures';

export interface TwoHandGestureResult {
  gestureType: string | null;
  confidence: number;
}

interface DistanceEntry {
  distance: number;
  timestamp: number;
}

const MAX_HISTORY = 30;
const SPREAD_THRESHOLD = 0.05;
const TOGETHER_THRESHOLD = 0.05;
const CLAP_VELOCITY_THRESHOLD = 0.0005;
const CROSS_X_THRESHOLD = 0.1;

export class TwoHandDetector {
  private distanceHistory: DistanceEntry[] = [];

  detect(landmarks: Landmark[][]): TwoHandGestureResult {
    if (landmarks.length !== 2) {
      return { gestureType: null, confidence: 0 };
    }

    const left = landmarks[0];
    const right = landmarks[1];

    this.updateDistanceHistory(left, right);

    const checks: Array<{ result: TwoHandGestureResult; priority: number }> = [
      { result: this.isClap(left, right), priority: 10 },
      { result: this.isCrossHands(left, right), priority: 9 },
      { result: this.isBothPalmsOpen(left, right), priority: 5 },
      { result: this.isBothFists(left, right), priority: 5 },
      { result: this.isHandsSpreadApart(left, right), priority: 7 },
      { result: this.isHandsComeTogether(left, right), priority: 7 },
      { result: this.isLeftPointRightSwipe(left, right), priority: 6 },
    ];

    let bestResult: TwoHandGestureResult = { gestureType: null, confidence: 0 };
    let bestPriority = -1;

    for (const { result, priority } of checks) {
      if (
        result.gestureType !== null &&
        result.confidence > 0 &&
        (priority > bestPriority ||
          (priority === bestPriority && result.confidence > bestResult.confidence))
      ) {
        bestResult = result;
        bestPriority = priority;
      }
    }

    return bestResult;
  }

  isBothPalmsOpen(left: Landmark[], right: Landmark[]): TwoHandGestureResult {
    const leftPalm = isOpenPalm(left);
    const rightPalm = isOpenPalm(right);

    if (leftPalm.detected && rightPalm.detected) {
      const confidence = (leftPalm.confidence + rightPalm.confidence) / 2;
      return { gestureType: 'split_screen', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  isBothFists(left: Landmark[], right: Landmark[]): TwoHandGestureResult {
    const leftFist = isFist(left);
    const rightFist = isFist(right);

    if (leftFist.detected && rightFist.detected) {
      const confidence = (leftFist.confidence + rightFist.confidence) / 2;
      return { gestureType: 'close_all_tabs', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  isHandsSpreadApart(_left: Landmark[], _right: Landmark[]): TwoHandGestureResult {
    if (this.distanceHistory.length < 3) {
      return { gestureType: null, confidence: 0 };
    }

    const recent = this.distanceHistory.slice(-5);
    const oldest = recent[0].distance;
    const newest = recent[recent.length - 1].distance;
    const delta = newest - oldest;

    if (delta > SPREAD_THRESHOLD) {
      const confidence = Math.min(1, 0.6 + delta * 3);
      return { gestureType: 'zoom_in', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  isHandsComeTogether(_left: Landmark[], _right: Landmark[]): TwoHandGestureResult {
    if (this.distanceHistory.length < 3) {
      return { gestureType: null, confidence: 0 };
    }

    const recent = this.distanceHistory.slice(-5);
    const oldest = recent[0].distance;
    const newest = recent[recent.length - 1].distance;
    const delta = oldest - newest;

    if (delta > TOGETHER_THRESHOLD) {
      const confidence = Math.min(1, 0.6 + delta * 3);
      return { gestureType: 'zoom_out', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  isLeftPointRightSwipe(left: Landmark[], right: Landmark[]): TwoHandGestureResult {
    const leftPoint = isPointIndex(left);
    const rightFingers = detectFingerStates(right);

    const rightExtendedCount = Object.values(rightFingers).filter(Boolean).length;
    const rightIsOpenish = rightExtendedCount >= 3;

    if (leftPoint.detected && rightIsOpenish) {
      const rightWrist = right[0];
      const rightMiddleTip = right[12];
      const swipeDx = rightMiddleTip.x - rightWrist.x;

      if (Math.abs(swipeDx) > 0.1) {
        const confidence = Math.min(1, leftPoint.confidence * 0.8 + 0.2);
        return { gestureType: 'drag_simulation', confidence };
      }
    }
    return { gestureType: null, confidence: 0 };
  }

  isCrossHands(left: Landmark[], right: Landmark[]): TwoHandGestureResult {
    const leftWrist = left[0];
    const rightWrist = right[0];
    const leftMiddleTip = left[12];
    const rightMiddleTip = right[12];

    const leftIsRight = leftMiddleTip.x > leftWrist.x;
    const rightIsLeft = rightMiddleTip.x < rightWrist.x;

    const crossDistance = Math.abs(leftMiddleTip.x - rightMiddleTip.x);

    if (leftIsRight && rightIsLeft && crossDistance < CROSS_X_THRESHOLD) {
      const confidence = Math.min(1, 0.7 + (CROSS_X_THRESHOLD - crossDistance) * 2);
      return { gestureType: 'close_browser', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  isClap(_left: Landmark[], _right: Landmark[]): TwoHandGestureResult {
    if (this.distanceHistory.length < 3) {
      return { gestureType: null, confidence: 0 };
    }

    const recent = this.distanceHistory.slice(-3);
    const velocity =
      (recent[recent.length - 1].distance - recent[0].distance) /
      (recent[recent.length - 1].timestamp - recent[0].timestamp || 1);

    const currentDist = recent[recent.length - 1].distance;

    if (velocity < -CLAP_VELOCITY_THRESHOLD && currentDist < 0.15) {
      const confidence = Math.min(1, 0.7 + Math.abs(velocity) * 500);
      return { gestureType: 'screenshot', confidence };
    }
    return { gestureType: null, confidence: 0 };
  }

  private updateDistanceHistory(left: Landmark[], right: Landmark[]): void {
    const leftCenter = this.getHandCenter(left);
    const rightCenter = this.getHandCenter(right);
    const dist = distance(leftCenter, rightCenter);
    const timestamp = performance.now();

    this.distanceHistory.push({ distance: dist, timestamp });
    if (this.distanceHistory.length > MAX_HISTORY) {
      this.distanceHistory.shift();
    }
  }

  private getHandCenter(landmarks: Landmark[]): Landmark {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    return {
      x: (wrist.x + middleMcp.x) / 2,
      y: (wrist.y + middleMcp.y) / 2,
      z: (wrist.z + middleMcp.z) / 2,
    };
  }

  getRelativePositions(
    left: Landmark[],
    right: Landmark[],
  ): { leftCenter: Landmark; rightCenter: Landmark; distance: number } {
    const leftCenter = this.getHandCenter(left);
    const rightCenter = this.getHandCenter(right);
    return {
      leftCenter,
      rightCenter,
      distance: distance(leftCenter, rightCenter),
    };
  }

  clearHistory(): void {
    this.distanceHistory = [];
  }
}
