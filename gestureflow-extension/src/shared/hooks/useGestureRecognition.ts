import { useState, useCallback, useRef } from 'react';
import type { GestureEvent, Gesture } from '../types/gesture';
import { useGestureStore } from '../store/gesture-store';
import { useAnalyticsStore } from '../store/analytics-store';

interface GestureRecognitionState {
  isRecognizing: boolean;
  lastGesture: GestureEvent | null;
  detectedGesture: Gesture | null;
  confidence: number;
  cooldownActive: boolean;
}

export function useGestureRecognition() {
  const [state, setState] = useState<GestureRecognitionState>({
    isRecognizing: false,
    lastGesture: null,
    detectedGesture: null,
    confidence: 0,
    cooldownActive: false,
  });

  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureStore = useGestureStore();
  const analyticsStore = useAnalyticsStore();

  const startRecognizing = useCallback(() => {
    setState((prev) => ({ ...prev, isRecognizing: true }));
  }, []);

  const stopRecognizing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRecognizing: false,
      lastGesture: null,
      detectedGesture: null,
      confidence: 0,
    }));
  }, []);

  const recognizeGesture = useCallback(
    (event: GestureEvent) => {
      const gesture = gestureStore.gestures.find(
        (g) => g.id === event.gestureId && g.isEnabled,
      );
      if (!gesture) return;

      const now = Date.now();
      setState((prev) => ({
        ...prev,
        lastGesture: event,
        detectedGesture: gesture,
        confidence: event.confidence,
      }));

      analyticsStore.recordGesture(
        event.gestureId,
        event.confidence,
        now - event.timestamp,
        true,
      );

      if (gesture.cooldown && gesture.cooldown > 0) {
        setState((prev) => ({ ...prev, cooldownActive: true }));
        if (cooldownTimerRef.current) {
          clearTimeout(cooldownTimerRef.current);
        }
        cooldownTimerRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, cooldownActive: false }));
          cooldownTimerRef.current = null;
        }, gesture.cooldown);
      }
    },
    [gestureStore.gestures, analyticsStore],
  );

  return {
    ...state,
    startRecognizing,
    stopRecognizing,
    recognizeGesture,
  };
}
