'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import BottomSheet from '@/components/BottomSheet';

type Priority = 'none' | 'low' | 'medium' | 'high';

interface TaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'none', label: 'なし', color: '#9999AA' },
  { value: 'low', label: '低', color: '#3498DB' },
  { value: 'medium', label: '中', color: '#F39C12' },
  { value: 'high', label: '高', color: '#E74C3C' },
];

export default function TaskDetail({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [date, setDate] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setText(task.text);
      setPriority(task.priority);
      setDate(task.date);
      setHasChanges(false);
    }
  }, [task]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const today = useMemo(() => formatDate(new Date()), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  }, []);
  const nextWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatDate(d);
  }, []);

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      markChanged();
    },
    [markChanged]
  );

  const handlePriorityChange = useCallback(
    (p: Priority) => {
      setPriority(p);
      markChanged();
    },
    [markChanged]
  );

  const handleDateChip = useCallback(
    (newDate: string | null) => {
      setDate(newDate);
      markChanged();
    },
    [markChanged]
  );

  const handleDatePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val) {
        setDate(val);
        markChanged();
      }
    },
    [markChanged]
  );

  const handleSave = useCallback(() => {
    if (!task) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const updates: Partial<Task> = {};
    if (trimmed !== task.text) updates.text = trimmed;
    if (priority !== task.priority) updates.priority = priority;
    if (date !== task.date) updates.date = date;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      onUpdate(task.id, updates);
    }
    onClose();
  }, [task, text, priority, date, onUpdate, onClose]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!task) return;
    onDelete(task.id);
    setShowDeleteConfirm(false);
    onClose();
  }, [task, onDelete, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        if (hasChanges) {
          handleSave();
        } else {
          onClose();
        }
      }
    },
    [hasChanges, handleSave, onClose]
  );

  if (!isOpen || !task) return null;

  const dateLabel = date ? date.slice(5).replace('-', '/') : null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
        onClick={handleBackdropClick}
      >
        <div
          className="flex w-full max-w-lg animate-[slideUp_0.2s_ease-out] flex-col rounded-t-2xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-label="タスク詳細"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="flex flex-col gap-5 px-6 pb-8 pt-2">
            {/* Task text */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#9999AA]">
                タスク
              </label>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-[#1A1A2E] outline-none transition-colors focus:border-[#F2724B]/40 focus:ring-2 focus:ring-[#F2724B]/10"
              />
            </div>

            {/* Date selection */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#9999AA]">
                日付
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDateChip(today)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                    date === today
                      ? 'bg-[#F2724B]/10 text-[#F2724B]'
                      : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
                  )}
                >
                  今日
                </button>
                <button
                  onClick={() => handleDateChip(tomorrow)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                    date === tomorrow
                      ? 'bg-[#F2724B]/10 text-[#F2724B]'
                      : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
                  )}
                >
                  明日
                </button>
                <button
                  onClick={() => handleDateChip(nextWeek)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                    date === nextWeek
                      ? 'bg-[#F2724B]/10 text-[#F2724B]'
                      : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
                  )}
                >
                  来週
                </button>

                {/* Custom date picker */}
                <div className="relative">
                  <button
                    onClick={() => datePickerRef.current?.showPicker()}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                      date && date !== today && date !== tomorrow && date !== nextWeek
                        ? 'bg-[#F2724B]/10 text-[#F2724B]'
                        : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
                    )}
                  >
                    {date && date !== today && date !== tomorrow && date !== nextWeek
                      ? dateLabel
                      : '選択'}
                  </button>
                  <input
                    ref={datePickerRef}
                    type="date"
                    value={date ?? ''}
                    onChange={handleDatePickerChange}
                    className="pointer-events-none absolute inset-0 opacity-0"
                    tabIndex={-1}
                  />
                </div>

                {/* Remove date button */}
                <button
                  onClick={() => handleDateChip(null)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                    date === null
                      ? 'bg-[#F2724B]/10 text-[#F2724B]'
                      : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
                  )}
                >
                  日付を外す
                </button>
              </div>
            </div>

            {/* Priority selection */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#9999AA]">
                優先度
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => handlePriorityChange(p.value)}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                      priority === p.value
                        ? 'ring-2 ring-offset-1'
                        : 'bg-gray-100 hover:bg-gray-200'
                    )}
                    style={
                      {
                        color: priority === p.value ? p.color : '#6B6B80',
                        backgroundColor:
                          priority === p.value ? p.color + '15' : undefined,
                        '--tw-ring-color':
                          priority === p.value ? p.color + '50' : undefined,
                      } as React.CSSProperties
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDelete}
                className="rounded-xl px-4 py-3 text-[14px] font-medium text-[#E74C3C] transition-all hover:bg-red-50 active:scale-[0.98]"
              >
                削除
              </button>
              <div className="flex-1" />
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="rounded-xl bg-[#F2724B] px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-[#e0633d] active:scale-[0.98]"
                >
                  保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <BottomSheet
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="タスクを削除しますか？"
        message="この操作は取り消せません。"
        actions={[
          {
            label: '削除する',
            onClick: confirmDelete,
            variant: 'danger',
          },
        ]}
      />
    </>
  );
}
