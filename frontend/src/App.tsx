import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CameraCapture } from "./components/CameraCapture";
import { ResultCard } from "./components/ResultCard";
import { RunningTotal } from "./components/RunningTotal";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Profile } from "./components/Profile";
import { BottomNav, type Tab } from "./components/BottomNav";
import { Mascot } from "./components/Mascot";
import { useAuth } from "./auth";
import { estimateWaste, fetchCatalog, type CatalogItem } from "./api";
import { loadWalks, progressFrom, saveWalk, type Walk } from "./walksStore";
import { computeDHash, isDuplicate, makeThumbnail } from "./imageHash";
import type { EstimateLine, EstimateResponse } from "./types";
import "./App.css";

type Screen = "landing" | "home" | "profile";
type Phase = "idle" | "loading" | "result" | "error" | "duplicate";

interface Pending {
  hash: string;
  thumbnail: string;
}

export default function App() {
  const { mode, user, ready, signInWithGoogle, signOut } = useAuth();

  const [screen, setScreen] = useState<Screen>("landing");
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string>("");
  const [walks, setWalks] = useState<Walk[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  const progress = progressFrom(walks);
  const userId = user?.id ?? null;

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { fetchCatalog().then(setCatalog).catch(() => {}); }, []);

  // Load this user's walks (or localStorage in guest mode) whenever auth changes.
  useEffect(() => {
    let active = true;
    loadWalks(userId).then((w) => { if (active) setWalks(w); });
    return () => { active = false; };
  }, [userId]);

  async function handlePhoto(file: File, previewUrl: string) {
    setPreview(previewUrl);
    setPhase("loading");
    setError("");
    try {
      const hash = await computeDHash(file);
      const knownHashes = walks.map((w) => w.imageHash).filter(Boolean);
      if (isDuplicate(hash, knownHashes)) {
        setPhase("duplicate");
        return;
      }
      const res = await estimateWaste(file);
      const thumbnail = await makeThumbnail(file);
      setResult(res);
      setPending({ hash, thumbnail });
      setPhase("result");
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  }

  async function handleSave(lines: EstimateLine[], totalWeightG: number, edited: boolean) {
    if (!pending || !result) return;
    const walk: Walk = {
      id: crypto.randomUUID(),
      date: Date.now(),
      totalWeightG,
      lines,
      originalLines: result.lines, // what the model first said — feedback signal
      edited,
      thumbnail: pending.thumbnail,
      imageHash: pending.hash,
    };
    await saveWalk(walk, userId);
    setWalks(await loadWalks(userId));
    reset();
    setScreen("profile");
  }

  function reset() {
    setResult(null);
    setPending(null);
    setPreview("");
    setPhase("idle");
  }

  // ---- Auth gates ----
  if (!ready) {
    return (
      <div className="app"><div className="splash"><Mascot size={110} mood="idle" /></div></div>
    );
  }
  if (mode === "supabase" && !user) {
    return <div className="app"><Login onGoogle={signInWithGoogle} /></div>;
  }

  return (
    <div className="app">
      <AnimatePresence>
        {screen === "landing" ? (
          <Landing key="landing" onStart={() => setScreen("home")} />
        ) : (
          <motion.div key="shell" className="shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="app__header">
              <div className="app__brand">
                <Mascot size={34} mood="static" />
                <h1 className="app__title">plog<span>it</span></h1>
              </div>
              {mode === "supabase" && user && (
                <button className="app__signout" onClick={signOut}>Sign out</button>
              )}
            </header>

            {screen === "home" && <RunningTotal progress={progress} />}

            <main className="app__main">
              <AnimatePresence>
                {screen === "profile" && (
                  <Profile key="profile" walks={walks} progress={progress} />
                )}

                {screen === "home" && phase === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CameraCapture onPhoto={handlePhoto} />
                  </motion.div>
                )}

                {screen === "home" && phase === "loading" && (
                  <motion.div key="loading" className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {preview && <img className="loading__img" src={preview} alt="Uploaded waste" />}
                    <div className="loading__spinner" />
                    <p className="loading__text">Identifying what you collected…</p>
                  </motion.div>
                )}

                {screen === "home" && phase === "result" && result && (
                  <ResultCard
                    key="result"
                    result={result}
                    previewUrl={preview}
                    walkNumber={progress.walks + 1}
                    catalog={catalog}
                    onSave={handleSave}
                  />
                )}

                {screen === "home" && phase === "duplicate" && (
                  <motion.div key="dup" className="errorbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Mascot size={90} mood="static" />
                    <p>You've already logged this one 🌱</p>
                    <span className="errorbox__detail">
                      Each haul counts once — snap a fresh photo of new waste to keep your total honest.
                    </span>
                    <button className="card__again" onClick={reset}>Snap a new one</button>
                  </motion.div>
                )}

                {screen === "home" && phase === "error" && (
                  <motion.div key="error" className="errorbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p>Couldn't read that one.</p>
                    <span className="errorbox__detail">{error}</span>
                    <button className="card__again" onClick={reset}>Try again</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <BottomNav active={screen as Tab} onChange={(t) => { setScreen(t); if (t === "home") reset(); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
