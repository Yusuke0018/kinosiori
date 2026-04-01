const TASK_BADGE_TAG = 'today-task-badge';
const TASK_BADGE_URL = '/';

type BadgeCapableNavigator = Navigator & {
  clearAppBadge?: () => Promise<void>;
  setAppBadge?: (contents?: number) => Promise<void>;
};

type ExtendedNotificationOptions = NotificationOptions & {
  renotify?: boolean;
  requireInteraction?: boolean;
};

export function getNotificationPermissionState():
  | NotificationPermission
  | 'unsupported' {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return 'unsupported';
  }

  return Notification.permission;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  );
}

export async function registerTaskBadgeServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (error) {
    console.error('Failed to register service worker:', error);
    return null;
  }
}

export async function requestTaskBadgePermission():
  Promise<NotificationPermission | 'unsupported'> {
  const permission = getNotificationPermissionState();
  if (permission === 'unsupported') {
    return 'unsupported';
  }

  return Notification.requestPermission();
}

async function syncNavigatorBadge(count: number) {
  const badgeNavigator = navigator as BadgeCapableNavigator;

  try {
    if (count > 0) {
      await badgeNavigator.setAppBadge?.(count);
      return;
    }

    await badgeNavigator.clearAppBadge?.();
  } catch (error) {
    console.error('Failed to sync app badge:', error);
  }
}

export async function syncTodayTaskBadge(count: number) {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('Notification' in window)
  ) {
    return;
  }

  await syncNavigatorBadge(count);

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingNotifications = await registration.getNotifications({
      tag: TASK_BADGE_TAG,
    });

    if (count <= 0) {
      existingNotifications.forEach((notification) => notification.close());
      return;
    }

    const sameCountNotification = existingNotifications.find(
      (notification) => notification.data?.count === count
    );

    existingNotifications
      .filter((notification) => notification !== sameCountNotification)
      .forEach((notification) => notification.close());

    if (sameCountNotification) {
      return;
    }

    const title =
      count === 1
        ? '今日のタスクが1件あります'
        : `今日のタスクが${count}件あります`;

    const options: ExtendedNotificationOptions = {
      body: 'ホーム画面のアイコンからも気づけるように通知を維持しています。',
      tag: TASK_BADGE_TAG,
      renotify: false,
      requireInteraction: true,
      silent: true,
      badge: '/icon-192.png',
      icon: '/icon-192.png',
      data: {
        count,
        kind: TASK_BADGE_TAG,
        url: TASK_BADGE_URL,
      },
    };

    await registration.showNotification(title, options);
  } catch (error) {
    console.error('Failed to sync notification badge:', error);
  }
}
