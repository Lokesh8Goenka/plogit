// Per-walk history + running total. localStorage for v1 (per the plan).
// Wrapped in try/catch — storage can be unavailable (private mode etc).
//
// NOTE: dedupe here is per-device only. Real anti-gaming needs accounts +
// server-side hash storage; this is the honest client-side ceiling.

import type { EstimateLine } from "./types";

const KEY = "plogging.walks.v1";

export interface Walk {
  id: string;
  date: number; // epoch ms
  totalWeightG: number;
  lines: EstimateLine[]; // final (corrected) items
  originalLines?: EstimateLine[]; // what the model first returned (feedback signal)
  edited?: boolean;
  thumbnail: string; // small data URL for the profile list
  imageHash: string; // perceptual dHash (hex) for duplicate detection
}

export interface Progress {
  totalWeightG: number;
  walks: number;
}

export function loadWalks(): Walk[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Walk[]) : [];
  } catch {
    return [];
  }
}

export function saveWalk(walk: Walk): Walk[] {
  const walks = loadWalks();
  walks.unshift(walk); // newest first
  try {
    localStorage.setItem(KEY, JSON.stringify(walks));
  } catch {
    // Likely quota (thumbnails add up). Drop oldest thumbnails and retry once.
    try {
      const trimmed = walks.map((w, i) => (i > 20 ? { ...w, thumbnail: "" } : w));
      localStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch {
      /* give up silently — session still works */
    }
  }
  return walks;
}

export function progressFrom(walks: Walk[]): Progress {
  return {
    totalWeightG: +walks.reduce((s, w) => s + w.totalWeightG, 0).toFixed(1),
    walks: walks.length,
  };
}

/** All stored perceptual hashes, for duplicate checking. */
export function knownHashes(): string[] {
  return loadWalks().map((w) => w.imageHash).filter(Boolean);
}
