let name = null;
let roomNo = null;
let socket = io();

function init() {

    socket.on('joined', function (room, userId) {
        writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room);
    });

    // called when a message is received

    connectToRoom()

}
socket.on('chat', function (room, userId, chatText) {
    let who = userId
    if (userId === name) who = 'Me';
    writeOnHistory('<b>' + who + ':</b> ' + chatText);
});

function connectToRoom() {
    roomNo = "ROOM"
    name = "test"
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', roomNo, name);
}


function writeOnHistory(text) {
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('comment_input').value = '';
}

function sendComment() {
    let chatText = document.getElementById('comment_input').value;
    name = "test";
    socket.emit('chat', roomNo ,name, chatText);
}