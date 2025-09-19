import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Debug: check if env vars are loaded
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("GROQ_MODEL:", process.env.GROQ_MODEL ? process.env.GROQ_MODEL : "Missing ❌");
console.log("GROQ_ENDPOINT:", process.env.GROQ_ENDPOINT ? process.env.GROQ_ENDPOINT : "Missing ❌");

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.json({ reply: "⚠ No message provided." });

  try {
    const response = await fetch(process.env.GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant for Ayurvedic herbs." },
          { role: "user", content: message }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Groq API error:", text);
      return res.json({ reply: "⚠ Error from Groq API." });
    }

    const data = await response.json();

    // Adjusted to match OpenAI-style Groq response
    const reply =
      data.choices?.[0]?.message?.content?.trim() || "⚠ No reply from Groq API.";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.json({ reply: "⚠ Could not connect to chatbot server." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
