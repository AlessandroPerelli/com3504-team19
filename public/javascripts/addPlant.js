const LOCAL_STORAGE_KEY = "username"
function verifyUsernameToAddPlant(){
    const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
    var addButton = document.getElementById("submit-button");
    var addPlantForm = document.getElementById("add-plant-form");
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

        
        addButton.innerHTML = "Please enter a nickname to use this feature";

    }
    usernameInput.setAttribute("readonly",true);

}