const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // для парсинга JSON

const YOUR_API_KEY = 'TezIz5eXyJsMz7LvcXU_eg';

app.post('/proxy-translate', async (req, res) => {
  try {
    const { audio, target_language } = req.body;

    if (!audio || !target_language) {
      return res.status(400).json({ error: "Missing 'audio' or 'target_language'" });
    }

    const response = await axios.post(
      'https://mangisoz.nu.edu.kz/external-api/v1/translate/audio/?output_format=text',
      {
        audio,
        target_language
      },
      {
        headers: {
          Authorization: `Bearer ${YOUR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({ text: response.data.text });
  } catch (err) {
    console.error("❌ Proxy Error:", err.message);
    if (err.response) {
      console.error("❌ Response body:", err.response.data);
      return res.status(err.response.status).json(err.response.data);
    } else {
      return res.status(500).json({ error: err.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy listening at http://localhost:${PORT}`);
});