import type { EstimateLine, EstimateResponse, IdentifyResult } from "./types.js";
import { lookupById, categoryAverage } from "./dictionary.js";

/** Fallback weight when we have neither a dictId nor a known category. */
const UNKNOWN_FALLBACK_G = 5;

/**
 * Turns an identification into a weight estimate using the two-tier model:
 *   identified -> exact dictionary weight (high confidence)
 *   category   -> category average        (medium)
 *   unknown    -> flat fallback           (low, flagged)
 */
export function estimate(result: IdentifyResult): EstimateResponse {
  const lines: EstimateLine[] = result.items.map((item) => {
    const entry = item.dictId ? lookupById(item.dictId) : undefined;

    let unitWeightG: number;
    let tier: EstimateLine["tier"];

    if (entry) {
      unitWeightG = entry.emptyWeightG;
      tier = "identified";
    } else {
      const avg = categoryAverage(item.category);
      if (avg !== undefined) {
        unitWeightG = avg;
        tier = "category";
      } else {
        unitWeightG = UNKNOWN_FALLBACK_G;
        tier = "unknown";
      }
    }

    const count = Math.max(0, Math.round(item.count));
    const lineWeightG = +(unitWeightG * count).toFixed(1);

    return {
      label: entry?.label ?? item.label,
      category: item.category,
      count,
      unitWeightG,
      lineWeightG,
      // Unknown tier is always low; otherwise trust the model's own confidence.
      confidence: tier === "unknown" ? "low" : item.confidence,
      tier,
    };
  });

  const totalWeightG = +lines.reduce((s, l) => s + l.lineWeightG, 0).toFixed(1);
  return { totalWeightG, lines, note: result.note };
}
