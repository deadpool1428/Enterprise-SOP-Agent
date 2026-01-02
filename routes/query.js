const express=require("express")
const Chunk=require("../models/chunk")
const {generateEmbedding}=require("../utils/embedding");

const router=express.Router();


router.post("/query", async (req, res) => {

      const queryEmbedding = await generateEmbedding(req.body.question);

  const results = await Chunk.aggregate([
      {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 2
      }
    },
    {
      $project: {
        text: 1,
        source: 1,
        page: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);

  res.json(results);
});

module.exports = router;

