const CACHE_NAME = 'webp-image-cache-v2';
const MAX_AGE = 86400; // 24 hours in seconds
const STALE_WHILE_REVALIDATE = 3600; // 1 hour in seconds
const STALE_IF_ERROR = 86400; // 24 hours in case of errors

// Helper function to check if a response is fresh (within max-age)
function isFresh(response) {
  if (!response) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const dateFetched = new Date(dateHeader).getTime();
  const now = Date.now();
  const age = (now - dateFetched) / 1000; // Age in seconds

  return age < MAX_AGE;
}

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  console.log('Fetch event for:', event.request.url);

  // Handle only WebP images
  if (requestURL.pathname.endsWith('.webp')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchAndCache = fetch(event.request)
            .then((networkResponse) => {
              // Cache the fresh response
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // If fetch fails, serve stale if error
              if (cachedResponse && isFresh(cachedResponse)) {
                return cachedResponse;
              }
              throw new Error('Network failed and no cached response');
            });

          // Serve stale-while-revalidate if the cached version exists and is fresh
          if (cachedResponse && isFresh(cachedResponse)) {
            fetchAndCache.catch(() => {}); // Trigger revalidation in background
            return cachedResponse;
          }

          // If no fresh cache, fetch from network or fall back to stale if error
          return fetchAndCache;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if necessary
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
