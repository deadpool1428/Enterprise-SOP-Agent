const express = require("express");
const Chunk = require("../models/chunk");
const { generateEmbedding } = require("../utils/embedding");

const router = express.Router();

router.post("/generate-embeddings", async (req, res) => {
  try {
    const chunks = await Chunk.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    });

    if (chunks.length === 0) {
      return res.json({ message: "No chunks found without embeddings" });
    }

    let updated = 0;

    for (const chunk of chunks) {
      chunk.embedding = await generateEmbedding(chunk.text);
      await chunk.save();
      updated++;
    }

    res.json({
      message: "Embeddings generated successfully",
      chunksUpdated: updated
    });
  } catch (err) {
    console.error("FULL EMBEDDING ERROR ↓↓↓");
  console.error(err);
  res.status(500).json({ error: err.message });
  }
});

module.exports = router;
