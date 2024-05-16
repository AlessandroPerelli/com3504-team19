importScripts('/javascripts/idb-utility.js');

console.log('Service Worker Called...');

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");

            const urlsToCache = [
                '/main',
                '/login',
                '/addplant',
                '/javascripts/addPlant.js',
                '/javascripts/categories.js',
                '/javascripts/changeUserProfile.js',
                '/javascripts/chat.js',
                '/javascripts/idb-utility.js',
                '/javascripts/imageUpload.js',
                '/javascripts/index.js',
                '/javascripts/insert.js',
                '/javascripts/login.js',
                '/javascripts/overlay.js',
                '/javascripts/plantUtilities.js',
                '/javascripts/switchCategory.js',
                '/stylesheets/main.scss',
                '/stylesheets/main.css',
                '/stylesheets/main.css.map',
            ];

            await cache.addAll(urlsToCache);
            console.log('Service Worker: App Shell Cached');

            if (navigator.onLine) {
                // Now, fetch data from MongoDB and add it to IndexedDB
                const mongoDBData = await fetchMongoDBData();
                await addMongoDBDataToIndexedDB(mongoDBData);

                await syncPlantsWithIndexedDB();

                const imageURLs = extractImageURLsFromPlants(mongoDBData);
                await cacheImages(imageURLs);
            }
        }
        catch{
            console.log("error occurred while caching...")
        }

    })());
});

// Function to sync plants with MongoDB
async function syncPlantsWithMongoDB() {
    console.log('Service Worker: Syncing plants with MongoDB');
    const db = await openSyncPlantsIDB();
    const tx = db.transaction('sync-plants', 'readonly');
    const store = tx.objectStore('sync-plants');
    const plants = await store.getAll();

    if (plants.length > 0) {
        try {
            for (const plant of plants) {
                const response = await fetch('http://localhost:3000/plants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(plant),
                });
                if (response.ok) {
                    console.log('Service Worker: Plant synced with MongoDB');
                    // Remove synced plant from IndexedDB
                    const deleteTx = db.transaction('sync-plants', 'readwrite');
                    const deleteStore = deleteTx.objectStore('sync-plants');
                    deleteStore.delete(plant._id);
                } else {
                    console.error('Service Worker: Failed to sync plant with MongoDB');
                }
            }
        } catch (error) {
            console.error('Service Worker: Failed to sync plants with MongoDB', error);
        }
    }
}

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
    event.waitUntil(syncPlantsWithMongoDB());
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);

        if (!navigator.onLine) {
            if (cachedResponse) {
                console.log('Service Worker: Fetching from Cache: ', event.request.url);
                return cachedResponse;
            }

            // Check if the URL includes "/add"
            if (event.request.url.includes('/add')) {
                // Construct a redirect response to "/main"
                return new Response(null, {
                    status: 302,
                    headers: {
                        'Location': '/main'
                    }
                });
            }
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

        // // Handle specific requests for the main page (/main)
        // if (event.request.url.includes('/main')) {
        //     // Fetch the main page
        //     const response = await fetch(event.request);
        //     if (response && response.status === 200) {
        //         const clonedResponse = response.clone();
        //         const text = await clonedResponse.text();
        //         // Extract image URLs from the main page
        //         const imageUrls = extractImageURLsFromPlants(text);
        //         // Cache the images
        //         for (const imageUrl of imageUrls) {
        //             const imageRequest = new Request(imageUrl);
        //             const imageResponse = await fetch(imageRequest);
        //             if (imageResponse && imageResponse.status === 200) {
        //                 await cache.put(imageRequest, imageResponse);
        //             }
        //         }
        //         // Return the original response
        //         return response;
        //     }
        // }

        return fetch(event.request);
    })());
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-plant') {
        console.log('Service Worker: Syncing new Plants');
        openSyncPlantsIDB().then((syncPostDB) => {
            getAllSyncPlants(syncPostDB).then((syncPlants) => {
                for (const syncPlant of syncPlants) {
                    console.log('Service Worker: Syncing new Plant: ', syncPlant);
                    // Create a FormData object
                    const formData = new FormData();

                    // Iterate over the properties of the JSON object and append them to FormData
                    for (const key in syncPlant) {
                        if (syncPlant.hasOwnProperty(key)) {
                            formData.append(key, syncPlant[key]);
                        }
                    }

                    // Fetch with FormData
                    fetch('http://localhost:3000/add', {
                        method: 'POST',
                        body: formData,
                        headers: {
                        },
                    }).then(response => {
                        console.log(response);
                        if (response.ok) {
                            console.log('Service Worker: Syncing new Plant: ', syncPlant, ' done');
                            // If the plant was successfully added, delete it from IndexedDB
                            deleteSyncPlantFromIDB(syncPostDB, syncPlant._id);
                        } else {
                            console.error('Service Worker: Syncing new Plant: ', syncPlant, ' failed');
                        }
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Plant: ', syncPlant, ' failed:', err);
                    });
                }
            });
        });
    }
});
