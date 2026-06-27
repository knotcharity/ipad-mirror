import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Index() {
  const [serverIP, setServerIP] = useState('10.10.11.193');
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Not connected');
  const [permission, requestPermission] = useCameraPermissions();
  const wsRef = useRef<WebSocket | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const intervalRef = useRef<any>(null);

  function connectToPC() {
    setStatusMessage('Connecting...');
    const ws = new WebSocket('ws://' + serverIP + ':3000');
    wsRef.current = ws;

    ws.onopen = function () {
      setIsConnected(true);
      setStatusMessage('Connected! Streaming... ✅');
      ws.send(JSON.stringify({ type: 'ipad-hello' }));
      startStreaming();
    };
    ws.onerror = function () {
      setIsConnected(false);
      setStatusMessage('Failed to connect ❌');
    };
    ws.onclose = function () {
      setIsConnected(false);
      setStatusMessage('Not connected');
      stopStreaming();
    };
  }

  function startStreaming() {
    intervalRef.current = setInterval(async () => {
      if (cameraRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.9,
            base64: true,
            skipProcessing: true,
            shutterSound: false,
          });
          if (photo?.base64) {
            wsRef.current.send('data:image/jpeg;base64,' + photo.base64);
          }
        } catch (e) {}
      }
    }, 100);
  }

  function stopStreaming() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function disconnect() {
    wsRef.current?.close();
    stopStreaming();
    setIsConnected(false);
    setStatusMessage('Not connected');
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission needed</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  status: { fontSize: 14, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    width: '100%', marginBottom: 10, borderRadius: 8,
    backgroundColor: 'white'
  },
  button: { padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});