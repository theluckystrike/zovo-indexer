/**
 * Zovo Indexer - Sitemap Parser
 * Handles parsing of XML sitemaps (standard and index sitemaps)
 * 
 * @module sitemap-parser
 * @requires fast-xml-parser
 */

import { XMLParser } from 'fast-xml-parser';

/**
 * URL entry in a sitemap
 * @interface UrlEntry
 * @property {string} loc - The URL location
 * @property {string} [lastmod] - Last modification date
 * @property {string} [changefreq] - Change frequency
 * @property {string} [priority] - Priority value
 */

/**
 * Sitemap entry in a sitemap index
 * @interface SitemapEntry
 * @property {string} loc - The sitemap URL
 * @property {string} [lastmod] - Last modification date
 */

/**
 * Parsed URL set structure
 * @interface UrlSet
 * @property {UrlEntry | UrlEntry[]} url - URL entries
 */

/**
 * Parsed sitemap index structure
 * @interface SitemapIndex
 * @property {SitemapEntry | SitemapEntry[]} sitemap - Sitemap entries
 */

/**
 * Internal parsed sitemap structure
 * @interface ParsedSitemap
 * @property {UrlSet} [urlset] - URL set (standard sitemap)
 * @property {SitemapIndex} [sitemapindex] - Sitemap index (sitemap of sitemaps)
 */

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

interface UrlSet {
  url: UrlEntry | UrlEntry[];
}

interface SitemapIndex {
  sitemap: SitemapEntry | SitemapEntry[];
}

interface ParsedSitemap {
  urlset?: UrlSet;
  sitemapindex?: SitemapIndex;
}

/**
 * Extract all URLs from a sitemap or sitemap index
 * Recursively parses child sitemaps if it's a sitemap index
 * @param {string} sitemapUrl - URL of the sitemap to parse
 * @returns {Promise<string[]>} Array of URLs found in the sitemap
 */
export async function getUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  console.log(`Fetching sitemap: ${sitemapUrl}`);

  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const result = parser.parse(xml) as ParsedSitemap;

  // Handle urlset (regular sitemap)
  if (result.urlset?.url) {
    const urls = Array.isArray(result.urlset.url)
      ? result.urlset.url
      : [result.urlset.url];
    return urls.map((u) => u.loc);
  }

  // Handle sitemapindex (sitemap of sitemaps)
  if (result.sitemapindex?.sitemap) {
    const sitemaps = Array.isArray(result.sitemapindex.sitemap)
      ? result.sitemapindex.sitemap
      : [result.sitemapindex.sitemap];

    console.log(`Found ${sitemaps.length} child sitemaps`);

    const childUrls = await Promise.all(
      sitemaps.map((s) => getUrlsFromSitemap(s.loc))
    );
    return childUrls.flat();
  }

  console.warn('No URLs found in sitemap');
  return [];
}

/**
 * Extract URLs from a sitemap with metadata (lastmod, changefreq, priority)
 * @param {string} sitemapUrl - URL of the sitemap to parse
 * @returns {Promise<UrlEntry[]>} Array of URL entries with metadata
 */
export async function getUrlsWithMeta(
  sitemapUrl: string
): Promise<UrlEntry[]> {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser();
  const result = parser.parse(xml) as ParsedSitemap;

  if (result.urlset?.url) {
    const urls = Array.isArray(result.urlset.url)
      ? result.urlset.url
      : [result.urlset.url];
    return urls;
  }

  return [];
}
