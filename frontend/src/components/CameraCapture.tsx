import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onPhoto: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

/**
 * Phone-first capture. The file input with capture="environment" opens the
 * rear camera on mobile and falls back to a file picker on desktop.
 */
export function CameraCapture({ onPhoto, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file?: File) => {
    if (!file) return;
    onPhoto(file, URL.createObjectURL(file));
  };

  return (
    <div
      className={`capture ${dragOver ? "capture--over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <motion.button
        className="capture__btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="capture__icon" aria-hidden>📷</span>
        <span className="capture__label">Snap your haul</span>
        <span className="capture__hint">Photograph the waste you picked up</span>
      </motion.button>
    </div>
  );
}
