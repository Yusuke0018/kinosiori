'use client';

import { useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetAction {
  label: string;
  onClick: () => void;
  variant?: 'danger' | 'default';
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: BottomSheetAction[];
}

export default function BottomSheet({ isOpen, onClose, title, message, actions }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg animate-[slideUp_0.2s_ease-out] rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Handle bar */}
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <h2 className="text-[17px] font-semibold text-[#1A1A2E]">{title}</h2>
        {message && (
          <p className="mt-2 text-[14px] leading-relaxed text-[#6B6B80]">{message}</p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.98]',
                action.variant === 'danger'
                  ? 'bg-[#E74C3C] text-white hover:bg-[#d44030]'
                  : 'bg-gray-100 text-[#1A1A2E] hover:bg-gray-200'
              )}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={onClose}
            className="w-full rounded-xl px-4 py-3 text-[15px] font-medium text-[#6B6B80] transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
