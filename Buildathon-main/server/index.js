import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "20mb" }));

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini backend error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
