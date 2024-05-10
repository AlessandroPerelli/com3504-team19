let name = null;
let roomNo = null;
let socket = io();

function init() {
    connectToRoom()
}
socket.on('chat', function (room, userId, chatText) {
    let who = userId
    if (userId === name) who = 'Me'
    writeOnHistory('<b>' + who + ':</b> ' + chatText)
});

function connectToRoom() {
    roomNo = "Room"
    name = "test"
    socket.emit('create or join', roomNo, name)
}


function writeOnHistory(text) {
    let history = document.getElementById('message_area')
    let paragraph = document.createElement('p')
    paragraph.innerHTML = text
    history.appendChild(paragraph)
    document.getElementById('comment_input').value = ''
}

function sendComment() {
    connectToRoom();
    let chatText = document.getElementById('comment_input').value;
    name = "test"
    socket.emit('chat', roomNo ,name, chatText)
}