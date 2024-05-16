const addPlantEventListener = () => {
    const form_data = new FormData(document.getElementById('add-plant'));
    console.log(form_data);
    if (!navigator.onLine) {
        openSyncPlantsIDB().then((db) => {
            addNewPlantToSync(db, form_data);
        });
    }
}

window.onload = function () {
    // Add event listeners to buttons
    const addButton = document.getElementsByClassName("add-button")[0];
    addButton.addEventListener("click", addPlantEventListener)
}
