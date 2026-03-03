# Zovo Indexer

[![npm version](https://img.shields.io/npm/v/zovo-indexer)](https://npmjs.com/package/zovo-indexer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Discord](https://img.shields.io/badge/Discord-Zovo-blueviolet.svg?logo=discord)](https://discord.gg/zovo)
[![Website](https://img.shields.io/badge/Website-zovo.one-blue)](https://zovo.one)
[![GitHub Stars](https://img.shields.io/github/stars/theluckystrike/zovo-indexer?style=social)](https://github.com/theluckystrike/zovo-indexer)

Safe, free indexing tool for Extension Insiders using official APIs. Submits URLs to Google Indexing API and IndexNow for fast indexing of your Chrome extension pages.

## Features

- **Google Indexing API** - Submit URLs directly to Google's indexing service
- **IndexNow Support** - Push URLs to IndexNow-compatible search engines
- **Sitemap Parsing** - Automatically extract URLs from XML sitemaps
- **Sitemap Ping** - Notify search engines of sitemap updates
- **SQLite Storage** - Local database to track indexing status
- **CLI Interface** - Easy command-line usage

## Installation

### From npm

```bash
# Install globally
npm install -g zovo-indexer

# Or use npx
npx zovo-indexer --help
```

### From Source

```bash
# Clone the repository
git clone https://github.com/theluckystrike/zovo-indexer.git
cd zovo-indexer

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### CLI Commands

```bash
# Index a single URL (requires Google service account JSON)
zovo-indexer index https://example.com/page

# Index all URLs from a sitemap
zovo-indexer sitemap https://example.com/sitemap.xml

# Ping search engines about sitemap
zovo-indexer ping-sitemap https://example.com/sitemap.xml

# Submit to IndexNow
zovo-indexer indexnow https://example.com/page
```

### Environment Variables

Create a `.env` file:

```bash
# Google Service Account (for Indexing API)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# IndexNow API Key
INDEXNOW_KEY=your-api-key
```

### Programmatic Usage

The library exports functions for Google Indexing API, IndexNow, and sitemap parsing:

```typescript
import { 
  requestIndexing, 
  getAuth,
  submitIndexNow,
  getUrlsFromSitemap,
  pingSitemap
} from 'zovo-indexer';

// Parse sitemap URLs
const urls = await getUrlsFromSitemap('https://example.com/sitemap.xml');

// Submit to Google Indexing
const auth = await getAuth();
await requestIndexing(['https://example.com/new-page']);

// Submit to IndexNow
await submitIndexNow(['https://example.com/page'], {
  host: 'example.com',
  key: 'your-indexnow-key'
});

// Ping search engines about sitemap
await pingSitemap('https://example.com/sitemap.xml');
```

## API Reference

### Google Indexing API

| Function | Description |
|----------|-------------|
| `requestIndexing(urls)` | Submit URLs for indexing (accepts array) |
| `requestRemoval(urls)` | Request removal of URLs from index |
| `checkCredentials()` | Verify Google service account credentials |
| `getAuth()` | Get authenticated Google OAuth2 client |
| `getNotificationStatus(url)` | Check indexing status for a URL |

### IndexNow

| Function | Description |
|----------|-------------|
| `submitIndexNow(urls, config)` | Submit URLs to IndexNow API |
| `submitSingleUrl(url, config)` | Submit a single URL to IndexNow |
| `generateKey()` | Generate a key for IndexNow verification |
| `validateConfig(config)` | Validate IndexNow configuration |

### Sitemap Parser

| Function | Description |
|----------|-------------|
| `getUrlsFromSitemap(url)` | Parse XML sitemap and extract URLs |
| `getUrlsWithMeta(url)` | Parse sitemap with metadata (lastmod, priority, etc.) |

### Sitemap Ping

| Function | Description |
|----------|-------------|
| `pingSitemap(url)` | Notify search engines about sitemap |
| `pingMultipleSitemaps(urls)` | Notify multiple sitemaps |

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript to JavaScript |
| `npm run dev` | Run in development mode |
| `npm run start` | Run the CLI |

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/indexer-improvement`
3. **Make** your changes
4. **Test** your changes: `npm run build && npm run dev`
5. **Commit** your changes: `git commit -m 'Add new feature'`
6. **Push** to the branch: `git push origin feature/indexer-improvement`
7. **Submit** a Pull Request

## See Also

### Related Zovo Repositories

- [zovo-extension-template](https://github.com/theluckystrike/zovo-extension-template) - Boilerplate for building privacy-first Chrome extensions
- [zovo-types-webext](https://github.com/theluckystrike/zovo-types-webext) - TypeScript type definitions
- [zovo-chrome-extensions](https://github.com/theluckystrike/zovo-chrome-extensions) - Collection of Zovo Chrome extensions
- [zovo-permissions-scanner](https://github.com/theluckystrike/zovo-permissions-scanner) - Privacy scanner for Chrome extensions
- [zovo-content](https://github.com/theluckystrike/zovo-content) - Marketing content for Zovo extensions

### Zovo Chrome Extensions

- [Zovo Tab Manager](https://chrome.google.com/webstore/detail/zovo-tab-manager) - Manage tabs efficiently
- [Zovo Focus](https://chrome.google.com/webstore/detail/zovo-focus) - Block distractions
- [Zovo Permissions Scanner](https://chrome.google.com/webstore/detail/zovo-permissions-scanner) - Check extension privacy grades

Visit [zovo.one](https://zovo.one) for more information about Zovo products.

## License

MIT - [Zovo](https://zovo.one)
