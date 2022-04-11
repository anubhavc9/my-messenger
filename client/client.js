// for production environment
const socket = io('https://my-messenger-backend.herokuapp.com/');

// for local (dev) environment
// const socket = io('http://localhost:8000');

const msgForm = document.getElementById('msgForm');
const messageInp = document.getElementById('messageInp');
const msgs = document.getElementById('msgs');

var newMessageAlert = new Audio('new-message-alert.mp3');

const appendMessage = (name, message, position, type = 'none') => {
    var today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let period = '';

    if (hours >= 12) {
        period = 'PM';
        hours = hours - 12;
    } else {
        period = 'AM';
    }
    if (hours == 0) {
        hours = 12;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    let time = `${hours}:${minutes} ${period}`;

    const msgElement = document.createElement('div');

    let msgHtml = ``;

    if (name === 'You') {
        msgHtml = `
        <div class="msg ${position}">
            <div id="msg-info">
                <div id="msg-info-inner">
                    <div id="user-name">
                        You
                    </div>
                    <div id="time">
                        ${time}
                    </div>
                </div>
                <div id="text">
                    ${message}
                </div>
            </div>
        </div>
        `;
    } else {
        msgHtml = `
        <div class="msg ${position}">
            <div id="msg-info">
                <div id="msg-info-inner">
                    <div id="user-name">
                        ${name}
                    </div>
                    <div id="time">
                        ${time}
                    </div>
                </div>
                <div id="text">
                    ${message}
                </div>
            </div>
        </div>
        `;
    }

    // new user joined the chat
    if (type === 'enter') {
        msgHtml = `
        <div class="user-entered">
            <span>
            ${name} ${message}
            </span>
        </div>
        `;
    }

    // user left the chat
    if (type === 'exit') {
        msgHtml = `
        <div class="user-exited">
            <span>
            ${name} ${message}
            </span>
        </div>
        `;
    }

    msgElement.innerHTML = msgHtml;

    msgs.append(msgElement);

    if (position == 'left') {
        newMessageAlert.play();
    }
}

// a utility function that populates the list of online users
function outputOnlineUsers(users) {
    let usersList = document.getElementById('usersList');

    let usersHtml = ``;
    for (socketID in users) {
        // socket.id is the id of the current instance of the client
        if (socket.id == socketID) {
            usersHtml += `
            <div class="online">
                <div id="online-avatar">
                    <img src="./images/${users[socketID][0].toLowerCase()}.png" alt="Avatar">
                </div>
                <div id="online-name">
                    ${users[socketID]} (You)
                </div>
            </div>
            `;
        } else {
            usersHtml += `
            <div class="online">
                <div id="online-avatar">
                    <img src="./images/${users[socketID][0].toLowerCase()}.png" alt="Avatar">
                </div>
                <div id="online-name">
                    ${users[socketID]}
                </div>
            </div>
            `;
        }
    }

    usersList.innerHTML = usersHtml;
}

var name = prompt("Enter your name to join");
if (name.trim() === '' || name === 'null') {
    while (true) {
        name = prompt("Name cannot be empty!");
        if (name.trim() != '' && name != 'null') {
            break;
        }
    }
}
socket.emit('new-user-joined', name);

socket.on('user-joined', (name, users) => {
    appendMessage(name, 'joined the chat', 'right', 'enter');
    outputOnlineUsers(users);
});

socket.on('add-new-user', users => {
    outputOnlineUsers(users);
});

socket.on('remove-disconnecting-user', users => {
    outputOnlineUsers(users);
});

socket.on('receive', data => {
    appendMessage(data.name, data.message, 'left')
})

socket.on('left', name => {
    appendMessage(name, 'left the chat', 'right', 'exit');
});

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInp.value;
    appendMessage('You', message, 'right');
    socket.emit('send', message);
    messageInp.value = ''
})

// highlight the send key when enter is pressed
document.addEventListener('keyup', function(event) {
    if (event.defaultPrevented) {
        return;
    }
    var key = event.key;
    if (key === 'Enter') {
        // when enter key is pressed, blur the messageInp element
        messageInp.blur();

        const btn = document.getElementsByClassName('btn')[0];
        btn.classList.add('pressed');
        setTimeout(() => {
            btn.classList.remove('pressed');
        }, 100);
    }
});

messageInp.addEventListener('focusin', () => {
    // console.log("User started typing...");
    socket.emit('user-typing', socket.id);
});

socket.on('typing', (socketID, users) => {
    appendTyping(users[socketID], 'left');
});

messageInp.addEventListener('focusout', () => {
    // console.log("User ended typing");
    socket.emit('user-stopped-typing', socket.id);
});

socket.on('stopped-typing', (socketID, users) => {
    typingElement.remove();
});

let typingElement;

// a utility function that will add "User is typing..." to the screen temporarily
const appendTyping = (name, position) => {
    typingElement = document.createElement('div');

    typingElement.innerHTML = `
    <div class="msg left">
        <div id="typing-info">
            <div id="text">
                ${name} is typing
            </div>
            <div id="typing">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </div>
    `;

    msgs.append(typingElement);
}