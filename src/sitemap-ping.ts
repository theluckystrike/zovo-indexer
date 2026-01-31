import { logSubmission } from './db.js';

export interface PingResult {
  endpoint: string;
  status: number | 'error';
  message: string;
}

export async function pingSitemap(sitemapUrl: string): Promise<PingResult[]> {
  const endpoints = [
    {
      name: 'Google',
      url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    },
    {
      name: 'Bing',
      url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    },
  ];

  const results: PingResult[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);

      results.push({
        endpoint: endpoint.name,
        status: response.status,
        message: response.ok ? 'Sitemap pinged successfully' : `HTTP ${response.status}`,
      });

      logSubmission(sitemapUrl, `ping-${endpoint.name.toLowerCase()}`, response.ok ? 'success' : 'error');
      console.log(`  ${response.ok ? '✓' : '✗'} ${endpoint.name}: ${response.status}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        endpoint: endpoint.name,
        status: 'error',
        message: errorMessage,
      });
      logSubmission(sitemapUrl, `ping-${endpoint.name.toLowerCase()}`, 'error', errorMessage);
      console.log(`  ✗ ${endpoint.name}: ${errorMessage}`);
    }
  }

  return results;
}

export async function pingMultipleSitemaps(sitemapUrls: string[]): Promise<Map<string, PingResult[]>> {
  const results = new Map<string, PingResult[]>();

  for (const url of sitemapUrls) {
    console.log(`\nPinging: ${url}`);
    results.set(url, await pingSitemap(url));
  }

  return results;
}
