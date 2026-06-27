import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

// =======================================
// IPAD MIRROR - iPad App
// Captures screen and sends to PC
// =======================================

export default function Index() {

  // ---- CONFIGURATION ----
  const [serverIP, setServerIP] = useState('10.10.11.193');
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Not connected');
  const [hasPermission, setHasPermission] = useState(false);
  const wsRef = useRef(null);
  const cameraRef = useRef(null);

  // ---- REQUEST CAMERA PERMISSION ----
  async function requestPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }

  // ---- CONNECT TO PC ----
  function connectToPC() {
    setStatusMessage('Connecting...');
    const ws = new WebSocket('ws://' + serverIP + ':3000');
    wsRef.current = ws;

    ws.onopen = function() {
      setIsConnected(true);
      setStatusMessage('Connected! ✅ Streaming...');
      startStreaming(ws);
    };

    ws.onerror = function() {
      setIsConnected(false);
      setStatusMessage('Failed to connect ❌');
    };

    ws.onclose = function() {
      setIsConnected(false);
      setStatusMessage('Not connected');
    };
  }

  // ---- START STREAMING ----
  function startStreaming(ws) {
    setInterval(async () => {
      if (cameraRef.current && ws.readyState === WebSocket.OPEN) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.5,
            base64: true,
            skipProcessing: true
          });
          ws.send('data:image/jpeg;base64,' + photo.base64);
        } catch (e) {}
      }
    }, 100);
  }

  // ---- DISCONNECT ----
  function disconnect() {
    if (wsRef.current) wsRef.current.close();
    setIsConnected(false);
    setStatusMessage('Not connected');
  }

  return (
    <View style={styles.container}>

      {/* ---- CAMERA PREVIEW ---- */}
      {hasPermission && (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      )}

      {/* ---- CONTROLS ---- */}
      <View style={styles.controls}>
        <Text style={styles.title}>iPad Mirror</Text>

        <Text style={[styles.status, { color: isConnected ? 'green' : 'red' }]}>
          {statusMessage}
        </Text>

        <TextInput
          style={styles.input}
          value={serverIP}
          onChangeText={setServerIP}
          placeholder="PC IP Address"
        />

        {!hasPermission && (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Allow Camera Access</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isConnected ? 'red' : 'blue' }]}
          onPress={isConnected ? disconnect : connectToPC}
        >
          <Text style={styles.buttonText}>
            {isConnected ? 'Disconnect' : 'Connect to PC'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { padding: 20, backgroundColor: 'rgba(0,0,0,0.7)' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  status: { fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '100%', marginBottom: 10, borderRadius: 8, backgroundColor: 'white' },
  button: { backgroundColor: 'blue', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});