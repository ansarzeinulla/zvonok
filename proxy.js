const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors()); // ✅ Разрешаем CORS для всех доменов

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg'; // ✅ Твой реальный API-ключ

app.post('/proxy-transcribe', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    const filePath = path.join(__dirname, req.file.path);

    form.append('file', fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/transcript/transcript_audio/',
      form,
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    fs.unlink(filePath, () => {}); // ✅ Удаляем временный файл после использования

    res.json(response.data);
  } catch (err) {
    console.error('❌ Proxy Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on http://localhost:${PORT}`);
});