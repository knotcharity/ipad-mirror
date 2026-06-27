// =======================================
// IPAD MIRROR - SERVER
// Receives video from iPad and sends it to OBS
// =======================================

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// ---- CONFIGURATION ----
const PORT = 3000; // the port your server runs on

// ---- SETUP ----
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ---- SERVE THE OBS DISPLAY PAGE ----
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- CONNECTIONS ----
wss.on('connection', function(ws) {
    console.log('[iPad Mirror] iPad connected!');

    ws.on('message', function(data) {
        // Send the video frame to all connected clients (OBS browser source)
        wss.clients.forEach(function(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', function() {
        console.log('[iPad Mirror] iPad disconnected.');
    });
});

// ---- START SERVER ----
server.listen(PORT, function() {
    console.log('[iPad Mirror] Server running on port ' + PORT);
});