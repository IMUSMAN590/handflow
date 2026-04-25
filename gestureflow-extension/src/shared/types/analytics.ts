export interface DailyCount {
  date: string;
  count: number;
}

export interface GestureCount {
  gestureId: string;
  count: number;
  lastUsed: number;
}

export interface AccuracyEntry {
  timestamp: number;
  expected: string;
  actual: string;
  confidence: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: string;
}

export interface HeatmapData {
  zone: string;
  count: number;
}

export interface AnalyticsData {
  dailyCounts: DailyCount[];
  gestureCounts: GestureCount[];
  accuracyLog: AccuracyEntry[];
  totalGestures: number;
  averageAccuracy: number;
  averageResponseTime: number;
  falsePositiveRate: number;
  streakDays: number;
  badges: Badge[];
  heatmap: HeatmapData[];
}
