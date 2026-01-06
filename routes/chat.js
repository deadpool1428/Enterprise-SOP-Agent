const express = require("express");
const Chunk = require("../models/chunk");
const { generateEmbedding } = require("../utils/embedding");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /chat
 * Protected (logged-in users only)
 */
router.post("/", requireLogin, async (req, res) => {
  try {
    const question = req.body?.question?.trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1️⃣ Generate embedding for question
    const queryEmbedding = await generateEmbedding(question);

    // 2️⃣ Vector search in MongoDB
    const chunks = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 30,
          limit: 5
        }
      }
    ]);

    // 3️⃣ If nothing relevant → refuse
    if (!chunks || chunks.length === 0) {
      return res.json({
        answer: "I don't know based on the provided SOP.",
        sources: []
      });
    }

    // 4️⃣ Build context (IMPORTANT: do NOT truncate)
    const context = chunks
      .map(c => c.text)
      .join("\n\n")
      .slice(0, 4000); // hard cap for latency control

    // 5️⃣ Strong RAG prompt
    const prompt = `
You are an enterprise SOP assistant.

RULES:
- Answer ONLY from the SOP text below.
- If the answer is not explicitly present, say:
  "I don't know based on the provided SOP."
- Answer in a clear paragraph.
- Do NOT add external knowledge.

SOP CONTENT:
${context}

QUESTION:
${question}

ANSWER:
`;

    // 6️⃣ Call Ollama (FIXED: IPv4 + timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 sec

    let ollamaJson;

    if (context.length < 300) {
  return res.json({
    answer: context.trim(),
    sources: chunks.map(c => c.source)
  });
}
    console.log("🟡 Calling Ollama...");


    try {
      const ollamaRes = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: "phi3",
            prompt,
            stream: false,
            options: {
              mperature: 0.1,
             num_predict: 120 
            }
          })
        }
      );

      clearTimeout(timeout);

      if (!ollamaRes.ok) {
        throw new Error("Ollama HTTP error");
      }

      ollamaJson = await ollamaRes.json();

    } catch (err) {
      console.error("❌ Ollama error:", err.message);
      return res.json({
        answer: "LLM service unavailable. Please try again.",
        sources: []
      });
    }

    // 7️⃣ Final response
    return res.json({
      answer: ollamaJson.response?.trim(),
      sources: chunks.map(c => c.source)
    });

  } catch (err) {
    console.error("❌ Chat failed:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
