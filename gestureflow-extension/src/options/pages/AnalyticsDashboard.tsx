import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '@shared/store/analytics-store';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0EA5E9', '#10B981', '#F97316', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#EC4899'];

export function AnalyticsDashboard() {
  const store = useAnalyticsStore();

  useEffect(() => {
    store.loadAnalytics();
  }, []);

  const { analytics } = store;

  const weeklyData = store.getWeeklyStats().map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  const gestureDistribution = analytics.gestureCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((g) => ({
      name: g.gestureId.replace(/_/g, ' '),
      value: g.count,
    }));

  const accuracyData = analytics.accuracyLog.slice(-20).map((a) => ({
    time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidence: Math.round(a.confidence * 100),
  }));

  const heatmapData = analytics.heatmap.length > 0
    ? analytics.heatmap
    : [
        { zone: 'top', count: 15 },
        { zone: 'left', count: 28 },
        { zone: 'center', count: 42 },
        { zone: 'right', count: 35 },
        { zone: 'bottom', count: 20 },
      ];

  const maxHeat = Math.max(...heatmapData.map((h) => h.count));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-light-bg">Analytics Dashboard</h2>
        <p className="text-sm text-text-muted mt-1">
          Track gesture usage, accuracy, and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Gestures" value={analytics.totalGestures.toLocaleString()} icon="✋" color="primary" />
        <MetricCard label="Avg Accuracy" value={`${Math.round(analytics.averageAccuracy * 100)}%`} icon="🎯" color="accent" />
        <MetricCard label="Avg Response" value={`${Math.round(analytics.averageResponseTime)}ms`} icon="⚡" color="secondary" />
        <MetricCard label="Streak Days" value={analytics.streakDays.toString()} icon="🔥" color="warning" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
          <h3 className="text-sm font-semibold text-light-bg mb-3">Weekly Usage</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData.length > 0 ? weeklyData : [{ date: 'Mon', count: 0 }]}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#0EA5E9" fill="url(#colorCount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
          <h3 className="text-sm font-semibold text-light-bg mb-3">Gesture Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gestureDistribution.length > 0 ? gestureDistribution : [{ name: 'None', value: 1 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                {(gestureDistribution.length > 0 ? gestureDistribution : [{ name: 'None', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Confidence Over Time</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={accuracyData.length > 0 ? accuracyData : [{ time: 'Now', confidence: 0 }]}>
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="confidence" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Gesture Heatmap</h3>
        <div className="grid grid-rows-[1fr_2fr_1fr] grid-cols-[1fr_2fr_1fr] gap-1 aspect-[4/3] max-w-md mx-auto">
          {heatmapData.map((zone) => {
            const intensity = maxHeat > 0 ? zone.count / maxHeat : 0;
            return (
              <div
                key={zone.zone}
                className={`rounded-lg flex items-center justify-center ${
                  zone.zone === 'top' ? 'col-span-3' : zone.zone === 'bottom' ? 'col-span-3' : ''
                }`}
                style={{ backgroundColor: `rgba(14, 165, 233, ${0.1 + intensity * 0.5})` }}
              >
                <div className="text-center">
                  <span className="text-xs font-medium text-light-bg capitalize">{zone.zone}</span>
                  <span className="block text-[10px] text-text-muted">{zone.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-dark-surface border border-dark-border rounded-card">
        <h3 className="text-sm font-semibold text-light-bg mb-3">Achievements</h3>
        <div className="grid grid-cols-3 gap-2">
          {analytics.badges.length > 0 ? (
            analytics.badges.map((badge) => (
              <div key={badge.id} className="p-3 bg-dark-bg rounded-card text-center">
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <span className="text-xs font-medium text-light-bg block">{badge.name}</span>
                <span className="text-[10px] text-text-muted">{badge.description}</span>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-text-muted text-xs">
              Start using gestures to unlock achievements!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 bg-dark-surface border border-dark-border rounded-card"
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${colorMap[color] ?? colorMap.primary} text-sm mb-2`}>
        {icon}
      </div>
      <span className="text-lg font-bold text-light-bg block">{value}</span>
      <span className="text-[10px] text-text-muted">{label}</span>
    </motion.div>
  );
}
