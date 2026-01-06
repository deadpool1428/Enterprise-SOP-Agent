const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Chunk = require("../models/chunk");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Multer config
const upload = multer({ storage: multer.memoryStorage() });

function chunkText(text, chunkSize = 600, overlap = 80) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }

  return chunks;
}

// ✅ FIXED ROUTE (multer added)
router.post(
  "/upload-pdf",
  requireAdmin,
  upload.single("pdf"), // 🔴 THIS LINE WAS MISSING
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file received" });
      }

      console.log("📄 PDF received:", req.file.originalname);

      const data = await pdfParse(req.file.buffer);
      const chunks = chunkText(data.text);

      const documents = chunks.map(chunk => ({
        text: chunk,
        source: req.file.originalname,
        page: null
      }));

      await Chunk.insertMany(documents);

      res.json({
        message: "PDF processed successfully",
        chunksStored: documents.length
      });
    } catch (err) {
      console.error("PDF ERROR:", err);
      res.status(500).json({ error: "PDF processing failed" });
    }
  }
);

module.exports = router;
