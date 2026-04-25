import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@shared/store/settings-store';
import { useGestureStore } from '@shared/store/gesture-store';
import { useAnalyticsStore } from '@shared/store/analytics-store';
import { GeneralSettings } from './pages/GeneralSettings';
import { GestureManager } from './pages/GestureManager';
import { ProfileManager } from './pages/ProfileManager';
import { ZoneConfig } from './pages/ZoneConfig';
import { AudioSettings } from './pages/AudioSettings';
import { IntegrationSettings } from './pages/IntegrationSettings';
import { HelpPage } from './pages/HelpPage';

const AnalyticsDashboard = lazy(() =>
  import('./pages/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })),
);

type PageId = 'general' | 'gestures' | 'profiles' | 'zones' | 'audio' | 'stats' | 'integration' | 'help';

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'gestures', label: 'Gestures', icon: '✋' },
  { id: 'profiles', label: 'Profiles', icon: '👤' },
  { id: 'zones', label: 'Zones', icon: '📐' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'integration', label: 'Integration', icon: '🔗' },
  { id: 'help', label: 'Help', icon: '❓' },
];

const PAGE_MAP: Record<PageId, React.FC> = {
  general: GeneralSettings,
  gestures: GestureManager,
  profiles: ProfileManager,
  zones: ZoneConfig,
  audio: AudioSettings,
  stats: AnalyticsDashboard,
  integration: IntegrationSettings,
  help: HelpPage,
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function OptionsApp() {
  const [activePage, setActivePage] = useState<PageId>('general');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadGestures = useGestureStore((s) => s.loadGestures);
  const loadAnalytics = useAnalyticsStore((s) => s.loadAnalytics);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    loadSettings();
    loadGestures();
    loadAnalytics();
  }, [loadSettings, loadGestures, loadAnalytics]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ActivePageComponent = PAGE_MAP[activePage];

  return (
    <div className="flex min-h-screen bg-dark-bg text-[#F8FAFC]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-30 flex h-full w-[240px] flex-col border-r border-dark-border bg-dark-surface transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
            G
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">Gesture</span>
            <span className="text-[#F8FAFC]">Flow</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                activePage === item.id
                  ? 'border-l-[3px] border-primary bg-primary/10 text-primary'
                  : 'text-[#94A3B8] hover:bg-dark-border/40 hover:text-[#F8FAFC]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-dark-border px-5 py-4">
          <p className="text-xs text-text-muted">GestureFlow v1.0.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex h-14 items-center border-b border-dark-border bg-dark-surface px-4 md:px-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 rounded-md p-1.5 text-[#94A3B8] hover:bg-dark-border/40 hover:text-[#F8FAFC] md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <h1 className="text-base font-semibold">
            {NAV_ITEMS.find((i) => i.id === activePage)?.label}
          </h1>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}>
                <ActivePageComponent />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
