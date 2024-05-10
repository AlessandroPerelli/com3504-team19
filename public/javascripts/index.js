// // Function to insert a plant item into the list
// const insertPlantInList = (plant) => {
//     if (plant.text) {
//         const copy = document.getElementById("plant_template").cloneNode()
//         copy.removeAttribute("id") // otherwise this will be hidden as well
//         copy.innerText = plant.text
//         copy.setAttribute("data-plant-id", plant.id)
//
//         // Insert sorted on string text order - ignoring case
//         const plantlist = document.getElementById("plant_list")
//         const children = plantlist.querySelectorAll("li[data-plant-id]")
//         let inserted = false
//         for (let i = 0; (i < children.length) && !inserted; i++) {
//             const child = children[i]
//             const copy_text = copy.innerText.toUpperCase()
//             const child_text = child.innerText.toUpperCase()
//             if (copy_text < child_text) {
//                 plantlist.insertBefore(copy, child)
//                 inserted = true
//             }
//         }
//         if (!inserted) { // Append child
//             plantlist.appendChild(copy)
//         }
//     }
// }

// Register service worker to control making site work offline
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
            openPlantsIDB().then((db) => {
                // insertPlantInList(db, newPlants)
                deleteAllExistingPlantsFromIDB(db).then(() => {
                    addNewPlantsToIDB(db, newPlants).then(() => {
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
    //
    // }
}
