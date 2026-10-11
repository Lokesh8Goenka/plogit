import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { EstimateLine, EstimateResponse } from "../types";
import type { CatalogItem } from "../api";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  result: EstimateResponse;
  previewUrl: string;
  walkNumber: number;
  catalog: CatalogItem[];
  onSave: (lines: EstimateLine[], totalWeightG: number, edited: boolean) => void;
}

function fmt(g: number): { value: string; unit: string } {
  if (g >= 1000) return { value: (g / 1000).toFixed(2), unit: "kg" };
  return { value: Math.round(g).toString(), unit: "g" };
}

const DEFAULT_UNKNOWN_G = 5;

/** Resolves a typed/picked item name to a weight using the catalog. */
function resolveItem(name: string, catalog: CatalogItem[]): EstimateLine {
  const q = name.trim().toLowerCase();
  const exact = catalog.find((c) => c.label.toLowerCase() === q);
  const partial = exact || catalog.find((c) => c.label.toLowerCase().includes(q) || q.includes(c.category));
  if (partial) {
    return {
      label: partial.label,
      category: partial.category,
      count: 1,
      unitWeightG: partial.emptyWeightG,
      lineWeightG: partial.emptyWeightG,
      confidence: "medium",
      tier: "identified",
    };
  }
  return {
    label: name.trim() || "Other item",
    category: "misc_plastic",
    count: 1,
    unitWeightG: DEFAULT_UNKNOWN_G,
    lineWeightG: DEFAULT_UNKNOWN_G,
    confidence: "low",
    tier: "unknown",
  };
}

export function ResultCard({ result, previewUrl, walkNumber, catalog, onSave }: Props) {
  const [lines, setLines] = useState<EstimateLine[]>(result.lines);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [edited, setEdited] = useState(false);

  // Count-up animates the ORIGINAL total once; after edits we show the live value.
  const initialTotal = useRef(result.totalWeightG).current;
  const animated = useCountUp(initialTotal);

  const liveTotal = useMemo(
    () => +lines.reduce((s, l) => s + l.lineWeightG, 0).toFixed(1),
    [lines]
  );
  const displayG = edited ? liveTotal : animated;
  const finalUnit = fmt(liveTotal).unit;

  function updateCount(i: number, delta: number) {
    setEdited(true);
    setLines((prev) =>
      prev.flatMap((l, idx) => {
        if (idx !== i) return [l];
        const count = l.count + delta;
        if (count <= 0) return []; // removes the line
        return [{ ...l, count, lineWeightG: +(l.unitWeightG * count).toFixed(1) }];
      })
    );
  }

  function removeLine(i: number) {
    setEdited(true);
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addItem() {
    if (!newName.trim()) return;
    setEdited(true);
    setLines((prev) => [...prev, resolveItem(newName, catalog)]);
    setNewName("");
    setAdding(false);
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <div className="card__photo">
        <img src={previewUrl} alt="Collected waste" />
        <div className="card__badge">Walk #{walkNumber}</div>
      </div>

      <div className="card__hero">
        <span className="card__eyebrow">You cleared approximately</span>
        <div className="card__weight">
          <span className="card__value">
            {finalUnit === "kg" ? (displayG / 1000).toFixed(2) : Math.round(displayG)}
          </span>
          <span className="card__unit">{finalUnit}</span>
        </div>
        <span className="card__sub">of waste from the ground 🌱</span>
      </div>

      <div className="edit">
        <div className="edit__hint">Tap to fix anything we got wrong</div>
        <ul className="breakdown">
          {lines.map((line, i) => (
            <li key={`${line.label}-${i}`} className="breakdown__row">
              <div className="stepper">
                <button className="stepper__btn" onClick={() => updateCount(i, -1)} aria-label="Fewer">−</button>
                <span className="stepper__count">{line.count}</span>
                <button className="stepper__btn" onClick={() => updateCount(i, 1)} aria-label="More">+</button>
              </div>
              <span className="breakdown__name">{line.label}</span>
              <span className="breakdown__weight">{line.lineWeightG} g</span>
              <button className="breakdown__remove" onClick={() => removeLine(i)} aria-label="Remove">×</button>
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="additem">
            <input
              className="additem__input"
              list="catalog-list"
              placeholder="Type an item (e.g. water bottle)"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <datalist id="catalog-list">
              {catalog.map((c) => <option key={c.id} value={c.label} />)}
            </datalist>
            <button className="additem__add" onClick={addItem}>Add</button>
          </div>
        ) : (
          <button className="additem__open" onClick={() => setAdding(true)}>+ Add a missed item</button>
        )}
      </div>

      <p className="card__disclaimer">
        Weights are estimated from the packaging we recognise — close, not exact.
      </p>

      <motion.button className="card__again" onClick={() => onSave(lines, liveTotal, edited)} whileTap={{ scale: 0.97 }}>
        {edited ? "Save corrected haul" : "Save this haul"}
      </motion.button>
    </motion.div>
  );
}
