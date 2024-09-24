const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const arExperienceSchema = new mongoose.Schema({
  id: String,
  targetImage: String,
  outputType: String,
  output: String,
});

const ARExperience = mongoose.model('ARExperience', arExperienceSchema);

app.post('/api/ar-experiences', async (req, res) => {
  try {
    const arExperience = new ARExperience(req.body);
    await arExperience.save();
    res.status(201).json({ id: arExperience.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/ar-experiences/:id', async (req, res) => {
  try {
    const arExperience = await ARExperience.findOne({ id: req.params.id });
    if (arExperience) {
      res.json(arExperience);
    } else {
      res.status(404).json({ error: 'AR experience not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const handler = serverless(app);
exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};