import type { Landmark } from '../../shared/types/gesture';

export type ProximityLevel = 'close' | 'medium' | 'far';

export interface ProximityState {
  level: ProximityLevel;
  distance: number;
  scaleFactor: number;
}

const CLOSE_THRESHOLD = 0.15;
const FAR_THRESHOLD = 0.35;

export class ProximityDetector {
  private readonly BASE_HAND_SIZE = 0.2;

  detect(landmarks: Landmark[]): ProximityState {
    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];

    const handHeight = Math.sqrt(
      (middleTip.x - wrist.x) ** 2 + (middleTip.y - wrist.y) ** 2,
    );
    const handWidth = Math.sqrt(
      (pinkyMcp.x - indexMcp.x) ** 2 + (pinkyMcp.y - indexMcp.y) ** 2,
    );

    const handSize = (handHeight + handWidth) / 2;
    const distance = this.BASE_HAND_SIZE / Math.max(handSize, 0.01);

    let level: ProximityLevel;
    let scaleFactor: number;

    if (handSize > FAR_THRESHOLD) {
      level = 'close';
      scaleFactor = 0.5;
    } else if (handSize > CLOSE_THRESHOLD) {
      level = 'medium';
      scaleFactor = 1.0;
    } else {
      level = 'far';
      scaleFactor = 1.5;
    }

    return { level, distance, scaleFactor };
  }
}

export const PROXIMITY_BEHAVIORS: Record<ProximityLevel, { description: string; gestureSpeed: 'slow' | 'normal' | 'fast'; actionMultiplier: number }> = {
  close: {
    description: 'Pause actions (safety)',
    gestureSpeed: 'slow',
    actionMultiplier: 0,
  },
  medium: {
    description: 'Normal mode',
    gestureSpeed: 'normal',
    actionMultiplier: 1,
  },
  far: {
    description: 'Exaggerated mode (presentations)',
    gestureSpeed: 'fast',
    actionMultiplier: 1.5,
  },
};
