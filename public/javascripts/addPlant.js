const LOCAL_STORAGE_KEY = "username"
function verifyUsernameToAddPlant(){
    const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
    var addButton = document.getElementById("submit-button");
    var addPlantForm = document.getElementById("add-plant");
    var usernameLabel = document.getElementById("user-nickname-label")
    var usernameInput = document.getElementById("user-nickname");

    if(username){
        addPlantForm.setAttribute("action","/add");
        addPlantForm.setAttribute("method","POST");
        addPlantForm.setAttribute("enctype","multipart/form-data");
        usernameInput.setAttribute("value",username);

    }else{
        addPlantForm.setAttribute("action","/setusername");
        addPlantForm.setAttribute("method","POST");
        usernameInput.style.display="none";
        usernameLabel.style.display="none";

        
        addButton.innerHTML = "Please enter a nickname to use this feature";

    }
    usernameInput.setAttribute("readonly",true);

}

const addPlantEventListener = () => {
    const form_data = new FormData(document.getElementById('add-plant'));
    console.log(form_data);
    if (!navigator.onLine) {
        openSyncIDB("sync-plants").then((db) => {
            addNewToSync(db, form_data, "sync-plants");
        });
    }
}

window.onload = function(){
    verifyUsernameToAddPlant();
    // Add event listeners to buttons
    const addButton = document.getElementById("submit-button");
    addButton.addEventListener("click", addPlantEventListener);
}