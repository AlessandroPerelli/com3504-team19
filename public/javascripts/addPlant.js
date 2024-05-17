const LOCAL_STORAGE_KEY = "username"

/** 
* @function verifyUsernameToAddPlant
* Verifies that the user has created a username in order to have access to 
* adding plants 
*/

function verifyUsernameToAddPlant(){
    const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));

    // Gets relevant elements from the page to change based on the username status
    var addButton = document.getElementById("submit-button");
    var addPlantForm = document.getElementById("add-plant");
    var usernameLabel = document.getElementById("user-nickname-label")
    var usernameInput = document.getElementById("user-nickname");

    if(username){
        // Changes the form method and action to be able to add plants
        addPlantForm.setAttribute("action","/add");
        addPlantForm.setAttribute("method","POST");
        addPlantForm.setAttribute("enctype","multipart/form-data");
        usernameInput.setAttribute("value",username);

    }else{
        // Changes the form method and action to take the user to the setusername page if they don't have a username
        addPlantForm.setAttribute("action","/setusername");
        addPlantForm.setAttribute("method","POST");

        // Hides the username input so that they need to be redirected
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