import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

// =======================================
// IPAD MIRROR - iPad App
// Connects to PC and sends screen to OBS
// =======================================

export default function Index() {

  // ---- CONFIGURATION ----
  const [serverIP, setServerIP] = useState('10.10.11.193');
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Not connected');

  // ---- CONNECT TO PC ----
  function connectToPC() {
    setStatusMessage('Connecting...');
    const ws = new WebSocket('ws://' + serverIP + ':3000');

    ws.onopen = function() {
      setIsConnected(true);
      setStatusMessage('Connected to PC! ✅');
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

  // ---- DISCONNECT ----
  function disconnect() {
    setIsConnected(false);
    setStatusMessage('Not connected');
  }

  return (
    <View style={styles.container}>

      {/* ---- TITLE ---- */}
      <Text style={styles.title}>iPad Mirror</Text>

      {/* ---- STATUS ---- */}
      <Text style={[styles.status, { color: isConnected ? 'green' : 'red' }]}>
        {statusMessage}
      </Text>

      {/* ---- IP INPUT ---- */}
      <TextInput
        style={styles.input}
        value={serverIP}
        onChangeText={setServerIP}
        placeholder="PC IP Address"
      />

      {/* ---- CONNECT BUTTON ---- */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isConnected ? 'red' : 'blue' }]}
        onPress={isConnected ? disconnect : connectToPC}
      >
        <Text style={styles.buttonText}>
          {isConnected ? 'Disconnect' : 'Connect to PC'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  status: { fontSize: 16, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '100%', marginBottom: 20, borderRadius: 8 },
  button: { padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});