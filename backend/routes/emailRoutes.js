const express = require('express');
const router = express.Router();
const Email = require('../models/Resume'); // Model is renamed to Email but file is still Resume.js

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

// Get a single email by ID
router.get('/:id', async (req, res) => {
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

// Get email count
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Email.countDocuments();
    res.json({ count });
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
