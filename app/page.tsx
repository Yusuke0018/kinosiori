'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import QuickInput from '@/components/QuickInput';
import TodayView from '@/components/TodayView';
import InboxView from '@/components/InboxView';
import CalendarView from '@/components/CalendarView';
import TabNav from '@/components/TabNav';
import SeasonalBackground from '@/components/seasonal/SeasonalBackground';
import { getCurrentSekki } from '@/lib/sekki';

type TabType = 'today' | 'inbox' | 'calendar';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const sekki = getCurrentSekki(new Date());

  const fetchTodayTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/todos?filter=today&include_overdue=true');
      if (res.ok) {
        const data = await res.json();
        setTodayTasks(data.filter((t: Task) => !t.done));
      }
    } catch (e) {
      console.error('Failed to fetch today tasks:', e);
    }
  }, []);

  const fetchInboxTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/todos?filter=inbox');
      if (res.ok) {
        const data = await res.json();
        setInboxTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch inbox tasks:', e);
    }
  }, []);

  const fetchCalendarTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/todos?month=${calendarMonth}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch calendar tasks:', e);
    }
  }, [calendarMonth]);

  useEffect(() => {
    fetchTodayTasks();
    fetchInboxTasks();
  }, [fetchTodayTasks, fetchInboxTasks]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const handleAdd = async (text: string, date: string | null, priority: string) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, date, priority }),
      });
      if (res.ok) {
        fetchTodayTasks();
        fetchInboxTasks();
        fetchCalendarTasks();
      }
    } catch (e) {
      console.error('Failed to add task:', e);
    }
  };

  const handleRefresh = () => {
    fetchTodayTasks();
    fetchInboxTasks();
    fetchCalendarTasks();
  };

  const todayCount = todayTasks.filter(t => !t.done).length;
  const inboxCount = inboxTasks.length;

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <SeasonalBackground />

      {/* Frosted overlay for text readability */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.35) 100%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <div className="shrink-0">
          <QuickInput onAdd={handleAdd} />
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          <div className={activeTab === 'today' ? '' : 'hidden'}>
            <TodayView
              tasks={todayTasks}
              onRefresh={handleRefresh}
              sekkiName={sekki.name}
              sekkiDescription={sekki.description}
            />
          </div>
          <div className={activeTab === 'inbox' ? '' : 'hidden'}>
            <InboxView tasks={inboxTasks} onRefresh={handleRefresh} />
          </div>
          <div className={activeTab === 'calendar' ? '' : 'hidden'}>
            <CalendarView
              tasks={calendarTasks}
              onRefresh={handleRefresh}
              currentMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
          </div>
        </div>

        <div className="shrink-0 fixed bottom-0 left-0 right-0 z-20">
          <TabNav
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as TabType)}
            todayCount={todayCount}
            inboxCount={inboxCount}
          />
        </div>
      </div>
    </div>
  );
}
