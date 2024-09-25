const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Netlify's deploy directory for persistent storage
const DEPLOY_DIR = process.env.DEPLOY_DIR || '.';
const AR_EXPERIENCES_DIR = path.join(DEPLOY_DIR, 'ar-experiences');

app.post('/generate-ar', upload.fields([
  { name: 'targetImage', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const targetImage = req.files['targetImage'][0];
    const outputFile = req.files['outputFile'] ? req.files['outputFile'][0] : null;
    const outputType = req.body.outputType;
    const youtubeLink = req.body.youtubeLink;

    const uniqueId = uuidv4();
    const arExperienceDir = path.join(AR_EXPERIENCES_DIR, uniqueId);
    await fs.ensureDir(arExperienceDir);

    await fs.move(targetImage.path, path.join(arExperienceDir, 'target.jpg'));
    
    let outputPath;
    if (outputFile) {
      outputPath = path.join(arExperienceDir, outputFile.originalname);
      await fs.move(outputFile.path, outputPath);
    }

    const arData = {
      targetImage: `/ar-experiences/${uniqueId}/target.jpg`,
      outputType: outputType,
      outputFile: outputFile ? `/ar-experiences/${uniqueId}/${outputFile.originalname}` : null,
      youtubeLink: youtubeLink
    };

    await fs.writeJson(path.join(arExperienceDir, 'ar-data.json'), arData);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://webarv0.netlify.app/ar-view/${uniqueId}`)}`;
    const uniqueUrl = `https://webarv0.netlify.app/ar-view/${uniqueId}`;

    res.json({
      success: true,
      qrCodeUrl: qrCodeUrl,
      uniqueUrl: uniqueUrl,
      arExperienceId: uniqueId
    });
  } catch (error) {
    console.error('Error generating AR experience:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AR experience' });
  }
});

app.get('/ar-experiences/:id/*', async (req, res) => {
  try {
    const filePath = path.join(AR_EXPERIENCES_DIR, req.params.id, req.params[0]);
    if (await fs.pathExists(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error serving AR file:', error);
    res.status(500).send('Error serving AR file');
  }
});

app.get('/ar-view/:id', async (req, res) => {
  try {
    const arExperienceId = req.params.id;
    const arDataPath = path.join(AR_EXPERIENCES_DIR, arExperienceId, 'ar-data.json');
    
    if (await fs.pathExists(arDataPath)) {
      res.sendFile(path.join(__dirname, 'public', 'ar-view.html'));
    } else {
      res.status(404).send('AR experience not found');
    }
  } catch (error) {
    console.error('Error serving AR view:', error);
    res.status(500).send('Error serving AR view');
  }
});

module.exports.handler = serverless(app);