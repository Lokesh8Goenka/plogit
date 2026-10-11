import { motion } from "framer-motion";
import { Mascot } from "./Mascot";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.1 }}
      >
        <Mascot size={150} mood="idle" />
      </motion.div>

      <motion.h1
        className="landing__title"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        plog<span>it</span>
      </motion.h1>

      <motion.p
        className="landing__pitch"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        Everyone wants to post. Few pick up the trash.
        <br />
        <strong>plogit turns your clean-up into something worth sharing.</strong>
      </motion.p>

      <motion.div
        className="landing__steps"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="landing__step"><span>📷</span> Snap your haul</div>
        <div className="landing__step"><span>🔍</span> We identify &amp; weigh it</div>
        <div className="landing__step"><span>🌱</span> Watch your impact grow</div>
      </motion.div>

      <motion.button
        className="landing__cta"
        onClick={onStart}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Start plogging
      </motion.button>
    </motion.div>
  );
}
