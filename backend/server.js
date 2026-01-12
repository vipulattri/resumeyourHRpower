const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to properly encode MongoDB connection string password
function encodeMongoPassword(uri) {
  if (!uri.includes('@') || (!uri.includes('mongodb://') && !uri.includes('mongodb+srv://'))) {
    return uri;
  }

  try {
    const atSignCount = (uri.match(/@/g) || []).length;
    
    if (atSignCount > 1) {
      const protocolMatch = uri.match(/^(mongodb\+?srv?:\/\/)/);
      if (!protocolMatch) return uri;
      
      const protocol = protocolMatch[1];
      const afterProtocol = uri.substring(protocol.length);
      const lastAtIndex = afterProtocol.lastIndexOf('@');
      
      if (lastAtIndex === -1) return uri;
      
      const credentials = afterProtocol.substring(0, lastAtIndex);
      const hostAndPath = afterProtocol.substring(lastAtIndex + 1);
      const colonIndex = credentials.indexOf(':');
      
      if (colonIndex === -1) return uri;
      
      const username = credentials.substring(0, colonIndex);
      const password = credentials.substring(colonIndex + 1);
      
      if (!password.includes('%')) {
        const encodedPassword = encodeURIComponent(password);
        return `${protocol}${username}:${encodedPassword}@${hostAndPath}`;
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not parse MongoDB connection string:', e.message);
  }
  
  return uri;
}

// MongoDB Connection
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_extractor';

// Try to fix common connection string issues
MONGODB_URI = encodeMongoPassword(MONGODB_URI);

console.log('🔄 Attempting to connect to MongoDB...');
const maskedURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log(`   URI: ${maskedURI}`);

mongoose.set('bufferCommands', false);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
})
.then(() => {
  console.log('✅ MongoDB Connected successfully');
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  mongoose.set('bufferCommands', true);
})
.catch(err => {
  console.error('\n❌ MongoDB connection FAILED!');
  console.error(`   Error: ${err.message}`);
  console.error(`   Error Name: ${err.name}`);
  
  if (err.name === 'MongoAPIError' && err.message.includes('URI must include hostname')) {
    console.error('\n   This error means your MongoDB connection string is malformed.');
    console.error('   Common issues:');
    console.error('   - Password contains special characters that need URL encoding');
    console.error('   - Multiple @ signs in the connection string');
    console.error('   - Invalid connection string format');
    console.error('\n   Fix:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Encode special characters in password:');
    console.error('      - @ becomes %40');
    console.error('      - : becomes %3A');
    console.error('      - / becomes %2F');
    console.error('   3. Example: If password is "pass@123", use "pass%40123"');
  }
  
  console.error('\n   Server will start but database operations will fail until MongoDB is connected.\n');
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  mongoose.set('bufferCommands', false);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  mongoose.set('bufferCommands', true);
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

// Import routes and services
const emailRoutes = require('./routes/emailRoutes');
const emailService = require('./services/emailService');

// Routes
app.use('/api/resumes', emailRoutes); // Using same endpoint for compatibility
app.use('/api/emails', emailRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to email service
app.set('io', io);

// Start email monitoring
emailService.startMonitoring(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use!`);
    console.error(`Another server instance is already running on port ${PORT}.`);
    console.error(`\nTo fix this:`);
    console.error(`1. Find the process using: netstat -ano | findstr :${PORT}`);
    console.error(`2. Kill it using: taskkill /PID <process_id> /F`);
    console.error(`3. Or use a different port by setting PORT in .env file\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
