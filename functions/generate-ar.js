const serverless = require('serverless-http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
fs.ensureDirSync(uploadsDir);

app.post('/generate-ar', upload.fields([
  { name: 'targetImage', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const targetImage = req.files['targetImage'][0];
    const outputFile = req.files['outputFile'] ? req.files['outputFile'][0] : null;
    const { outputType, youtubeLink } = req.body;

    const arExperienceId = uuidv4();
    const arExperienceDir = path.join(uploadsDir, arExperienceId);
    await fs.ensureDir(arExperienceDir);

    // Move uploaded files to the AR experience directory
    await fs.move(targetImage.path, path.join(arExperienceDir, 'target.jpg'));
    
    let outputContent;
    if (outputType === 'youtube') {
      outputContent = youtubeLink;
    } else if (outputFile) {
      const outputPath = path.join(arExperienceDir, outputFile.originalname);
      await fs.move(outputFile.path, outputPath);
      outputContent = `/uploads/${arExperienceId}/${outputFile.originalname}`;
    }

    // Create AR experience data
    const arExperienceData = {
      id: arExperienceId,
      targetImage: `/uploads/${arExperienceId}/target.jpg`,
      outputType,
      outputContent
    };

    // Save AR experience data
    await fs.writeJson(path.join(arExperienceDir, 'ar-data.json'), arExperienceData);

    // Generate QR code
    const arExperienceUrl = `https://webarv0.netlify.app/ar-view/${arExperienceId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(arExperienceUrl);

    res.json({
      success: true,
      arExperienceUrl,
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error generating AR experience:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AR experience' });
  }
});

module.exports.handler = serverless(app);