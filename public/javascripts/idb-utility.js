
// Function to fetch data from MongoDB
async function fetchMongoDBData() {
    const response = await fetch('http://localhost:3000/plants');
    const data = await response.json();
    return data;
}

// Function to add MongoDB data to IndexedDB
async function addMongoDBDataToIndexedDB(data) {
    try {
        const db = await openIDB('plants', 1);
        const tx = db.transaction('plants', 'readwrite');
        const store = tx.objectStore('plants');
        for (const item of data) {
            store.add(item);
        }
        await tx.complete;
    } catch (error) {
        console.error('Service Worker: Error adding MongoDB data to IndexedDB', error);
    }
}

// Function to handle adding a new plant
const addNewToSync = (syncPlantIDB, form_data, syncIDB) => {

    const transaction = syncPlantIDB.transaction([syncIDB], "readwrite")
    const plantStore = transaction.objectStore(syncIDB)
    const addRequest = plantStore.add(Object.fromEntries(form_data))
    addRequest.addEventListener("success", () => {
        console.log("Added " + "#" + addRequest.result + ": " + form_data)
        const getRequest = plantStore.get(addRequest.result)
        getRequest.addEventListener("success", () => {
            console.log("Found " + JSON.stringify(getRequest.result))
            // Send a sync message to the service worker
            navigator.serviceWorker.ready.then((sw) => {
                sw.sync.register("sync-plant")
            }).then(() => {
                console.log("Sync registered");
            }).catch((err) => {
                console.log("Sync registration failed: " + JSON.stringify(err))
            })
        })
    })
}

// Function to add new plants to IndexedDB from MongoDB and return a promise
const addNewPlantsToIDB = (plantIDB) => {
    return new Promise((resolve, reject) => {
        fetch('/plants') // Assuming '/plants' returns JSON array of plant objects
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(plants => {
            const transaction = plantIDB.transaction(["plants"], "readwrite");
            const plantStore = transaction.objectStore("plants");

            const addPromises = plants.map(plant => {
                return new Promise((resolveAdd, rejectAdd) => {
                    const addRequest = plantStore.add(plant);
                    addRequest.addEventListener("success", () => {
                        console.log("Added " + "#" + addRequest.result + ": " + plant.text);
                        const getRequest = plantStore.get(addRequest.result);
                        getRequest.addEventListener("success", () => {
                            console.log("Found " + JSON.stringify(getRequest.result));
                            resolveAdd(); // Resolve the add promise
                        });
                        getRequest.addEventListener("error", (event) => {
                            rejectAdd(event.target.error); // Reject the add promise if there's an error
                        });
                    });
                    addRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
            });

            // Resolve the main promise when all add operations are completed
            Promise.all(addPromises).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        })
        .catch(error => {
            reject(error);
        });
    });
};

// Function to remove all plants from idb
const deleteAllExistingPlantsFromIDB = (plantIDB) => {
    const transaction = plantIDB.transaction(["plants"], "readwrite");
    const plantStore = transaction.objectStore("plants");
    const clearRequest = plantStore.clear();

    return new Promise((resolve, reject) => {
        clearRequest.addEventListener("success", () => {
            resolve();
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

// Function to extract image URLs from plant objects
const extractImageURLsFromPlants = (plants) => {
    const imageURLs = [];
    plants.forEach(plant => {
        if (plant.img && typeof plant.img === 'string') {
            imageURLs.push(plant.img);
        }
    });
    return imageURLs;
};

// Function to cache images
const cacheImages = async (imageURLs) => {
    const cache = await caches.open("static");
    const imagePromises = imageURLs.map(async (url) => {
        const imageURL = `/images/uploads/${url}`; // Append "/public/images/" to the image URL
        try {
            const response = await fetch(imageURL);
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            await cache.put(imageURL, response);
            console.log('Cached image:', imageURL);
        } catch (error) {
            console.error('Failed to cache image:', imageURL, error);
        }
    });

    await Promise.all(imagePromises);
    console.log('All images cached successfully');
};

// Function to open IndexedDB
async function openIDB(name, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('plants')) {
                db.createObjectStore('plants', { keyPath: '_id' });
            }
        };
    });
}

// Function to sync plants with IndexedDB
async function syncPlantsWithIndexedDB() {
    console.log('Service Worker: Syncing plants with IndexedDB');
    try {
        openIDB('plants',1).then((db) => {
            deleteAllExistingPlantsFromIDB(db);
        });
        const mongoDBData = await fetchMongoDBData();
        await addMongoDBDataToIndexedDB(mongoDBData);
        console.log('Service Worker: Plants synced with IndexedDB');
    } catch (error) {
        console.error('Service Worker: Failed to sync plants with IndexedDB', error);
    }
}

// Function to get the plant list from the IndexedDB
const getAllSync = (syncPlantIDB, syncIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncPlantIDB.transaction([syncIDB]);
        const plantStore = transaction.objectStore(syncIDB);
        const getAllRequest = plantStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

// Function to delete a syn
const deleteSyncFromIDB = (syncPlantIDB, id, syncIDB) => {
    const transaction = syncPlantIDB.transaction([syncIDB], "readwrite")
    const plantStore = transaction.objectStore(syncIDB)
    const deleteRequest = plantStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
}

function openPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('plants', {keyPath: '_id'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

function openSyncIDB(syncIDB) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(syncIDB, 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore(syncIDB, {keyPath: '_id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}
