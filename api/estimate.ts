import type { VercelRequest, VercelResponse } from "@vercel/node";
import { estimate } from "../backend/src/estimate.js";
import { GeminiProvider } from "../backend/src/providers/GeminiProvider.js";
import { MockProvider } from "../backend/src/providers/MockProvider.js";
import type { VisionProvider } from "../backend/src/providers/VisionProvider.js";

// Same provider selection as the local Express server — single source of logic.
function selectProvider(): VisionProvider {
  const key = process.env.GEMINI_API_KEY;
  if (key) return new GeminiProvider(key, process.env.GEMINI_MODEL || "gemini-3.5-flash");
  return new MockProvider();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  try {
    const { imageBase64, mimeType } = (req.body ?? {}) as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "imageBase64 and mimeType are required" });
    }
    const identified = await selectProvider().identify(imageBase64, mimeType);
    res.json(estimate(identified));
  } catch (err) {
    console.error("[estimate] failed:", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
