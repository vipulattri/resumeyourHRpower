const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  fromName: {
    type: String
  },
  subject: {
    type: String,
    default: 'No Subject'
  },
  body: {
    type: String,
    required: true
  },
  receivedAt: {
    type: Date,
    required: true
  },
  emailId: {
    type: String,
    unique: true  // To avoid duplicate emails
  },
  // PDF attachment data (if PDF is attached)
  hasAttachment: {
    type: Boolean,
    default: false
  },
  attachmentData: {
    name: String,
    email: String,
    contactNumber: String,
    dateOfBirth: String,
    experience: String,
    role: String,
    pdfPath: String,
    rawText: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Email', emailSchema);
