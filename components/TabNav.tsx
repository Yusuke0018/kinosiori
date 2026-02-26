'use client';

import { cn } from '@/lib/utils';

type TabId = 'today' | 'inbox' | 'calendar';

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  todayCount: number;
  inboxCount: number;
}

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle
        cx="11"
        cy="11"
        r="9"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
      />
      <path
        d="M11 6V11L14 13"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="3"
        y="5"
        width="16"
        height="12"
        rx="2"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
      />
      <path
        d="M3 13H7.5L9 15H13L14.5 13H19"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="3"
        y="4"
        width="16"
        height="14"
        rx="2"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
      />
      <path
        d="M3 9H19"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
      />
      <path
        d="M8 2V5"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 2V5"
        stroke={active ? '#F2724B' : '#9999AA'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TabNav({ activeTab, onTabChange, todayCount, inboxCount }: TabNavProps) {
  const tabs: TabItem[] = [
    {
      id: 'today',
      label: '今日',
      icon: <TodayIcon active={activeTab === 'today'} />,
      badge: todayCount > 0 ? todayCount : undefined,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: <InboxIcon active={activeTab === 'inbox'} />,
      badge: inboxCount > 0 ? inboxCount : undefined,
    },
    {
      id: 'calendar',
      label: 'カレンダー',
      icon: <CalendarIcon active={activeTab === 'calendar'} />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/60 bg-white/80 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-2 transition-colors',
                isActive ? 'text-[#F2724B]' : 'text-[#9999AA]'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F2724B] px-1 text-[10px] font-bold leading-none text-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-[#F2724B]" />
              )}
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
