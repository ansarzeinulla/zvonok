const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg';

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

app.post('/proxy-translate', upload.single('file'), async (req, res) => {
  try {
    const originalPath = path.join(__dirname, req.file.path);

    const audioBuffer = fs.readFileSync(originalPath);
    const hexAudio = bufferToHex(audioBuffer);

    // ✅ JSON тело запроса
    const payload = {
      target_language: "kaz",         // 🎯 Измени язык при необходимости
      audio: hexAudio
    };

    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/translate/audio/?output_format=text',
      payload,
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    fs.unlinkSync(originalPath); // 🧹 Удалить temp файл
    res.json(response.data);
  } catch (err) {
    console.error("❌ Proxy Error:", err.message);
    if (err.response) {
      console.error("❌ Response body:", err.response.data);
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Translate proxy running on http://localhost:${PORT}`);
});