/**
 * Timezone-aware date & time utilities.
 * Ensures timestamps stored in UTC (such as from SQLite/MySQL)
 * are always accurately displayed in the user's local timezone (e.g. IST, UTC+5:30).
 */

/**
 * Normalizes ISO date strings so JavaScript Date parser always treats them as UTC
 * if no timezone offset is present.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  let str = String(dateStr).trim();
  // If string has 'T' or space and no timezone (no 'Z' and no +00:00 or -05:00)
  if (!str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    // Replace space between date and time with T if present
    str = str.replace(' ', 'T') + 'Z';
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats date and time to user's localized format (e.g. "9/9/2026, 3:15:49 PM" in IST)
 */
export const formatDateTime = (dateStr, options = {}) => {
  const d = parseLocalDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options,
  });
};

/**
 * Formats time only (e.g. "03:15:49 PM")
 */
export const formatTime = (dateStr, options = {}) => {
  const d = parseLocalDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options,
  });
};

/**
 * Formats date only (e.g. "Sep 9, 2026")
 */
export const formatDate = (dateStr, options = {}) => {
  const d = parseLocalDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};
