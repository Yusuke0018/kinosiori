'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

type Priority = 'none' | 'low' | 'medium' | 'high';

interface QuickInputProps {
  onAdd: (text: string, date: string | null, priority: string) => void;
}

const PRIORITY_CYCLE: Priority[] = ['none', 'low', 'medium', 'high'];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  none: { label: 'なし', color: '#9999AA', bg: 'bg-gray-100' },
  low: { label: '低', color: '#3498DB', bg: 'bg-blue-50' },
  medium: { label: '中', color: '#F39C12', bg: 'bg-amber-50' },
  high: { label: '高', color: '#E74C3C', bg: 'bg-red-50' },
};

function getPlaceholderByTime(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 10) return '今日やること何がある？';
  if (hour >= 11 && hour <= 16) return '午後のタスクを追加';
  return '明日の自分に申し送り';
}

export default function QuickInput({ onAdd }: QuickInputProps) {
  const [text, setText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<'inbox' | 'today' | 'tomorrow' | 'pick'>('inbox');
  const [priority, setPriority] = useState<Priority>('none');
  const [placeholder, setPlaceholder] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlaceholder(getPlaceholderByTime());
    inputRef.current?.focus();
  }, []);

  const handleDateChip = useCallback((chip: 'inbox' | 'today' | 'tomorrow' | 'pick') => {
    const today = new Date();
    switch (chip) {
      case 'inbox':
        setSelectedDate(null);
        setActiveChip('inbox');
        break;
      case 'today':
        setSelectedDate(formatDate(today));
        setActiveChip('today');
        break;
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(formatDate(tomorrow));
        setActiveChip('tomorrow');
        break;
      }
      case 'pick':
        datePickerRef.current?.showPicker();
        break;
    }
  }, []);

  const handleDatePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setSelectedDate(val);
      setActiveChip('pick');
    }
  }, []);

  const cyclePriority = useCallback(() => {
    setPriority(prev => {
      const idx = PRIORITY_CYCLE.indexOf(prev);
      return PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, selectedDate, priority);
    setText('');
    setPriority('none');
    inputRef.current?.focus();
  }, [text, selectedDate, priority, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const pConfig = PRIORITY_CONFIG[priority];

  return (
    <div className="w-full px-4 pt-3 pb-2">
      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-[#1A1A2E] placeholder-[#9999AA] outline-none backdrop-blur-md transition-colors focus:border-[#F2724B]/40 focus:ring-2 focus:ring-[#F2724B]/10"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#F2724B] text-white shadow-sm transition-all hover:bg-[#e0633d] active:scale-95 disabled:opacity-40 disabled:active:scale-100"
          aria-label="タスクを追加"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Date chips and priority */}
      <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleDateChip('inbox')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
            activeChip === 'inbox'
              ? 'bg-[#F2724B]/10 text-[#F2724B]'
              : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => handleDateChip('today')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
            activeChip === 'today'
              ? 'bg-[#F2724B]/10 text-[#F2724B]'
              : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
          }`}
        >
          今日
        </button>
        <button
          onClick={() => handleDateChip('tomorrow')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
            activeChip === 'tomorrow'
              ? 'bg-[#F2724B]/10 text-[#F2724B]'
              : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
          }`}
        >
          明日
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => handleDateChip('pick')}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
              activeChip === 'pick'
                ? 'bg-[#F2724B]/10 text-[#F2724B]'
                : 'bg-gray-100 text-[#6B6B80] hover:bg-gray-200'
            }`}
          >
            {activeChip === 'pick' && selectedDate
              ? selectedDate.slice(5).replace('-', '/')
              : '日付を選ぶ'}
          </button>
          <input
            ref={datePickerRef}
            type="date"
            onChange={handleDatePickerChange}
            className="pointer-events-none absolute inset-0 opacity-0"
            tabIndex={-1}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Priority toggle */}
        <button
          onClick={cyclePriority}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${pConfig.bg}`}
          style={{ color: pConfig.color }}
          aria-label={`優先度: ${pConfig.label}`}
        >
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z"
                fill={priority === 'none' ? 'none' : pConfig.color}
                stroke={pConfig.color}
                strokeWidth="1"
              />
            </svg>
            {pConfig.label}
          </span>
        </button>
      </div>
    </div>
  );
}
