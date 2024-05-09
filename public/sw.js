console.log('Service Worker Called...');

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            await cache.addAll([
                '/',
                '/main',
                '/login',
                '/user',
                '/addplant',
                '/javascripts/categories.js',
                '/javascripts/changeUserProfile.js',
                '/javascripts/imageUpload.js',
                '/javascripts/overlay.js',
                '/javascripts/script.js',
                '/javascripts/index.js',
                '/javascripts/switchCategory.js',
                '/images/avatar.png',
                '/images/big.jpg',
                '/images/marigold.jpg',
                '/images/peashooter.png',
                '/images/sunflower.jpg',
                '/stylesheets/main.scss',
                '/stylesheets/main.css',
                '/stylesheets/main.css.map',
            ]);
            console.log('Service Worker: App Shell Cached');
        }
        catch{
            console.log("error occured while caching...")
        }

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);

        // Handle specific requests for /viewplant pages
        if (event.request.url.includes('/viewplant')) {
            // Extract plant ID from URL
            const url = new URL(event.request.url);
            const plantId = url.searchParams.get('id');
            if (plantId) {
                // If plant ID is found, fetch and cache the response
                const response = await fetch(event.request);
                if (response && response.status === 200) {
                    const clonedResponse = response.clone();
                    await cache.put(event.request, clonedResponse);
                    return response;
                }
            }
        }

        return fetch(event.request);
    })());
});
