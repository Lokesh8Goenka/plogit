import { motion } from "framer-motion";
import { Mascot } from "./Mascot";
import type { Progress, Walk } from "../storage";

function fmt(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`;
  return `${Math.round(g)} g`;
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Profile({ walks, progress }: { walks: Walk[]; progress: Progress }) {
  return (
    <motion.div className="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile__hero">
        <Mascot size={84} mood={progress.walks > 0 ? "cheer" : "idle"} />
        <div className="profile__totals">
          <div className="profile__big">{fmt(progress.totalWeightG)}</div>
          <div className="profile__cap">cleared across {progress.walks} {progress.walks === 1 ? "walk" : "walks"}</div>
        </div>
      </div>

      {walks.length === 0 ? (
        <p className="profile__empty">No walks yet. Your first haul will show up here 🌱</p>
      ) : (
        <ul className="history">
          {walks.map((w, i) => (
            <motion.li
              key={w.id}
              className="history__row"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {w.thumbnail ? (
                <img className="history__thumb" src={w.thumbnail} alt="Walk" />
              ) : (
                <div className="history__thumb history__thumb--empty">🌱</div>
              )}
              <div className="history__info">
                <span className="history__weight">{fmt(w.totalWeightG)}</span>
                <span className="history__date">{fmtDate(w.date)}</span>
              </div>
              <span className="history__items">
                {w.lines.reduce((s, l) => s + l.count, 0)} items
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
