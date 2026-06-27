// =======================================
// IPAD MIRROR - SERVER
// =======================================
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let ipadClient = null;

wss.on('connection', function(ws) {
    console.log('[iPad Mirror] Someone connected!');

    ws.on('message', function(data, isBinary) {
        const str = data.toString();
        try {
            const msg = JSON.parse(str);
            if (msg.type === 'ipad-hello') {
                ipadClient = ws;
                console.log('[iPad Mirror] iPad identified!');
                return;
            }
        } catch(e) {}

        // Forward frames to OBS as the same type they arrived
        wss.clients.forEach(function(client) {
            if (client !== ipadClient && client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });

    ws.on('close', function() {
        if (ws === ipadClient) {
            ipadClient = null;
            console.log('[iPad Mirror] iPad disconnected.');
        }
    });
});

server.listen(PORT, function() {
    console.log('[iPad Mirror] Server running on port ' + PORT);
});