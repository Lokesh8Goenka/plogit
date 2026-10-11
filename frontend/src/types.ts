// Mirrors backend/src/types.ts — the API contract between the two halves.

export type Confidence = "high" | "medium" | "low";

export interface EstimateLine {
  label: string;
  category: string;
  count: number;
  unitWeightG: number;
  lineWeightG: number;
  confidence: Confidence;
  tier: "identified" | "category" | "unknown";
}

export interface EstimateResponse {
  totalWeightG: number;
  lines: EstimateLine[];
  note?: string;
}
