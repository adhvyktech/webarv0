const serverless = require('serverless-http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/generate-ar', upload.fields([
  { name: 'targetImage', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async (req, res) => {
  try {
    // Your AR generation logic here
    // ...

    res.json({
      success: true,
      // Other response data
    });
  } catch (error) {
    console.error('Error generating AR experience:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AR experience' });
  }
});

module.exports.handler = serverless(app);