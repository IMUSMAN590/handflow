import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GestureEvent } from '@shared/types/gesture';
import { GestureType } from '@shared/types/gesture';
import { CHROME_ACTIONS } from '@shared/constants/actions';

const GESTURE_ICONS: Record<string, string> = {
  [GestureType.SWIPE_LEFT]: 'swipe-left',
  [GestureType.SWIPE_RIGHT]: 'swipe-right',
  [GestureType.SWIPE_UP]: 'swipe-up',
  [GestureType.SWIPE_DOWN]: 'swipe-down',
  [GestureType.PINCH]: 'pinch',
  [GestureType.FIST]: 'fist',
  [GestureType.OPEN_PALM]: 'open-palm',
  [GestureType.THUMBS_UP]: 'thumbs-up',
  [GestureType.POINT]: 'point-index',
  [GestureType.PEACE]: 'peace',
  [GestureType.ROTATE]: 'spread',
  [GestureType.OK_SIGN]: 'pinch',
  [GestureType.ROCK]: 'spread',
};

const GESTURE_DISPLAY_NAMES: Record<string, string> = {
  [GestureType.SWIPE_LEFT]: 'Swipe Left',
  [GestureType.SWIPE_RIGHT]: 'Swipe Right',
  [GestureType.SWIPE_UP]: 'Swipe Up',
  [GestureType.SWIPE_DOWN]: 'Swipe Down',
  [GestureType.PINCH]: 'Pinch',
  [GestureType.FIST]: 'Fist',
  [GestureType.OPEN_PALM]: 'Open Palm',
  [GestureType.THUMBS_UP]: 'Thumbs Up',
  [GestureType.POINT]: 'Point',
  [GestureType.PEACE]: 'Peace',
  [GestureType.ROTATE]: 'Rotate',
  [GestureType.OK_SIGN]: 'OK Sign',
  [GestureType.ROCK]: 'Rock',
};

const ACTION_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(CHROME_ACTIONS).map(([key, val]) => [key, `${val.name}...`]),
);

interface GesturePopupProps {
  event: GestureEvent | null;
  actionValue?: string;
}

export const GesturePopup: React.FC<GesturePopupProps> = ({ event, actionValue }) => {
  if (!event) return null;

  const gestureName = GESTURE_DISPLAY_NAMES[event.gestureId] ?? event.gestureId;
  const actionLabel = actionValue ? (ACTION_DISPLAY[actionValue] ?? actionValue) : '';
  const iconName = GESTURE_ICONS[event.gestureId];
  const confidencePct = Math.round(event.confidence * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute top-2 right-2 flex items-center gap-2 rounded-lg bg-dark-bg/80 backdrop-blur-sm px-3 py-2 border border-dark-border shadow-lg"
      >
        {iconName && (
          <img
            src={chrome.runtime.getURL(`assets/gesture-icons/${iconName}.svg`)}
            alt={gestureName}
            className="w-5 h-5"
          />
        )}
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm leading-tight">
            {gestureName}
          </span>
          {actionLabel && (
            <span className="text-text-muted text-xs leading-tight">
              {actionLabel}
            </span>
          )}
        </div>
        <span className="text-xs text-text-secondary ml-1 tabular-nums">
          {confidencePct}%
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
