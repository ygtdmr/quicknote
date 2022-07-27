const root_path = '/quicknote/', static_path = root_path + 'static/';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        root_path,
        static_path + 'js/main.cd3355d3.js',
        static_path + 'css/main.247fd091.css',
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Source+Code+Pro:wght@400;500;600&display=swap'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const r = event.request;
  if (r.mode === 'navigate' && new URL(r.url).pathname === root_path) {
    event.respondWith(caches.match(root_path));
    event.waitUntil(update(root_path).then(refresh));
    return;
  }
  if (['no-cors','cors'].includes(r.mode) && !r.url.startsWith('chrome-extension://')) {
    event.respondWith(caches.match(r.url));
    event.waitUntil(update(r.url).then(refresh));
  }
});

update = request => {
  return caches.open('v1').then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    }).catch(()=>false);
  });
};

refresh = response => {
  if (!response) {return;}
  return self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      const message = {
        type:'refresh',
        url:response.url,
        eTag:response.headers.get('ETag')
      };
      client.postMessage(JSON.stringify(message));
    });
  });
};
