'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';
import { isOverdue, getOverdueLabel, cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
  onDetail: (task: Task) => void;
  isRemoving?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#3498DB',
  none: 'transparent',
};

export default function TaskCard({ task, onComplete, onDetail, isRemoving = false }: TaskCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const overdue = task.date && !task.done ? isOverdue(task.date) : false;
  const overdueLabel = task.date && overdue ? getOverdueLabel(task.date) : '';
  const priorityColor = PRIORITY_COLORS[task.priority] ?? 'transparent';
  const showBar = task.priority !== 'none';

  return (
    <div
      className={cn(
        'relative flex items-stretch gap-0 rounded-2xl border bg-white/65 backdrop-blur-[20px] shadow-[0_4px_24px_var(--sekki-shadow-color)] transition-all duration-300',
        'border-[var(--sekki-border-color)]',
        !mounted && 'translate-x-8 opacity-0',
        mounted && !isRemoving && 'translate-x-0 opacity-100',
        isRemoving && 'scale-95 opacity-0',
        overdue && 'ring-1 ring-[#856404]/20'
      )}
      style={{
        transitionDuration: isRemoving ? '400ms' : '300ms',
        transitionTimingFunction: isRemoving ? 'ease-in' : 'ease-out',
      }}
    >
      {/* Priority color bar */}
      {showBar && (
        <div
          className="w-1 shrink-0 rounded-l-2xl"
          style={{ backgroundColor: priorityColor }}
        />
      )}

      {/* Card body */}
      <button
        onClick={() => onDetail(task)}
        className={cn(
          'flex min-h-[56px] flex-1 flex-col justify-center px-4 py-3 text-left',
          !showBar && 'rounded-l-2xl'
        )}
      >
        {overdue && overdueLabel && (
          <span className="mb-1 inline-block w-fit rounded bg-[#FFF3CD] px-2 py-0.5 text-[11px] font-medium text-[#856404]">
            {overdueLabel}
          </span>
        )}
        <span
          className={cn(
            'text-[15px] leading-snug text-[#1A1A2E]',
            task.done && 'text-[#9999AA] line-through'
          )}
        >
          {task.text}
        </span>
      </button>

      {/* Complete button */}
      <button
        onClick={e => {
          e.stopPropagation();
          onComplete(task);
        }}
        className="flex shrink-0 items-center justify-center px-4"
        aria-label={task.done ? '完了済み' : 'タスクを完了'}
      >
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200',
            task.done
              ? 'border-[#F2724B] bg-[#F2724B]'
              : 'border-[#D1D1D8] bg-transparent hover:border-[#F2724B]/50'
          )}
        >
          {task.done && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3.5 7L6 9.5L10.5 4.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
