const io = require('socket.io')(8000)

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name, users);

        // add this newly joined user to the list of online users
        socket.emit('add-new-user', users);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });

    // 'disconnect' is an in-built event that is automatically triggered, not a custom one
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];

        // remove the disconnecting user from the list of online users
        socket.broadcast.emit('remove-disconnecting-user', users);
    });

    socket.on('user-typing', socketID => {
        socket.broadcast.emit('typing', socketID, users);
    });

    socket.on('user-stopped-typing', (socketID) => {
        socket.broadcast.emit('stopped-typing', socketID, users);
    });

})