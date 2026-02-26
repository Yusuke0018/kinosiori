'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { isOverdue, getGreeting } from '@/lib/utils';
import TaskCard from '@/components/TaskCard';
import ProgressRing from '@/components/ProgressRing';
import BottomSheet from '@/components/BottomSheet';

interface TodayViewProps {
  tasks: Task[];
  onRefresh: () => void;
  sekkiName: string;
  sekkiDescription: string;
}

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

export default function TodayView({ tasks, onRefresh, sekkiName, sekkiDescription }: TodayViewProps) {
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  // Separate overdue from today tasks, sort appropriately
  const sortedTasks = useMemo(() => {
    const incompleteTasks = tasks.filter(t => !t.done);
    const completedTasks = tasks.filter(t => t.done);

    // Overdue tasks first, then by priority, then by created_at desc
    const sorted = [...incompleteTasks].sort((a, b) => {
      const aOverdue = a.date ? isOverdue(a.date) : false;
      const bOverdue = b.date ? isOverdue(b.date) : false;

      // Overdue tasks come first
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then by priority
      const aPri = PRIORITY_ORDER[a.priority] ?? 3;
      const bPri = PRIORITY_ORDER[b.priority] ?? 3;
      if (aPri !== bPri) return aPri - bPri;

      // Then by created_at descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Completed tasks at the bottom, most recently completed first
    const sortedCompleted = [...completedTasks].sort(
      (a, b) => new Date(b.done_at ?? b.updated_at).getTime() - new Date(a.done_at ?? a.updated_at).getTime()
    );

    return [...sorted, ...sortedCompleted];
  }, [tasks]);

  const incompleteTasks = useMemo(() => tasks.filter(t => !t.done), [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.done).length, [tasks]);

  const greeting = useMemo(() => getGreeting(''), []);
  // Strip trailing comma from greeting since no name
  const displayGreeting = greeting.replace(/、$/, '');

  const handleCompleteClick = useCallback((task: Task) => {
    if (task.done) return;
    setConfirmTask(task);
  }, []);

  const handleConfirmComplete = useCallback(async () => {
    if (!confirmTask) return;
    try {
      setRemovingIds(prev => new Set(prev).add(confirmTask.id));
      await fetch(`/api/todos/${confirmTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: true, done_at: new Date().toISOString() }),
      });
      // Wait for animation to finish before refreshing
      setTimeout(() => {
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(confirmTask.id);
          return next;
        });
        onRefresh();
      }, 400);
    } catch (err) {
      console.error('Failed to complete task:', err);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(confirmTask.id);
        return next;
      });
    }
    setConfirmTask(null);
  }, [confirmTask, onRefresh]);

  const handleDetail = useCallback((task: Task) => {
    setDetailTask(task);
    // TaskDetail is handled by parent; for now emit an event
    // Parent component should handle onDetail via a callback
    // This is a placeholder; real detail opens TaskDetail
    void task;
    setDetailTask(null);
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-2">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-bold text-[#1A1A2E] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">{displayGreeting}</h1>
        {sekkiName && (
          <p className="text-[13px] font-medium text-[#4A4A5E] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            {sekkiName}
            {sekkiDescription && (
              <span className="text-[#5A5A70]"> ─ {sekkiDescription}</span>
            )}
          </p>
        )}
      </div>

      {/* Progress ring */}
      {tasks.length > 0 && (
        <div className="flex justify-center py-2">
          <ProgressRing completed={completedCount} total={tasks.length} />
        </div>
      )}

      {/* Task list */}
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#D1D1D8" strokeWidth="2" strokeDasharray="4 4" />
            <path
              d="M18 24L22 28L30 20"
              stroke="#D1D1D8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[15px] text-[#9999AA]">今日のタスクはありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {incompleteTasks.length > 0 && sortedTasks.filter(t => !t.done).length > 0 && (
            <>
              {sortedTasks
                .filter(t => !t.done)
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteClick}
                    onDetail={handleDetail}
                    isRemoving={removingIds.has(task.id)}
                  />
                ))}
            </>
          )}

          {/* Completed section */}
          {completedCount > 0 && (
            <>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[12px] font-medium text-[#9999AA]">
                  完了 ({completedCount})
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {sortedTasks
                .filter(t => t.done)
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => {}}
                    onDetail={handleDetail}
                    isRemoving={false}
                  />
                ))}
            </>
          )}
        </div>
      )}

      {/* Completion confirmation sheet */}
      <BottomSheet
        isOpen={!!confirmTask}
        onClose={() => setConfirmTask(null)}
        title="タスクを完了にしますか？"
        message={confirmTask?.text}
        actions={[
          {
            label: '完了にする',
            onClick: handleConfirmComplete,
          },
        ]}
      />
    </div>
  );
}
