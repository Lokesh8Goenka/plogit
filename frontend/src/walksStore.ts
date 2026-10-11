// Unified walk store. Uses Supabase when configured (per-account, cross-device),
// otherwise falls back to localStorage (guest mode). The rest of the app calls
// these async functions and never knows which backend is live — same seam idea
// as the vision provider on the backend.

import { supabase } from "./supabase";
import {
  loadWalks as lsLoad,
  saveWalk as lsSave,
  type Walk,
  type Progress,
} from "./storage";

export type { Walk, Progress };
export { progressFrom } from "./storage";

/** DB row (snake_case) -> Walk (camelCase). */
function rowToWalk(r: any): Walk {
  return {
    id: r.id,
    date: new Date(r.created_at).getTime(),
    totalWeightG: Number(r.total_weight_g),
    lines: r.lines ?? [],
    originalLines: r.original_lines ?? undefined,
    edited: !!r.edited,
    thumbnail: r.thumbnail ?? "",
    imageHash: r.image_hash ?? "",
  };
}

export async function loadWalks(userId: string | null): Promise<Walk[]> {
  if (supabase && userId) {
    const { data, error } = await supabase
      .from("walks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[walks] load failed:", error.message);
      return [];
    }
    return (data ?? []).map(rowToWalk);
  }
  return lsLoad();
}

export async function saveWalk(walk: Walk, userId: string | null): Promise<void> {
  if (supabase && userId) {
    const { error } = await supabase.from("walks").insert({
      user_id: userId,
      total_weight_g: walk.totalWeightG,
      lines: walk.lines,
      original_lines: walk.originalLines ?? null,
      edited: walk.edited ?? false,
      image_hash: walk.imageHash,
      thumbnail: walk.thumbnail,
    });
    if (error) console.error("[walks] save failed:", error.message);
    return;
  }
  lsSave(walk);
}
