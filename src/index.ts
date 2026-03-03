// Main entry point - re-export all public APIs
export { 
  requestIndexing, 
  requestRemoval, 
  checkCredentials, 
  getAuth, 
  getNotificationStatus,
  type IndexingResult 
} from './google-indexer.js';

export { 
  submitIndexNow, 
  submitSingleUrl, 
  generateKey,
  validateConfig,
  type IndexNowConfig,
  type IndexNowResult
} from './indexnow.js';

export { 
  getUrlsFromSitemap, 
  getUrlsWithMeta 
} from './sitemap-parser.js';

export { 
  pingSitemap, 
  pingMultipleSitemaps,
  type PingResult 
} from './sitemap-ping.js';
