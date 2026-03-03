/**
 * Zovo Indexer - Sitemap Ping Service
 * Notifies search engines about sitemap updates via ping endpoints
 * 
 * @module sitemap-ping
 */

import { logSubmission } from './db.js';

/**
 * Result of a sitemap ping operation
 * @interface PingResult
 * @property {string} endpoint - Search engine name (Google, Bing)
 * @property {number | 'error'} status - HTTP status code or 'error'
 * @property {string} message - Human-readable result message
 */

export interface PingResult {
  endpoint: string;
  status: number | 'error';
  message: string;
}

/**
 * Ping Google and Bing to notify them about a sitemap
 * @param {string} sitemapUrl - URL of the sitemap to ping
 * @returns {Promise<PingResult[]>} Array of ping results for each search engine
 */
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

/**
 * Ping multiple sitemaps sequentially
 * @param {string[]} sitemapUrls - Array of sitemap URLs to ping
 * @returns {Promise<Map<string, PingResult[]>>} Map of sitemap URL to its ping results
 */
export async function pingMultipleSitemaps(sitemapUrls: string[]): Promise<Map<string, PingResult[]>> {
  const results = new Map<string, PingResult[]>();

  for (const url of sitemapUrls) {
    console.log(`\nPinging: ${url}`);
    results.set(url, await pingSitemap(url));
  }

  return results;
}
