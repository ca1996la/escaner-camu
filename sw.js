// Service worker: guarda la app en el celular para que abra sin internet.
// Al subir una versión nueva de los archivos, cambia el número de VERSION.
const VERSION = 'v1';
const CACHE   = 'escaner-camu-' + VERSION;
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './chart.umd.js',
  './jszip.min.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('escaner-camu-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde primero con lo guardado (funciona sin internet) y, si hay
// conexión, actualiza la copia en segundo plano para la próxima vez.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(guardado => {
        const red = fetch(e.request).then(resp => {
          if (resp && (resp.ok || resp.type === 'opaque')) cache.put(e.request, resp.clone());
          return resp;
        }).catch(() => guardado);
        return guardado || red;
      })
    )
  );
});
