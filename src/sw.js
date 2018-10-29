const staticCacheName = 'whatever';

self.addEventListener('install', event =>
	event.waitUntil(caches.open(staticCacheName).then(cache =>
		cache.add('/'))));

self.addEventListener('fetch', event =>
	event.respondWith(
		fetch(event.request).then(response => {
			let responseClone = response.clone();
			caches.open(staticCacheName).then(cache =>
				cache.put(event.request, responseClone));
			return response;
		}).catch(() =>
			caches.open(staticCacheName).then(cache =>
				cache.match(event.request)))));
