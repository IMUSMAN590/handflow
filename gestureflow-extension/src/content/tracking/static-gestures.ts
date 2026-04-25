import type { Landmark } from '../../shared/types/gesture';
import { GestureType } from '../../shared/types/gesture';
import { distance, angle } from '../../shared/utils/math';

export interface FingerStates {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface PalmOrientation {
  facing: 'up' | 'down' | 'left' | 'right' | 'toward' | 'away';
  confidence: number;
}

export interface FingerAngles {
  thumb: number[];
  index: number[];
  middle: number[];
  ring: number[];
  pinky: number[];
}

export interface LandmarkDistances {
  thumbIndexTip: number;
  thumbMiddleTip: number;
  thumbRingTip: number;
  thumbPinkyTip: number;
  indexMiddleTip: number;
  wristMiddleMcp: number;
  palmSize: number;
}

export interface StaticGestureResult {
  gestureType: GestureType | null;
  confidence: number;
}

const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_DIP = 11;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_DIP = 15;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_DIP = 19;
const PINKY_TIP = 20;

export function detectFingerStates(landmarks: Landmark[]): FingerStates {
  const thumbExtended = isThumbExtended(landmarks);
  const indexExtended = isFingerExtended(landmarks, INDEX_MCP, INDEX_PIP, INDEX_TIP);
  const middleExtended = isFingerExtended(landmarks, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_TIP);
  const ringExtended = isFingerExtended(landmarks, RING_MCP, RING_PIP, RING_TIP);
  const pinkyExtended = isFingerExtended(landmarks, PINKY_MCP, PINKY_PIP, PINKY_TIP);

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };
}

function isThumbExtended(landmarks: Landmark[]): boolean {
  const thumbTip = landmarks[THUMB_TIP];
  const thumbIp = landmarks[THUMB_IP];
  const indexMcp = landmarks[INDEX_MCP];

  const tipDist = distance(thumbTip, indexMcp);
  const ipDist = distance(thumbIp, indexMcp);

  return tipDist > ipDist;
}

function isFingerExtended(
  landmarks: Landmark[],
  mcp: number,
  pip: number,
  tip: number,
): boolean {
  const mcpPt = landmarks[mcp];
  const pipPt = landmarks[pip];
  const tipPt = landmarks[tip];

  const pipAngle = angle(mcpPt, pipPt, tipPt);
  return pipAngle > 150;
}

export function detectPalmOrientation(landmarks: Landmark[]): PalmOrientation {
  const wrist = landmarks[WRIST];
  const indexMcp = landmarks[INDEX_MCP];
  const pinkyMcp = landmarks[PINKY_MCP];

  const palmNormal = crossProduct(
    { x: indexMcp.x - wrist.x, y: indexMcp.y - wrist.y, z: indexMcp.z - wrist.z },
    { x: pinkyMcp.x - wrist.x, y: pinkyMcp.y - wrist.y, z: pinkyMcp.z - wrist.z },
  );

  const mag = Math.sqrt(
    palmNormal.x * palmNormal.x + palmNormal.y * palmNormal.y + palmNormal.z * palmNormal.z,
  );
  if (mag === 0) return { facing: 'toward', confidence: 0.5 };

  const nx = palmNormal.x / mag;
  const ny = palmNormal.y / mag;

  const absNx = Math.abs(nx);
  const absNy = Math.abs(ny);
  const confidence = Math.max(absNx, absNy);

  if (absNy > absNx) {
    return { facing: ny < 0 ? 'up' : 'down', confidence };
  }
  return { facing: nx < 0 ? 'left' : 'right', confidence };
}

function crossProduct(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function detectFingerAngles(landmarks: Landmark[]): FingerAngles {
  return {
    thumb: [
      angle(landmarks[WRIST], landmarks[THUMB_CMC], landmarks[THUMB_MCP]),
      angle(landmarks[THUMB_CMC], landmarks[THUMB_MCP], landmarks[THUMB_IP]),
      angle(landmarks[THUMB_MCP], landmarks[THUMB_IP], landmarks[THUMB_TIP]),
    ],
    index: [
      angle(landmarks[INDEX_MCP], landmarks[INDEX_PIP], landmarks[INDEX_DIP]),
      angle(landmarks[INDEX_PIP], landmarks[INDEX_DIP], landmarks[INDEX_TIP]),
    ],
    middle: [
      angle(landmarks[MIDDLE_MCP], landmarks[MIDDLE_PIP], landmarks[MIDDLE_DIP]),
      angle(landmarks[MIDDLE_PIP], landmarks[MIDDLE_DIP], landmarks[MIDDLE_TIP]),
    ],
    ring: [
      angle(landmarks[RING_MCP], landmarks[RING_PIP], landmarks[RING_DIP]),
      angle(landmarks[RING_PIP], landmarks[RING_DIP], landmarks[RING_TIP]),
    ],
    pinky: [
      angle(landmarks[PINKY_MCP], landmarks[PINKY_PIP], landmarks[PINKY_DIP]),
      angle(landmarks[PINKY_PIP], landmarks[PINKY_DIP], landmarks[PINKY_TIP]),
    ],
  };
}

export function calculateLandmarkDistances(landmarks: Landmark[]): LandmarkDistances {
  const palmSize = distance(landmarks[WRIST], landmarks[MIDDLE_MCP]);

  return {
    thumbIndexTip: distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / palmSize,
    thumbMiddleTip: distance(landmarks[THUMB_TIP], landmarks[MIDDLE_TIP]) / palmSize,
    thumbRingTip: distance(landmarks[THUMB_TIP], landmarks[RING_TIP]) / palmSize,
    thumbPinkyTip: distance(landmarks[THUMB_TIP], landmarks[PINKY_TIP]) / palmSize,
    indexMiddleTip: distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]) / palmSize,
    wristMiddleMcp: palmSize,
    palmSize,
  };
}

