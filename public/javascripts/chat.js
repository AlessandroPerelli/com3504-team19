const LOCAL_STORAGE_KEY = "username";

let name = null;
let roomNo = null;
let socket = io();

document
  .getElementById("overlay")
  .addEventListener("overlayShown", function () {
    verifyUsername();
    var button = document.getElementById("DBPediaButton");
    // Attach the event listener properly
    button.addEventListener("click", sendNameToDBPedia);
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
  var form = document.getElementById("DBPedia_form");
  console.log("HERE");
  console.log(form.action);
  let chatText = document.getElementById("comment_input").value;
  let name = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  let date = Date.now();
  socket.emit("chat", roomNo, name, chatText);

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

<<<<<<< HEAD
function verifyUsername() {
=======
function keyListener(event){
  if (event.key === 'Enter'){
    sendComment();
  }
}

function verifyUsername(){
>>>>>>> main
  const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  var container = document.getElementById("send_message");
  var form = document.createElement("form");

  if (username) {
    var paragraph = document.createElement("p");

    var comment_input = document.createElement("input");
    comment_input.setAttribute("type", "text");
    comment_input.setAttribute("id", "comment_input");
    comment_input.setAttribute("name", "chat_input");
    comment_input.setAttribute("style", "width: 80%");
    comment_input.setAttribute("placeholder", "Write a comment...");

    var send_comment = document.createElement("button");
    send_comment.setAttribute("id", "chat_send");
    send_comment.setAttribute("onClick", "sendComment()");
    send_comment.innerHTML = "Send";

    paragraph.appendChild(comment_input);
    paragraph.appendChild(send_comment);

    form.appendChild(paragraph)
    form.addEventListener("submit", function(event) {
      event.preventDefault();
    });

  }else{
    form.setAttribute("action","/setUsername");
    form.setAttribute("method","POST");

    var nickname_button = document.createElement("button");
    nickname_button.setAttribute("class", "active");
    nickname_button.setAttribute("type", "submit");
    nickname_button.innerHTML = "Please enter a Username to comment";

    form.appendChild(nickname_button);
  }

  container.appendChild(form);
}

function sendNameToDBPedia() {
  console.log("Button clicked, running sendNameToDBPedia");

  var plantName = document.getElementById("plant_name").innerText;
  console.log(
    "Redirecting to: /dbpedia?plantName=" + encodeURIComponent(plantName)
  );

  window.location.href = "/dbpedia?plantName=" + encodeURIComponent(plantName);
}
