'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import TaskCard from '@/components/TaskCard';

interface InboxViewProps {
  tasks: Task[];
  onRefresh: () => void;
  onDetail: (task: Task) => void;
}

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

export default function InboxView({ tasks, onRefresh, onDetail }: InboxViewProps) {
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  // Only show inbox tasks: date is null and not done
  const inboxTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.date === null && !t.done)
      .sort((a, b) => {
        const aPri = PRIORITY_ORDER[a.priority] ?? 3;
        const bPri = PRIORITY_ORDER[b.priority] ?? 3;
        if (aPri !== bPri) return aPri - bPri;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tasks]);

  const handleMoveToToday = useCallback(
    async (task: Task) => {
      const today = formatDate(new Date());
      try {
        setMovingIds(prev => new Set(prev).add(task.id));
        await fetch(`/api/todos/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today }),
        });
        // Wait for slide-out animation
        setTimeout(() => {
          setMovingIds(prev => {
            const next = new Set(prev);
            next.delete(task.id);
            return next;
          });
          onRefresh();
        }, 400);
      } catch (err) {
        console.error('Failed to move task to today:', err);
        setMovingIds(prev => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
      }
    },
    [onRefresh]
  );

  const handleDetail = useCallback((task: Task) => {
    onDetail(task);
  }, [onDetail]);

  if (inboxTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-20">
        <span className="text-[40px]">&#10024;</span>
        <p className="text-[15px] text-[#9999AA]">スッキリ！全部整理済み</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-24 pt-2">
      <h2 className="mb-1 text-[14px] font-semibold text-[#4A4A5E] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
        未整理のタスク ({inboxTasks.length})
      </h2>

      {inboxTasks.map(task => (
        <div
          key={task.id}
          className={cn(
            'transition-all duration-400',
            movingIds.has(task.id) && 'translate-x-full opacity-0'
          )}
        >
          <div className="relative">
            <TaskCard
              task={task}
              onComplete={() => {}}
              onDetail={handleDetail}
              isRemoving={movingIds.has(task.id)}
            />
            {/* "今日やる" button overlay */}
            <button
              onClick={() => handleMoveToToday(task)}
              disabled={movingIds.has(task.id)}
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg bg-[#F2724B]/10 px-3 py-1.5 text-[12px] font-medium text-[#F2724B] transition-all hover:bg-[#F2724B]/20 active:scale-95 disabled:opacity-0"
            >
              今日やる
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
