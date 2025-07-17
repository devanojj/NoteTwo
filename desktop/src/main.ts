import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div>
    <h1>NoteTwo - Desktop</h1>
    <div id="note-container">
      <textarea id="note-textarea" placeholder="Start typing your notes..."></textarea>
    </div>
  </div>
`

// Load saved note from localStorage
const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement
const savedNote = localStorage.getItem('note')
if (savedNote) {
  textarea.value = savedNote
}

// Save note to localStorage on every change
textarea.addEventListener('input', () => {
  localStorage.setItem('note', textarea.value)
})

// Listen for messages from main process
window.ipcRenderer?.on('main-process-message', (_event, message) => {
  console.log('Message from main process:', message)
})
