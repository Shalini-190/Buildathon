import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json({ limit: "20mb" }));

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve React build
app.use(express.static(path.join(__dirname, "../dist")));

// ✅ API route
app.post("/api/gemini", async (req, res) => {
  try {
    const { type, data } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: JSON.stringify({ type, data }) }] }
          ]
        })
      }
    );

    res.json(await response.json());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gemini error" });
  }
});

// SPA fallback
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("FULL WEB APP running on port", PORT);
});
