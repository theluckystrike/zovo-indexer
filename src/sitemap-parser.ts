import { XMLParser } from 'fast-xml-parser';

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
