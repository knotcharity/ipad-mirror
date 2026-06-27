import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, NativeModules, NativeEventEmitter } from 'react-native';

const { RPSystemBroadcastPickerView } = NativeModules;

export default function Index() {
  const [serverIP, setServerIP] = useState('10.10.11.193');
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Not connected');
  const wsRef = useRef<WebSocket | null>(null);

  function connectToPC() {
    setStatusMessage('Connecting...');
    const ws = new WebSocket('ws://' + serverIP + ':3000');
    wsRef.current = ws;

    ws.onopen = function () {
      setIsConnected(true);
      setStatusMessage('Connected! ✅ Now start screen recording');
      ws.send(JSON.stringify({ type: 'ipad-hello' }));
    };
    ws.onerror = function () {
      setIsConnected(false);
      setStatusMessage('Failed to connect ❌');
    };
    ws.onclose = function () {
      setIsConnected(false);
      setStatusMessage('Not connected');
    };
  }

  function disconnect() {
    wsRef.current?.close();
    setIsConnected(false);
    setStatusMessage('Not connected');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iPad Mirror</Text>
      <Text style={[styles.status, { color: isConnected ? '#00ff00' : '#ff4444' }]}>
        {statusMessage}
      </Text>
      <TextInput
        style={styles.input}
        value={serverIP}
        onChangeText={setServerIP}
        placeholder="PC IP Address"
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isConnected ? '#cc0000' : '#0066cc' }]}
        onPress={isConnected ? disconnect : connectToPC}
      >
        <Text style={styles.buttonText}>
          {isConnected ? 'Disconnect' : 'Connect to PC'}
        </Text>
      </TouchableOpacity>
      {isConnected && (
        <Text style={styles.instructions}>
          Swipe down from top right to open Control Center, then tap and hold the Screen Recording button and select iPad Mirror to start streaming.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#111' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  status: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#555', padding: 10,
    width: '100%', marginBottom: 10, borderRadius: 8,
    backgroundColor: '#222', color: 'white'
  },
  button: { padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  instructions: { color: '#aaa', textAlign: 'center', fontSize: 14, lineHeight: 22 }
});