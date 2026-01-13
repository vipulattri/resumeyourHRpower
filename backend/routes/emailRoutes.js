const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const { extractResumeData } = require('../services/pdfParser');
const Email = require('../models/Resume'); // Model is renamed to Email but file is still Resume.js

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Helper to get io instance
const getIO = (req) => {
  return req.app.get('io');
};

// Get all emails
router.get('/', async (req, res) => {
  try {
    const emails = await Email.find().sort({ receivedAt: -1, createdAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get email count (must be before /:id route)
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Email.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify route registration
router.get('/test-upload-route', (req, res) => {
  res.json({ message: 'Upload route is registered!', path: '/api/resumes/upload', method: 'POST' });
});

// Test endpoint to verify download route registration
router.get('/test-download-route', (req, res) => {
  res.json({ message: 'Download route is registered!', path: '/api/resumes/download/:id', method: 'GET' });
});

// Helper to process a single uploaded file
async function processUploadedResume(file, req) {
  console.log(`📥 Resume file uploaded: ${file.filename}`);
  console.log(`   Original name: ${file.originalname}`);
  console.log(`   Size: ${file.size} bytes`);

  // Read and parse PDF
  const pdfBuffer = await fs.readFile(file.path);
  console.log('📄 Parsing PDF...');
  
  const pdfData = await pdfParse(pdfBuffer);
  const pdfText = pdfData.text;

  if (!pdfText || pdfText.length === 0) {
    await fs.remove(file.path);
    throw new Error('PDF file appears to be empty or could not be parsed');
  }

  // Extract resume data
  const extractedData = extractResumeData(pdfText);
  
  console.log('✓ Extracted data:', {
    name: extractedData.name,
    email: extractedData.email,
    contactNumber: extractedData.contactNumber,
    role: extractedData.role
  });

  // Check MongoDB connection before saving
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ MongoDB not connected');
    await fs.remove(file.path);
    throw new Error('Database connection unavailable. Please try again later.');
  }

  // Create email/resume record
  const resumeData = {
    from: extractedData.email || 'upload@youhrpower.com',
    fromName: extractedData.name || 'Resume Upload',
    subject: `Resume Upload: ${extractedData.name || 'Unknown'} - ${extractedData.role || 'No Role'}`,
    body: `Resume uploaded directly via shareable link.\n\nFile: ${file.originalname}\n\nExtracted Information:\n${JSON.stringify(extractedData, null, 2)}`,
    receivedAt: new Date(),
    emailId: `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    hasAttachment: true,
    attachmentData: {
      ...extractedData,
      pdfPath: file.path,
      rawText: pdfText.substring(0, 5000) // Store first 5000 chars
    }
  };

  // Save to database
  const savedResume = await Email.create(resumeData);
  console.log(`✅ Resume saved to database: ${savedResume._id}`);

  // Emit socket event for real-time update
  const io = req.app.get('io');
  if (io) {
    io.emit('newEmail', {
      message: 'New resume uploaded!',
      email: savedResume
    });
  }

  return savedResume;
}

// Upload multiple resume files (must be before /:id route)
router.post('/upload', (req, res, next) => {
  upload.array('resumes', 10)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 10MB per file.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded. Please select at least one PDF file.' });
    }

    const results = [];
    for (const file of req.files) {
      try {
        const saved = await processUploadedResume(file, req);
        results.push({ file: file.originalname, status: 'success', resume: saved });
      } catch (e) {
        console.error(`❌ Error processing ${file.originalname}:`, e.message);
        results.push({ file: file.originalname, status: 'error', error: e.message });
      }
    }

    res.json({
      message: 'Upload processed',
      results
    });

  } catch (error) {
    console.error('❌ Error processing uploaded resumes:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process resume upload' 
    });
  }
});

// Download PDF route (must be before /:id route)
router.get('/download/:id', async (req, res) => {
  try {
    console.log(`📥 Download request received for ID: ${req.params.id}`);
    console.log(`📥 Full URL: ${req.originalUrl}`);
    console.log(`📥 Method: ${req.method}`);
    
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(503).json({ error: 'Database not connected', message: 'MongoDB connection is not established.' });
    }

    const email = await Email.findById(req.params.id);
    if (!email) {
      console.error(`❌ Resume not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!email.attachmentData || !email.attachmentData.pdfPath) {
      console.error(`❌ PDF path not found for resume: ${req.params.id}`);
      return res.status(404).json({ error: 'PDF file not found for this resume' });
    }

    let pdfPath = email.attachmentData.pdfPath;
    console.log(`📄 PDF path from DB: ${pdfPath}`);

    // Resolve to absolute path if relative
    if (!path.isAbsolute(pdfPath)) {
      pdfPath = path.resolve(__dirname, '..', pdfPath);
      console.log(`📄 Resolved absolute path: ${pdfPath}`);
    }

    // Check if file exists
    const fileExists = await fs.pathExists(pdfPath);
    if (!fileExists) {
      console.error(`❌ PDF file not found at path: ${pdfPath}`);
      // Try alternative path in uploads directory
      const filename = path.basename(pdfPath);
      const altPath = path.join(__dirname, '../uploads', filename);
      console.log(`🔄 Trying alternative path: ${altPath}`);
      
      if (await fs.pathExists(altPath)) {
        pdfPath = altPath;
        console.log(`✅ Found file at alternative path: ${altPath}`);
      } else {
        return res.status(404).json({ error: 'PDF file not found on server' });
      }
    }

    // Get the original filename or generate one
    const originalName = email.attachmentData.name || email.fromName || 'resume';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${sanitizedName}_resume.pdf`;

    console.log(`📤 Sending file: ${pdfPath} as ${filename}`);

    // Use res.sendFile with absolute path
    res.sendFile(pdfPath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    }, (err) => {
      if (err) {
        console.error('❌ Error sending PDF file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading PDF file: ' + err.message });
        }
      } else {
        console.log(`✅ PDF sent successfully: ${filename}`);
      }
    });

  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    console.error('Stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to download PDF' });
    }
  }
});

// Get a single email by ID (must be after specific routes like /download/:id)
router.get('/:id', async (req, res) => {
  // Don't match if this is a download request (should be caught by /download/:id)
  if (req.path.includes('/download')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an email
router.delete('/:id', async (req, res) => {
  try {
    const email = await Email.findByIdAndDelete(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add resume from URL
router.post('/add-from-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let pdfUrl;
    try {
      pdfUrl = new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL points to a PDF
    if (!pdfUrl.pathname.toLowerCase().endsWith('.pdf') && !url.toLowerCase().includes('.pdf')) {
      return res.status(400).json({ error: 'URL must point to a PDF file' });
    }

    // Import required modules
    const https = require('https');
    const http = require('http');
    const fs = require('fs-extra');
    const path = require('path');
    const pdfParse = require('pdf-parse');
    const { extractResumeData } = require('../services/pdfParser');

    // Download PDF from URL
    console.log(`📥 Downloading PDF from URL: ${url}`);
    const protocol = pdfUrl.protocol === 'https:' ? https : http;
    
    const pdfBuffer = await new Promise((resolve, reject) => {
      const request = protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download PDF: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });

      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });

    console.log(`✓ PDF downloaded, size: ${pdfBuffer.length} bytes`);

    // Parse PDF
    console.log('📄 Parsing PDF...');
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    // Extract resume data
    console.log('🔍 Extracting resume data...');
    const extractedData = extractResumeData(pdfText);

    // Save PDF file locally
    const uploadsDir = path.join(__dirname, '../uploads');
    await fs.ensureDir(uploadsDir);
    const timestamp = Date.now();
    const filename = `${timestamp}_resume_from_url.pdf`;
    const pdfPath = path.join(uploadsDir, filename);
    await fs.writeFile(pdfPath, pdfBuffer);

    console.log(`✓ PDF saved to: ${pdfPath}`);

    // Create email/resume record
    const resumeData = {
      from: extractedData.email || 'resume@url.com',
      fromName: extractedData.name || 'Resume from URL',
      subject: `Resume: ${extractedData.name || 'Unknown'} - ${extractedData.role || 'No Role'}`,
      body: `Resume added from URL: ${url}\n\nExtracted Information:\n${JSON.stringify(extractedData, null, 2)}`,
      receivedAt: new Date(),
      emailId: `url_${timestamp}`,
      hasAttachment: true,
      attachmentData: {
        ...extractedData,
        pdfPath: pdfPath,
        rawText: pdfText.substring(0, 5000) // Store first 5000 chars
      }
    };

    // Check if resume already exists
    const existingResume = await Email.findOne({ emailId: resumeData.emailId });
    if (existingResume) {
      return res.status(400).json({ error: 'This resume has already been added' });
    }

    // Save to database
    const savedResume = await Email.create(resumeData);
    console.log(`✅ Resume saved to database: ${savedResume._id}`);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('newEmail', {
        message: 'New resume added from URL!',
        email: savedResume
      });
      console.log('✓ Real-time notification sent to frontend');
    }

    res.json({
      message: 'Resume added successfully',
      resume: savedResume
    });

  } catch (error) {
    console.error('❌ Error adding resume from URL:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume from URL' });
  }
});

module.exports = router;
