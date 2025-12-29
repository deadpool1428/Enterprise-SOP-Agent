const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const pdfParse = require("pdf-parse");


require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);





const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

mongoose.connect("MONGO_URL")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const ChunkSchema = new mongoose.Schema({
  text: String,
   embedding: [Number], // WILL BE FILLED NEXT
  source: String,
  page: Number
});

const Chunk = mongoose.model("Chunk", ChunkSchema);
//Embedding
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  });

  const result = await model.embedContent(text);
  return result.embedding.values;
}


function chunkText(text, chunkSize = 1000, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }

  return chunks;
}


//pdf parsing route
app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const data = await pdfParse(req.file.buffer);
    const chunks = chunkText(data.text);

    // 3. Prepare documents
    const documents = chunks.map(chunk => ({
      text: chunk,
      source: req.file.originalname,
      page: null // pdf-parse does not give page numbers
    }));

    // 4. Save chunks
    await Chunk.insertMany(documents);

    res.json({
      message: "PDF processed successfully",
      chunksStored: documents.length
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});
//embedding route
app.post("/generate-embeddings", async (req, res) => {
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
      const embedding = await generateEmbedding(chunk.text);
      chunk.embedding = embedding;
      await chunk.save();
      updated++;
    }

    res.json({
      message: "Embeddings generated successfully",
      chunksUpdated: updated
    });

  } catch (err) {
    console.error("Embedding Error:", err);
    res.status(500).json({ error: "Embedding generation failed" });
  }
});
//user querying route
app.post("/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1. Generate embedding for user query
    const queryEmbedding = await generateEmbedding(question);

    // 2. Vector search in MongoDB
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // 👈 EXACT name from Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          _id: 0,
          text: 1,
          source: 1,
          page: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.json({
      question,
      matches: results
    });

  } catch (err) {
    console.error("Query Error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});





   
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
