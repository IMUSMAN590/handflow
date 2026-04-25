import React, { useRef, useEffect, useState } from 'react';
import type { LandmarkFrame } from '@shared/types/gesture';
import { HandSkeleton } from './HandSkeleton';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  frames: LandmarkFrame[];
  fps: number;
  showSkeleton: boolean;
  showZones: boolean;
  width: number;
  height: number;
}

const ZONE_LINES_COLOR = 'rgba(14,165,233,0.3)';
const ZONE_LABEL_COLOR = 'rgba(148,163,184,0.6)';

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  frames,
  fps,
  showSkeleton,
  showZones,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const check = () => {
      setCameraActive(
        video.readyState >= 2 &&
        video.srcObject !== null &&
        (video.srcObject as MediaStream | null)?.active === true,
      );
    };

    const interval = setInterval(check, 500);
    check();

    return () => clearInterval(interval);
  }, [videoRef]);

  useEffect(() => {
    if (!showZones) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = ZONE_LINES_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((2 * width) / 3, 0);
    ctx.lineTo((2 * width) / 3, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, (2 * height) / 3);
    ctx.lineTo(width, (2 * height) / 3);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillStyle = ZONE_LABEL_COLOR;

    ctx.fillText('T', width / 2 - 3, height / 6);
    ctx.fillText('L', width / 6 - 3, height / 2);
    ctx.fillText('C', width / 2 - 3, height / 2);
    ctx.fillText('R', (5 * width) / 6 - 3, height / 2);
    ctx.fillText('B', width / 2 - 3, (5 * height) / 6);
  }, [showZones, width, height]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded bg-dark-bg">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />

      {showSkeleton && frames.length > 0 && (
        <HandSkeleton
          frames={frames}
          width={width}
          height={height}
          confidence={frames[0]?.landmarks ? 1 : 0}
        />
      )}

      {showZones && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      <div className="absolute top-1 left-1 flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${
            cameraActive ? 'bg-accent' : 'bg-error'
          }`}
        />
        <span className="text-[9px] text-text-muted tabular-nums">
          {fps} FPS
        </span>
      </div>
    </div>
  );
};
