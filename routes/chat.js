const express = require("express");
const Chunk = require("../models/chunk");
const { generateEmbedding } = require("../utils/embedding");
const { generateAnswer } = require("../utils/generateAnswer");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const question = req.body?.question?.trim();
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1️⃣ Generate query embedding
    const queryEmbedding = await generateEmbedding(question);

    // 2️⃣ Vector search (tight + fast)
    const chunks = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 20,
          limit: 4
        }
      },
      {
        $project: {
          text: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    // 3️⃣ Relevance filter
    const relevant = chunks.filter(c => c.score >= 0.6);

    if (relevant.length === 0) {
      return res.json({
        answer: "I don't know based on the provided SOP."
      });
    }

    // 4️⃣ Controlled context (KEY for latency)
    const context = relevant
      .slice(0, 2)              // only top 2 chunks
      .map(c => c.text)
      .join("\n\n")
      .slice(0, 1000);          // hard cap context

    // 5️⃣ Generate final answer (once)
    const answer = await generateAnswer(context, question);

    // 6️⃣ Clean JSON response
    return res.json({
      answer
    });

  } catch (err) {
    console.error("Chat error:", err.message);
    return res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
