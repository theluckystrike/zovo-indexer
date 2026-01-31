import { logSubmission, getTodayCount, incrementTodayCount } from './db.js';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

const DAILY_LIMIT = 10000;

export interface IndexNowConfig {
  host: string;
  key: string;
  keyLocation?: string;
}

export interface IndexNowResult {
  endpoint: string;
  status: number | 'error';
  message: string;
}

export function validateConfig(config: IndexNowConfig): void {
  if (!config.host) {
    throw new Error('INDEXNOW_HOST not set. Add it to your .env file.');
  }
  if (!config.key) {
    throw new Error(
      'INDEXNOW_KEY not set. Generate one with: openssl rand -hex 16\n' +
      'Then add to .env and host at https://your-domain.com/[key].txt'
    );
  }
}

export async function submitIndexNow(
  urls: string[],
  config: IndexNowConfig
): Promise<IndexNowResult[]> {
  validateConfig(config);

  const todayCount = getTodayCount('indexnow');
  console.log(`\nIndexNow - Today's submissions: ${todayCount}/${DAILY_LIMIT}`);

  if (todayCount + urls.length > DAILY_LIMIT) {
    const remaining = DAILY_LIMIT - todayCount;
    console.warn(`Warning: Only ${remaining} submissions remaining today. Limiting batch.`);
    urls = urls.slice(0, remaining);
  }

  if (urls.length === 0) {
    console.log('No URLs to submit (daily limit reached)');
    return [];
  }

  const keyLocation = config.keyLocation || `https://${config.host}/${config.key}.txt`;

  const payload = {
    host: config.host,
    key: config.key,
    keyLocation: keyLocation,
    urlList: urls,
  };

  const results: IndexNowResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const statusText = getStatusText(response.status);
      results.push({
        endpoint,
        status: response.status,
        message: statusText,
      });

      console.log(`  ${response.status === 200 || response.status === 202 ? '✓' : '✗'} ${endpoint}: ${response.status} ${statusText}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        endpoint,
        status: 'error',
        message: errorMessage,
      });
      console.log(`  ✗ ${endpoint}: ${errorMessage}`);
    }
  }

  // Log each URL
  for (const url of urls) {
    const success = results.some(r => r.status === 200 || r.status === 202);
    logSubmission(url, 'indexnow', success ? 'success' : 'error');
    if (success) {
      incrementTodayCount('indexnow');
    }
  }

  return results;
}

export async function submitSingleUrl(
  url: string,
  config: IndexNowConfig
): Promise<IndexNowResult[]> {
  validateConfig(config);

  // For single URL, use GET request
  const results: IndexNowResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const params = new URLSearchParams({
        url: url,
        key: config.key,
      });

      const response = await fetch(`${endpoint}?${params}`);

      results.push({
        endpoint,
        status: response.status,
        message: getStatusText(response.status),
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

function getStatusText(status: number): string {
  switch (status) {
    case 200:
      return 'OK - URL submitted successfully';
    case 202:
      return 'Accepted - URL received';
    case 400:
      return 'Bad Request - Invalid format';
    case 403:
      return 'Forbidden - Key not valid or not matching URL';
    case 422:
      return 'Unprocessable - URLs don\'t belong to host';
    case 429:
      return 'Too Many Requests - Rate limited';
    default:
      return `Status ${status}`;
  }
}

export function generateKey(): string {
  const chars = 'abcdef0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
