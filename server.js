const express = require('express');

let io = require('socket.io')({
  path: '/io/webrtc',
});

const app = express();
const port = 8580;

//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/build'));
app.get('/', (req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.sendFile(__dirname + '/build/index.html');
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

io.listen(server);

const peers = io.of('/webrtcPeer');

let connectedPeers = new Map();

peers.on('connection', (socket) => {
  console.log(socket.id);
  socket.emit('connection-success', { success: socket.id });
  connectedPeers.set(socket.id, socket);

  socket.on('disconnect', () => {
    console.log('disconnected!');
    connectedPeers.delete(socket.id);
  });

  socket.on('offerOrAnswer', (data) => {
    console.log('data-offer||Answer', data);
    // send to other peers if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log('not-offerOrAnswer', socketID, data.payload.type);
        socket.emit('offerOrAnswer', data.payload);
      }
    }
  });

  socket.on('candidate', (data) => {
    // send candidate to the other peers if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log('dont_send_to_self-candidate', socketID, data.payload.type);
        socket.emit('candidate', data.payload);
      }
    }
  });
});
