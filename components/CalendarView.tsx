'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import TaskCard from '@/components/TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onRefresh: () => void;
  currentMonth: string;             // "YYYY-MM" format, controlled by parent for data fetching
  onMonthChange: (month: string) => void;
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAY_COLORS = [
  'text-red-500', // 日 (Sunday)
  'text-[#6B6B80]',
  'text-[#6B6B80]',
  'text-[#6B6B80]',
  'text-[#6B6B80]',
  'text-[#6B6B80]',
  'text-[#F2724B]', // 土 (Saturday)
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#3498DB',
  none: '#9999AA',
};

interface DayCell {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

function parseYearMonth(ym: string): [number, number] {
  const [y, m] = ym.split('-').map(Number);
  return [y, m - 1]; // month is 0-indexed for Date constructor
}

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getMonthGrid(year: number, month: number, tasks: Task[]): DayCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build task map for the month
  const taskMap = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.date) {
      const existing = taskMap.get(task.date) ?? [];
      existing.push(task);
      taskMap.set(task.date, existing);
    }
  }

  const cells: DayCell[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    const dateStr = formatDate(date);
    cells.push({
      date,
      dateStr,
      day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      tasks: taskMap.get(dateStr) ?? [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    cells.push({
      date,
      dateStr,
      day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      tasks: taskMap.get(dateStr) ?? [],
    });
  }

  // Next month leading days (fill to complete rows of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = formatDate(date);
      cells.push({
        date,
        dateStr,
        day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        tasks: taskMap.get(dateStr) ?? [],
      });
    }
  }

  return cells;
}

export default function CalendarView({ tasks, onRefresh, currentMonth, onMonthChange }: CalendarViewProps) {
  const [viewYear, viewMonth] = useMemo(() => parseYearMonth(currentMonth), [currentMonth]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthLabel = useMemo(() => {
    return `${viewYear}年${viewMonth + 1}月`;
  }, [viewYear, viewMonth]);

  const grid = useMemo(
    () => getMonthGrid(viewYear, viewMonth, tasks),
    [viewYear, viewMonth, tasks]
  );

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks
      .filter(t => t.date === selectedDate)
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [selectedDate, tasks]);

  const goToToday = useCallback(() => {
    const now = new Date();
    onMonthChange(toYearMonth(now.getFullYear(), now.getMonth()));
    setSelectedDate(formatDate(now));
  }, [onMonthChange]);

  const prevMonth = useCallback(() => {
    let newMonth = viewMonth - 1;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    onMonthChange(toYearMonth(newYear, newMonth));
  }, [viewYear, viewMonth, onMonthChange]);

  const nextMonth = useCallback(() => {
    let newMonth = viewMonth + 1;
    let newYear = viewYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onMonthChange(toYearMonth(newYear, newMonth));
  }, [viewYear, viewMonth, onMonthChange]);

  const handleDayClick = useCallback((cell: DayCell) => {
    setSelectedDate(prev => (prev === cell.dateStr ? null : cell.dateStr));
  }, []);

  return (
    <div className="flex flex-col gap-3 px-4 pb-24 pt-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B80] transition-colors hover:bg-gray-100"
          aria-label="前月"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-semibold text-[#1A1A2E]">{monthLabel}</h2>
          <button
            onClick={goToToday}
            className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-[#6B6B80] transition-colors hover:bg-gray-200"
          >
            今日
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B80] transition-colors hover:bg-gray-100"
          aria-label="翌月"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={label} className={cn('py-1 text-center text-[12px] font-medium', WEEKDAY_COLORS[i])}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {grid.map((cell, idx) => {
          const incompleteTasks = cell.tasks.filter(t => !t.done);
          const maxDots = 3;
          const overflowCount = incompleteTasks.length - maxDots;
          const isSelected = selectedDate === cell.dateStr;

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(cell)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-1.5 transition-colors',
                !cell.isCurrentMonth && 'opacity-30',
                isSelected && 'bg-[#F2724B]/5 rounded-lg'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium',
                  cell.isToday && 'bg-[#F2724B] text-white',
                  !cell.isToday && cell.isCurrentMonth && 'text-[#1A1A2E]',
                  !cell.isToday && !cell.isCurrentMonth && 'text-[#9999AA]',
                  isSelected && !cell.isToday && 'ring-1.5 ring-[#F2724B]/40'
                )}
              >
                {cell.day}
              </span>

              {/* Task dots */}
              {incompleteTasks.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {incompleteTasks.slice(0, maxDots).map((t, di) => (
                    <span
                      key={di}
                      className="block h-1 w-1 rounded-full"
                      style={{ backgroundColor: PRIORITY_COLORS[t.priority] }}
                    />
                  ))}
                  {overflowCount > 0 && (
                    <span className="text-[8px] leading-none text-[#9999AA]">+</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day task list */}
      {selectedDate && (
        <div className="mt-2 flex flex-col gap-2">
          <h3 className="text-[13px] font-medium text-[#6B6B80]">
            {selectedDate.slice(5).replace('-', '/')} のタスク ({selectedTasks.length})
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-[#9999AA]">タスクなし</p>
          ) : (
            selectedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => {}}
                onDetail={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
