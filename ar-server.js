const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/generate-ar', upload.fields([
  { name: 'targetImage', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]), (req, res) => {
  const targetImage = req.files['targetImage'][0];
  const outputFile = req.files['outputFile'] ? req.files['outputFile'][0] : null;
  const outputType = req.body.outputType;
  const youtubeLink = req.body.youtubeLink;

  const uniqueId = uuidv4();
  const arExperienceDir = path.join(__dirname, 'public', 'ar-experiences', uniqueId);
  fs.mkdirSync(arExperienceDir, { recursive: true });

  fs.renameSync(targetImage.path, path.join(arExperienceDir, 'target.jpg'));
  
  let outputPath;
  if (outputFile) {
    outputPath = path.join(arExperienceDir, outputFile.originalname);
    fs.renameSync(outputFile.path, outputPath);
  }

  const arData = {
    targetImage: `/ar-experiences/${uniqueId}/target.jpg`,
    outputType: outputType,
    outputFile: outputFile ? `/ar-experiences/${uniqueId}/${outputFile.originalname}` : null,
    youtubeLink: youtubeLink
  };

  fs.writeFileSync(path.join(arExperienceDir, 'ar-data.json'), JSON.stringify(arData));

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://webarv0.netlify.app/ar-view/${uniqueId}`)}`;
  const uniqueUrl = `https://webarv0.netlify.app/ar-view/${uniqueId}`;

  res.json({
    success: true,
    qrCodeUrl: qrCodeUrl,
    uniqueUrl: uniqueUrl,
    arExperienceId: uniqueId
  });
});

app.get('/ar-view/:id', (req, res) => {
  const arExperienceId = req.params.id;
  const arDataPath = path.join(__dirname, 'public', 'ar-experiences', arExperienceId, 'ar-data.json');
  
  if (fs.existsSync(arDataPath)) {
    const arData = JSON.parse(fs.readFileSync(arDataPath, 'utf-8'));
    res.sendFile(path.join(__dirname, 'public', 'ar-view.html'));
  } else {
    res.status(404).send('AR experience not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});