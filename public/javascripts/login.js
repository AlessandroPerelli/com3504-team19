const LOCAL_STORAGE_KEY = "username"

/**
 * @function setUsername()
 * Saves the username to the local storage
 */
function setUsername() {
    let result = document.getElementById("username").value;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
}

