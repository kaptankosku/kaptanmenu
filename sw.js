// OneSignal SDK must be imported before the app's service-worker handlers.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'kaptan-kosku-v2';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(()=>{})); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kaptan-kosku-') && k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => {
    const fresh = fetch(event.request).then(response => { if(response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())); return response; }).catch(()=>cached);
    return cached || fresh;
  }));
});
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const {title,body} = event.data;
    event.waitUntil(self.registration.showNotification(title || 'Kaptan Köşkü', {body:body || '', icon:'./icon-192.png', badge:'./icon-192.png'}));
  }
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => { for(const client of list){ if('focus' in client) return client.focus(); } if(clients.openWindow) return clients.openWindow('./'); }));
});
