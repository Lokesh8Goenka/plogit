import { existsSync } from "node:fs";
import express from "express";
import cors from "cors";

// Load .env (gitignored) if present, using Node's built-in loader — no deps.
if (existsSync(".env")) process.loadEnvFile(".env");
import type { VisionProvider } from "./providers/VisionProvider.js";
import { MockProvider } from "./providers/MockProvider.js";
import { GeminiProvider } from "./providers/GeminiProvider.js";
import { estimate } from "./estimate.js";
import { allEntries } from "./dictionary.js";

// --- Provider selection: the ONLY place that knows which model runs. ---
// Set GEMINI_API_KEY to use the real model; otherwise the mock runs.
function selectProvider(): VisionProvider {
  const key = process.env.GEMINI_API_KEY;
  if (key) {
    console.log("[provider] GeminiProvider (GEMINI_API_KEY found)");
    return new GeminiProvider(key, process.env.GEMINI_MODEL || "gemini-3.5-flash");
  }
  console.log("[provider] MockProvider (no GEMINI_API_KEY) — set the key to go live");
  return new MockProvider();
}

const provider = selectProvider();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" })); // base64 images are chunky

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: provider.name });
});

/**
 * GET /api/catalog
 * The litter dictionary the frontend uses to resolve user-added items to a
 * real empty-packaging weight (and to power the add-item autocomplete).
 */
app.get("/api/catalog", (_req, res) => {
  res.json(
    allEntries().map((e) => ({
      id: e.id,
      label: e.label,
      category: e.category,
      emptyWeightG: e.emptyWeightG,
      confidence: e.confidence,
    }))
  );
});

/**
 * POST /api/estimate
 * body: { imageBase64: string, mimeType: string }
 * returns: EstimateResponse
 */
app.post("/api/estimate", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body ?? {};
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "imageBase64 and mimeType are required" });
    }
    const identified = await provider.identify(imageBase64, mimeType);
    const result = estimate(identified);
    res.json(result);
  } catch (err) {
    console.error("[estimate] failed:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`[plogging] backend on http://localhost:${PORT} (provider: ${provider.name})`);
});
