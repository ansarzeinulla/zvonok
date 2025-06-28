// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors")({ origin: true });
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const path = require("path");

admin.initializeApp();

const upload = multer({ storage: multer.memoryStorage() });

exports.transcribeAudio = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    upload.single("file")(req, res, async err => {
      if (err || !req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const tempFilePath = path.join(os.tmpdir(), req.file.originalname);
      fs.writeFileSync(tempFilePath, req.file.buffer);

      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(tempFilePath), req.file.originalname);

        const response = await axios.post(
          "https://mangisoz.nu.edu.kz/external-api/v1/transcript/transcript_audio/",
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer TezIz5eXyJsMz7LvcXU_eg`,
            },
          }
        );

        fs.unlinkSync(tempFilePath);
        return res.status(200).json(response.data);
      } catch (error) {
        console.error("Transcription error:", error.response?.data || error.message);
        return res.status(500).json({ error: error.response?.data || error.message });
      }
    });
  });
});