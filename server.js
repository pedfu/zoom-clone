import express from 'express';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io'; 
import { ExpressPeerServer } from 'peer'; 

const app = express();
const server = http.Server(app);
const io = new Server(server);
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    const roomId = req.params.room;
    res.render('room', {roomId: roomId})
})

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('message', (message) => {
            io.to(roomId).emit('create-message', message);
        })
        
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3030);