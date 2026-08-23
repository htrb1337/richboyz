import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

type IntroProps = {
  onProceed: () => void;
  progressBoost: number;
};

export default function Intro({ onProceed, progressBoost }: IntroProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showProceed, setShowProceed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const boostRef = useRef(progressBoost);
  boostRef.current = progressBoost;

  useEffect(() => {
    let current = 0;
    let timer = 0;

    const tick = () => {
      const remaining = 100 - current;
      const step = Math.max(0.4, Math.random() * (remaining > 16 ? 3.2 : 1.05));
      current = Math.min(100, current + step);
      current = Math.min(100, Math.max(current, boostRef.current));
      setProgress(current);
      if (current >= 100) {
        window.setTimeout(() => setLoaded(true), 240);
        return;
      }
      timer = window.setTimeout(tick, 32 + Math.random() * 80);
    };

    timer = window.setTimeout(tick, 380);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => setShowProceed(true), 380);
    return () => window.clearTimeout(id);
  }, [loaded]);

  const handleProceed = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onProceed, 680);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#fbf8ff] transition-all duration-700 ${
        leaving ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"
      }`}
    >
      <div className="orb -top-24 -left-16 h-72 w-72 bg-[#d8b4fe]/70" />
      <div
        className="orb right-[-80px] bottom-[-60px] h-80 w-80 bg-[#c084fc]/55"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="orb top-1/3 right-1/4 h-40 w-40 bg-[#a78bfa]/40"
        style={{ animationDelay: "2.2s" }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <p className="font-display fade-in mb-8 text-[11px] tracking-[0.62em] text-violet-500/80">
          S MOB
        </p>

        <Logo className="scale-in w-[280px] sm:w-[360px] md:w-[420px]" />

        <div className="mt-14 flex h-20 items-center justify-center">
          {!loaded && (
            <div className="fade-in">
              <div className="loading-track">
                <div
                  className="loading-fill transition-[width] duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-center text-[11px] tracking-[0.42em] text-violet-700/70">
                LOADING {Math.floor(progress)}%
              </p>
            </div>
          )}

          {showProceed && (
            <button type="button" className="proceed-btn fade-in" onClick={handleProceed}>
              PROCEED
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
