// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Software = require('./models/Software');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API ROUTES ---

// 1. Get all softwares (Search & Filter support)
app.get('/api/software', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search,$options: 'i' };
    }

    const softwares = await Software.find(query).sort({ createdAt: -1 });
    res.json(softwares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add new software
app.post('/api/software', async (req, res) => {
  try {
    const newSoftware = new Software(req.body);
    const saved = await newSoftware.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Track download count
app.post('/api/software/:id/download', async (req, res) => {
  try {
    await Software.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    res.json({ message: 'Count updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete software
app.delete('/api/software/:id', async (req, res) => {
  try {
    await Software.findByIdAndDelete(req.params.id);
    res.json({ message: 'Software deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));