/**
 * Pauses execution for the specified number of milliseconds.
 * @param ms - The number of milliseconds to sleep
 * @returns A promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formats a Date object as a SQL-style datetime string.
 * @param date - The date to format
 * @returns Formatted date string in "YYYY-MM-DD HH:MM:SS" format
 */
export function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Truncates a URL to a maximum length, adding ellipsis if truncated.
 * @param url - The URL to truncate
 * @param maxLength - Maximum length before truncation (default: 60)
 * @returns The truncated URL or original if shorter than maxLength
 */
export function truncateUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}
