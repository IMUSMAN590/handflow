import { useState, useCallback, useRef } from 'react';
import type { LandmarkFrame } from '../types/gesture';

interface HandTrackingState {
  isTracking: boolean;
  isCameraReady: boolean;
  handedness: 'Left' | 'Right' | null;
  currentFrame: LandmarkFrame | null;
  fps: number;
  error: string | null;
}

export function useHandTracking() {
  const [state, setState] = useState<HandTrackingState>({
    isTracking: false,
    isCameraReady: false,
    handedness: null,
    currentFrame: null,
    fps: 0,
    error: null,
  });

  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  const startTracking = useCallback(() => {
    setState((prev) => ({ ...prev, isTracking: true, error: null }));
  }, []);

  const stopTracking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isTracking: false,
      currentFrame: null,
      handedness: null,
    }));
  }, []);

  const setCameraReady = useCallback((ready: boolean) => {
    setState((prev) => ({ ...prev, isCameraReady: ready }));
  }, []);

  const updateFrame = useCallback((frame: LandmarkFrame) => {
    frameCountRef.current += 1;
    const now = Date.now();
    const elapsed = now - lastFpsTimeRef.current;
    let fps = 0;
    if (elapsed >= 1000) {
      fps = Math.round((frameCountRef.current * 1000) / elapsed);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }

    setState((prev) => ({
      ...prev,
      currentFrame: frame,
      handedness: frame.handedness,
      fps: fps > 0 ? fps : prev.fps,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    setCameraReady,
    updateFrame,
    setError,
  };
}
