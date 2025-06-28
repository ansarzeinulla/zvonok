const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // <-- важно!

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg';

app.post('/proxy-translate', async (req, res) => {
  try {
    const { target_language, audio } = req.body;

    if (!target_language || !audio) {
      return res.status(400).json({ error: 'Missing target_language or audio' });
    }

    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/translate/audio/?output_format=text',
      {
        target_language,
        audio,
      },
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

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