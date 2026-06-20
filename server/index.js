require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const PORT = process.env.PORT || 4000;

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set. /api/profile-summary will fail until it is.");
}

function buildPrompt(input) {
  const { personalityBaseline, dailySchedule, scenarioSession, moodEntries, journalEntries } = input;

  return `You are analyzing self-reported personal data to help someone understand themselves better.
Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "summaryText": string,
  "attributes": [{ "label": string, "detail": string }],
  "painPoints": string[],
  "productiveWindows": string[]
}

Guidance:
- "attributes" should be 4-8 concise concluded traits/characteristics about the person (e.g. "Highly conscientious", "Secure attachment style", "Most energetic in mornings"), each with a one-sentence "detail" explaining the evidence from the data below.
- "painPoints" should be recurring emotional triggers or friction points inferred from journal entries and mood tags. Empty array if there isn't enough evidence yet.
- "productiveWindows" should be times of day or contexts where energy/mood self-ratings are consistently higher. Empty array if there isn't enough evidence yet.
- Be specific and grounded only in the data provided below. Do not invent details that aren't supported by it.

DATA:
Personality baseline: ${JSON.stringify(personalityBaseline)}
Daily schedule: ${JSON.stringify(dailySchedule)}
Situational scenario answers (trait deltas): ${JSON.stringify(scenarioSession)}
Mood entries (most recent first): ${JSON.stringify(moodEntries)}
Journal entries (most recent first): ${JSON.stringify(journalEntries)}
`;
}

function extractJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(candidate);
}

app.post("/api/profile-summary", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
    return;
  }

  try {
    const prompt = buildPrompt(req.body || {});
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      res.status(502).json({ error: `Gemini request failed: ${errText}` });
      return;
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "Gemini returned no content." });
      return;
    }

    const parsed = extractJson(text);
    res.json({
      summaryText: parsed.summaryText ?? "",
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes : [],
      painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
      productiveWindows: Array.isArray(parsed.productiveWindows) ? parsed.productiveWindows : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate profile summary." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Profile summary server listening on port ${PORT}`);
});
