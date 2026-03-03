# Zovo Indexer

[![npm version](https://img.shields.io/npm/v/zovo-indexer)](https://npmjs.com/package/zovo-indexer)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![CI Status](https://github.com/theluckystrike/zovo-indexer/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/zovo-indexer/actions)
[![Discord](https://img.shields.io/badge/Discord-Zovo-blueviolet.svg?logo=discord)](https://discord.gg/zovo)
[![Website](https://img.shields.io/badge/Website-zovo.one-blue)](https://zovo.one)
[![GitHub Stars](https://img.shields.io/github/stars/theluckystrike/zovo-indexer?style=social)](https://github.com/theluckystrike/zovo-indexer)

> Safe, free indexing tool for Chrome extensions using official Google APIs.

## Overview

**Zovo Indexer** is a command-line tool that helps Chrome extension developers get their extensions indexed quickly using Google's official Indexing API and IndexNow. Built by the Zovo team with a focus on privacy and simplicity.

## Features

- ✅ **Google Indexing API** - Submit URLs directly to Google for fast indexing
- ✅ **IndexNow Support** - Use the open IndexNow protocol for Bing, Yandex, and others
- ✅ **Sitemap Processing** - Automatically extract and submit URLs from sitemaps
- ✅ **Batch Processing** - Handle thousands of URLs efficiently
- ✅ **Rate Limiting** - Built-in protection to avoid API quotas
- ✅ **Privacy-First** - No tracking, all processing done locally

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

## Setup

### Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Indexing API**
4. Create a service account with **Indexing API** permissions
5. Download the JSON key file
6. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-keyfile.json"
```

### Configuration File

Create a `.env` file in your project root:

```bash
# Google Indexing API
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Optional: Custom batch size
BATCH_SIZE=100
```

## Usage

### Submit Single URL

```bash
zovo-indexer submit https://example.com/page
```

### Submit from Sitemap

```bash
zovo-indexer sitemap https://example.com/sitemap.xml
```

### Submit from File (one URL per line)

```bash
zovo-indexer file urls.txt
```

### IndexNow Only (no Google)

```bash
zovo-indexer indexnow https://example.com/page
```

### Using the TypeScript API

```typescript
import { submitToGoogle, submitToIndexNow } from 'zovo-indexer';

// Submit to Google Indexing API
await submitToGoogle('https://example.com/page');

// Submit to IndexNow (Bing, Yandex, etc.)
await submitToIndexNow('https://example.com/page');

// Process sitemap
await processSitemap('https://example.com/sitemap.xml');
```

## Commands

| Command | Description |
|---------|-------------|
| `submit <url>` | Submit a single URL to Google |
| `sitemap <url>` | Process URLs from a sitemap |
| `file <path>` | Process URLs from a text file |
| `indexnow <url>` | Submit URL via IndexNow only |
| `batch <file>` | Process URLs in batches |

## Options

| Option | Description |
|--------|-------------|
| `--help` | Display help information |
| `--version` | Display version number |
| `--verbose` | Enable verbose logging |
| `--dry-run` | Show what would be done without making API calls |

## Development Commands

```bash
# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Start CLI
npm start
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/indexer-improvement`
3. **Make** your changes
4. **Test** your changes locally
5. **Commit** your changes: `git commit -m 'Add new feature'`
6. **Push** to the branch: `git push origin feature/indexer-improvement`
7. **Submit** a Pull Request

### Development Setup

```bash
# Clone and install
git clone https://github.com/theluckystrike/zovo-indexer.git
cd zovo-indexer
npm install

# Set up credentials
cp .env.example .env
# Edit .env with your Google credentials

# Test locally
npm run dev
```

## Built by Zovo

Part of the [Zovo](https://zovo.one) developer tools family — privacy-first Chrome extensions built by developers, for developers.

## See Also

### Related Zovo Repositories

- [zovo-permissions-scanner](https://github.com/theluckystrike/zovo-permissions-scanner) - Privacy scanner for Chrome extensions
- [zovo-extension-template](https://github.com/theluckystrike/zovo-extension-template) - Boilerplate for building privacy-first Chrome extensions
- [zovo-types-webext](https://github.com/theluckrike/zovo-types-webext) - Comprehensive TypeScript type definitions
- [zovo-content](https://github.com/theluckystrike/zovo-content) - Marketing content for Zovo extensions
- [zovo-tab-suspender-public](https://github.com/theluckystrike/zovo-tab-suspender-public) - Memory-saving tab suspenders

### Zovo Chrome Extensions

- [Zovo Tab Manager](https://chrome.google.com/webstore/detail/zovo-tab-manager) - Manage tabs efficiently
- [Zovo Focus](https://chrome.google.com/webstore/detail/zovo-focus) - Block distractions
- [Zovo Permissions Scanner](https://chrome.google.com/webstore/detail/zovo-permissions-scanner) - Check extension privacy grades

Visit [zovo.one](https://zovo.one) for more information.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by developers, for developers. No compromises on privacy.*
