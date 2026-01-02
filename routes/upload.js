const express=require("express")
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Chunk =require("../models/chunk");

const router=express.Router();
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
//pdf-parse
router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
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

module.exports=router;