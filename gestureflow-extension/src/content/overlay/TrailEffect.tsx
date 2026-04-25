import React, { useRef, useEffect, useCallback } from 'react';
import type { Landmark } from '@shared/types/gesture';

const TRAIL_LENGTH = 30;
const LINE_WIDTH = 3;
const PRIMARY_COLOR = '#0EA5E9';

interface TrailEffectProps {
  landmarks: Landmark[] | null;
  width: number;
  height: number;
  clearSignal?: number;
}

export const TrailEffect: React.FC<TrailEffectProps> = ({
  landmarks,
  width,
  height,
  clearSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const trail = trailRef.current;
    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = PRIMARY_COLOR;
      ctx.globalAlpha = alpha * 0.8;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [width, height]);

  useEffect(() => {
    if (landmarks && landmarks.length > 9) {
      const indexTip = landmarks[8];
      trailRef.current.push({ x: indexTip.x * width, y: indexTip.y * height });
      if (trailRef.current.length > TRAIL_LENGTH) {
        trailRef.current.shift();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [landmarks, width, height, draw]);

  useEffect(() => {
    trailRef.current = [];
  }, [clearSignal]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
