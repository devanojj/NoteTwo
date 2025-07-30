import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Load from localStorage first to get app working
  useEffect(() => {
    const saved = localStorage.getItem('note');
    if (saved) {
      setText(saved);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('note', text);
  }, [text]);

  // Initialize Firebase via REST API
  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log('Starting Firebase REST API test...');
        
        // Test Firebase REST API directly
        const testUrl = 'https://notetwo-fa8e0-default-rtdb.firebaseio.com/test.json';
        
        // Try a simple GET request
        console.log('Testing Firebase REST API read...');
        const response = await fetch(testUrl);
        const data = await response.json();
        console.log('Firebase REST API read successful, data:', data);
        
        // Try a simple PUT request
        console.log('Testing Firebase REST API write...');
        const writeResponse = await fetch(testUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Firebase REST API connected',
            timestamp: Date.now()
          })
        });
        
        if (writeResponse.ok) {
          console.log('Firebase REST API write successful');
          setFirebaseReady(true);
          
          // Set up polling for real-time updates (since REST API doesn't have real-time)
          const pollForUpdates = async () => {
            try {
              const notesResponse = await fetch('https://notetwo-fa8e0-default-rtdb.firebaseio.com/notes.json');
              const notesData = await notesResponse.json();
              if (notesData && notesData.content && notesData.content !== text) {
                setText(notesData.content);
              }
            } catch (err) {
              console.error('Error polling for updates:', err);
            }
          };
          
          // Poll every 2 seconds for updates
          const pollInterval = setInterval(pollForUpdates, 2000);
          return () => clearInterval(pollInterval);
        } else {
          throw new Error(`Firebase REST API write failed: ${writeResponse.status}`);
        }
        
      } catch (err) {
        console.error('Firebase REST API error:', err);
        setError(err.message);
      }
    };

    initFirebase();
  }, []); // Only run once on mount

  // Sync to Firebase REST API when text changes (after Firebase is ready)
  useEffect(() => {
    if (!firebaseReady || text === undefined) return;

    const syncToFirebase = async () => {
      try {
        console.log('Syncing to Firebase via REST API...');
        const response = await fetch('https://notetwo-fa8e0-default-rtdb.firebaseio.com/notes.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: text,
            lastUpdated: Date.now()
          })
        });
        
        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status}`);
        }
        console.log('Sync successful');
      } catch (err) {
        console.error('Error syncing to Firebase:', err);
      }
    };

    // Debounce the sync to avoid too many writes
    const timeoutId = setTimeout(syncToFirebase, 500);
    return () => clearTimeout(timeoutId);
  }, [text, firebaseReady]);

  return (
    <div>
      {error && (
        <div style={{
          padding: '1rem',
          color: 'red',
          background: '#ffe6e6',
          borderBottom: '1px solid #ffcccc'
        }}>
          Firebase Error: {error}
        </div>
      )}
      
      {firebaseReady && (
        <div style={{
          padding: '0.5rem 1rem',
          color: 'green',
          background: '#e6ffe6',
          borderBottom: '1px solid #ccffcc',
          fontSize: '0.875rem'
        }}>
          ✓ Firebase connected - Notes are syncing in real-time
        </div>
      )}
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing your notes..."
        style={{
          width: '100vw',
          height: error || firebaseReady ? '90vh' : '100vh',
          border: 'none',
          outline: 'none',
          padding: '1rem',
          fontSize: '1rem',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          resize: 'none',
          boxSizing: 'border-box',
          margin: 0,
          position: 'fixed',
          top: error || firebaseReady ? '10vh' : 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default App;