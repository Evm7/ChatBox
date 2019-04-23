const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {
    generateMessage
} = require('./utils/message');
const {
    isRealString
} = require('./utils/validation');
const {
    Users
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 9080;
app.use(express.static(publicPath));
io.on('connection', (socket) => {
    console.log('New user connected');
    //Function that runs if client joins
    socket.on('join', (params, callback) => {
        //Check if form is correctly filled in
        if (!isRealString(params.username) || !isRealString(params.room)) {
            return callback('Username and room name are required');
        }
        //Suscribe the socket to a channel "room"
        socket.join(params.room);
        //Suscribe the user to the correct channel and introduce parametres.
        users.removeUser(socket.id);
        users.addUser(socket.id, params.username, params.room);
        //Update User list and send it to the clients.
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        //Administrator welcoming to the new user connected to "room"
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room: ' + params.room));
        //Administratior notification of the new user join to all other users
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.username} has joined.`));
        callback();
    });
    //Creates a message
    socket.on('createMessage', (message, callback) => {
        //get user class by socket.id functionality
        const user = users.getUser(socket.id);
        //Check if message is correctly texted.
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.username, message.text));
        }
        callback('');
    });
    //Notify of disconnection of a user
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has left`));
        }
    });

    //Notify "user" is typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {
            username: data
        })
    })
});

//establish the server in listen mode in port "port"
server.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});
