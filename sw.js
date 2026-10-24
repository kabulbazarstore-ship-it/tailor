const CACHE_NAME = 'workshop-cache-v3'; // نسخه آپدیت شد تا فایل راهنما هم کش شود
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './guide.json',  // <--- اضافه شدن فایل راهنما
  './icon-192.png',
  './icon-512.png'
];

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// فعال‌سازی و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتژی آفلاین (اول از کش می‌خواند، اگر نبود از اینترنت می‌گیرد)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});