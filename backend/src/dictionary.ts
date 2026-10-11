import { createRequire } from "node:module";
import type { DictionaryEntry } from "./types.js";

// JSON import that works under tsx/ESM without import-assertion friction.
const require = createRequire(import.meta.url);
const entries = require("./data/litter-dictionary.json") as DictionaryEntry[];

const byId = new Map<string, DictionaryEntry>(entries.map((e) => [e.id, e]));

/** Average empty weight per category — the medium-confidence fallback. */
const categoryAvg = new Map<string, number>();
{
  const sums = new Map<string, { total: number; n: number }>();
  for (const e of entries) {
    const s = sums.get(e.category) ?? { total: 0, n: 0 };
    s.total += e.emptyWeightG;
    s.n += 1;
    sums.set(e.category, s);
  }
  for (const [cat, s] of sums) categoryAvg.set(cat, s.total / s.n);
}

export function lookupById(id: string): DictionaryEntry | undefined {
  return byId.get(id);
}

export function categoryAverage(category: string): number | undefined {
  return categoryAvg.get(category);
}

/** Compact catalog listing injected into the identify prompt. */
export function listDictionaryForPrompt(): string {
  return entries.map((e) => `${e.id} | ${e.label} | ${e.category}`).join("\n");
}

export function allEntries(): DictionaryEntry[] {
  return entries;
}
