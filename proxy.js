const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg'; // Replace with real token

app.post('/proxy-transcribe', upload.single('file'), async (req, res) => {
  try {
    const fileStream = fs.createReadStream(req.file.path);

    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/transcript/transcript_audio/',
      {
        file: fileStream,
      },
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy running on http://localhost:3000');
});