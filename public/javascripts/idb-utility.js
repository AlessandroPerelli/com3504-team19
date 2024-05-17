
/** 
* @function fetchMongoDBData
* Returns the data from MongoDB.
* @return {data} Response from MongoDB
*/
async function fetchMongoDBData() {
    const response = await fetch('http://localhost:3000/plants');
    const data = await response.json();
    return data;
}


/** 
* @function addMongoDBDataToIndexedDB
* Function to add MongoDB data to IndexedDB
* @param {data} The data to add to the indexedDB
*/
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


/** 
* @constant {addNewPlantToSync}
* Handles adding a new plant
* @param {form_data} The plant data to add to the DB
* @param {syncPlantIDB} The offline DB that the plant gets uploaded to
*/

const addNewPlantToSync = (syncPlantIDB, form_data) => {

    const transaction = syncPlantIDB.transaction(["sync-plants"], "readwrite")
    const plantStore = transaction.objectStore("sync-plants")
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

/** 
* @constant {addNewPlantsToIDB}
* Add new plants to IndexedDB from MongoDB
* @param {plantIDB} A copy of MongoDB that the user had last when they were online
* @return A promise that this will take place
*/
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


/** 
* @constant {deleteAllExistingPlantsFromIDB}
* Removes all plants from idb
* @param {plantIDB} A copy of MongoDB that the user had last when they were online
*/
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

/** 
* @constant {extractImageURLsFromPlants}
* Extracts image URLs from plant objects
* @param {plants} The plant objects to get the image URLs from
* @return {imageURLs} The image URLs that are extracted
*/
const extractImageURLsFromPlants = (plants) => {
    const imageURLs = [];
    plants.forEach(plant => {
        if (plant.img && typeof plant.img === 'string') {
            imageURLs.push(plant.img);
        }
    });
    return imageURLs;
};


/** 
* @constant {cacheImages}
* Caches the images
* @param {imageURLs} The image URLs to cache
*/
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


/** 
* @function openIDB
* Function to open IndexedDB
* @param {name} The name of the IDB
* @param {version} The version of the IDB
*/
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

/** 
* @function syncPlantsWithIndexedDB
* Function to sync plants with IndexedDB
*/
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

/** 
* @constant {getAllSyncPlants}
* Gets the plant list from the IndexedDB
* @param {syncPlantIDB} The IndexedDB to get the plants from
*/
const getAllSyncPlants = (syncPlantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncPlantIDB.transaction(["sync-plants"]);
        const plantStore = transaction.objectStore("sync-plants");
        const getAllRequest = plantStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}


/** 
* @constant {deleteSyncPlantFromIDB}
* Deletes a sync
* @param {syncPlantIDB} The IndexedDB to delete the sync from
* @param {id} The Id of the sync to delete
*/
const deleteSyncPlantFromIDB = (syncPlantIDB, id) => {
    const transaction = syncPlantIDB.transaction(["sync-plants"], "readwrite")
    const plantStore = transaction.objectStore("sync-plants")
    const deleteRequest = plantStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
}


/**
 * @function openPlantsIDB
 * Function to open the Indexed DB for the plants
 * @returns A promise that either happens or fails
 */
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

/**
 * @function openSyncPlantsIDB
 * Function to open the Indexed DB for the sync plants, which are all plants uploaded offline
 * @returns A promise that either happens or fails
 */
function openSyncPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-plants", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('sync-plants', {keyPath: '_id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}
