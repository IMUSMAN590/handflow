import { create } from 'zustand';
import type { AnalyticsData, DailyCount, Badge } from '../types/analytics';
import { getAnalytics, saveAnalytics } from '../utils/storage';
import { DEFAULT_ANALYTICS } from '../constants/defaults';

interface AnalyticsState {
  analytics: AnalyticsData;
  isLoading: boolean;
}

interface AnalyticsActions {
  loadAnalytics: () => Promise<void>;
  recordGesture: (gestureId: string, confidence: number, responseTime: number, isCorrect: boolean) => Promise<void>;
  getDailyStats: (date: string) => DailyCount | undefined;
  getWeeklyStats: () => DailyCount[];
  getMonthlyStats: () => DailyCount[];
  incrementStreak: () => Promise<void>;
  addBadge: (badge: Badge) => Promise<void>;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const MAX_ACCURACY_LOG = 500;

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set, get) => ({
  analytics: { ...DEFAULT_ANALYTICS },
  isLoading: true,

  loadAnalytics: async () => {
    set({ isLoading: true });
    const analytics = await getAnalytics();
    set({ analytics, isLoading: false });
  },

  recordGesture: async (gestureId: string, confidence: number, responseTime: number, isCorrect: boolean) => {
    const analytics = { ...get().analytics };
    const today = getTodayKey();

    const dailyCounts = [...analytics.dailyCounts];
    const todayEntry = dailyCounts.find((d) => d.date === today);
    if (todayEntry) {
      todayEntry.count += 1;
    } else {
      dailyCounts.push({ date: today, count: 1 });
    }

    const gestureCounts = [...analytics.gestureCounts];
    const gestureEntry = gestureCounts.find((g) => g.gestureId === gestureId);
    if (gestureEntry) {
      gestureEntry.count += 1;
      gestureEntry.lastUsed = Date.now();
    } else {
      gestureCounts.push({ gestureId, count: 1, lastUsed: Date.now() });
    }

    const totalGestures = analytics.totalGestures + 1;
    const accuracyLog = [
      ...analytics.accuracyLog.slice(-(MAX_ACCURACY_LOG - 1)),
      { timestamp: Date.now(), expected: gestureId, actual: gestureId, confidence },
    ];
    const averageAccuracy = isCorrect
      ? (analytics.averageAccuracy * analytics.totalGestures + confidence) / totalGestures
      : (analytics.averageAccuracy * analytics.totalGestures) / totalGestures;
    const averageResponseTime =
      (analytics.averageResponseTime * analytics.totalGestures + responseTime) / totalGestures;
    const falsePositiveRate = !isCorrect
      ? (analytics.falsePositiveRate * analytics.totalGestures + 1) / totalGestures
      : (analytics.falsePositiveRate * analytics.totalGestures) / totalGestures;

    const updated: AnalyticsData = {
      dailyCounts,
      gestureCounts,
      accuracyLog,
      totalGestures,
      averageAccuracy,
      averageResponseTime,
      falsePositiveRate,
      streakDays: analytics.streakDays,
      badges: analytics.badges,
      heatmap: analytics.heatmap,
    };

    set({ analytics: updated });
    await saveAnalytics(updated);
  },

  getDailyStats: (date: string) => {
    return get().analytics.dailyCounts.find((d) => d.date === date);
  },

  getWeeklyStats: () => {
    const cutoff = getDaysAgo(7);
    return get().analytics.dailyCounts.filter((d) => d.date >= cutoff);
  },

  getMonthlyStats: () => {
    const cutoff = getDaysAgo(30);
    return get().analytics.dailyCounts.filter((d) => d.date >= cutoff);
  },

  incrementStreak: async () => {
    const analytics = { ...get().analytics };
    analytics.streakDays += 1;
    set({ analytics });
    await saveAnalytics(analytics);
  },

  addBadge: async (badge: Badge) => {
    const analytics = { ...get().analytics };
    const exists = analytics.badges.find((b) => b.id === badge.id);
    if (!exists) {
      analytics.badges.push({ ...badge, unlockedAt: Date.now() });
      set({ analytics });
      await saveAnalytics(analytics);
    }
  },
}));
