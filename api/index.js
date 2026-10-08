const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Serverless Connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
  } catch (err) {
    console.error('MongoDB Error:', err);
  }
};

// Software Model Schema
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
  instructions: { type: String, default: 'Run setup and follow default prompts.' },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

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

const Software = mongoose.models.Software || mongoose.model('Software', softwareSchema);

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.get('/api/software', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.title = { $regex: search,$options: 'i' };

    const softwares = await Software.find(query).sort({ createdAt: -1 });
    res.json(softwares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/software', async (req, res) => {
  try {
    const newSoftware = new Software(req.body);
    const saved = await newSoftware.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/software/:id/download', async (req, res) => {
  try {
    await Software.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    res.json({ message: 'Count updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/software/:id', async (req, res) => {
  try {
    await Software.findByIdAndDelete(req.params.id);
    res.json({ message: 'Software deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;