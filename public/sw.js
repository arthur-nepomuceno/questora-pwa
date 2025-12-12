const CACHE_NAME = 'show-milenio-v1.0.3';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-base.png',
  // Adicione aqui outras URLs estáticas que devem ser cacheadas
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Erro ao instalar cache:', error);
      })
  );
  // Força a ativação imediata do novo service worker
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Força a ativação imediata do novo service worker
      return self.clients.claim();
    })
  );
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  // Estratégia: Cache First para assets estáticos
  if (event.request.destination === 'image' || 
      event.request.url.includes('/icons/') ||
      event.request.url.includes('/screenshots/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
        })
    );
    return; // ← ADICIONAR ESTA LINHA
  }
  
  // Estratégia: Network First para dados dinâmicos
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return; // ← ADICIONAR ESTA LINHA
  }
  
  // Para outras requests, usar network first
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
  return; // ← ADICIONAR ESTA LINHA
});

// Mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificações (para futuras funcionalidades)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
