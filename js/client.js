const socket = io('http://localhost:8000');

// Get DOM elements in respective JS variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");

// Audio that will play when a message is received
var audio = new Audio('ting.mp3');

// Function which will append event info to the contaner
// 1st argument is the message to populate
// 2nd argument is the position of the message - right/left
// 3rd argument is the type of message - enter/exit/none(default)
const append = (message, position, type = 'none')=> {
    var today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let period = '';

    if(hours >= 12){
        period = 'PM';
        hours = hours - 12;
    }
    else{
        period = 'AM';
    }
    if(hours == 0){
        hours = 12;
    }
    if(minutes < 10){
        minutes = '0'+minutes;
    }
    let time = `${hours}:${minutes} ${period}`;

    const messageElement = document.createElement('div');
    messageElement.innerText = `${time}`;
    messageElement.innerText += '\n' + message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);

    if(type == 'enter'){
        messageElement.classList.add('enter');
        messageElement.classList.remove('message');
    }
    if(type == 'exit'){
        messageElement.classList.add('exit');
        messageElement.classList.remove('message');
    }
    
    messageContainer.append(messageElement);

    if(position =='left'){ 
        audio.play();
    }
}

// a utility function that will populate the <ul> with <li>s from "users" object
function outputUsers(users)
{
    let usersList = document.getElementById('usersList');
    let html = '';
    for(socketID in users){
        // socket.id is the id of the current instance of the client
        if(socket.id == socketID){
            html += `<li>${users[socketID]} (You)</li>`
        }
        else{
            html += `<li>${users[socketID]}</li>`
        }
    }
    usersList.innerHTML = html;
}

// Ask new user for his/her name and let the server know
const name = prompt("Enter your name to join");
// trigger a 'new-user-joined' event with user's name in parameter
socket.emit('new-user-joined', name);

// If a new user joins, receive his/her name from the server
socket.on('user-joined', (name, users) =>{
    append(`${name} joined the chat`, 'right', 'enter');
    outputUsers(users);
});

// when a new user joins the chat, add him to the list of online users (listening to the add-new-user event from the server)
socket.on('add-new-user', users => {
    outputUsers(users);
});

// when an online user disconnects, remove him from the list of online users (listening to the remove-disconnecting-user event from the server)
socket.on('remove-disconnecting-user', users => {
    outputUsers(users);
});

// If server sends a message, receive it
socket.on('receive', data =>{
    append(`${data.name}: ${data.message}`, 'left')
})

// If a user leaves the chat, append the info to the container
socket.on('left', name =>{
    append(`${name} left the chat`, 'right', 'exit');
});

// If the form gets submitted, emit a 'send' event to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''
})

// highlight the send key when enter is pressed
document.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    }
    var key = event.key;
    if (key === 'Enter') {
        // when enter key is pressed, blur the messageInput element
        // messageInput.blur();

        const btn = document.getElementsByClassName('btn')[0];
        btn.classList.add('pressed');
        setTimeout(()=>{
            btn.classList.remove('pressed');
        }, 100);
    }
});

// listen for 'focusin' event on messageInput on client side
messageInput.addEventListener('focusin', ()=>{
    // console.log("User started typing...");
    socket.emit('user-typing', socket.id); // send a 'user-typing' event to the server
});

// listen for 'typing' event (broadcasting signal) from the server
socket.on('typing', (socketID, users) =>{
    // append a "user is typing" element to the DOM on the left side
    appendTyping(users[socketID], 'left');
});

// listen for 'focusout' event on messageInput on client side
messageInput.addEventListener('focusout', ()=>{
    // console.log("User ended typing");
    socket.emit('user-stopped-typing', socket.id); // send a 'user-stopped-typing' event to the server
});

// listen for 'stopped-typing' event (broadcasting signal) from the server
socket.on('stopped-typing', (socketID, users) =>{
    // here we will remove the "user is typing..." typingElement from the DOM, that was earlier added by the appendTyping() method
    typingElement.remove();
});

let typingElement; // making it global so we can remove it by directly referencing it
// a utility function that adds "user is typing" message to the DOM
const appendTyping = (name, position) => {
    typingElement = document.createElement('div');
    typingElement.innerText = `${name} is typing...`;
    typingElement.classList.add('message');
    typingElement.classList.add(position);

    messageContainer.append(typingElement);
}