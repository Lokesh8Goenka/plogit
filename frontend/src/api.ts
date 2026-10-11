import type { EstimateResponse } from "./types";

export interface CatalogItem {
  id: string;
  label: string;
  category: string;
  emptyWeightG: number;
  confidence: "high" | "medium" | "low";
}

/** Fetches the litter dictionary (cached after first call). */
let catalogCache: CatalogItem[] | null = null;
export async function fetchCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) return catalogCache;
  const res = await fetch("/api/catalog");
  if (!res.ok) return [];
  catalogCache = await res.json();
  return catalogCache!;
}

/** Reads a File into a base64 string (no data: prefix) + its mime type. */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string; // "data:image/jpeg;base64,...."
      const comma = result.indexOf(",");
      resolve({ base64: result.slice(comma + 1), mimeType: file.type || "image/jpeg" });
    };
    reader.readAsDataURL(file);
  });
}

export async function estimateWaste(file: File): Promise<EstimateResponse> {
  const { base64, mimeType } = await fileToBase64(file);
  const res = await fetch("/api/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}
