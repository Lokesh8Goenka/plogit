import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allEntries } from "../backend/src/dictionary.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json(
    allEntries().map((e) => ({
      id: e.id,
      label: e.label,
      category: e.category,
      emptyWeightG: e.emptyWeightG,
      confidence: e.confidence,
    }))
  );
}
