// server/models/Software.js
const mongoose = require('mongoose');

const softwareSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Development', 'Office', 'Design', 'Utilities', 'Security'], 
    default: 'Utilities' 
  },
  version: { type: String, default: '1.0.0' },
  os: { type: String, default: 'Windows 64-bit' },
  fileSize: { type: String, default: 'N/A' },
  driveUrl: { type: String, required: true },
  directDownloadUrl: { type: String },
  iconUrl: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3281/3281307.png' },
  instructions: { type: String, default: 'Run setup and follow default prompts.' },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

// Google Drive link ko automatic Direct Download link mein convert karne ka helper
softwareSchema.pre('save', function (next) {
  if (this.driveUrl) {
    const match = this.driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      this.directDownloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    } else {
      this.directDownloadUrl = this.driveUrl;
    }
  }
  next();
});

module.exports = mongoose.model('Software', softwareSchema);