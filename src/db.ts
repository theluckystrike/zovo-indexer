import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'indexing.db');

const db: DatabaseType = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    indexed_at DATETIME,
    UNIQUE(url, service)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_counts (
    id INTEGER PRIMARY KEY,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    UNIQUE(service, date)
  )
`);

export interface Submission {
  id: number;
  url: string;
  service: string;
  status: string;
  message: string | null;
  submitted_at: string;
  indexed_at: string | null;
}

export function logSubmission(
  url: string,
  service: string,
  status: string,
  message?: string
): void {
  db.prepare(`
    INSERT OR REPLACE INTO submissions (url, service, status, message, submitted_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(url, service, status, message || null);
}

export function getSubmissionHistory(limit: number = 100): Submission[] {
  return db
    .prepare('SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT ?')
    .all(limit) as Submission[];
}

export function getSubmissionsByService(service: string): Submission[] {
  return db
    .prepare('SELECT * FROM submissions WHERE service = ? ORDER BY submitted_at DESC')
    .all(service) as Submission[];
}

export function getTodayCount(service: string): number {
  const today = new Date().toISOString().substring(0, 10);
  const result = db
    .prepare('SELECT count FROM daily_counts WHERE service = ? AND date = ?')
    .get(service, today) as { count: number } | undefined;
  return result?.count || 0;
}

export function incrementTodayCount(service: string): void {
  const today = new Date().toISOString().substring(0, 10);
  db.prepare(`
    INSERT INTO daily_counts (service, date, count)
    VALUES (?, ?, 1)
    ON CONFLICT(service, date) DO UPDATE SET count = count + 1
  `).run(service, today);
}

export function getStats(): { service: string; total: number; today: number }[] {
  const today = new Date().toISOString().substring(0, 10);
  const stats = db.prepare(`
    SELECT
      s.service,
      COUNT(*) as total,
      COALESCE(d.count, 0) as today
    FROM submissions s
    LEFT JOIN daily_counts d ON s.service = d.service AND d.date = ?
    GROUP BY s.service
  `).all(today) as { service: string; total: number; today: number }[];
  return stats;
}

export { db };
