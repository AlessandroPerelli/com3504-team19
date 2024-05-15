console.log("SCRIPT LOADED")
const VISIT_LOCAL_STORAGE_KEY = "username"

function getUsername() {
    result = "hengjohmnan";
    const stored = window.localStorage.getItem(VISIT_LOCAL_STORAGE_KEY)
    if (stored) {
        result = JSON.parse(stored)
    }
    return result
}
function setUsername(username) {
    window.localStorage.setItem(VISIT_LOCAL_STORAGE_KEY, JSON.stringify(username));
}

let username = getUsername();
setUsername(username)
