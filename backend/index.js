const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
try {
  console.log('Starting Firebase Admin SDK initialization...');
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  console.log('Parsing service account key...');
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  
  console.log('Creating credential...');
  const credential = admin.credential.cert(serviceAccount);
  
  console.log('Initializing Firebase app...');
  admin.initializeApp({
    credential: credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://notetwo-fa8e0-default-rtdb.firebaseio.com'
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Get database reference
const db = admin.database();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get notes
app.get('/api/notes', async (req, res) => {
  try {
    const snapshot = await db.ref('notes').once('value');
    const data = snapshot.val();
    
    res.json({
      success: true,
      data: data || { content: '', lastUpdated: null }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
});

// Update notes
app.put('/api/notes', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Content must be a string'
      });
    }

    const noteData = {
      content,
      lastUpdated: Date.now()
    };

    await db.ref('notes').set(noteData);
    
    res.json({
      success: true,
      data: noteData
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notes'
    });
  }
});

// Test endpoint to verify Firebase connection
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing Firebase connection...');
    
    const testData = {
      message: 'Backend Firebase connection test',
      timestamp: Date.now()
    };
    
    console.log('Writing test data to Firebase...');
    await db.ref('test').set(testData);
    
    console.log('Reading test data from Firebase...');
    const snapshot = await db.ref('test').once('value');
    
    console.log('Firebase test successful');
    res.json({
      success: true,
      message: 'Firebase connection working',
      data: snapshot.val()
    });
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Firebase connection failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});