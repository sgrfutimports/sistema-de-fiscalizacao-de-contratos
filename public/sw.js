const CACHE_NAME = 'contratos-71bi-v2';
const PRECACHE_ASSETS = [
  '/',
  '/logo.png',
  '/militar-avatar.png',
  '/manifest.json',
  '/offline.html'
];

// Instalação do Service Worker e Precache de arquivos críticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpeza de caches antigos
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
    })
  );
  self.clients.claim();
});

// Intercepção e roteamento de requisições (Fetch)
self.addEventListener('fetch', (e) => {
  // Desativar em localhost / desenvolvimento
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  // Apenas tratar requisições GET
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Ignorar chamadas de API do Supabase, auth interno, chrome-extension, etc.
  if (
    url.origin !== self.location.origin ||
    url.pathname.includes('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // 1. Estratégia para Páginas HTML (Navegação): Network-First com Fallback de Cache / Offline
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          // Salva uma cópia da página visitada no cache
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // Se falhar a rede, tenta buscar do cache
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Se não estiver no cache, retorna a página offline estática
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 2. Estratégia para Static Assets (Imagens, CSS, JS, Fontes): Cache-First (Stale-While-Revalidate)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualiza em background
        fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        if (
          networkResponse.status === 200 &&
          (url.pathname.startsWith('/_next/') ||
            url.pathname.startsWith('/static/') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.json'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
