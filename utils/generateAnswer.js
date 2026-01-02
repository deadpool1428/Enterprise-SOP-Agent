const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function generateAnswer(context, question) {
  const prompt = `
You are an enterprise SOP assistant.

Rules:
- Answer ONLY from the SOP content
- Do NOT add assumptions
- If the answer is not present, reply exactly:
  "I don't know based on the provided SOP."

SOP Content:
${context}

Question:
${question}

Answer in a clear paragraph.
`;

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3",
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error("Generation API failed");
  }

  const data = await response.json();
  return data.response.trim();
}

module.exports = { generateAnswer };
