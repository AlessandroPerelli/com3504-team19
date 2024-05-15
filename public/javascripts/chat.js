let name = null;
let roomNo = null;
let socket = io();

function init(plantId) {
  connectToRoom(plantId);
}

socket.on("chat", function (room, userId, chatText) {
  let who = userId;
  if (userId === name) who = "Me";
  writeOnHistory("<b>" + who + ":</b> " + chatText);
});

function connectToRoom(plantId) {
  roomNo = plantId;
  name = "test";
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
  let name = "test";
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
        writeOnHistory(`<b>${name}:</b> ${chatText}`); // Optional: update UI after successful response
      } else {
        console.error("Failed to add comment");
      }
    })
    .catch((error) => {
      console.error("Error adding comment:", error);
    });
}