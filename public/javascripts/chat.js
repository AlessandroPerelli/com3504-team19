const LOCAL_STORAGE_KEY = "username"

let name = null;
let roomNo = null;
let socket = io();

document.getElementById("overlay").addEventListener("overlayShown", function(){
  verifyUsername();
});

function init(plantId) {
  connectToRoom(plantId);
}

socket.on("chat", function (room, userId, chatText) {
  let who = userId;
  writeOnHistory("<b>" + who + ":</b> " + chatText);
});

function connectToRoom(plantId) {
  roomNo = plantId;
  name = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  socket.emit("create or join", roomNo, name);
}

function writeOnHistory(text) {
  let messageArea = document.getElementById("message_area");
  let paragraph = document.createElement("p");
  paragraph.innerHTML = text;
  paragraph.classList.add("text-message");
  messageArea.appendChild(paragraph);
  document.getElementById("comment_input").value = "";
}

function sendComment() {
  let chatText = document.getElementById("comment_input").value;
  let name = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  let date = Date.now();
  let commentData = {
    plantId: roomNo,
    name: name,
    comment: chatText,
    date: date
  };

  socket.emit("chat", roomNo, name, chatText);

  if (!navigator.onLine) {
    openSyncIDB("sync-chats").then((db) => {
        addNewToSync(db, commentData, "sync-chats");
    });

  } else {
    fetch("/updateComments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plantId: roomNo,
        name: name,
        comment: chatText,
        date: date,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Comment added successfully");
        } else {
          console.error("Failed to add comment");
        }
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });

  }
}

function verifyUsername(){
  const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  var container = document.getElementById("send_message");
  var form = document.createElement("form");

  if(username){
    var paragraph = document.createElement("p");

    var comment_input = document.createElement("input");
    comment_input.setAttribute("type","text");
    comment_input.setAttribute("id","comment_input");
    comment_input.setAttribute("name","chat_input");
    comment_input.setAttribute("style","width: 80%");
    comment_input.setAttribute("placeholder","Write a comment...");

    var send_comment = document.createElement("button");
    send_comment.setAttribute("id","chat_send")
    send_comment.setAttribute("onClick","sendComment()")
    send_comment.innerHTML = "Send";

    paragraph.appendChild(comment_input);
    paragraph.appendChild(send_comment);

    form.appendChild(paragraph);

  }else{
    form.setAttribute("action","/setUsername");
    form.setAttribute("method","post");

    var nickname_button = document.createElement("button");
    nickname_button.setAttribute("class","active");
    nickname_button.setAttribute("type","submit");
    nickname_button.innerHTML = "Please enter a Username to comment";
    
    form.appendChild(nickname_button)

  }

  container.appendChild(form);
}

function openSyncIDB(syncIDB) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(syncIDB, 1);

    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore(syncIDB, {keyPath: '_id', autoIncrement: true});
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
}

const addNewToSync = (syncPlantIDB, commentData, syncIDB) => {
  const transaction = syncPlantIDB.transaction([syncIDB], "readwrite");
  const plantStore = transaction.objectStore(syncIDB);

  // Directly add the commentData object to the store
  const addRequest = plantStore.add(commentData);

  addRequest.addEventListener("success", () => {
    console.log("Added " + "#" + addRequest.result + ": " + JSON.stringify(commentData));

    const getRequest = plantStore.get(addRequest.result);
    getRequest.addEventListener("success", () => {
      console.log("Found " + JSON.stringify(getRequest.result));

      // Send a sync message to the service worker
      navigator.serviceWorker.ready.then((sw) => {
        sw.sync.register("sync-plant");
      }).then(() => {
        console.log("Sync registered");
      }).catch((err) => {
        console.log("Sync registration failed: " + JSON.stringify(err));
      });
    });
  });
}
