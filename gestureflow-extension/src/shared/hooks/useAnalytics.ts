import { useEffect } from 'react';
import { useAnalyticsStore } from '../store/analytics-store';

export function useAnalytics() {
  const store = useAnalyticsStore();

  useEffect(() => {
    store.loadAnalytics();
  }, []);

  return {
    analytics: store.analytics,
    isLoading: store.isLoading,
    recordGesture: store.recordGesture,
    getDailyStats: store.getDailyStats,
    getWeeklyStats: store.getWeeklyStats,
    getMonthlyStats: store.getMonthlyStats,
    incrementStreak: store.incrementStreak,
    addBadge: store.addBadge,
  };
}
