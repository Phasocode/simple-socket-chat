// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = {};
let messages = []; // store message history

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name;

        // Send history to the new user
        socket.emit('chat-history', messages);

        const joinMsg = `${name} joined the chat`;
        const systemMessage = { name: 'System', message: joinMsg, type: 'system' };
        messages.push(systemMessage);
        io.emit('system-message', joinMsg);
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-chat-message', message => {
        const name = users[socket.id];
        const msg = { name, message, id: socket.id, type: 'chat' };
        messages.push(msg);
        io.emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
        const name = users[socket.id];
        if (name) {
            const leaveMsg = `${name} left the chat`;
            const systemMessage = { name: 'System', message: leaveMsg, type: 'system' };
            messages.push(systemMessage);
            io.emit('system-message', leaveMsg);
            delete users[socket.id];
            io.emit('update-users', Object.values(users));
        }
    });
});

server.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
});
