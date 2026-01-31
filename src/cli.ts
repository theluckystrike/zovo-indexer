#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { getUrlsFromSitemap } from './sitemap-parser.js';
import { requestIndexing, checkCredentials, getNotificationStatus } from './google-indexer.js';
import { submitIndexNow, generateKey, IndexNowConfig } from './indexnow.js';
import { pingSitemap } from './sitemap-ping.js';
import { getSubmissionHistory, getStats } from './db.js';
import { truncateUrl } from './utils.js';

dotenv.config();

const program = new Command();

program
  .name('zovo-indexer')
  .description('Safe, free indexing tool for Extension Insiders using official APIs')
  .version('1.0.0');

// Main index command
program
  .command('index')
  .description('Request indexing for URLs via various services')
  .option('-s, --sitemap <url>', 'Sitemap URL to extract pages from')
  .option('-u, --urls <urls...>', 'Specific URLs to index')
  .option('-l, --limit <number>', 'Max URLs per run', '50')
  .option('--google', 'Submit to Google Indexing API')
  .option('--indexnow', 'Submit to IndexNow (Bing, Yandex, etc.)')
  .option('--ping', 'Ping sitemap to search engines')
  .option('--all', 'Submit to all services')
  .option('--dry-run', 'Show what would be submitted without submitting')
  .action(async (options) => {
    console.log('\n🔍 Zovo Indexer - Extension Insiders\n');

    let urls: string[] = [];

    // Get URLs from sitemap
    if (options.sitemap) {
      try {
        const sitemapUrls = await getUrlsFromSitemap(options.sitemap);
        console.log(`Found ${sitemapUrls.length} URLs in sitemap`);
        urls = [...urls, ...sitemapUrls];
      } catch (error) {
        console.error(`Error fetching sitemap: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    }

    // Add specific URLs
    if (options.urls) {
      urls = [...urls, ...options.urls];
    }

    if (urls.length === 0) {
      console.error('No URLs provided. Use --sitemap or --urls');
      process.exit(1);
    }

    // Remove duplicates
    urls = [...new Set(urls)];

    // Apply limit
    const limit = parseInt(options.limit);
    if (urls.length > limit) {
      console.log(`Limiting to ${limit} URLs (use --limit to change)`);
      urls = urls.slice(0, limit);
    }

    console.log(`\nURLs to process: ${urls.length}`);

    // Dry run mode
    if (options.dryRun) {
      console.log('\n📋 Dry run - would submit:');
      urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
      return;
    }

    const useGoogle = options.google || options.all;
    const useIndexNow = options.indexnow || options.all;
    const usePing = options.ping || options.all;

    if (!useGoogle && !useIndexNow && !usePing) {
      console.log('\nNo service specified. Use --google, --indexnow, --ping, or --all');
      return;
    }

    // Google Indexing API
    if (useGoogle) {
      console.log('\n📍 Google Indexing API');
      const hasCredentials = await checkCredentials();
      if (!hasCredentials) {
        console.log('  ⚠ credentials.json not found - skipping Google');
        console.log('  See: https://developers.google.com/search/apis/indexing-api/v3/quickstart');
      } else {
        try {
          await requestIndexing(urls);
        } catch (error) {
          console.error(`  Error: ${error instanceof Error ? error.message : error}`);
        }
      }
    }

    // IndexNow
    if (useIndexNow) {
      console.log('\n📍 IndexNow (Bing, Yandex, etc.)');
      const config: IndexNowConfig = {
        host: process.env.INDEXNOW_HOST || '',
        key: process.env.INDEXNOW_KEY || '',
        keyLocation: process.env.INDEXNOW_KEY_LOCATION,
      };

      try {
        await submitIndexNow(urls, config);
      } catch (error) {
        console.error(`  Error: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Sitemap ping
    if (usePing && options.sitemap) {
      console.log('\n📍 Sitemap Ping');
      await pingSitemap(options.sitemap);
    } else if (usePing && !options.sitemap) {
      console.log('\n📍 Sitemap Ping - skipped (no sitemap URL provided)');
    }

    console.log('\n✅ Done!\n');
  });

// Status command
program
  .command('status')
  .description('Check notification status for URLs (Google)')
  .option('-u, --urls <urls...>', 'URLs to check')
  .action(async (options) => {
    if (!options.urls || options.urls.length === 0) {
      console.error('No URLs provided. Use --urls');
      process.exit(1);
    }

    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
      console.error('credentials.json not found - required for status check');
      process.exit(1);
    }

    console.log('\n📊 Checking notification status...\n');

    for (const url of options.urls) {
      try {
        const status = await getNotificationStatus(url);
        console.log(`${url}:`);
        console.log(JSON.stringify(status, null, 2));
        console.log('');
      } catch (error) {
        console.log(`${url}: Error - ${error instanceof Error ? error.message : error}\n`);
      }
    }
  });

// History command
program
  .command('history')
  .description('View submission history')
  .option('-l, --limit <number>', 'Number of entries to show', '20')
  .option('-s, --service <service>', 'Filter by service (google, indexnow, ping-google, ping-bing)')
  .action(async (options) => {
    const history = getSubmissionHistory(parseInt(options.limit) * 5);

    let filtered = history;
    if (options.service) {
      filtered = history.filter(h => h.service === options.service);
    }
    filtered = filtered.slice(0, parseInt(options.limit));

    console.log('\n📜 Submission History\n');

    if (filtered.length === 0) {
      console.log('No submissions found.');
      return;
    }

    console.log('Time                 Service      Status   URL');
    console.log('─'.repeat(80));

    for (const entry of filtered) {
      const time = entry.submitted_at.substring(5, 16);
      const service = entry.service.padEnd(12);
      const status = entry.status.padEnd(8);
      const url = truncateUrl(entry.url, 40);
      console.log(`${time}  ${service} ${status} ${url}`);
    }
  });

// Stats command
program
  .command('stats')
  .description('View submission statistics')
  .action(async () => {
    const stats = getStats();

    console.log('\n📈 Submission Statistics\n');

    if (stats.length === 0) {
      console.log('No submissions yet.');
      return;
    }

    console.log('Service          Today    Total');
    console.log('─'.repeat(35));

    for (const stat of stats) {
      const service = stat.service.padEnd(16);
      const today = String(stat.today).padStart(5);
      const total = String(stat.total).padStart(8);
      console.log(`${service} ${today} ${total}`);
    }

    console.log('\nRate Limits:');
    console.log('  Google Indexing API: 200/day');
    console.log('  IndexNow: 10,000/day');
  });

// Generate key command
program
  .command('generate-key')
  .description('Generate a random IndexNow key')
  .action(() => {
    const key = generateKey();
    console.log('\n🔑 Generated IndexNow Key\n');
    console.log(`Key: ${key}`);
    console.log(`\nSetup steps:`);
    console.log(`1. Add to .env: INDEXNOW_KEY=${key}`);
    console.log(`2. Create file: public/${key}.txt`);
    console.log(`3. File contents: ${key}`);
    console.log(`4. Deploy so it's accessible at https://your-domain.com/${key}.txt`);
  });

// Parse sitemap command
program
  .command('parse-sitemap')
  .description('Parse and display URLs from a sitemap')
  .argument('<url>', 'Sitemap URL')
  .option('-l, --limit <number>', 'Max URLs to display', '50')
  .action(async (url, options) => {
    try {
      const urls = await getUrlsFromSitemap(url);
      const limit = parseInt(options.limit);

      console.log(`\n📋 URLs in sitemap (${urls.length} total)\n`);

      const display = urls.slice(0, limit);
      display.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));

      if (urls.length > limit) {
        console.log(`\n  ... and ${urls.length - limit} more`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program.parse();
