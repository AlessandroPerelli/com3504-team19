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
                '/user',
                '/javascripts/addPlant.js',
                '/javascripts/changeUserProfile.js',
                '/javascripts/idb-utility.js',
                '/javascripts/imageUpload.js',
                '/javascripts/index.js',
                '/javascripts/login.js',
                '/javascripts/overlay.js',
                '/javascripts/plantUtilities.js',
                '/javascripts/viewPlant.js',
                '/stylesheets/main.scss',
                '/stylesheets/main.css',
                '/stylesheets/main.css.map',
                '/images/avatar.png',
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

                const plantUrls = getPlantUrls(mongoDBData);
                await cacheImages(plantUrls);
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
    const db = await openSyncIDB("sync-plants");
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

// Function to sync plants with MongoDB
async function syncChatsWithMongoDB() {
    console.log('Service Worker: Syncing chats with MongoDB');
    const db = await openSyncIDB("sync-chats");
    const tx = db.transaction('sync-chats', 'readonly');
    const store = tx.objectStore('sync-chats');
    const chats = await store.getAll();

    if (chats.length > 0) {
        try {
            for (const chat of chats) {
                const plantId = chat.plantId;

                const response = await fetch(`http://localhost:3000/plants/${plantId}/addChat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(chat),
                });
                if (response.ok) {
                    console.log('Service Worker: Chat synced with MongoDB');
                    // Remove synced plant from IndexedDB
                    const deleteTx = db.transaction('sync-chats', 'readwrite');
                    const deleteStore = deleteTx.objectStore('sync-chats');
                    deleteStore.delete(plant._id);
                } else {
                    console.error('Service Worker: Failed to sync chat with MongoDB');
                }
            }
        } catch (error) {
            console.error('Service Worker: Failed to sync chats with MongoDB', error);
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
    event.waitUntil(syncChatsWithMongoDB());
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
            if ((event.request.url.includes('/add') && !event.request.url.includes('/addplant')) || event.request.url.includes('chat_input')) {
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
        return fetch(event.request);
    })());
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-plant') {
        console.log('Service Worker: Syncing new Plants');
        openSyncIDB("sync-plants").then((syncPostDB) => {
            getAllSync(syncPostDB, "sync-plants").then((syncPlants) => {
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
                            deleteSyncFromIDB(syncPostDB, syncPlant._id, "sync-plants");
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

    if (event.tag === 'sync-chat') {
        console.log('Service Worker: Syncing new chats');
        openSyncIDB("sync-chats").then((syncPostDB) => {
            getAllSync(syncPostDB, "sync-chats").then((syncChats) => {
                for (const syncChat of syncChats) {
                    console.log('Service Worker: Syncing new Chat: ', syncChat);
                    console.log(syncChat.comment)
                    // Create a FormData object
                    const formData = new FormData();

                    // Iterate over the properties of the JSON object and append them to FormData
                    for (const key in syncChat) {
                        if (syncChat.hasOwnProperty(key)) {
                            formData.append(key, syncChat[key]);
                        }
                    }

                    // Fetch with FormData instead of JSON
                    fetch('http://localhost:3000/updateComments', {
                        method: 'POST',
                        body: JSON.stringify(syncChat),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }).then(response => {
                        console.log(response);
                        if (response.ok) {
                            console.log('Service Worker: Syncing new Plant: ', syncChat, ' done');
                            // If the plant was successfully added, delete it from IndexedDB
                            deleteSyncFromIDB(syncPostDB, syncChat._id, "sync-chats");
                        } else {
                            console.error('Service Worker: Syncing new Plant: ', syncChat, ' failed');
                        }
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Chat: ', syncChat, ' failed');
                    });
                }
            });
        });
    }
});
