import { motion } from "framer-motion";
import type { Progress } from "../storage";

function fmt(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`;
  return `${Math.round(g)} g`;
}

export function RunningTotal({ progress }: { progress: Progress }) {
  if (progress.walks === 0) return null;
  return (
    <motion.div
      className="running"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="running__stat">
        <span className="running__num">{fmt(progress.totalWeightG)}</span>
        <span className="running__cap">collected</span>
      </div>
      <div className="running__divider" />
      <div className="running__stat">
        <span className="running__num">{progress.walks}</span>
        <span className="running__cap">{progress.walks === 1 ? "walk" : "walks"}</span>
      </div>
    </motion.div>
  );
}
