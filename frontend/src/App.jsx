// frontend/src/App.jsx
import { useEffect, useState, useRef } from 'react';
import { connectWS, onWS, sendWS, shutdownWS } from './ws';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Register listeners
    const unsubOpen = onWS('open', () => {
      console.log('App: WebSocket opened');
      setConnected(true);
    });

    const unsubMessage = onWS('message', (msg) => {
      console.log('App: received message', msg);
      setMessages(prev => [...prev, { ...msg, sender: 'server' }]);
    });

    const unsubClose = onWS('close', () => {
      console.log('App: WebSocket closed');
      setConnected(false);
      setMessages(prev => [...prev, { type: 'text', data: '❌ disconnected', sender: 'server' }]);
    });

    // Connect
    connectWS();

    // cleanup
    return () => {
      unsubOpen();
      unsubMessage();
      unsubClose();
      shutdownWS();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && connected) {
      const message = { type: 'text', data: input, sender: 'user' };
      sendWS({ type: 'text', data: input });
      setMessages(prev => [...prev, message]);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>WebSocket Test</h1>
      
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px',
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24',
        borderRadius: '5px'
      }}>
        Status: {connected ? '✅ Connected' : '❌ Disconnected'}
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '300px', 
        overflowY: 'auto',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999' }}>No messages yet...</p>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={i} 
                style={{ 
                  marginBottom: '8px', 
                  padding: '5px', 
                  backgroundColor: '#fff', 
                  borderRadius: '3px', 
                  color: '#000', 
                  textAlign: isUser ? 'right' : 'left',
                  marginLeft: isUser ? 'auto' : '0',
                  marginRight: isUser ? '0' : 'auto',
                  maxWidth: '70%'
                }}
              >
                {isUser ? (
                  <>
                    <strong>{msg.data || ''}</strong> 👤
                  </>
                ) : (
                  <>
                    <strong>🖥️</strong> {msg.data || ''}
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={!connected}
          style={{ flex: 1, padding: '8px', color: '#000', backgroundColor: '#fff', textAlign: 'left' }}
        />
        <button 
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          style={{ padding: '8px 20px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;