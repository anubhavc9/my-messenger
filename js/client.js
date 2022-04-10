const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const msgs = document.getElementById('msgs');

var audio = new Audio('new-message-alert.mp3');

const append = (name, message, position, type = 'none') => {
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


    if (type === 'enter') {
        msgHtml = `
        <div class="user-entered">
            <span>
            ${name} ${message}
            </span>
        </div>
        `;
    }

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
        audio.play();
    }
}

function outputUsers(users) {
    let usersList = document.getElementById('usersList');

    let usersHtml = ``;
    for (socketID in users) {
        // socket.id is the id of the current instance of the client
        if (socket.id == socketID) {
            usersHtml += `
            <div class="online">
                <div id="online-avatar">
                    <img src="img_avatar.png" alt="Avatar">
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
                    <img src="img_avatar.png" alt="Avatar">
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

const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

socket.on('user-joined', (name, users) => {
    append(name, 'joined the chat', 'right', 'enter');
    outputUsers(users);
});

socket.on('add-new-user', users => {
    outputUsers(users);
});

socket.on('remove-disconnecting-user', users => {
    outputUsers(users);
});

socket.on('receive', data => {
    append(data.name, data.message, 'left')
})

socket.on('left', name => {
    append(name, 'left the chat', 'right', 'exit');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append('You', message, 'right');
    socket.emit('send', message);
    messageInput.value = ''
})

// highlight the send key when enter is pressed
document.addEventListener('keyup', function(event) {
    if (event.defaultPrevented) {
        return;
    }
    var key = event.key;
    if (key === 'Enter') {
        // when enter key is pressed, blur the messageInput element
        messageInput.blur();

        const btn = document.getElementsByClassName('btn')[0];
        btn.classList.add('pressed');
        setTimeout(() => {
            btn.classList.remove('pressed');
        }, 100);
    }
});

messageInput.addEventListener('focusin', () => {
    // console.log("User started typing...");
    socket.emit('user-typing', socket.id);
});

socket.on('typing', (socketID, users) => {
    appendTyping(users[socketID], 'left');
});

messageInput.addEventListener('focusout', () => {
    // console.log("User ended typing");
    socket.emit('user-stopped-typing', socket.id);
});

socket.on('stopped-typing', (socketID, users) => {
    typingElement.remove();
});

let typingElement;

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