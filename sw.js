const CACHE_NAME = 'pup-kitty-adventure-v3';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './cats.html',
  './style.css',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './saves/dog.json',
  './saves/cat.json',
  './js/main.js',
  './js/state.js',
  './js/input.js',
  './js/audio.js',
  './js/math.js',
  './js/sprites.js',
  './js/pet_avatars.js',
  './js/overworld.js',
  './js/modes/cafe.js',
  './js/modes/boardwalk.js',
  './js/modes/bakery.js',
  './js/modes/frisbee.js',
  './js/modes/memory.js',
  './js/modes/munchers.js',
  './js/modes/boutique.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/api/save')) return;

  // Network-first with cache fallback so updates arrive immediately when online
  // while still working 100% offline on iPad.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
