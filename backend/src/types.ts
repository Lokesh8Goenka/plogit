// Shared types for the identify -> lookup -> estimate pipeline.
// Kept in one place so the frontend can mirror these shapes.

export type Confidence = "high" | "medium" | "low";

/** One item the vision model thinks it sees in the photo. */
export interface IdentifiedItem {
  /** Dictionary id if the model matched a known catalog item, else null. */
  dictId: string | null;
  /** Human-readable label, e.g. "Lay's chips packet (small)". */
  label: string;
  /** Rough category, e.g. "chips_packet", "pet_bottle". */
  category: string;
  /** How many of this item the model counted. */
  count: number;
  /** Model's own confidence in the identification. */
  confidence: Confidence;
}

/** Raw result returned by any VisionProvider. */
export interface IdentifyResult {
  items: IdentifiedItem[];
  /** Free-form note from the provider (debugging / transparency). */
  note?: string;
}

/** A dictionary row: empty-packaging weight for a known litter item. */
export interface DictionaryEntry {
  id: string;
  label: string;
  brand: string | null;
  category: string;
  sizeVariant: string | null;
  emptyWeightG: number;
  confidence: Confidence;
  sourceNote: string;
}

/** One line of the final estimate shown to the user. */
export interface EstimateLine {
  label: string;
  category: string;
  count: number;
  unitWeightG: number;
  lineWeightG: number;
  confidence: Confidence;
  /** How the weight was resolved — drives the two-tier honesty in the UI. */
  tier: "identified" | "category" | "unknown";
}

/** The full response for one photo. */
export interface EstimateResponse {
  totalWeightG: number;
  lines: EstimateLine[];
  note?: string;
}
