'use client';

interface NotificationPermissionCardProps {
  isRequesting: boolean;
  isStandalone: boolean;
  permission: NotificationPermission | 'unsupported';
  todayCount: number;
  onRequestPermission: () => void;
}

export default function NotificationPermissionCard({
  isRequesting,
  isStandalone,
  permission,
  todayCount,
  onRequestPermission,
}: NotificationPermissionCardProps) {
  if (permission === 'unsupported') {
    return null;
  }

  if (permission === 'granted' && isStandalone) {
    return null;
  }

  const countLabel =
    todayCount > 0 ? `今日は ${todayCount} 件の未完了タスクがあります。` : '';

  let title = '通知を許可すると気づきやすくなります';
  let description =
    '今日の未完了タスクがある間、通知を維持して Android のホーム画面アイコンに反映されやすくします。';

  if (!isStandalone) {
    title = 'ホーム画面に追加すると見やすくなります';
    description =
      'Chrome のメニューからホーム画面に追加すると、通知許可後にアイコンのバッジ表示が反映されやすくなります。';
  }

  if (permission === 'denied') {
    title = '通知がブロックされています';
    description =
      'Chrome のサイト設定から通知を許可すると、今日のタスクをアイコンで気づけるようになります。';
  }

  return (
    <section className="mx-4 mt-3 rounded-[28px] border border-[#F2C8B8] bg-white/75 px-4 py-4 text-[#1A1A2E] shadow-[0_14px_40px_rgba(242,114,75,0.14)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2724B]/12 text-[#F2724B]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 3.25C7.65279 3.25 5.75 5.15279 5.75 7.5V9.60412C5.75 10.1701 5.52522 10.7128 5.125 11.113L4.46967 11.7683C4.15446 12.0835 4.37769 12.625 4.82322 12.625H15.1768C15.6223 12.625 15.8455 12.0835 15.5303 11.7683L14.875 11.113C14.4748 10.7128 14.25 10.1701 14.25 9.60412V7.5C14.25 5.15279 12.3472 3.25 10 3.25Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.25 14.5C8.56507 15.1218 9.21467 15.55 10 15.55C10.7853 15.55 11.4349 15.1218 11.75 14.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{title}</p>
          <p className="mt-1 text-[13px] leading-6 text-[#5A5A70]">
            {countLabel}
            {description}
          </p>
          {permission === 'default' && (
            <button
              type="button"
              onClick={onRequestPermission}
              disabled={isRequesting}
              className="mt-3 inline-flex items-center rounded-full bg-[#F2724B] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#E0633D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRequesting ? '許可を確認中...' : '通知を有効にする'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
