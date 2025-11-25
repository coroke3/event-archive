/**
 * Fetch latest data from remote APIs and cache to disk so that
 * Next.js static export can run without hitting rate limits.
 */
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'build-data.json');

const endpoints = {
  videos: 'https://pvsf-cash.vercel.app/api/videos',
  users: 'https://pvsf-cash.vercel.app/api/users',
  events: 'https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec',
};

async function fetchWithRetry(url, retries = 3, timeout = 30000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)',
        },
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      if (!text?.trim()) {
        throw new Error('Empty response');
      }
      return JSON.parse(text);
    } catch (err) {
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}: ${err.message}`);
      if (attempt === retries - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return null;
}

async function main() {
  console.log('[cache-data] Fetching latest datasets...');
  const [videos, users, events] = await Promise.all([
    fetchWithRetry(endpoints.videos).catch(() => []),
    fetchWithRetry(endpoints.users).catch(() => []),
    fetchWithRetry(endpoints.events).catch(() => []),
  ]);

  const payload = {
    timestamp: new Date().toISOString(),
    videos,
    users,
    events,
  };

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2));
  console.log(`[cache-data] Cached ${videos?.length ?? 0} videos, ${users?.length ?? 0} users, ${events?.length ?? 0} events to ${CACHE_FILE}`);
}

main().catch((error) => {
  console.error('[cache-data] Failed to cache data:', error);
  process.exit(1);
});

