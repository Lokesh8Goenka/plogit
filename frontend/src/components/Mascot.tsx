import { motion } from "framer-motion";

interface Props {
  size?: number;
  /** "idle" gentle bob, "cheer" celebratory bounce, "static" none */
  mood?: "idle" | "cheer" | "static";
}

/**
 * Sprout — the plogit mascot. A friendly water-drop/leaf character holding a
 * little bag. Pure SVG so it stays crisp and animatable at any size.
 */
export function Mascot({ size = 120, mood = "idle" }: Props) {
  const anim =
    mood === "idle"
      ? { y: [0, -6, 0] }
      : mood === "cheer"
      ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
      : {};
  const transition =
    mood === "static"
      ? undefined
      : { duration: mood === "cheer" ? 0.9 : 2.6, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={anim}
      transition={transition}
      aria-label="Sprout the mascot"
    >
      {/* body: rounded leaf/drop */}
      <path
        d="M60 14 C86 40 98 58 98 78 a38 38 0 0 1-76 0 C22 58 34 40 60 14 Z"
        fill="url(#sproutBody)"
      />
      {/* belly highlight */}
      <ellipse cx="60" cy="80" rx="26" ry="24" fill="rgba(255,255,255,0.14)" />
      {/* leaf sprig on top */}
      <path d="M60 18 C58 6 66 2 74 4 C74 14 68 20 60 18 Z" fill="#8be0a6" />
      {/* eyes */}
      <circle cx="49" cy="72" r="6.5" fill="#0f2417" />
      <circle cx="71" cy="72" r="6.5" fill="#0f2417" />
      <circle cx="51" cy="70" r="2" fill="#fff" />
      <circle cx="73" cy="70" r="2" fill="#fff" />
      {/* smile */}
      <path d="M50 86 Q60 96 70 86" stroke="#0f2417" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* cheeks */}
      <circle cx="41" cy="82" r="4" fill="rgba(255,120,120,0.35)" />
      <circle cx="79" cy="82" r="4" fill="rgba(255,120,120,0.35)" />
      {/* little bag in hand */}
      <g>
        <rect x="86" y="84" width="20" height="22" rx="4" fill="#2ba45f" />
        <path d="M90 84 l3-6 h6 l3 6" stroke="#2ba45f" strokeWidth="3" fill="none" strokeLinejoin="round" />
        <path d="M96 90 v10 M92 95 h8" stroke="#eaf2ec" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <defs>
        <linearGradient id="sproutBody" x1="60" y1="14" x2="60" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54e08a" />
          <stop offset="1" stopColor="#2ba45f" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
