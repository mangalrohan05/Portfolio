const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Multer config for resume upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname);
  },
  filename: (req, file, cb) => {
    cb(null, 'resume.pdf');
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Endpoint to get data
app.get('/api/data', (req, res) => {
  fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read data.json' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to save data
app.post('/api/save', (req, res) => {
  const updatedData = req.body;
  
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: 'Invalid data payload' });
  }

  // Write file
  fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to write to data.json' });
    }
    res.json({ success: true, message: 'Data saved successfully' });
  });
});

// Endpoint to upload resume
app.post('/api/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or file type is invalid' });
  }
  res.json({ 
    success: true, 
    url: './resume.pdf', 
    name: req.file.originalname 
  });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Portfolio Admin Server running locally at:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`==================================================`);
});
