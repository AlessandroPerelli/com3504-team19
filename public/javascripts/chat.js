let name = null;
let roomNo = null;
let socket = io();

function init(plantId) {
    connectToRoom(plantId);
}

socket.on('chat', function (room, userId, chatText) {
    let who = userId
    if (userId === name) who = 'Me'
    writeOnHistory('<b>' + who + ':</b> ' + chatText)
});

function connectToRoom(plantId) {
    roomNo = plantId
    name = "test"
    socket.emit('create or join', roomNo, name)
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
    let chatText = document.getElementById('comment_input').value;
    name = "test"
    date = Date.now();
    socket.emit('chat', roomNo ,name, chatText)
    updateComments(roomNo,name,chatText,date)
}



module.exports =  {
    init,
}
