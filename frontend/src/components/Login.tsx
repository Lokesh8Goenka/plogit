import { motion } from "framer-motion";
import { Mascot } from "./Mascot";

export function Login({ onGoogle }: { onGoogle: () => void }) {
  return (
    <motion.div className="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.1 }}
      >
        <Mascot size={130} mood="idle" />
      </motion.div>

      <h1 className="landing__title">plog<span>it</span></h1>
      <p className="landing__pitch">
        Sign in to track your impact across every walk — on any device.
      </p>

      <button className="google-btn" onClick={onGoogle}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5Z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.6 37.8 46.5 31.7 46.5 24.5Z"/>
          <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1Z"/>
          <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.3 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48Z"/>
        </svg>
        Continue with Google
      </button>

      <p className="login__fineprint">We only use this to save your walks. Nothing is shared.</p>
    </motion.div>
  );
}
