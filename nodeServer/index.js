// Node server which will handle socket io connections

const io = require('socket.io')(8000)

const users = {};

io.on('connection', socket => {
    // Listen to the 'new-user-joined' event from any of the clients
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name => { 
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name, users);

        // add this newly joined user to the list of online users
        socket.emit('add-new-user', users); // emitting the signal to everyone (not broadcasting)
    });

    // Listen to the 'send' event from any of the clients
    // If someone sends a message, broadcast it to other people
    socket.on('send', message => {
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        // update the users list
        delete users[socket.id];

        // remove the disconnecting user from the list of online users
        socket.broadcast.emit('remove-disconnecting-user', users);
    });

    // listen for 'user-typing' event from the client
    socket.on('user-typing', socketID => {
        // broadcast a 'typing' event to all the other connected clients
        socket.broadcast.emit('typing', socketID, users);
    });

    // listen for the 'user-stopped-typing' event from the client
    socket.on('user-stopped-typing', (socketID) => {
        // broadcast a 'stopped-typing' event to all the other connected clients
        socket.broadcast.emit('stopped-typing', socketID, users);
    });
    
})
