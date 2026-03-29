/**
 * @module utils/dateHelpers
 * @description Date formatting and deadline zone calculations.
 */

/**
 * Format a date for display.
 * @param {string|Date} date
 * @returns {string} e.g. "29 Mar 2026, 14:30"
 */
export const formatDate = (date) => {
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
 * @param {string|Date} date
 * @returns {string} YYYY-MM-DDTHH:mm format
 */
export const formatDateForInput = (date) => {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Check if a task is in the deadline zone (< 1 hour remaining).
 * @param {string|Date} deadline
 * @returns {boolean}
 */
export const isInDeadlineZone = (deadline) => {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  return diffMs > 0 && diffMs <= 3600000; // 1 hour in ms
};

/**
 * Check if a deadline has passed.
 * @param {string|Date} deadline
 * @returns {boolean}
 */
export const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

/**
 * Get relative time string.
 * @param {string|Date} date
 * @returns {string} e.g. "în 2 ore", "acum 3 zile"
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d - now;
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  let text;
  if (minutes < 60) text = `${minutes} min`;
  else if (hours < 24) text = `${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  else text = `${days} ${days === 1 ? 'zi' : 'zile'}`;

  return isPast ? `acum ${text}` : `în ${text}`;
};

/**
 * Get date range for a month (first day to last day).
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {{ start: Date, end: Date }}
 */
export const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
};

/**
 * Get days grid for a calendar month (includes padding from prev/next month).
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array<Date>}
 */
export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday (adjust for locale)
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7;
  startDay -= 1;

  const days = [];

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
