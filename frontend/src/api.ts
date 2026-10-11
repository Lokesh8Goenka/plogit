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

/**
 * Downscales a photo to <= maxDim and re-encodes as JPEG, returning base64.
 * Keeps uploads well under Vercel's ~4.5MB function body limit and cuts the
 * tokens/latency of the vision call. Phone photos are far larger than we need
 * for identification.
 */
function resizeForUpload(file: File, maxDim = 1280, quality = 0.85): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: "image/jpeg" });
    };
    img.src = url;
  });
}

export async function estimateWaste(file: File): Promise<EstimateResponse> {
  const { base64, mimeType } = await resizeForUpload(file);
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
