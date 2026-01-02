const mongoose=require("mongoose")

const ChunkSchema = new mongoose.Schema({
  text: String,
   embedding: [Number], // WILL BE FILLED NEXT
  source: String,
  page: Number
});

module.exports = mongoose.models.Chunk || mongoose.model("Chunk", ChunkSchema);