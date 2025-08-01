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

  // Initialize backend connection
  useEffect(() => {
    const initBackend = async () => {
      try {
        console.log('Testing backend connection...');
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        
        // Test backend connection
        console.log('Testing backend API...');
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        
        if (data.success) {
          console.log('Backend API connected successfully:', data);
          setFirebaseReady(true);
          
          // Load existing notes from backend
          const notesResponse = await fetch(`${API_BASE_URL}/notes`);
          const notesData = await notesResponse.json();
          
          if (notesData.success && notesData.data && notesData.data.content) {
            setText(notesData.data.content);
          }
          
          // Set up polling for real-time updates
          const pollForUpdates = async () => {
            try {
              const notesResponse = await fetch(`${API_BASE_URL}/notes`);
              const notesData = await notesResponse.json();
              if (notesData.success && notesData.data && notesData.data.content && notesData.data.content !== text) {
                setText(notesData.data.content);
              }
            } catch (err) {
              console.error('Error polling for updates:', err);
            }
          };
          
          // Poll every 2 seconds for updates
          const pollInterval = setInterval(pollForUpdates, 2000);
          return () => clearInterval(pollInterval);
        } else {
          throw new Error(`Backend API test failed: ${data.error}`);
        }
        
      } catch (err) {
        console.error('Backend API error:', err);
        setError(err.message);
      }
    };

    initBackend();
  }, []); // Only run once on mount

  // Sync to backend API when text changes (after backend is ready)
  useEffect(() => {
    if (!firebaseReady || text === undefined) return;

    const syncToBackend = async () => {
      try {
        console.log('Syncing to backend API...');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        
        const response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: text
          })
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(`Sync failed: ${data.error}`);
        }
        console.log('Sync successful');
      } catch (err) {
        console.error('Error syncing to backend:', err);
      }
    };

    // Debounce the sync to avoid too many writes
    const timeoutId = setTimeout(syncToBackend, 500);
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
          Backend Error: {error}
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
          ✓ Backend connected - Notes are syncing in real-time
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