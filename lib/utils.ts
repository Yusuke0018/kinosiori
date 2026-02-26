/**
 * Returns a time-based Japanese greeting.
 * 5:00-10:59  -> おはよう、{name}
 * 11:00-16:59 -> おつかれさま、{name}
 * 17:00-4:59  -> おつかれさま、{name}
 */
export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 10) {
    return `おはよう、${name}`;
  }
  return `おつかれさま、${name}`;
}

/**
 * Returns a time-based placeholder text for task input.
 */
export function getPlaceholder(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 10) {
    return "今日やることを書いてみよう";
  }
  if (hour >= 11 && hour <= 16) {
    return "午後もがんばろう";
  }
  return "明日の準備をしておこう";
}

/**
 * Formats a Date to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date string (YYYY-MM-DD) is before today.
 */
export function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return target < today;
}

/**
 * Returns a human-readable overdue label in Japanese.
 * "昨日から持ち越し" for 1 day overdue.
 * "○日前から持ち越し" for 2+ days overdue.
 * Returns empty string if not overdue.
 */
export function getOverdueLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "";
  if (diffDays === 1) return "昨日から持ち越し";
  return `${diffDays}日前から持ち越し`;
}

/**
 * Classname utility. Joins class strings, filtering out falsy values.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
