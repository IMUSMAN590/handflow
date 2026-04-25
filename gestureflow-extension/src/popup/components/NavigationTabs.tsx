interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'status', label: 'Status', icon: '●' },
  { id: 'gestures', label: 'Gestures', icon: '✋' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="flex gap-1 bg-dark-bg p-1 rounded-button">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-1.5 text-[10px] font-medium rounded-button transition-colors flex items-center justify-center gap-1 ${
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-light-bg'
          }`}
        >
          <span className="text-xs">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
