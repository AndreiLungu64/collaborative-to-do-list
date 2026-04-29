/**
 * @module utils/dateHelpers
 * @description Date formatting and deadline zone calculations.
 */

/**
 * Format a date for display.
 * @param date
 * @returns e.g. "29 Mar 2026, 14:30"
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date for date input fields.
 * @returns YYYY-MM-DDTHH:mm format
 */
export const formatDateForInput = (date: string | Date): string => {
  const d = new Date(date);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Check if a task is in the deadline zone (< 1 hour remaining).
 */
export const isInDeadlineZone = (deadline: string | Date): boolean => {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 3600000; // 1 hour in ms
};

/**
 * Check if a deadline has passed.
 */
export const isOverdue = (deadline: string | Date): boolean => {
  return new Date(deadline) < new Date();
};

/**
 * Get relative time string.
 * @returns e.g. "în 2 ore", "acum 3 zile"
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  let text: string;
  if (minutes < 60) text = `${minutes} min`;
  else if (hours < 24) text = `${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  else text = `${days} ${days === 1 ? 'zi' : 'zile'}`;

  return isPast ? `acum ${text}` : `în ${text}`;
};

/**
 * Get date range for a month (first day to last day).
 */
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
};

/**
 * Get days grid for a calendar month (includes padding from prev/next month).
 */
export const getCalendarDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday (adjust for locale)
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7;
  startDay -= 1;

  const days: Date[] = [];

  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Next month padding (fill to 42 = 6 weeks)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};
