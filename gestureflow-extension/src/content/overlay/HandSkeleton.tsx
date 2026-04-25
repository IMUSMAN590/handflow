import { useRef, useEffect, useCallback } from 'react';
import type { LandmarkFrame } from '@shared/types/gesture';

const FINGER_COLORS: Record<string, string> = {
  thumb: '#F97316',
  index: '#0EA5E9',
  middle: '#10B981',
  ring: '#F59E0B',
  pinky: '#EF4444',
};

const WRIST_COLOR = '#FFFFFF';
const PALM_COLOR = '#94A3B8';

const FINGER_CONNECTIONS: [number, number, string][] = [
  [0, 1, 'thumb'], [1, 2, 'thumb'], [2, 3, 'thumb'], [3, 4, 'thumb'],
  [0, 5, 'palm'], [0, 17, 'palm'],
  [5, 6, 'index'], [6, 7, 'index'], [7, 8, 'index'],
  [5, 9, 'palm'], [9, 10, 'middle'], [10, 11, 'middle'], [11, 12, 'middle'],
  [9, 13, 'palm'], [13, 14, 'ring'], [14, 15, 'ring'], [15, 16, 'ring'],
  [13, 17, 'palm'], [17, 18, 'pinky'], [18, 19, 'pinky'], [19, 20, 'pinky'],
];

const LANDMARK_RADIUS = 4;
const LINE_WIDTH = 2;

interface HandSkeletonProps {
  frames: LandmarkFrame[];
  width: number;
  height: number;
  confidence?: number;
}

export const HandSkeleton: React.FC<HandSkeletonProps> = ({
  frames,
  width,
  height,
  confidence = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = confidence;

    for (const frame of frames) {
      const { landmarks } = frame;

      for (const [start, end, group] of FINGER_CONNECTIONS) {
        const a = landmarks[start];
        const b = landmarks[end];
        if (!a || !b) continue;

        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.strokeStyle = group === 'palm' ? PALM_COLOR : FINGER_COLORS[group];
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
      }

      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        if (!lm) continue;

        let color = WRIST_COLOR;
        if (i >= 1 && i <= 4) color = FINGER_COLORS.thumb;
        else if (i >= 5 && i <= 8) color = FINGER_COLORS.index;
        else if (i >= 9 && i <= 12) color = FINGER_COLORS.middle;
        else if (i >= 13 && i <= 16) color = FINGER_COLORS.ring;
        else if (i >= 17 && i <= 20) color = FINGER_COLORS.pinky;

        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, LANDMARK_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }, [frames, width, height, confidence]);

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
