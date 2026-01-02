const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function generateEmbedding(text) {
  const response = await fetch("http://127.0.0.1:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text
    })
  });

  if (!response.ok) {
    throw new Error("Embedding API call failed");
  }

  const data = await response.json();

  if (!Array.isArray(data.embedding)) {
    throw new Error("Invalid embedding response");
  }

  return data.embedding; // ✅ 1024 dimensions
}

module.exports = { generateEmbedding };
