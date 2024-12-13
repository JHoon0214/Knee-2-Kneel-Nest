const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3004, path: '/chat' });

wss.on('connection', (ws) => {
  console.log('New client connected to WebSocket server on 3004');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:3004/chat');
