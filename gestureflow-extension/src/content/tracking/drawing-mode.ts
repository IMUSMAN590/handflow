import type { Landmark } from '../../shared/types/gesture';
import { distance } from '../../shared/utils/math';

export interface DrawingShape {
  type: 'circle' | 'x' | 'checkmark' | 'arrow_left' | 'arrow_right' | 'arrow_up' | 'arrow_down' | 'line';
  confidence: number;
  center: { x: number; y: number };
}

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

const MIN_POINTS = 15;
const CIRCLE_CLOSED_THRESHOLD = 0.15;
const CIRCLE_CIRCULARITY_THRESHOLD = 0.6;

export class DrawingModeDetector {
  private pointBuffer: Point[] = [];
  private isDrawing = false;
  private lastTipPosition: { x: number; y: number } | null = null;
  private readonly BUFFER_MAX = 200;

  addPoint(landmarks: Landmark[], timestamp: number): void {
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const isPinching = distance(indexTip, thumbTip) < 0.06;

    if (isPinching) {
      if (!this.isDrawing) {
        this.isDrawing = true;
        this.pointBuffer = [];
      }
      this.pointBuffer.push({
        x: indexTip.x,
        y: indexTip.y,
        timestamp,
      });
      if (this.pointBuffer.length > this.BUFFER_MAX) {
        this.pointBuffer.shift();
      }
    } else {
      if (this.isDrawing && this.pointBuffer.length >= MIN_POINTS) {
        this.isDrawing = false;
      } else {
        this.isDrawing = false;
        this.pointBuffer = [];
      }
    }

    this.lastTipPosition = { x: indexTip.x, y: indexTip.y };
  }

  detectShape(): DrawingShape | null {
    if (this.pointBuffer.length < MIN_POINTS) return null;

    const points = [...this.pointBuffer];
    this.pointBuffer = [];

    const circleResult = this.detectCircle(points);
    if (circleResult) return circleResult;

    const xResult = this.detectX(points);
    if (xResult) return xResult;

    const checkResult = this.detectCheckmark(points);
    if (checkResult) return checkResult;

    const arrowResult = this.detectArrow(points);
    if (arrowResult) return arrowResult;

    return null;
  }

  private detectCircle(points: Point[]): DrawingShape | null {
    const first = points[0];
    const last = points[points.length - 1];
    const closeDistance = Math.sqrt(
      (first.x - last.x) ** 2 + (first.y - last.y) ** 2,
    );

    const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
    const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
    const avgRadius = points.reduce(
      (s, p) => s + Math.sqrt((p.x - avgX) ** 2 + (p.y - avgY) ** 2),
      0,
    ) / points.length;

    const variance = points.reduce(
      (s, p) =>
        s + (Math.sqrt((p.x - avgX) ** 2 + (p.y - avgY) ** 2) - avgRadius) ** 2,
      0,
    ) / points.length;
    const stdDev = Math.sqrt(variance);
    const circularity = avgRadius > 0 ? 1 - stdDev / avgRadius : 0;

    if (
      closeDistance < CIRCLE_CLOSED_THRESHOLD &&
      circularity > CIRCLE_CIRCULARITY_THRESHOLD
    ) {
      return {
        type: 'circle',
        confidence: Math.min(1, circularity * 1.2),
        center: { x: avgX, y: avgY },
      };
    }

    return null;
  }

  private detectX(points: Point[]): DrawingShape | null {
    if (points.length < 20) return null;

    const first = points[0];
    const mid = points[Math.floor(points.length / 2)];
    const last = points[points.length - 1];

    const dxFirst = mid.x - first.x;
    const dyFirst = mid.y - first.y;
    const dxLast = last.x - mid.x;
    const dyLast = last.y - mid.y;

    const crossProduct = dxFirst * dyLast - dyFirst * dxLast;
    const magFirst = Math.sqrt(dxFirst * dxFirst + dyFirst * dyFirst);
    const magLast = Math.sqrt(dxLast * dxLast + dyLast * dyLast);

    if (magFirst === 0 || magLast === 0) return null;

    const angle = Math.abs(Math.atan2(crossProduct, dxFirst * dxLast + dyFirst * dyLast));

    if (angle > Math.PI * 0.4 && angle < Math.PI * 0.9) {
      const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
      return {
        type: 'x',
        confidence: Math.min(1, 0.6 + (1 - Math.abs(angle - Math.PI / 2) / (Math.PI / 2)) * 0.4),
        center: { x: avgX, y: avgY },
      };
    }

    return null;
  }

  private detectCheckmark(points: Point[]): DrawingShape | null {
    if (points.length < 10) return null;

    const first = points[0];
    const mid = points[Math.floor(points.length * 0.4)];
    const last = points[points.length - 1];

    const goesDown = mid.y > first.y;
    const goesUp = last.y < mid.y;
    const goesRight = last.x > mid.x;

    if (goesDown && goesUp && goesRight) {
      const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
      return {
        type: 'checkmark',
        confidence: 0.75,
        center: { x: avgX, y: avgY },
      };
    }

    return null;
  }

  private detectArrow(points: Point[]): DrawingShape | null {
    if (points.length < 8) return null;

    const first = points[0];
    const last = points[points.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) return null;

    const angle = Math.atan2(dy, dx);
    const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
    const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;

    if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
      return { type: 'arrow_right', confidence: 0.7, center: { x: avgX, y: avgY } };
    }
    if (angle > (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
      return { type: 'arrow_left', confidence: 0.7, center: { x: avgX, y: avgY } };
    }
    if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4) {
      return { type: 'arrow_down', confidence: 0.7, center: { x: avgX, y: avgY } };
    }
    if (angle > -(3 * Math.PI) / 4 && angle < -Math.PI / 4) {
      return { type: 'arrow_up', confidence: 0.7, center: { x: avgX, y: avgY } };
    }

    return null;
  }

  getIsDrawing(): boolean {
    return this.isDrawing;
  }

  getDrawingPoints(): Point[] {
    return [...this.pointBuffer];
  }

  getLastTipPosition(): { x: number; y: number } | null {
    return this.lastTipPosition;
  }

  clear(): void {
    this.pointBuffer = [];
    this.isDrawing = false;
  }
}

export const DRAWING_ACTION_MAP: Record<DrawingShape['type'], string> = {
  circle: 'openLink',
  x: 'closeTab',
  checkmark: 'like',
  arrow_left: 'goBack',
  arrow_right: 'goForward',
  arrow_up: 'scrollUp',
  arrow_down: 'scrollDown',
  line: 'scrollDown',
};
