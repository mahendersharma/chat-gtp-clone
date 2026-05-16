const {Server} = require('socket.io');

function initSockets(httpServer) {
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('User connected');
    });
    io.on('disconnect', (socket) => {
        console.log('User disconnected');
    });

    return io;
}


module.exports = initSockets;