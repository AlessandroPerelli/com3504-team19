const LOCAL_STORAGE_KEY = "username";

let name = null;
let roomNo = null;
let socket = io();

/**
 * Overlay event listener that runs when all HTML elements of the overlay have been shown
 * Will verify the nickname and the plant status and add event listeners
 */
document.getElementById("overlay").addEventListener("overlayShown", function () {
  verifyUsername();
  verifyConfirmed();
  var button = document.getElementById("DBPediaButton");
  button.addEventListener("click", sendNameToDBPedia);
});

/**
 * @function init
 * Function to initialise the comments
 * @param {plantId} The plantID of the plant that the comments are tied to
 */
function init(plantId) {
  connectToRoom(plantId);
}

socket.on("chat", function (room, userId, chatText) {
  let who = userId;
  writeOnHistory("<b>" + who + ":</b> " + chatText);
});

/**
 * @function connectToRoom
 * Function to connect to a specific comment room.
 * @param {string} plantId - The ID of the plant which will become the room number
 */
function connectToRoom(plantId) {
  roomNo = plantId;
  name = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  socket.emit("create or join", roomNo, name);
}

/**
 * @function writeOnHistory
 * Function to display a new chat message in the comment area.
 * @param {string} text - The text of the comment to be displayed.
 */

function writeOnHistory(text) {
  let messageArea = document.getElementById("message_area");
  let paragraph = document.createElement("p");
  paragraph.innerHTML = text;
  paragraph.classList.add("text-message");
  messageArea.appendChild(paragraph);
  document.getElementById("comment_input").value = "";
}

/**
 * @function sendComment
 * Function to send a new comment to the server and display it in the comment area.
 */
function sendComment() {
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

/**
 * @function verifyUsername
 * Function to verify if a username is set:
 * If it isn't a user can't comment
 * If it is, a user has access to the comment input
 */
function verifyUsername() {
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

    form.appendChild(paragraph);
    form.addEventListener("submit", function(event) {
      event.preventDefault();
  });

  } else {
    form.setAttribute("action", "/setUsername");
    form.setAttribute("method", "post");

    var nickname_button = document.createElement("button");
    nickname_button.setAttribute("class", "active");
    nickname_button.setAttribute("type", "submit");
    nickname_button.innerHTML = "Please enter a Username to comment";

    form.appendChild(nickname_button);
  }

  container.appendChild(form);
}

/**
 * @function sendNameToDBPedia
 * Function to get plant name from the view plant page and redirect to the DBPedia entry for that plant
 */
function sendNameToDBPedia() {
  console.log("Button clicked, running sendNameToDBPedia");

  var plantName = document.getElementById("plant_name").innerText;
  console.log(
    "Redirecting to: /dbpedia?plantName=" + encodeURIComponent(plantName)
  );

  window.location.href = "/dbpedia?plantName=" + encodeURIComponent(plantName);
}

/**
 * @function verifyConfirmed
 * Function to verify the confirmation status of a plant identification:
 * If its confirmed, the name is unchangable
 * If the username is not the same as the plant creator, the name is unchangable
 * If it isn't confirmed and the username is the same as the plant creator, the name is changable via the form
 */
function verifyConfirmed(){
  const username = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  var identification_status = document.getElementById("identification_status");
  var plantCreator = document.getElementById("user_nickname").innerText;
  plantCreator = plantCreator.replace("Uploaded by: ", "");

  if( identification_status.innerText ==="false" && username === plantCreator ){
    var plantIdentificationContainer = document.getElementById("plant_identification");
    identification_status.innerText = "Status: In Progress";
    var paragraph = document.createElement("p");
    var confirmNameForm = document.createElement("form");
    var newPlantName = document.createElement("input");
    var plantId = document.createElement("input");
    var submissionButton = document.createElement("button");

    paragraph.innerHTML = "Confirm this plant name below:";
    confirmNameForm.setAttribute("action", "/editplant");
    confirmNameForm.setAttribute("method", "post");
    confirmNameForm.setAttribute("id", "confirm_name");

    newPlantName.setAttribute("type", "text");
    newPlantName.setAttribute("id", "plantName");
    newPlantName.setAttribute("name", "name");
    newPlantName.setAttribute("required", true);

    plantId.setAttribute("type", "text");
    plantId.setAttribute("id", "plantId");
    plantId.setAttribute("name", "plantId")
    plantId.setAttribute("value", roomNo);
    plantId.setAttribute("hidden", true);

    submissionButton.setAttribute("type", "submit");
    submissionButton.innerText = "Confirm Plant"

    confirmNameForm.appendChild(newPlantName);
    confirmNameForm.appendChild(plantId);
    confirmNameForm.appendChild(submissionButton);

    plantIdentificationContainer.appendChild(paragraph);
    plantIdentificationContainer.appendChild(confirmNameForm);

  }else if( identification_status.innerText === "false" ){
    identification_status.innerText = "Status: In Progress";
  }else {
    identification_status.innerText = "Status: Completed";
  }

}
