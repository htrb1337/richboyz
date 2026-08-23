type AudioDockProps = {
  muted: boolean;
  onToggle: () => void;
};

export default function AudioDock({ muted, onToggle }: AudioDockProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed right-5 bottom-5 z-40 flex items-center gap-3 rounded-full border border-violet-200 bg-white/80 px-4 py-2.5 shadow-[0_12px_40px_rgba(109,40,217,0.12)] backdrop-blur-xl"
    >
      <span className="flex h-4 items-end gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="eq-bar h-4"
            style={{
              animationDelay: `${i * 0.12}s`,
              animationPlayState: muted ? "paused" : "running",
              opacity: muted ? 0.25 : 1,
            }}
          />
        ))}
      </span>
      <span className="text-[10px] tracking-[0.28em] text-violet-700">
        {muted ? "SOUND OFF" : "SOUND ON"}
      </span>
    </button>
  );
}
