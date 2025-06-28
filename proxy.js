const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg'; // ✅ API-ключ

app.post('/proxy-translate', upload.single('file'), async (req, res) => {
  try {
    const originalPath = path.join(__dirname, req.file.path);
    const wavPath = `${originalPath}.wav`;

    // 🔄 Конвертация в WAV 16kHz mono
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${originalPath}" -ar 16000 -ac 1 -f wav "${wavPath}"`,
        (err, stdout, stderr) => {
          if (err) {
            console.error('❌ FFMPEG error:', stderr);
            return reject(new Error('FFMPEG failed'));
          }
          resolve();
        }
      );
    });

    // 🔁 Читаем WAV и кодируем в base16
    const buffer = fs.readFileSync(wavPath);
    const hexAudio = buffer.toString('hex');

    // 📨 Отправка запроса на API перевода
    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/translate/audio/?output_format=text',
      {
        target_language: 'kaz',
        audio: hexAudio,
      },
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 🧹 Очистка временных файлов
    fs.unlinkSync(originalPath);
    fs.unlinkSync(wavPath);

    res.json(response.data);
  } catch (err) {
    console.error('❌ Proxy Error:', err.message);
    if (err.response) {
      console.error('❌ Response body:', err.response.data);
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on http://localhost:${PORT}`);
});