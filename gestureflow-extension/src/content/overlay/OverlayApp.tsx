import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Settings, OverlayPosition, OverlaySize } from '@shared/types/settings';
import type { LandmarkFrame, GestureEvent, Landmark } from '@shared/types/gesture';
import { CameraPreview } from './CameraPreview';
import { HandSkeleton } from './HandSkeleton';
import { GesturePopup } from './GesturePopup';
import { ConfidenceMeter } from './ConfidenceMeter';
import { TrailEffect } from './TrailEffect';
import { ZoneMiniMap } from './ZoneMiniMap';

const SIZE_MAP: Record<OverlaySize, { width: number; height: number }> = {
  small: { width: 200, height: 150 },
  medium: { width: 300, height: 225 },
  large: { width: 400, height: 300 },
};

const POSITION_CLASSES: Record<OverlayPosition, string> = {
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'top-right': 'top-4 right-4',
};

type OverlayState = 'normal' | 'minimized' | 'fullscreen';

interface OverlayAppProps {
  settings: Settings;
  videoRef: React.RefObject<HTMLVideoElement>;
  frames: LandmarkFrame[];
  gestureEvent: GestureEvent | null;
  actionValue: string | undefined;
  fps: number;
  onGestureClear: () => void;
}

export const OverlayApp: React.FC<OverlayAppProps> = ({
  settings,
  videoRef,
  frames,
  gestureEvent,
  actionValue,
  fps,
  onGestureClear,
}) => {
  const [overlayState, setOverlayState] = useState<OverlayState>('normal');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const clearSignalRef = useRef(0);
  const [clearSignal, setClearSignal] = useState(0);

  const size = SIZE_MAP[settings.overlaySize];
  const currentWidth = overlayState === 'fullscreen' ? window.innerWidth : size.width;
  const currentHeight = overlayState === 'fullscreen' ? window.innerHeight : size.height;

  const activeZone = gestureEvent?.zone as 'top' | 'left' | 'center' | 'right' | 'bottom' | null;
  const handPosition: { x: number; y: number } | undefined =
    frames.length > 0 && frames[0].landmarks.length > 9
      ? { x: frames[0].landmarks[9].x, y: frames[0].landmarks[9].y }
      : undefined;

  const latestLandmarks: Landmark[] | null = frames.length > 0 ? frames[0].landmarks : null;

  useEffect(() => {
    if (gestureEvent) {
      clearSignalRef.current += 1;
      setClearSignal(clearSignalRef.current);
      const timer = setTimeout(onGestureClear, 2000);
      return () => clearTimeout(timer);
    }
  }, [gestureEvent, onGestureClear]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (overlayState === 'fullscreen') return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };

      const handleMove = (ev: MouseEvent) => {
        setDragOffset({
          x: ev.clientX - dragStartRef.current.x,
          y: ev.clientY - dragStartRef.current.y,
        });
      };

      const handleUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [overlayState, dragOffset],
  );

  if (!settings.showOverlay) return null;

  const positionClass = overlayState === 'fullscreen' ? '' : POSITION_CLASSES[settings.overlayPosition];

  return (
    <motion.div
      ref={containerRef}
      className={`fixed ${positionClass} flex flex-col rounded-lg overflow-hidden shadow-2xl border border-dark-border`}
      style={{
        zIndex: 2147483647,
        width: currentWidth,
        height: currentHeight,
        opacity: settings.overlayOpacity,
        transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined,
        transition: isDragging ? 'none' : 'transform 0.2s ease, width 0.3s ease, height 0.3s ease',
        pointerEvents: 'auto',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: settings.overlayOpacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="flex items-center justify-between px-2 py-1 bg-dark-bg border-b border-dark-border cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <span className="text-[10px] font-semibold text-text-muted tracking-wide uppercase">
          GestureFlow
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOverlayState(overlayState === 'minimized' ? 'normal' : 'minimized')}
            className="w-4 h-4 flex items-center justify-center rounded text-text-muted hover:text-white hover:bg-dark-border transition-colors text-[10px]"
          >
            {overlayState === 'minimized' ? '□' : '−'}
          </button>
          <button
            onClick={() => setOverlayState(overlayState === 'fullscreen' ? 'normal' : 'fullscreen')}
            className="w-4 h-4 flex items-center justify-center rounded text-text-muted hover:text-white hover:bg-dark-border transition-colors text-[10px]"
          >
            {overlayState === 'fullscreen' ? '⧉' : '⤢'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {overlayState !== 'minimized' && (
          <motion.div
            className="relative flex-1 bg-dark-bg overflow-hidden"
            initial={false}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {settings.showOverlay && (
              <CameraPreview
                videoRef={videoRef}
                frames={frames}
                fps={fps}
                showSkeleton={settings.showGestureName}
                showZones={settings.proximityActions}
                width={currentWidth}
                height={currentHeight - 28}
              />
            )}

            {settings.showGestureName && frames.length > 0 && !settings.showOverlay && (
              <HandSkeleton
                frames={frames}
                width={currentWidth}
                height={currentHeight - 28}
              />
            )}

            {settings.drawingMode && (
              <TrailEffect
                landmarks={latestLandmarks}
                width={currentWidth}
                height={currentHeight - 28}
                clearSignal={clearSignal}
              />
            )}

            {settings.showGestureName && gestureEvent && (
              <GesturePopup event={gestureEvent} actionValue={actionValue} />
            )}

            <div className="absolute bottom-1 left-1 flex items-center gap-2">
              {settings.showGestureName && (
                <ConfidenceMeter value={gestureEvent?.confidence ?? 0} />
              )}
              {settings.proximityActions && (
                <ZoneMiniMap activeZone={activeZone} handPosition={handPosition} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
