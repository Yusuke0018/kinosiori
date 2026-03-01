'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '@/lib/types';
import QuickInput from '@/components/QuickInput';
import TodayView from '@/components/TodayView';
import InboxView from '@/components/InboxView';
import CalendarView from '@/components/CalendarView';
import TabNav from '@/components/TabNav';
import TaskDetail from '@/components/TaskDetail';
import SeasonalBackground from '@/components/seasonal/SeasonalBackground';
import { getCurrentSekki } from '@/lib/sekki';
import { useSwipe } from '@/lib/useSwipe';

const TABS = ['today', 'inbox', 'calendar'] as const;
type TabType = (typeof TABS)[number];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Task detail editing state
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  // Slide animation state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const sekki = getCurrentSekki(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/todos/stats');
      if (res.ok) {
        const data = await res.json();
        setTotalCompleted(data.totalCompleted ?? 0);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }, []);

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
    fetchStats();
  }, [fetchTodayTasks, fetchInboxTasks, fetchStats]);

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
    fetchStats();
  };

  // Task detail handlers
  const handleOpenDetail = useCallback((task: Task) => {
    setDetailTask(task);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailTask(null);
  }, []);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        handleRefresh();
      }
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        handleRefresh();
      }
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  }, []);

  // Tab switching with slide animation
  const switchTab = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return;

    const currentIndex = TABS.indexOf(activeTab);
    let nextIndex: number;

    if (direction === 'left') {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    }

    const nextTab = TABS[nextIndex];
    if (nextTab === activeTab) return;

    setIsAnimating(true);
    setSlideDirection(direction);

    setTimeout(() => {
      setActiveTab(nextTab);
      setSlideDirection(direction === 'left' ? 'right' : 'left');

      requestAnimationFrame(() => {
        setTimeout(() => {
          setSlideDirection(null);
          setIsAnimating(false);
        }, 200);
      });
    }, 150);
  }, [activeTab, isAnimating]);

  const handleTabChange = useCallback((tab: string) => {
    if (isAnimating) return;
    const targetIndex = TABS.indexOf(tab as TabType);
    const currentIndex = TABS.indexOf(activeTab);
    if (targetIndex === currentIndex) return;

    const direction = targetIndex > currentIndex ? 'left' : 'right';
    setIsAnimating(true);
    setSlideDirection(direction);

    setTimeout(() => {
      setActiveTab(tab as TabType);
      setSlideDirection(direction === 'left' ? 'right' : 'left');
      requestAnimationFrame(() => {
        setTimeout(() => {
          setSlideDirection(null);
          setIsAnimating(false);
        }, 200);
      });
    }, 150);
  }, [activeTab, isAnimating]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => switchTab('left'),
    onSwipeRight: () => switchTab('right'),
    threshold: 40,
    maxVertical: 120,
  });

  const todayCount = todayTasks.filter(t => !t.done).length;
  const inboxCount = inboxTasks.length;

  const getSlideStyle = (): React.CSSProperties => {
    if (!slideDirection) return { transform: 'translateX(0)', opacity: 1, transition: 'transform 0.2s ease-out, opacity 0.15s ease-out' };
    if (slideDirection === 'left') return { transform: 'translateX(-30px)', opacity: 0, transition: 'transform 0.15s ease-in, opacity 0.1s ease-in' };
    if (slideDirection === 'right') return { transform: 'translateX(30px)', opacity: 0, transition: 'transform 0.15s ease-in, opacity 0.1s ease-in' };
    return {};
  };

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

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto pb-20"
          {...swipeHandlers}
        >
          <div style={getSlideStyle()}>
            <div className={activeTab === 'today' ? '' : 'hidden'}>
              <TodayView
                tasks={todayTasks}
                onRefresh={handleRefresh}
                onDetail={handleOpenDetail}
                sekkiName={sekki.name}
                sekkiDescription={sekki.description}
                totalCompleted={totalCompleted}
              />
            </div>
            <div className={activeTab === 'inbox' ? '' : 'hidden'}>
              <InboxView
                tasks={inboxTasks}
                onRefresh={handleRefresh}
                onDetail={handleOpenDetail}
              />
            </div>
            <div className={activeTab === 'calendar' ? '' : 'hidden'}>
              <CalendarView
                tasks={calendarTasks}
                onRefresh={handleRefresh}
                onDetail={handleOpenDetail}
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 fixed bottom-0 left-0 right-0 z-20">
          <TabNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            todayCount={todayCount}
            inboxCount={inboxCount}
          />
        </div>
      </div>

      {/* Task detail / edit bottom sheet */}
      <TaskDetail
        task={detailTask}
        isOpen={!!detailTask}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
