import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sleep } from './utils.js';
import { logSubmission, getTodayCount, incrementTodayCount } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');

const DAILY_LIMIT = 200;
const DELAY_BETWEEN_REQUESTS = 500; // ms

export interface IndexingResult {
  url: string;
  status: 'success' | 'error' | 'rate_limited' | 'skipped';
  message: string;
}

export async function checkCredentials(): Promise<boolean> {
  return fs.existsSync(CREDENTIALS_PATH);
}

export async function getAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `credentials.json not found at ${CREDENTIALS_PATH}\n` +
      'Please download it from Google Cloud Console:\n' +
      '1. Go to console.cloud.google.com\n' +
      '2. Create/select project\n' +
      '3. Enable "Web Search Indexing API"\n' +
      '4. Create Service Account → Download JSON key\n' +
      '5. Save as credentials.json in project root'
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  return auth;
}

export async function requestIndexing(urls: string[]): Promise<IndexingResult[]> {
  const auth = await getAuth();
  const indexing = google.indexing({ version: 'v3', auth });

  const results: IndexingResult[] = [];
  let todayCount = getTodayCount('google');

  console.log(`\nGoogle Indexing API - Today's submissions: ${todayCount}/${DAILY_LIMIT}`);

  for (const url of urls) {
    // Check daily limit
    if (todayCount >= DAILY_LIMIT) {
      results.push({
        url,
        status: 'rate_limited',
        message: `Daily limit of ${DAILY_LIMIT} reached`,
      });
      logSubmission(url, 'google', 'rate_limited', 'Daily limit reached');
      continue;
    }

    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });

      results.push({
        url,
        status: 'success',
        message: `Submitted (${response.status})`,
      });

      logSubmission(url, 'google', 'success', `HTTP ${response.status}`);
      incrementTodayCount('google');
      todayCount++;

      console.log(`  ✓ ${url}`);

      // Rate limiting delay
      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        url,
        status: 'error',
        message: errorMessage,
      });
      logSubmission(url, 'google', 'error', errorMessage);
      console.log(`  ✗ ${url}: ${errorMessage}`);
    }
  }

  return results;
}

export async function requestRemoval(urls: string[]): Promise<IndexingResult[]> {
  const auth = await getAuth();
  const indexing = google.indexing({ version: 'v3', auth });

  const results: IndexingResult[] = [];

  for (const url of urls) {
    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_DELETED',
        },
      });

      results.push({
        url,
        status: 'success',
        message: `Removal requested (${response.status})`,
      });

      logSubmission(url, 'google-removal', 'success');
      console.log(`  ✓ Removal: ${url}`);

      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        url,
        status: 'error',
        message: errorMessage,
      });
      console.log(`  ✗ ${url}: ${errorMessage}`);
    }
  }

  return results;
}

export async function getNotificationStatus(url: string): Promise<unknown> {
  const auth = await getAuth();
  const indexing = google.indexing({ version: 'v3', auth });

  const response = await indexing.urlNotifications.getMetadata({
    url: url,
  });

  return response.data;
}
