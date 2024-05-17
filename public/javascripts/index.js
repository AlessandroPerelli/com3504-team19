/**
 * Register service worker to control making site work offline
*/

window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    if (navigator.onLine) {
        fetch('http://localhost:3000/plants')
            .then(function (res) {
                return res.json();
            }).then(function (newPlants) {
            openIDB('plants', 1).then((db) => {
                deleteAllExistingPlantsFromIDB(db).then(() => {
                    addNewPlantsToIDB(db).then(() => {
                        console.log("All new plants added to IDB")
                    })
                });
            });
        });

    } 
    // else {
    //     console.log("Offline mode")
    //     openPlantsIDB().then((db) => {
    //         getAllPlants(db).then((plants) => {
    //             for (const plant of plants) {
    //                 insertPlantInList(plant)
    //             }
    //         });
    //     });
    // }
}
