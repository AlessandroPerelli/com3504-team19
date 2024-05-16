const LOCAL_STORAGE_KEY = "username"

function setUsername() {
    let result = document.getElementById("username").value;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
}

