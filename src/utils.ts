export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function truncateUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}
