const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const uploadRoute = require("./routes/upload");
const embeddingRoute = require("./routes/ge");
const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.static("sop-ui"));

app.use(
  session({
    secret: "sop-secret",
    resave: false,
    saveUninitialized: false
  })
);

// =====================
// DATABASE
// =====================
mongoose
  .connect("Your Mongo URL")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

// =====================
// ROUTES (FINAL, FIXED)
// =====================

// Auth
app.use("/auth", authRoute);

// Admin-only routes
app.use("/admin", uploadRoute);
app.use("/admin", embeddingRoute);

// User chat
app.use("/chat", chatRoute);
const fetch = global.fetch;

(async () => {
  try {
    await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt: "warm up",
        stream: false
      })
    });
    console.log("🔥 Ollama warmed up");
  } catch {
    console.log("⚠️ Ollama warm-up skipped");
  }
})();

// Health check
app.get("/", (req, res) => {
  res.send("API running");
});

// =====================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});


