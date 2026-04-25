import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@shared/store/settings-store';
import { useAnalyticsStore } from '@shared/store/analytics-store';
import { sendMessage, onMessage } from '@shared/utils/messaging';
import { MessageType } from '@shared/types/message';
import type { GestureRecognizedPayload } from '@shared/types/message';
import { StatusIndicator } from './components/StatusIndicator';
import { CameraPreview } from './components/CameraPreview';
import { QuickSettings } from './components/QuickSettings';
import { NavigationTabs } from './components/NavigationTabs';

interface LastGesture {
  name: string;
  time: number;
}

type PopupTab = 'status' | 'gestures' | 'settings';

export function PopupApp() {
  const { settings, isLoading, loadSettings, toggleEnabled } =
    useSettingsStore();
  const { loadAnalytics, getDailyStats } = useAnalyticsStore();
  const [lastGesture, setLastGesture] = useState<LastGesture | null>(null);
  const [activeTab, setActiveTab] = useState<PopupTab>('status');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    loadSettings();
    loadAnalytics();
  }, [loadSettings, loadAnalytics]);

  useEffect(() => {
    const removeListener = onMessage<GestureRecognizedPayload>(
      MessageType.GESTURE_RECOGNIZED,
      (payload) => {
        setLastGesture({
          name: payload.gestureId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          time: Date.now(),
        });
      },
    );
    return removeListener;
  }, []);

  const handleToggle = useCallback(async () => {
    await toggleEnabled();
    sendMessage(MessageType.TOGGLE, {
      isEnabled: !settings.isEnabled,
    });
  }, [toggleEnabled, settings.isEnabled]);

  const todayKey = new Date().toISOString().split('T')[0];
  const gesturesToday = getDailyStats(todayKey)?.count ?? 0;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="w-[360px] h-[500px] bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-[500px] bg-dark-bg flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </div>
          <h1 className="text-[#F8FAFC] text-sm font-semibold tracking-tight">
            GestureFlow
          </h1>
        </div>
        <button
          onClick={handleToggle}
          className={`
            relative w-10 h-[22px] rounded-full transition-colors duration-200
            ${settings.isEnabled ? 'bg-primary' : 'bg-dark-border'}
          `}
          aria-label={settings.isEnabled ? 'Disable GestureFlow' : 'Enable GestureFlow'}
        >
          <motion.div
            className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
            animate={{ left: settings.isEnabled ? '20px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <StatusIndicator
            isEnabled={settings.isEnabled}
            isTracking={settings.isEnabled}
            isCameraReady={settings.isEnabled}
            lastGesture={lastGesture?.name}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted">Today:</span>
            <span className="text-xs font-semibold text-primary">{gesturesToday}</span>
          </div>
        </div>

        {activeTab === 'status' && (
          <>
            <CameraPreview isEnabled={settings.isEnabled} />

            <AnimatePresence mode="wait">
              {lastGesture && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-dark-surface border border-dark-border rounded-card px-3 py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[#F8FAFC] text-xs font-medium">
                      {lastGesture.name}
                    </span>
                  </div>
                  <span className="text-text-muted text-[10px]">
                    {formatTime(lastGesture.time)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeTab === 'gestures' && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-light-bg">Quick Gesture Reference</h3>
            {[
              { icon: '←', name: 'Swipe Left', action: 'Go Back' },
              { icon: '→', name: 'Swipe Right', action: 'Go Forward' },
              { icon: '↑', name: 'Swipe Up', action: 'Scroll Up' },
              { icon: '↓', name: 'Swipe Down', action: 'Scroll Down' },
              { icon: '🖐', name: 'Open Palm', action: 'New Tab' },
              { icon: '✊', name: 'Fist', action: 'Close Tab' },
              { icon: '✌️', name: 'Peace Sign', action: 'Refresh' },
              { icon: '👍', name: 'Thumbs Up', action: 'Bookmark' },
              { icon: '☝️', name: 'Point', action: 'Move Cursor' },
              { icon: '🤏', name: 'Pinch', action: 'Zoom In' },
              { icon: '👌', name: 'OK Sign', action: 'Toggle' },
              { icon: '👋', name: 'Wave', action: 'On/Off' },
            ].map((g) => (
              <div key={g.name} className="flex items-center gap-2 p-2 bg-dark-surface rounded-card border border-dark-border">
                <span className="text-sm w-6 text-center">{g.icon}</span>
                <span className="text-xs text-light-bg flex-1">{g.name}</span>
                <span className="text-[10px] text-text-muted">{g.action}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && <QuickSettings />}
      </div>

      <NavigationTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as PopupTab)} />

      <footer className="flex items-center justify-between px-4 py-2 border-t border-dark-border">
        <span className="text-text-muted text-[10px]">v1.0.0</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-text-muted text-[10px]">Privacy First</span>
        </div>
      </footer>
    </div>
  );
}
