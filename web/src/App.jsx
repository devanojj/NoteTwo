import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');

  useEffect(() => {
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
      setText(savedNote);
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('note', text);
  }, [text]);


    return (
    <div>
      <h1>Hello from React!</h1>
      <button onClick={() => alert('Clicked!')}>Click me</button>
      <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      
      style={{
        width: '100vw',         // Full width
        height: '100vh',        // Full height
        border: 'none',
        outline: 'none',
        padding: '1rem',
        fontSize: '1rem',
        fontFamily: 'monospace', // Like Notepad
        lineHeight: '1.5',
        resize: 'none',
        boxSizing: 'border-box', // Ensures padding doesn't shrink the box
      }}
      />
    </div>
  );
}

export default App;
