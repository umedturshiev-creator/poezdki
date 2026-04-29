const CACHE_NAME = 'smartpay-trips-v6';

// Установка (принудительно обновляем)
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Активация (чистим старый кеш)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        // Кешируем успешные ответы
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Если нет интернета — берем из кеша
        return caches.match(event.request);
      })
  );
});