export function isOpenPalm(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);
  const extendedCount = Object.values(fingers).filter(Boolean).length;

  if (extendedCount === 5) {
    const dists = calculateLandmarkDistances(landmarks);
    const spreadness = dists.thumbIndexTip + dists.indexMiddleTip;
    const confidence = Math.min(1, 0.7 + spreadness * 0.1);
    return { detected: true, confidence };
  }
  if (extendedCount === 4 && !fingers.thumb) {
    return { detected: true, confidence: 0.8 };
  }
  return { detected: false, confidence: 0 };
}

export function isFist(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);
  const extendedCount = Object.values(fingers).filter(Boolean).length;

  if (extendedCount === 0) {
    const dists = calculateLandmarkDistances(landmarks);
    const tightness = 1 - dists.thumbIndexTip;
    const confidence = Math.min(1, 0.7 + tightness * 0.2);
    return { detected: true, confidence };
  }
  if (extendedCount === 1 && fingers.thumb) {
    return { detected: true, confidence: 0.6 };
  }
  return { detected: false, confidence: 0 };
}

export function isPeaceSign(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);

  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    const dists = calculateLandmarkDistances(landmarks);
    const vSpread = dists.indexMiddleTip;
    const confidence = Math.min(1, 0.75 + vSpread * 0.15);
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isThumbsUp(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);

  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    const thumbTip = landmarks[THUMB_TIP];
    const thumbIp = landmarks[THUMB_IP];
    const thumbMcp = landmarks[THUMB_MCP];
    const goingUp = thumbTip.y < thumbIp.y && thumbIp.y < thumbMcp.y;
    const confidence = goingUp ? 0.9 : 0.65;
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isThumbsDown(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);

  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    const thumbTip = landmarks[THUMB_TIP];
    const thumbIp = landmarks[THUMB_IP];
    const thumbMcp = landmarks[THUMB_MCP];
    const goingDown = thumbTip.y > thumbIp.y && thumbIp.y > thumbMcp.y;
    const confidence = goingDown ? 0.9 : 0.65;
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isPointIndex(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const fingers = detectFingerStates(landmarks);

  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    const confidence = fingers.thumb ? 0.75 : 0.9;
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isPinch(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const dists = calculateLandmarkDistances(landmarks);
  const pinchThreshold = 0.12;

  if (dists.thumbIndexTip < pinchThreshold) {
    const confidence = Math.min(1, 0.8 + (pinchThreshold - dists.thumbIndexTip) * 3);
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isSpread(landmarks: Landmark[]): { detected: boolean; confidence: number } {
  const dists = calculateLandmarkDistances(landmarks);
  const spreadThreshold = 0.5;

  if (dists.thumbIndexTip > spreadThreshold) {
    const confidence = Math.min(1, 0.75 + (dists.thumbIndexTip - spreadThreshold) * 0.5);
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function isWave(
  landmarks: Landmark[],
  frameHistory: Landmark[][],
): { detected: boolean; confidence: number } {
  if (frameHistory.length < 6) {
    return { detected: false, confidence: 0 };
  }

  const recentFrames = frameHistory.slice(-6);
  const wristXPositions = recentFrames.map((lm) => lm[WRIST].x);

  let directionChanges = 0;
  for (let i = 2; i < wristXPositions.length; i++) {
    const prev = wristXPositions[i - 2];
    const curr = wristXPositions[i];
    if (Math.abs(curr - prev) > 0.01) {
      const prevDir = wristXPositions[i - 1] - prev;
      const currDir = curr - wristXPositions[i - 1];
      if (prevDir * currDir < 0) {
        directionChanges++;
      }
    }
  }

  if (directionChanges >= 2) {
    const fingers = detectFingerStates(landmarks);
    const extendedCount = Object.values(fingers).filter(Boolean).length;
    const hasOpenHand = extendedCount >= 3;
    const confidence = hasOpenHand ? 0.85 : 0.6;
    return { detected: true, confidence };
  }
  return { detected: false, confidence: 0 };
}

export function classifyStaticGesture(
  landmarks: Landmark[],
  _handedness: string,
): StaticGestureResult {
  const checks: Array<{ check: { detected: boolean; confidence: number }; type: GestureType }> = [
    { check: isOpenPalm(landmarks), type: GestureType.OPEN_PALM },
    { check: isFist(landmarks), type: GestureType.FIST },
    { check: isPeaceSign(landmarks), type: GestureType.PEACE },
    { check: isThumbsUp(landmarks), type: GestureType.THUMBS_UP },
    { check: isPointIndex(landmarks), type: GestureType.POINT },
    { check: isPinch(landmarks), type: GestureType.PINCH },
  ];

  let bestGesture: GestureType | null = null;
  let bestConfidence = 0;

  for (const { check, type } of checks) {
    if (check.detected && check.confidence > bestConfidence) {
      bestGesture = type;
      bestConfidence = check.confidence;
    }
  }

  return { gestureType: bestGesture, confidence: bestConfidence };
}
