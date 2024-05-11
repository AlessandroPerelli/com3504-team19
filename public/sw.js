importScripts('/javascripts/idb-utility.js');

console.log('Service Worker Called...');

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            const urlsToCache = [
                '/main',
                '/login',
                '/addplant',
                '/javascripts/categories.js',
                '/javascripts/changeUserProfile.js',
                '/javascripts/imageUpload.js',
                '/javascripts/overlay.js',
                '/javascripts/script.js',
                '/javascripts/index.js',
                '/javascripts/switchCategory.js',
                '/javascripts/idb-utility.js',
                '/javascripts/chat.js',
                '/stylesheets/main.scss',
                '/stylesheets/main.css',
                '/stylesheets/main.css.map',
            ];

            numbers.forEach(number => {
                urlsToCache.push(`/viewplant?id=${number}`);
            });

            // Extract image URLs from main page (/main)
            const response = await fetch('/main');
            const responseClone = await response.clone();
            const text = await responseClone.text();
            const imageUrls = extractImageUrls(text);

            // Add main page image URLs to urlsToCache
            urlsToCache.push(...imageUrls);

            await cache.addAll(urlsToCache);
            console.log('Service Worker: App Shell Cached');

            // Now, fetch data from MongoDB and add it to IndexedDB
            const mongoDBData = await fetchMongoDBData();
            await addMongoDBDataToIndexedDB(mongoDBData);
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

        // Handle specific requests for the main page (/main)
        if (event.request.url.includes('/main')) {
            // Fetch the main page
            const response = await fetch(event.request);
            if (response && response.status === 200) {
                const clonedResponse = response.clone();
                const text = await clonedResponse.text();
                // Extract image URLs from the main page
                const imageUrls = extractImageUrls(text);
                // Cache the images
                for (const imageUrl of imageUrls) {
                    const imageRequest = new Request(imageUrl);
                    const imageResponse = await fetch(imageRequest);
                    if (imageResponse && imageResponse.status === 200) {
                        await cache.put(imageRequest, imageResponse);
                    }
                }
                // Return the original response
                return response;
            }
        }

        return fetch(event.request);
    })());
});

// Function to extract image URLs from HTML text using regular expressions and prevent duplicates
function extractImageUrls(htmlText) {
    const regex = /<img.*?src=["'](.*?)["']/g;
    const imageUrls = [];
    let match;
    while ((match = regex.exec(htmlText)) !== null) {
        const imageUrl = match[1];
        if (!imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
        }
    }
    return imageUrls;
}

//Sync event to sync the todos
self.addEventListener('sync', event => {
    if (event.tag === 'sync-plants') {
        console.log('Service Worker: Syncing new plants');
        openSyncPlantsIDB().then((syncPostDB) => {
            getAllSyncPlants(syncPostDB).then((syncPlants) => {
                for (const syncPlant of syncPlants) {
                    console.log('Service Worker: Syncing new plants: ', syncPlant);
                    // Create a FormData object
                    const formData = new URLSearchParams();

                    // Iterate over the properties of the JSON object and append them to FormData
                    formData.append("text", syncPlant.text);

                    // Fetch with FormData instead of JSON
                    fetch('http://localhost:3000/add', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }).then(() => {
                        console.log('Service Worker: Syncing new Plant: ', syncPlant, ' done');
                        deleteSyncPlantFromIDB(syncPostDB,syncPlant.id);
                        // Send a notification
                        self.registration.showNotification('Plant Synced', {
                            body: 'Plant synced successfully!',
                        });
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Plant: ', syncPlant, ' failed');
                    });
                }
            });
        });
    }
});
